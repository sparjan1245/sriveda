import Stripe from "stripe";
import { db } from "@/lib/db";
import { decrypt } from "@/lib/encryption";

const API_VERSION = "2026-04-22.dahlia" as const;

// Static instance used ONLY for webhook signature verification
// (constructEvent is a local HMAC check — it doesn't need a valid API key)
export const stripe = new Stripe(
  process.env.STRIPE_SECRET_KEY || "sk_placeholder",
  { apiVersion: API_VERSION }
);

function isPlaceholder(key: string | undefined): boolean {
  return !key || key.includes("...") || key === "sk_placeholder";
}

/** Returns a Stripe client using the secret key from DB settings (preferred) or env fallback. */
async function getStripeClient(): Promise<Stripe> {
  // Try DB-stored key first
  const s = await db.siteSettings.findUnique({ where: { id: "main" } });
  if (s?.stripeEnabled && s.stripeSecretKey) {
    const key = decrypt(s.stripeSecretKey);
    if (key && key.startsWith("sk_")) {
      return new Stripe(key, { apiVersion: API_VERSION });
    }
  }

  // Fall back to env var
  const envKey = process.env.STRIPE_SECRET_KEY;
  if (isPlaceholder(envKey)) {
    throw new Error(
      "Stripe is not configured. Add your Stripe Secret Key in Admin → Settings → Stripe."
    );
  }
  return stripe;
}

export async function createPaymentIntent(amount: number, metadata: Record<string, string>) {
  const client = await getStripeClient();
  return client.paymentIntents.create({
    amount:   Math.round(amount * 100),
    currency: "usd",
    metadata,
  });
}

export async function createCheckoutSession({
  lineItems,
  successUrl,
  cancelUrl,
  metadata,
  customerEmail,
  mode = "payment",
}: {
  lineItems: Stripe.Checkout.SessionCreateParams["line_items"] extends (infer T)[] | null | undefined
    ? T[]
    : Record<string, unknown>[];
  successUrl:    string;
  cancelUrl:     string;
  metadata?:     Record<string, string>;
  customerEmail?: string;
  mode?:         "payment" | "subscription";
}) {
  const client = await getStripeClient();
  return client.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items:    lineItems,
    mode,
    success_url:   successUrl,
    cancel_url:    cancelUrl,
    metadata,
    customer_email: customerEmail,
  });
}
