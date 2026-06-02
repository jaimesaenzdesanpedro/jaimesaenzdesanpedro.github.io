'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import LoadingOverlay from '@/components/LoadingOverlay';
import { SECTORS, MARKET_CAPS, HORIZONS, GEOGRAPHIES } from '@/lib/constants';

function Label({ children, hint }) {
  return (
    <div className="mb-3 flex items-baseline justify-between">
      <h2 className="font-display text-sm font-bold uppercase tracking-wider text-ink-muted">
        {children}
      </h2>
      {hint ? <span className="text-xs text-ink-muted">{hint}</span> : null}
    </div>
  );
}

export default function ResearchPage() {
  const router = useRouter();
  const [sectorId, setSectorId] = useState(null);
  const [customSector, setCustomSector] = useState('');
  const [marketCap, setMarketCap] = useState('all');
  const [horizon, setHorizon] = useState('mid');
  const [geography, setGeography] = useState('global');
  const [loading, setLoading] = useState(false);
  const [complete, setComplete] = useState(false);
  const [resultId, setResultId] = useState(null);
  const [error, setError] = useState('');

  const selectedSector = SECTORS.find((s) => s.id === sectorId);
  const isOther = sectorId === 'other';

  const sectorName = isOther ? customSector.trim() : selectedSector?.name || '';
  const capLabel = MARKET_CAPS.find((m) => m.id === marketCap)?.label;
  const horizonLabel = HORIZONS.find((h) => h.id === horizon)?.label;
  const geoLabel = GEOGRAPHIES.find((g) => g.id === geography)?.label;

  const ready = sectorName.length > 0;

  const summary = useMemo(() => {
    const parts = [sectorName || 'Select a sector', capLabel, horizonLabel, geoLabel].filter(Boolean);
    return parts.join('  ·  ');
  }, [sectorName, capLabel, horizonLabel, geoLabel]);

  async function handleGenerate() {
    if (!ready || loading) return;
    setError('');
    setComplete(false);
    setResultId(null);
    setLoading(true);
    try {
      const res = await fetch('/api/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sector: sectorName,
          market_cap: capLabel,
          horizon: horizonLabel,
          geography: geoLabel,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setLoading(false);
        setError(data.error || 'Something went wrong. Please try again.');
        return;
      }

      const data = await res.json();
      // Hand the id to the overlay; it fills the bar to 100%, fades out, then
      // calls onDone to navigate. Keeps the loading animation on screen until
      // the result page is ready.
      setResultId(data.id);
      setComplete(true);
    } catch (e) {
      setLoading(false);
      setError('Network error. Please try again.');
    }
  }

  return (
    <>
      <Navbar />
      {loading && (
        <LoadingOverlay
          complete={complete}
          onDone={() => resultId && router.push(`/result/${resultId}`)}
        />
      )}

      <main className="mx-auto max-w-4xl px-5 pb-40 pt-10">
        <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
          New research
        </h1>
        <p className="mt-2 text-ink-muted">
          Choose what to analyze. We&apos;ll pull live data and build your report.
        </p>

        {/* Sector */}
        <div className="mt-10">
          <Label>Market Sector</Label>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {SECTORS.map((s) => {
              const active = sectorId === s.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSectorId(s.id)}
                  className={`card flex flex-col items-start gap-1 p-4 text-left transition ${
                    s.custom ? 'border-dashed' : ''
                  } ${active ? 'ring-2 ring-green' : 'hover:border-green/60'}`}
                  style={active ? { borderColor: 'var(--green)' } : undefined}
                >
                  <span className="text-2xl">{s.icon}</span>
                  <span className="font-semibold">{s.name}</span>
                  <span className="text-xs text-ink-muted">{s.blurb}</span>
                </button>
              );
            })}
          </div>

          {isOther && (
            <div className="mt-3 animate-fadeUp">
              <input
                autoFocus
                value={customSector}
                onChange={(e) => setCustomSector(e.target.value)}
                placeholder="Type a custom sector, e.g. Quantum computing"
                className="w-full rounded-xl border border-line bg-surface px-4 py-3 text-ink outline-none transition focus:border-green"
              />
            </div>
          )}
        </div>

        {/* Market cap */}
        <div className="mt-10">
          <Label>Market Capitalization</Label>
          <div className="flex flex-wrap gap-2">
            {MARKET_CAPS.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setMarketCap(m.id)}
                className={`chip px-4 py-2 text-sm ${marketCap === m.id ? 'chip-active' : ''}`}
              >
                {m.label}
                {m.sub ? <span className="ml-1 opacity-70">{m.sub}</span> : null}
              </button>
            ))}
          </div>
        </div>

        {/* Horizon */}
        <div className="mt-10">
          <Label>Time Horizon</Label>
          <div className="flex flex-wrap gap-2">
            {HORIZONS.map((h) => (
              <button
                key={h.id}
                type="button"
                onClick={() => setHorizon(h.id)}
                className={`chip px-4 py-2 text-sm ${horizon === h.id ? 'chip-active' : ''}`}
              >
                {h.label}
                <span className="ml-1 opacity-70">({h.sub})</span>
              </button>
            ))}
          </div>
        </div>

        {/* Geography */}
        <div className="mt-10">
          <Label>Geography</Label>
          <div className="flex flex-wrap gap-2">
            {GEOGRAPHIES.map((g) => (
              <button
                key={g.id}
                type="button"
                onClick={() => setGeography(g.id)}
                className={`chip px-4 py-2 text-sm ${geography === g.id ? 'chip-active' : ''}`}
              >
                {g.label}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="mt-8 rounded-xl border border-[color:var(--red)] bg-[color:var(--red)]/10 px-4 py-3 text-sm" style={{ color: 'var(--red)' }}>
            {error}
          </div>
        )}
      </main>

      {/* Sticky bottom bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line backdrop-blur-md" style={{ backgroundColor: 'color-mix(in srgb, var(--bg) 85%, transparent)' }}>
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-5 py-4">
          <div className="min-w-0">
            <div className="text-xs uppercase tracking-wider text-ink-muted">Selected</div>
            <div className="truncate text-sm font-medium">{summary}</div>
          </div>
          <button
            type="button"
            onClick={handleGenerate}
            disabled={!ready || loading}
            className="btn-green shrink-0 px-6 py-3 text-sm disabled:cursor-not-allowed disabled:opacity-40"
          >
            Generate Research →
          </button>
        </div>
      </div>
    </>
  );
}
