import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Stripe Checkout session creator.
 *
 * Stripe is being wired up later in the project, so until the keys are
 * present we return a friendly 503 the client can surface. Once
 * STRIPE_SECRET_KEY + STRIPE_PRO_PRICE_ID are set, this creates a real
 * Checkout Session via the Stripe REST API (no extra dependency needed).
 */
export async function POST(req) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Please log in to upgrade.' }, { status: 401 });
  }

  const secret = process.env.STRIPE_SECRET_KEY;
  const priceId = process.env.STRIPE_PRO_PRICE_ID;
  if (!secret || !priceId) {
    return NextResponse.json(
      { error: 'Pro checkout is coming soon — Stripe is not configured yet.' },
      { status: 503 }
    );
  }

  const origin = req.headers.get('origin') || new URL(req.url).origin;
  const form = new URLSearchParams({
    mode: 'subscription',
    'line_items[0][price]': priceId,
    'line_items[0][quantity]': '1',
    success_url: `${origin}/dashboard?upgraded=1`,
    cancel_url: `${origin}/pricing`,
    client_reference_id: userId,
  });

  const res = await fetch('https://api.stripe.com/v1/checkout/sessions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${secret}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: form,
  });

  if (!res.ok) {
    return NextResponse.json({ error: 'Could not start checkout.' }, { status: 502 });
  }
  const session = await res.json();
  return NextResponse.json({ url: session.url });
}
