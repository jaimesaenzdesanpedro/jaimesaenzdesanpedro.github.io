import { NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { checkRateLimit, getClientIp } from '@/lib/ratelimit';
import { tavilySearch } from '@/lib/tavily';
import { generateResearch } from '@/lib/anthropic';
import { getOrCreateUser, incrementSearches, saveResearch, FREE_SEARCH_LIMIT } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req) {
  // Correlation id so all log lines for one request can be grepped together.
  const rid = Math.random().toString(36).slice(2, 8);
  const log = (...args) => console.log(`[alphalens][research:${rid}]`, ...args);
  const logErr = (...args) => console.error(`[alphalens][research:${rid}]`, ...args);

  // 1. Authentication
  const { userId } = await auth();
  if (!userId) {
    log('unauthorized — no Clerk session');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 2. Rate limit by IP — protects against bot abuse / runaway API costs
  const ip = getClientIp(req);
  if (!checkRateLimit(ip, { limit: 10, windowMs: 60_000 })) {
    log('rate limited for ip', ip);
    return NextResponse.json(
      { error: 'Too many requests. Please slow down and try again in a minute.' },
      { status: 429 }
    );
  }

  // 3. Parse + validate input
  let body;
  try {
    body = await req.json();
  } catch (e) {
    logErr('invalid JSON body:', e.message);
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
  const { sector, market_cap, horizon, geography } = body || {};
  if (!sector || typeof sector !== 'string') {
    log('missing sector in body:', body);
    return NextResponse.json({ error: 'A sector is required' }, { status: 400 });
  }
  log('received', { userId, sector, market_cap, horizon, geography });

  // 4. Plan / usage check
  let email;
  try {
    const user = await currentUser();
    email = user?.emailAddresses?.[0]?.emailAddress;
  } catch (e) {
    logErr('currentUser() failed (non-fatal):', e.message);
  }

  const account = await getOrCreateUser(userId, email);
  if (account?.plan === 'free' && (account.monthly_searches || 0) >= FREE_SEARCH_LIMIT) {
    log('free plan limit reached:', account.monthly_searches);
    return NextResponse.json(
      { error: 'Monthly limit reached. Upgrade to Pro.' },
      { status: 403 }
    );
  }

  try {
    // 5. Live web search via Tavily. If the key is missing or search is
    // unreachable (e.g. blocked by a network egress policy), degrade gracefully
    // and let Claude generate from its own knowledge rather than failing.
    const query = `${sector} stocks market analysis 2026 earnings catalysts`;
    let results = [];
    if (!process.env.TAVILY_API_KEY) {
      log('TAVILY_API_KEY missing — generating with Claude only (no live search)');
    } else {
      try {
        ({ results } = await tavilySearch(query, { maxResults: 5 }));
        log('tavily returned', results.length, 'results');
      } catch (searchErr) {
        logErr('tavily search failed — continuing without it:', searchErr.message);
      }
    }

    // 6. Structured report via Claude
    log('calling Anthropic…');
    const result = await generateResearch({
      sector,
      market_cap: market_cap || 'All',
      horizon: horizon || 'Mid-term',
      geography: geography || 'Global',
      tavilyResults: results,
    });
    log(
      'anthropic ok — companies:',
      result?.companies?.length,
      'catalysts:',
      result?.catalysts?.length
    );

    // 7. Persist (throws on a real Supabase error so we never hand back an id
    //    the result page can't load) + 8. increment usage
    const filters = { market_cap, horizon, geography };
    const record = await saveResearch({ userId, sector, filters, result });
    await incrementSearches(userId);
    log('saved record id:', record.id, '→ redirect /result/' + record.id);

    // 9. Return result + new record id
    return NextResponse.json({ id: record.id, result });
  } catch (err) {
    logErr('research generation failed:', err?.message, err?.stack);
    return NextResponse.json(
      { error: 'Failed to generate research. Please try again.' },
      { status: 500 }
    );
  }
}
