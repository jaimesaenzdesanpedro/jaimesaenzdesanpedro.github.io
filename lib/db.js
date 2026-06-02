import { getSupabaseAdmin } from './supabase';
import {
  saveResearchLocal,
  getResearchLocal,
  listResearchLocal,
  getUserLocal,
  incrementSearchesLocal,
  getWatchlistLocal,
} from './store';

const FREE_SEARCH_LIMIT = 2;
export { FREE_SEARCH_LIMIT };

/**
 * Persistence facade. Uses Supabase when configured, otherwise falls back to
 * an ephemeral in-memory store so the app stays fully functional in dev.
 *
 * IMPORTANT: the in-memory fallback does NOT persist across serverless
 * invocations (e.g. on Vercel). If you see "Report not found" in production,
 * the cause is almost always that Supabase is not configured — the write and
 * the read land on different lambdas. The logs below make that obvious.
 */

let warnedNoSupabase = false;
function warnNoSupabase(where) {
  if (!warnedNoSupabase) {
    warnedNoSupabase = true;
    console.warn(
      `[alphalens][db] Supabase is NOT configured (${where}). Using ephemeral ` +
        'in-memory store — data will NOT persist across serverless invocations. ' +
        'Set NEXT_PUBLIC_SUPABASE_URL (https://<ref>.supabase.co) and ' +
        'SUPABASE_SERVICE_ROLE_KEY to enable real persistence.'
    );
  }
}

export async function getOrCreateUser(userId, email) {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    warnNoSupabase('getOrCreateUser');
    return getUserLocal(userId);
  }

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .maybeSingle();
  if (error) {
    console.error('[alphalens][db] users select failed:', error.message, error.details || '');
  }
  if (data) return data;

  const { data: created, error: insertError } = await supabase
    .from('users')
    .insert({ id: userId, email, plan: 'free', monthly_searches: 0 })
    .select()
    .single();
  if (insertError) {
    console.error(
      '[alphalens][db] users insert failed:',
      insertError.message,
      insertError.details || ''
    );
    // Don't hard-fail the whole request just because the user row couldn't be
    // created — return a sane default so plan/limit checks still work.
    return { id: userId, email, plan: 'free', monthly_searches: 0 };
  }
  return created;
}

export async function incrementSearches(userId) {
  const supabase = getSupabaseAdmin();
  if (!supabase) return incrementSearchesLocal(userId);

  const user = await getOrCreateUser(userId);
  const next = (user?.monthly_searches || 0) + 1;
  const { error } = await supabase
    .from('users')
    .update({ monthly_searches: next })
    .eq('id', userId);
  if (error) {
    console.error('[alphalens][db] increment monthly_searches failed:', error.message);
  }
  return next;
}

export async function saveResearch({ userId, sector, filters, result }) {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    warnNoSupabase('saveResearch');
    return saveResearchLocal({ userId, sector, filters, result });
  }

  const { data, error } = await supabase
    .from('research_history')
    .insert({ user_id: userId, sector, filters, result })
    .select()
    .single();

  if (error || !data) {
    // Supabase IS configured but the insert failed — surface the exact error so
    // it shows up in the logs, and fail loudly instead of returning an id that
    // the result page will never be able to find.
    console.error(
      '[alphalens][db] research_history insert failed:',
      error?.message,
      error?.details || '',
      error?.hint || ''
    );
    throw new Error(`Failed to save research: ${error?.message || 'no row returned'}`);
  }

  console.log('[alphalens][db] research_history insert ok, id:', data.id);
  return data;
}

export async function getResearch(id) {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    warnNoSupabase('getResearch');
    return getResearchLocal(id);
  }

  const { data, error } = await supabase
    .from('research_history')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) {
    console.error('[alphalens][db] research_history select failed:', error.message);
  }
  if (!data) {
    console.warn('[alphalens][db] research_history row not found for id:', id);
  }
  return data || null;
}

export async function listResearch(userId) {
  const supabase = getSupabaseAdmin();
  if (!supabase) return listResearchLocal(userId);

  const { data, error } = await supabase
    .from('research_history')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) console.error('[alphalens][db] listResearch failed:', error.message);
  return data || [];
}

export async function getWatchlist(userId) {
  const supabase = getSupabaseAdmin();
  if (!supabase) return getWatchlistLocal(userId);

  const { data, error } = await supabase
    .from('watchlist')
    .select('*')
    .eq('user_id', userId)
    .order('added_at', { ascending: false });
  if (error) console.error('[alphalens][db] getWatchlist failed:', error.message);
  return data || [];
}
