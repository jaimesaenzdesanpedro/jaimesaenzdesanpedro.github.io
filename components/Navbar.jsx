'use client';

import Link from 'next/link';
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from '@clerk/nextjs';
import ThemeToggle from './ThemeToggle';

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-line backdrop-blur-md" style={{ backgroundColor: 'color-mix(in srgb, var(--bg) 80%, transparent)' }}>
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <Link href="/" className="font-display text-xl font-bold tracking-tight text-green">
          alphalens
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />

          <SignedIn>
            <Link href="/dashboard" className="hidden rounded-lg px-3 py-2 text-sm text-ink-muted transition hover:text-ink sm:block">
              Dashboard
            </Link>
            <Link href="/research" className="btn-green px-4 py-2 text-sm">
              New research
            </Link>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>

          <SignedOut>
            <SignInButton mode="modal">
              <button className="rounded-lg px-3 py-2 text-sm text-ink-muted transition hover:text-ink">
                Log in
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="btn-green px-4 py-2 text-sm">Get started free</button>
            </SignUpButton>
          </SignedOut>
        </div>
      </nav>
    </header>
  );
}
