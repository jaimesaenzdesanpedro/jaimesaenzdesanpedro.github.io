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
 */

export async function getOrCreateUser(userId, email) {
  const supabase = getSupabaseAdmin();
  if (!supabase) return getUserLocal(userId);

  const { data } = await supabase.from('users').select('*').eq('id', userId).maybeSingle();
  if (data) return data;

  const { data: created } = await supabase
    .from('users')
    .insert({ id: userId, email, plan: 'free', monthly_searches: 0 })
    .select()
    .single();
  return created || getUserLocal(userId);
}

export async function incrementSearches(userId) {
  const supabase = getSupabaseAdmin();
  if (!supabase) return incrementSearchesLocal(userId);

  const user = await getOrCreateUser(userId);
  const next = (user?.monthly_searches || 0) + 1;
  await supabase.from('users').update({ monthly_searches: next }).eq('id', userId);
  return next;
}

export async function saveResearch({ userId, sector, filters, result }) {
  const supabase = getSupabaseAdmin();
  if (!supabase) return saveResearchLocal({ userId, sector, filters, result });

  const { data, error } = await supabase
    .from('research_history')
    .insert({ user_id: userId, sector, filters, result })
    .select()
    .single();
  if (error || !data) return saveResearchLocal({ userId, sector, filters, result });
  return data;
}

export async function getResearch(id) {
  const supabase = getSupabaseAdmin();
  if (!supabase) return getResearchLocal(id);

  const { data } = await supabase
    .from('research_history')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  return data || getResearchLocal(id);
}

export async function listResearch(userId) {
  const supabase = getSupabaseAdmin();
  if (!supabase) return listResearchLocal(userId);

  const { data } = await supabase
    .from('research_history')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  return data || listResearchLocal(userId);
}

export async function getWatchlist(userId) {
  const supabase = getSupabaseAdmin();
  if (!supabase) return getWatchlistLocal(userId);

  const { data } = await supabase
    .from('watchlist')
    .select('*')
    .eq('user_id', userId)
    .order('added_at', { ascending: false });
  return data || getWatchlistLocal(userId);
}
