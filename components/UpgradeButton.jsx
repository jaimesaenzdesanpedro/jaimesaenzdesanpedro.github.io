'use client';

import { useState } from 'react';

export default function UpgradeButton({ className = '' }) {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  async function upgrade() {
    setLoading(true);
    setMsg('');
    try {
      const res = await fetch('/api/checkout', { method: 'POST' });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.url) {
        window.location.href = data.url;
        return;
      }
      setMsg(data.error || 'Checkout is not available yet. Please check back soon.');
    } catch {
      setMsg('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={upgrade}
        disabled={loading}
        className={`btn-green w-full px-5 py-3 text-sm disabled:opacity-50 ${className}`}
      >
        {loading ? 'Redirecting…' : 'Upgrade to Pro →'}
      </button>
      {msg && <p className="mt-2 text-center text-xs text-ink-muted">{msg}</p>}
    </div>
  );
}
