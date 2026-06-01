import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import UpgradeButton from '@/components/UpgradeButton';

function Check({ children, muted }) {
  return (
    <li className="flex items-start gap-2 text-sm">
      <span className="mt-0.5 text-green">✓</span>
      <span className={muted ? 'text-ink-muted' : ''}>{children}</span>
    </li>
  );
}

export default function PricingPage() {
  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-4xl px-5 pb-24 pt-16">
        <div className="text-center">
          <h1 className="font-display text-4xl font-extrabold tracking-tight sm:text-5xl">
            Simple, honest pricing
          </h1>
          <p className="mx-auto mt-4 max-w-md text-ink-muted">
            Start free. Upgrade when you want unlimited research and your full history.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {/* Free */}
          <div className="card flex flex-col p-7">
            <div className="font-display text-lg font-bold">Free</div>
            <div className="mt-2">
              <span className="font-display text-4xl font-extrabold">€0</span>
              <span className="text-ink-muted">/month</span>
            </div>
            <p className="mt-2 text-sm text-ink-muted">For trying things out.</p>

            <ul className="mt-6 space-y-3">
              <Check>2 searches / month</Check>
              <Check>Basic filters</Check>
              <Check muted>No saved history</Check>
            </ul>

            <div className="mt-auto pt-8">
              <Link
                href="/research"
                className="btn-ghost block w-full px-5 py-3 text-center text-sm"
              >
                Get started
              </Link>
            </div>
          </div>

          {/* Pro */}
          <div
            className="card relative flex flex-col p-7"
            style={{ borderColor: 'var(--green)', boxShadow: '0 0 0 1px var(--green)' }}
          >
            <span className="absolute -top-3 left-7 rounded-full bg-green px-3 py-1 text-xs font-bold text-[#04130c]">
              Most popular
            </span>

            <div className="flex items-center gap-2">
              <span className="font-display text-lg font-bold">Pro</span>
            </div>
            <div className="mt-2">
              <span className="font-display text-4xl font-extrabold">€15</span>
              <span className="text-ink-muted">/month</span>
            </div>
            <p className="mt-2 text-sm text-ink-muted">For active investors.</p>

            <ul className="mt-6 space-y-3">
              <Check>Unlimited searches</Check>
              <Check>All filters</Check>
              <Check>Full research history</Check>
              <Check>Watchlist</Check>
              <Check>PDF export</Check>
              <Check muted>
                Weekly email digest{' '}
                <span className="ml-1 rounded-full border border-line px-2 py-0.5 text-[10px] uppercase tracking-wide">
                  Coming soon
                </span>
              </Check>
            </ul>

            <div className="mt-auto pt-8">
              <UpgradeButton />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
