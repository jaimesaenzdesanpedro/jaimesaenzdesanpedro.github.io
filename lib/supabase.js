import { createClient } from '@supabase/supabase-js';

/**
 * Returns a Supabase admin client, or null when Supabase is not configured.
 *
 * The project ships with placeholder env values (the provided
 * NEXT_PUBLIC_SUPABASE_URL is actually a publishable key, and the service
 * role key is empty), so we guard against that and let the app degrade to an
 * in-memory fallback store instead of crashing.
 */
let cached;

export function getSupabaseAdmin() {
  if (cached !== undefined) return cached;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  const looksValid =
    typeof url === 'string' &&
    /^https?:\/\//.test(url) &&
    typeof serviceKey === 'string' &&
    serviceKey.length > 20;

  if (!looksValid) {
    cached = null;
    return cached;
  }

  cached = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  return cached;
}

export function isSupabaseEnabled() {
  return getSupabaseAdmin() !== null;
}
