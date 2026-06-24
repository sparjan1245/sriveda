import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { createCheckoutSession } from "@/lib/stripe";
import { createPayPalOrder } from "@/lib/payments/paypal";
import { createSquareCheckout } from "@/lib/payments/square";
import { SERVICES } from "@/lib/constants";
import { randomBytes } from "crypto";

async function nextReceiptNumber(): Promise<string> {
  const counter = await db.counter.upsert({
    where:  { id: "booking" },
    create: { id: "booking", seq: 1 },
    update: { seq: { increment: 1 } },
  });
  return `VGCC/BKG${new Date().getFullYear()}/${String(counter.seq).padStart(4, "0")}`;
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    const {
      serviceId, serviceSlug, firstName, lastName, email,
      phone, date, occasion, notes, gateway = "stripe",
    } = await req.json();

    const name   = `${firstName ?? ""} ${lastName ?? ""}`.trim();
    const userId = session?.user ? (session.user as { id: string }).id : undefined;

    if (!name || !email || !phone || !date) {
      return NextResponse.json({ error: "Required fields are missing." }, { status: 400 });
    }

    if (!date || new Date(date) < new Date()) {
      return NextResponse.json({ error: "Please select a future date." }, { status: 400 });
    }

    let dbService: { id: string; name: string; price: number; shortDesc?: string | null; image?: string | null };

    if (serviceId) {
      // Use the DB service directly when ID is provided
      const found = await db.service.findUnique({ where: { id: serviceId } });
      if (!found) return NextResponse.json({ error: "Service not found" }, { status: 404 });
      dbService = found;
    } else {
      // Fallback: look up by slug and upsert from constants
      const serviceData = SERVICES.find((s) => s.slug === serviceSlug);
      if (!serviceData) return NextResponse.json({ error: "Service not found" }, { status: 404 });
      dbService = await db.service.upsert({
        where:  { slug: serviceSlug },
        update: {},
        create: {
          slug:        serviceData.slug,
          name:        serviceData.name,
          description: serviceData.description,
          price:       serviceData.price,
          duration:    serviceData.duration,
          image:       serviceData.image,
          category:    serviceData.category,
        },
      });
    }

    const receiptNumber = await nextReceiptNumber();
    const guestToken    = userId ? undefined : randomBytes(32).toString("hex");

    const booking = await db.booking.create({
      data: {
        userId,
        serviceId:      dbService.id,
        guestName:      name,
        guestEmail:     email,
        guestPhone:     phone,
        date:           new Date(date),
        occasion,
        notes,
        amount:         dbService.price,
        status:         "PENDING",
        paymentGateway: gateway,
        receiptNumber,
        guestToken,
      },
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:4000";

    // Success URL — guests land on /booking-success, auth users go to dashboard
    const tokenParam  = guestToken ? `&token=${guestToken}` : "";
    const successBase = userId
      ? `${appUrl}/booking-success?bookingId=${booking.id}`
      : `${appUrl}/booking-success?bookingId=${booking.id}${tokenParam}`;
    const cancelUrl   = serviceSlug ? `${appUrl}/services/${serviceSlug}` : `${appUrl}/services`;

    // ── PayPal ────────────────────────────────────────────────────────────────
    if (gateway === "paypal") {
      const { orderId, approveUrl } = await createPayPalOrder({
        amount:      dbService.price,
        description: dbService.name,
        returnUrl:   `${appUrl}/api/payments/paypal/capture?bookingId=${booking.id}${tokenParam}`,
        cancelUrl,
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await db.booking.update({ where: { id: booking.id }, data: { paypalOrderId: orderId } as any });
      return NextResponse.json({ url: approveUrl });
    }

    // ── Square ────────────────────────────────────────────────────────────────
    if (gateway === "square") {
      try {
        const { checkoutUrl, orderId } = await createSquareCheckout({
          amount:      dbService.price,
          description: dbService.name,
          referenceId: booking.id,
          redirectUrl: `${successBase}&gateway=square`,
        });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await db.booking.update({ where: { id: booking.id }, data: { squareOrderId: orderId } as any });
        return NextResponse.json({ url: checkoutUrl });
      } catch (squareErr) {
        await db.booking.delete({ where: { id: booking.id } }).catch(() => {});
        const msg = squareErr instanceof Error ? squareErr.message : "Square checkout failed";
        return NextResponse.json({ error: msg }, { status: 400 });
      }
    }

    // ── Stripe (default) ──────────────────────────────────────────────────────
    const checkoutSession = await createCheckoutSession({
      lineItems: [
        {
          price_data: {
            currency:     "usd",
            product_data: {
              name:        dbService.name,
              description: (dbService as { shortDesc?: string | null }).shortDesc ?? undefined,
              images:      dbService.image ? [dbService.image] : [],
            },
            unit_amount: Math.round(dbService.price * 100),
          },
          quantity: 1,
        },
      ],
      successUrl:    successBase,
      cancelUrl,
      metadata:      { bookingId: booking.id },
      customerEmail: email,
    });

    await db.booking.update({
      where: { id: booking.id },
      data:  { stripePaymentId: checkoutSession.id },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error("Booking checkout error:", error);
    const msg = error instanceof Error ? error.message : "Failed to create checkout session";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
