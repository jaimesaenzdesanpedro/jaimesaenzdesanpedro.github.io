'use client';

export default function LoadingOverlay({ label = 'Analyzing markets' }) {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-bg/95 backdrop-blur-sm">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(500px circle at 50% 40%, rgba(0,208,132,0.14), transparent 60%)',
        }}
      />
      <div className="relative flex flex-col items-center">
        <div className="mb-7 grid h-16 w-16 place-items-center rounded-2xl border border-green/40 bg-surface">
          <span className="font-display text-2xl font-bold text-green">A</span>
        </div>
        <div className="flex items-center gap-3 font-display text-xl font-semibold">
          {label}
          <span className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="inline-block h-2 w-2 rounded-full bg-green"
                style={{ animation: 'bounceDot 1.4s ease-in-out infinite', animationDelay: `${i * 0.16}s` }}
              />
            ))}
          </span>
        </div>
        <p className="mt-3 max-w-xs text-center text-sm text-ink-muted">
          Searching live sources and synthesizing your report. This usually takes
          under a minute.
        </p>
      </div>
    </div>
  );
}
