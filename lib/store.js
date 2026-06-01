import { randomUUID } from 'crypto';

/**
 * In-memory fallback persistence used when Supabase is not configured.
 *
 * Kept on globalThis so it survives Next.js module reloads in dev and is
 * shared between the API route and server components within the same process.
 * This is intentionally ephemeral — real persistence happens in Supabase once
 * the project is connected.
 */
function db() {
  if (!globalThis.__alphalensStore) {
    globalThis.__alphalensStore = {
      research: new Map(), // id -> record
      users: new Map(), // userId -> { plan, monthly_searches, searches_reset_at }
      watchlist: new Map(), // userId -> [ { ticker, company_name, domain } ]
    };
  }
  return globalThis.__alphalensStore;
}

export function saveResearchLocal({ userId, sector, filters, result }) {
  const id = randomUUID();
  const record = {
    id,
    user_id: userId,
    sector,
    filters,
    result,
    created_at: new Date().toISOString(),
  };
  db().research.set(id, record);
  return record;
}

export function getResearchLocal(id) {
  return db().research.get(id) || null;
}

export function listResearchLocal(userId) {
  return Array.from(db().research.values())
    .filter((r) => r.user_id === userId)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}

export function getUserLocal(userId) {
  const users = db().users;
  if (!users.has(userId)) {
    users.set(userId, {
      id: userId,
      plan: 'free',
      monthly_searches: 0,
      searches_reset_at: new Date().toISOString(),
    });
  }
  return users.get(userId);
}

export function incrementSearchesLocal(userId) {
  const u = getUserLocal(userId);
  u.monthly_searches += 1;
  return u.monthly_searches;
}

export function getWatchlistLocal(userId) {
  return db().watchlist.get(userId) || [];
}
