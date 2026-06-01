'use client';

import { useState } from 'react';

export default function ResultActions() {
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  async function share() {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    try {
      if (navigator.share) {
        await navigator.share({ title: 'AlphaLens research', url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* user dismissed */
    }
  }

  const base =
    'inline-flex items-center gap-1.5 rounded-lg border border-line px-3 py-2 text-sm transition hover:bg-surface2';

  return (
    <div className="flex flex-wrap gap-2 print:hidden">
      <button
        type="button"
        onClick={() => setSaved((v) => !v)}
        className={base}
        style={saved ? { borderColor: 'var(--green)', color: 'var(--green)' } : undefined}
      >
        🔖 {saved ? 'Saved' : 'Save'}
      </button>
      <button type="button" onClick={() => window.print()} className={base}>
        ⬇ Export PDF
      </button>
      <button type="button" onClick={share} className={base}>
        ↗ {copied ? 'Link copied' : 'Share'}
      </button>
    </div>
  );
}
