# AlphaLens

AI-powered market research for retail investors. Pick a sector, set your
filters, and get a structured, source-backed report — macro context, featured
companies, and upcoming catalysts — generated in about a minute.

## Tech stack

- **Next.js 14** (App Router) + **React 18**
- **Tailwind CSS** with a CSS-variable design system (dark default + light toggle)
- **Clerk** — authentication
- **Supabase** — database (user records, research history, watchlist)
- **Anthropic API** (Claude Sonnet) — report generation
- **Tavily API** — live web search
- **Stripe** — payments (wired up later in the project)

## Pages

| Route | Description |
| --- | --- |
| `/` | Landing page — hero, stats, browser-style preview card |
| `/research` | Protected. Sector + market-cap + horizon + geography filters |
| `/api/research` | POST. Rate-limited, plan-gated. Tavily → Claude → persist |
| `/result/[id]` | Report: macro context, featured companies, upcoming catalysts |
| `/dashboard` | Protected. Stats, research history, watchlist |
| `/pricing` | Free vs Pro plans; Pro connects to Stripe Checkout |

## Design system

- Fonts: **Syne** (headings/numbers) + **DM Sans** (body), via `next/font`
- Tokens (`app/globals.css`): `--green: #00D084`, `--bg-dark: #090E0C`,
  `--surface-dark: #101710`, `--surface2-dark: #162016`, `--bg-light: #F3F7F4`
- Theme is applied before paint to avoid a flash; preference stored in
  `localStorage` and toggled on `<html>` via the `.light` class.

## Getting started

```bash
npm install
cp .env.example .env.local   # fill in your keys
npm run dev                  # http://localhost:3000
```

### Environment variables

See `.env.example`. Required for full functionality:

- `ANTHROPIC_API_KEY` (and optional `ANTHROPIC_MODEL`)
- `TAVILY_API_KEY`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` / `CLERK_SECRET_KEY`
- `NEXT_PUBLIC_SUPABASE_URL` (a full `https://<ref>.supabase.co` URL) +
  `SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_SECRET_KEY` / `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` /
  `STRIPE_PRO_PRICE_ID` (added later)

### Database

Run `supabase/schema.sql` in the Supabase SQL editor to create the `users`,
`research_history`, and `watchlist` tables.

## Graceful degradation

The app is built to run even when an integration isn't fully configured:

- **Supabase not configured** → research history, usage counters, and the
  watchlist fall back to an in-memory store (`lib/store.js`), so the app stays
  fully functional in development.
- **Tavily unreachable** → the research route logs a warning and lets Claude
  generate from its own knowledge rather than failing the request.
- **Stripe not configured** → the Pro upgrade button surfaces a friendly
  "coming soon" message; once keys are set it creates a real Checkout Session.

## Notes / deviations

Two adjustments were made for the environment this was built in:

1. **Model:** the spec asked for `claude-sonnet-4-20250514`, which is no longer
   available on the provided account. The default is `claude-sonnet-4-5-20250929`,
   overridable via `ANTHROPIC_MODEL`.
2. **Network egress:** `api.tavily.com`, `logo.clearbit.com`, and
   `api.stripe.com` are blocked by this environment's network policy, while
   `api.anthropic.com` is allowed. The code is correct and works in an
   environment / deployment whose network policy permits those hosts. See the
   [network policy docs](https://code.claude.com/docs/en/claude-code-on-the-web).

> Not investment advice.
