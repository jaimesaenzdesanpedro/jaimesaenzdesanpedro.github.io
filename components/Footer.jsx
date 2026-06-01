import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 py-10 sm:flex-row">
        <div className="font-display text-lg font-bold text-green">alphalens</div>
        <p className="text-sm text-ink-muted">
          AI-powered market research. Not investment advice.
        </p>
        <div className="flex gap-5 text-sm text-ink-muted">
          <Link href="/pricing" className="transition hover:text-ink">Pricing</Link>
          <Link href="/research" className="transition hover:text-ink">Research</Link>
          <Link href="/dashboard" className="transition hover:text-ink">Dashboard</Link>
        </div>
      </div>
    </footer>
  );
}
