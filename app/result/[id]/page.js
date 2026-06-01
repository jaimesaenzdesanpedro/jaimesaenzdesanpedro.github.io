import Link from 'next/link';
import Navbar from '@/components/Navbar';
import CompanyLogo from '@/components/CompanyLogo';
import ResultActions from '@/components/ResultActions';
import { getResearch } from '@/lib/db';

export const dynamic = 'force-dynamic';

function ytdColor(ytd) {
  return String(ytd || '').trim().startsWith('-') ? 'var(--red)' : 'var(--green)';
}

export default async function ResultPage({ params }) {
  const record = await getResearch(params.id);

  if (!record) {
    return (
      <>
        <Navbar />
        <main className="mx-auto max-w-2xl px-5 py-24 text-center">
          <div className="text-5xl">🔍</div>
          <h1 className="mt-4 font-display text-2xl font-bold">Report not found</h1>
          <p className="mt-2 text-ink-muted">
            This research report may have expired or doesn&apos;t exist.
          </p>
          <Link href="/research" className="btn-green mt-6 inline-block px-5 py-2.5 text-sm">
            Start a new research →
          </Link>
        </main>
      </>
    );
  }

  const { sector, filters, result } = record;
  const { macro_context, highlight, companies = [], catalysts = [] } = result || {};
  const marketCap = filters?.market_cap;
  const tags = [marketCap, filters?.horizon, filters?.geography].filter(Boolean);

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-4xl px-5 pb-24 pt-10">
        {/* Header */}
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
              {sector}{marketCap ? ` — ${marketCap}` : ''}
            </h1>
            <div className="mt-3 flex flex-wrap gap-2">
              {tags.map((t) => (
                <span key={t} className="chip chip-active px-3 py-1 text-xs">
                  {t}
                </span>
              ))}
            </div>
          </div>
          <ResultActions />
        </div>

        {/* Macro context */}
        <section className="mt-10">
          <h2 className="mb-3 font-display text-sm font-bold uppercase tracking-wider text-ink-muted">
            Macro Context
          </h2>
          <div className="card p-6">
            {highlight && (
              <div className="mb-5 border-l-2 border-green pl-4">
                <div className="text-xs uppercase tracking-wider text-ink-muted">Highlight</div>
                <div className="font-display text-lg font-semibold text-green">{highlight}</div>
              </div>
            )}
            <div className="space-y-4 leading-relaxed text-ink">
              {String(macro_context || '')
                .split(/\n{2,}|\n/)
                .filter((p) => p.trim())
                .map((p, i) => (
                  <p key={i}>{p.trim()}</p>
                ))}
            </div>
          </div>
        </section>

        {/* Featured companies */}
        <section className="mt-10">
          <h2 className="mb-3 font-display text-sm font-bold uppercase tracking-wider text-ink-muted">
            Featured Companies
          </h2>
          <div className="space-y-3">
            {companies.map((c, i) => {
              const opportunity = c.signal_type === 'opportunity';
              const signalStyle = opportunity
                ? { backgroundColor: 'var(--green-dim)', color: 'var(--green)', borderColor: 'var(--green)' }
                : { backgroundColor: 'rgba(245,158,11,0.12)', color: '#f59e0b', borderColor: 'rgba(245,158,11,0.5)' };
              return (
                <div key={i} className="card flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
                  <CompanyLogo domain={c.domain} ticker={c.ticker} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{c.name}</span>
                      {c.ticker && (
                        <span className="rounded bg-surface2 px-1.5 py-0.5 font-display text-xs text-ink-muted">
                          {c.ticker}
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-sm text-ink-muted">{c.description}</p>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <div className="font-display text-base font-bold" style={{ color: ytdColor(c.ytd) }}>
                        {c.ytd}
                      </div>
                      <div className="text-xs text-ink-muted">YTD</div>
                    </div>
                    <div className="text-right">
                      <div className="font-display text-base font-bold">{c.pe}</div>
                      <div className="text-xs text-ink-muted">P/E</div>
                    </div>
                  </div>

                  {c.signal && (
                    <span
                      className="shrink-0 self-start rounded-full border px-3 py-1 text-xs font-medium sm:self-center"
                      style={signalStyle}
                    >
                      {c.signal}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Upcoming catalysts */}
        <section className="mt-10">
          <h2 className="mb-3 font-display text-sm font-bold uppercase tracking-wider text-ink-muted">
            Upcoming Catalysts
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {catalysts.map((cat, i) => (
              <div key={i} className="card p-5">
                <div className="font-display text-xs font-bold uppercase tracking-wider text-green">
                  {cat.date}
                </div>
                <div className="mt-1 font-semibold">{cat.title}</div>
                <p className="mt-1 text-sm text-ink-muted">{cat.description}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
