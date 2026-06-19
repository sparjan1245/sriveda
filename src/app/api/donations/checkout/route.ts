import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { createCheckoutSession } from "@/lib/stripe";

export async function POST(req: Request) {
  try {
    const session = await auth();
    const { amount, cause, firstName, lastName, email, message, recurring } = await req.json();
    const name = `${firstName ?? ""} ${lastName ?? ""}`.trim();

    if (!amount || amount < 1) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    const userId = session?.user ? (session.user as { id: string }).id : undefined;

    const donation = await db.donation.create({
      data: {
        userId,
        guestName: name,
        guestEmail: email,
        amount,
        cause,
        message,
        recurring: recurring || false,
        status: "PENDING",
      },
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const checkoutSession = await createCheckoutSession({
      lineItems: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: cause,
              description: `Donation to Sri Veda Gayatri Temple — ${cause}`,
            },
            unit_amount: Math.round(amount * 100),
            ...(recurring
              ? {
                  recurring: { interval: "month" },
                }
              : {}),
          },
          quantity: 1,
        },
      ],
      successUrl: `${appUrl}/donate?success=true&donationId=${donation.id}`,
      cancelUrl: `${appUrl}/donate`,
      metadata: { donationId: donation.id },
      customerEmail: email,
      mode: recurring ? "subscription" : "payment",
    });

    await db.donation.update({
      where: { id: donation.id },
      data: { stripePaymentId: checkoutSession.id },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error("Donation checkout error:", error);
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
  }
}
