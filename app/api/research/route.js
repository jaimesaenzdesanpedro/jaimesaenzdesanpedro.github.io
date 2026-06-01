import { NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { checkRateLimit, getClientIp } from '@/lib/ratelimit';
import { tavilySearch } from '@/lib/tavily';
import { generateResearch } from '@/lib/anthropic';
import { getOrCreateUser, incrementSearches, saveResearch, FREE_SEARCH_LIMIT } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req) {
  // 1. Authentication
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 2. Rate limit by IP — protects against bot abuse / runaway API costs
  const ip = getClientIp(req);
  if (!checkRateLimit(ip, { limit: 10, windowMs: 60_000 })) {
    return NextResponse.json(
      { error: 'Too many requests. Please slow down and try again in a minute.' },
      { status: 429 }
    );
  }

  // 3. Parse + validate input
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
  const { sector, market_cap, horizon, geography } = body || {};
  if (!sector || typeof sector !== 'string') {
    return NextResponse.json({ error: 'A sector is required' }, { status: 400 });
  }

  // 4. Plan / usage check
  let email;
  try {
    const user = await currentUser();
    email = user?.emailAddresses?.[0]?.emailAddress;
  } catch {
    /* non-fatal */
  }

  const account = await getOrCreateUser(userId, email);
  if (account?.plan === 'free' && (account.monthly_searches || 0) >= FREE_SEARCH_LIMIT) {
    return NextResponse.json(
      { error: 'Monthly limit reached. Upgrade to Pro.' },
      { status: 403 }
    );
  }

  try {
    // 5. Live web search via Tavily. If search is unreachable (e.g. blocked by
    // a network egress policy), degrade gracefully and let Claude generate from
    // its own knowledge rather than failing the whole request.
    const query = `${sector} stocks market analysis 2026 earnings catalysts`;
    let results = [];
    try {
      ({ results } = await tavilySearch(query, { maxResults: 5 }));
    } catch (searchErr) {
      console.warn('Tavily search unavailable, continuing without it:', searchErr.message);
    }

    // 6. Structured report via Claude
    const result = await generateResearch({
      sector,
      market_cap: market_cap || 'All',
      horizon: horizon || 'Mid-term',
      geography: geography || 'Global',
      tavilyResults: results,
    });

    // 7. Persist + 8. increment usage
    const filters = { market_cap, horizon, geography };
    const record = await saveResearch({ userId, sector, filters, result });
    await incrementSearches(userId);

    // 9. Return result + new record id
    return NextResponse.json({ id: record.id, result });
  } catch (err) {
    console.error('research generation failed:', err);
    return NextResponse.json(
      { error: 'Failed to generate research. Please try again.' },
      { status: 500 }
    );
  }
}
