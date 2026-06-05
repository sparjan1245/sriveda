import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-04-22.dahlia",
});

export async function createPaymentIntent(
  amount: number,
  metadata: Record<string, string>
) {
  return stripe.paymentIntents.create({
    amount: Math.round(amount * 100),
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
  lineItems: Stripe.Checkout.SessionCreateParams["line_items"] extends (infer T)[] | null | undefined ? T[] : Record<string, unknown>[];
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
  customerEmail?: string;
  mode?: "payment" | "subscription";
}) {
  return stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: lineItems,
    mode,
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata,
    customer_email: customerEmail,
  });
}
