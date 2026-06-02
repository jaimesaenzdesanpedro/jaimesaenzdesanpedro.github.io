'use client';

import { useEffect, useState } from 'react';

const MESSAGES = [
  'Scanning market data...',
  'Analyzing sector trends...',
  'Identifying key companies...',
  'Evaluating upcoming catalysts...',
  'Generating your report...',
];

/**
 * Full-screen loading overlay shown while research is generated.
 *
 * - radar pulse (3 concentric green rings)
 * - status text cycling every 2s with a fade
 * - progress bar that fills 0 → 90% over 15s, then jumps to 100% when the real
 *   response arrives (`complete`), fades out, and calls `onDone` to redirect.
 */
export default function LoadingOverlay({ complete = false, onDone }) {
  const [msgIndex, setMsgIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(true);

  // Kick the progress bar toward 90% on mount (CSS transition does the easing).
  useEffect(() => {
    const raf = requestAnimationFrame(() => setProgress(90));
    return () => cancelAnimationFrame(raf);
  }, []);

  // Cycle the status messages.
  useEffect(() => {
    const id = setInterval(() => {
      setMsgIndex((i) => (i + 1) % MESSAGES.length);
    }, 2000);
    return () => clearInterval(id);
  }, []);

  // When the response arrives: fill to 100%, fade out, then redirect.
  useEffect(() => {
    if (!complete) return;
    setProgress(100);
    const fade = setTimeout(() => setVisible(false), 450);
    const done = setTimeout(() => onDone && onDone(), 950);
    return () => {
      clearTimeout(fade);
      clearTimeout(done);
    };
  }, [complete, onDone]);

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center"
      style={{
        backgroundColor: 'rgba(9, 14, 12, 0.95)',
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.5s ease',
      }}
      aria-live="polite"
      role="status"
    >
      {/* Logo */}
      <div className="mb-12 font-display text-2xl font-bold tracking-tight text-green">
        alphalens
      </div>

      {/* Radar pulse */}
      <div className="relative grid h-40 w-40 place-items-center">
        <span className="radar-ring" style={{ animationDelay: '0s' }} />
        <span className="radar-ring" style={{ animationDelay: '0.6s' }} />
        <span className="radar-ring" style={{ animationDelay: '1.2s' }} />
        <span className="h-3 w-3 rounded-full bg-green shadow-[0_0_16px_4px_rgba(0,208,132,0.6)]" />
      </div>

      {/* Cycling status text */}
      <div className="mt-10 h-6 text-center">
        <span key={msgIndex} className="loading-msg font-display text-lg font-semibold text-[#e8efe9]">
          {MESSAGES[msgIndex]}
        </span>
      </div>

      {/* Progress bar pinned to the bottom of the screen */}
      <div className="absolute inset-x-0 bottom-0 h-1 w-full bg-white/5">
        <div
          className="h-full bg-green"
          style={{
            width: `${progress}%`,
            transition: complete
              ? 'width 0.35s ease-out'
              : 'width 15s cubic-bezier(0.22, 1, 0.36, 1)',
          }}
        />
      </div>
    </div>
  );
}
