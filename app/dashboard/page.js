import Link from 'next/link';
import { auth, currentUser } from '@clerk/nextjs/server';
import Navbar from '@/components/Navbar';
import { getOrCreateUser, listResearch, getWatchlist, FREE_SEARCH_LIMIT } from '@/lib/db';
import { sectorIcon, timeAgo } from '@/lib/constants';

export const dynamic = 'force-dynamic';

function StatCard({ label, value, sub }) {
  return (
    <div className="card p-5">
      <div className="text-xs uppercase tracking-wider text-ink-muted">{label}</div>
      <div className="mt-2 font-display text-3xl font-bold">{value}</div>
      {sub ? <div className="mt-1 text-xs text-ink-muted">{sub}</div> : null}
    </div>
  );
}

export default async function DashboardPage() {
  const { userId } = await auth();
  let email;
  try {
    const u = await currentUser();
    email = u?.emailAddresses?.[0]?.emailAddress;
  } catch {
    /* ignore */
  }

  const [account, history, watchlist] = await Promise.all([
    getOrCreateUser(userId, email),
    listResearch(userId),
    getWatchlist(userId),
  ]);

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  const plan = account?.plan === 'pro' ? 'Pro' : 'Free';
  const searches = account?.monthly_searches || 0;
  const searchesSub = plan === 'Free' ? `of ${FREE_SEARCH_LIMIT} free` : 'unlimited';

  // Placeholder watchlist when none saved yet
  const watchItems =
    watchlist.length > 0
      ? watchlist.map((w) => ({ ...w, price: '—', change: '' }))
      : [];

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-6xl px-5 pb-24 pt-10">
        {/* Greeting */}
        <div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
            Good morning 👋
          </h1>
          <p className="mt-2 text-ink-muted">{today}</p>
        </div>

        {/* Stat cards */}
        <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard label="Searches this month" value={searches} sub={searchesSub} />
          <StatCard label="Watchlist" value={watchlist.length} sub="tickers saved" />
          <StatCard label="Catalysts this week" value={history.length > 0 ? 4 : 0} sub="upcoming" />
          <StatCard label="Active plan" value={plan} sub={plan === 'Free' ? 'Upgrade for more' : 'Thank you'} />
        </div>

        {/* Two columns */}
        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {/* Research history */}
          <section className="lg:col-span-2">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-display text-sm font-bold uppercase tracking-wider text-ink-muted">
                Research History
              </h2>
              <Link href="/research" className="text-sm text-green hover:underline">
                + New
              </Link>
            </div>

            {history.length === 0 ? (
              <div className="card flex flex-col items-center gap-3 p-10 text-center">
                <div className="text-4xl">📊</div>
                <p className="text-ink-muted">No research yet. Run your first analysis.</p>
                <Link href="/research" className="btn-green px-5 py-2.5 text-sm">
                  Start research →
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {history.map((h) => {
                  const f = h.filters || {};
                  const summary = [f.market_cap, f.horizon, f.geography].filter(Boolean).join(' · ');
                  return (
                    <Link
                      key={h.id}
                      href={`/result/${h.id}`}
                      className="card flex items-center gap-4 p-4 transition hover:border-green/60"
                    >
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-surface2 text-xl">
                        {sectorIcon(h.sector)}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="truncate font-semibold">{h.sector}</div>
                        <div className="truncate text-xs text-ink-muted">{summary}</div>
                      </div>
                      <div className="shrink-0 text-xs text-ink-muted">{timeAgo(h.created_at)}</div>
                    </Link>
                  );
                })}
              </div>
            )}
          </section>

          {/* Watchlist */}
          <section>
            <h2 className="mb-3 font-display text-sm font-bold uppercase tracking-wider text-ink-muted">
              Watchlist
            </h2>
            {watchItems.length === 0 ? (
              <div className="card p-6 text-center">
                <div className="text-3xl">⭐</div>
                <p className="mt-2 text-sm text-ink-muted">
                  Save tickers from any report to track them here.
                </p>
              </div>
            ) : (
              <div className="card divide-y divide-line">
                {watchItems.map((w, i) => (
                  <div key={i} className="flex items-center justify-between p-4">
                    <div className="min-w-0">
                      <div className="font-display text-sm font-bold">{w.ticker}</div>
                      <div className="truncate text-xs text-ink-muted">{w.company_name}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold">{w.price}</div>
                      <div className="text-xs text-ink-muted">{w.change || 'price soon'}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </>
  );
}
