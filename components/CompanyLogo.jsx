'use client';

import { useState } from 'react';

export default function CompanyLogo({ domain, ticker }) {
  const [failed, setFailed] = useState(!domain);

  if (failed) {
    return (
      <div className="grid h-11 w-11 shrink-0 place-items-center rounded-lg border border-green/40 bg-green/10 font-display text-sm font-bold text-green">
        {(ticker || '?').slice(0, 4)}
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`https://logo.clearbit.com/${domain}`}
      alt={ticker || 'logo'}
      width={44}
      height={44}
      className="h-11 w-11 shrink-0 rounded-lg bg-white object-contain"
      onError={() => setFailed(true)}
    />
  );
}
