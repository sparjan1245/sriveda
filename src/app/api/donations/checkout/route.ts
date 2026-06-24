import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { createCheckoutSession } from "@/lib/stripe";
import { createPayPalOrder } from "@/lib/payments/paypal";
import { createSquareCheckout } from "@/lib/payments/square";
import { formatReceiptNumber } from "@/lib/utils";
import { randomBytes } from "crypto";
import { sendDonationEmails } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const session = await auth();
    const {
      amount, cause, firstName, lastName, email,
      phone, message, recurring, gateway = "stripe",
    } = await req.json();

    const name = `${firstName ?? ""} ${lastName ?? ""}`.trim();

    if (!amount || amount < 1) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }
    if (phone) {
      const digits = String(phone).replace(/\D/g, "");
      if (digits.length < 10 || digits.length > 15) {
        return NextResponse.json({ error: "Invalid phone number" }, { status: 400 });
      }
    }

    const userId = session?.user ? (session.user as { id: string }).id : undefined;

    // Receipt number + guest token (same pattern as bookings)
    const counter = await db.counter.upsert({
      where:  { id: "receipt-donation" },
      update: { seq: { increment: 1 } },
      create: { id: "receipt-donation", seq: 1 },
    });
    const receiptNumber = formatReceiptNumber("DON", counter.seq);
    const guestToken    = userId ? undefined : randomBytes(32).toString("hex");

    const donation = await db.donation.create({
      data: {
        userId,
        guestName:      name,
        guestEmail:     email      || null,
        guestPhone:     phone      || null,
        amount,
        cause,
        message:        message    || null,
        recurring:      recurring  || false,
        status:         "PENDING",
        paymentGateway: gateway,
        receiptNumber,
        guestToken,
      },
    });

    const appUrl      = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:4000";
    const tokenParam  = guestToken ? `&token=${guestToken}` : "";
    const successBase = `${appUrl}/donation-success?donationId=${donation.id}${tokenParam}`;
    const cancelUrl   = `${appUrl}/donate`;

    // ── PayPal ─────────────────────────────────────────────────────────
    if (gateway === "paypal") {
      const { orderId, approveUrl } = await createPayPalOrder({
        amount,
        description: `Donation — ${cause}`,
        returnUrl:   `${appUrl}/api/payments/paypal/capture?donationId=${donation.id}${tokenParam}`,
        cancelUrl,
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await db.donation.update({ where: { id: donation.id }, data: { paypalOrderId: orderId } as any });
      return NextResponse.json({ url: approveUrl });
    }

    // ── Square ─────────────────────────────────────────────────────────
    if (gateway === "square") {
      try {
        const { checkoutUrl, orderId } = await createSquareCheckout({
          amount,
          description: `Donation — ${cause}`,
          referenceId:  donation.id,
          redirectUrl:  `${successBase}&gateway=square`,
        });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await db.donation.update({ where: { id: donation.id }, data: { squareOrderId: orderId } as any });
        return NextResponse.json({ url: checkoutUrl });
      } catch (squareErr) {
        await db.donation.delete({ where: { id: donation.id } }).catch(() => {});
        const msg = squareErr instanceof Error ? squareErr.message : "Square checkout failed";
        return NextResponse.json({ error: msg }, { status: 400 });
      }
    }

    // ── Stripe (default) ───────────────────────────────────────────────
    const checkoutSession = await createCheckoutSession({
      lineItems: [
        {
          price_data: {
            currency:     "usd",
            product_data: {
              name:        cause,
              description: `Donation to Sri Veda Gayatri Temple — ${cause}`,
            },
            unit_amount: Math.round(amount * 100),
            ...(recurring ? { recurring: { interval: "month" } } : {}),
          },
          quantity: 1,
        },
      ],
      successUrl:    `${successBase}&gateway=stripe`,
      cancelUrl,
      metadata:      { donationId: donation.id },
      customerEmail: email,
      mode:          recurring ? "subscription" : "payment",
    });

    await db.donation.update({
      where: { id: donation.id },
      data:  { stripePaymentId: checkoutSession.id },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error("Donation checkout error:", error);
    const msg = error instanceof Error ? error.message : "Failed to create checkout session";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// Called by Stripe webhook after payment confirmed
export async function PATCH(req: Request) {
  const { donationId, appUrl } = await req.json();
  if (!donationId) return NextResponse.json({ error: "Missing donationId" }, { status: 400 });
  await db.donation.update({ where: { id: donationId }, data: { status: "COMPLETED" } });
  sendDonationEmails(donationId, appUrl || "http://localhost:4000").catch(console.error);
  return NextResponse.json({ ok: true });
}
