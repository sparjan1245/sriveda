import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";
import { sendBookingEmails, sendDonationEmails } from "@/lib/email";
import Stripe from "stripe";

export async function POST(req: Request) {
  const body = await req.text();
  const sig  = req.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    console.error("Webhook signature failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const { bookingId, donationId } = session.metadata || {};
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:4000";

    if (bookingId) {
      await db.booking.update({
        where: { id: bookingId },
        data:  { status: "CONFIRMED", stripePaymentId: session.payment_intent as string },
      }).catch(console.error);

      // Send confirmation + admin emails with PDF receipt
      sendBookingEmails(bookingId, appUrl).catch(console.error);
    }

    if (donationId) {
      const paymentRef = (session.payment_intent as string) || session.id;
      const receiptUrl = (session.invoice as string) || undefined;
      await db.donation.update({
        where: { id: donationId },
        data:  {
          status:          "COMPLETED",
          stripePaymentId: paymentRef,
          receiptUrl,
        },
      }).catch(console.error);

      sendDonationEmails(donationId, appUrl).catch(console.error);
    }
  }

  return NextResponse.json({ received: true });
}
