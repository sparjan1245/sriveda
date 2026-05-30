import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { createCheckoutSession } from "@/lib/stripe";
import { SERVICES } from "@/lib/constants";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { serviceSlug, name, email, phone, date, occasion, notes } = await req.json();
    const userId = (session.user as { id: string }).id;

    const serviceData = SERVICES.find((s) => s.slug === serviceSlug);
    if (!serviceData) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    const dbService = await db.service.upsert({
      where: { slug: serviceSlug },
      update: {},
      create: {
        slug: serviceData.slug,
        name: serviceData.name,
        description: serviceData.description,
        price: serviceData.price,
        duration: serviceData.duration,
        image: serviceData.image,
        category: serviceData.category,
      },
    });

    const booking = await db.booking.create({
      data: {
        userId,
        serviceId: dbService.id,
        guestName: name,
        guestEmail: email,
        guestPhone: phone,
        date: new Date(date),
        occasion,
        notes,
        amount: serviceData.price,
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
              name: serviceData.name,
              description: serviceData.shortDesc,
              images: [serviceData.image],
            },
            unit_amount: Math.round(serviceData.price * 100),
          },
          quantity: 1,
        },
      ],
      successUrl: `${appUrl}/dashboard/bookings?success=true&bookingId=${booking.id}`,
      cancelUrl: `${appUrl}/services/${serviceSlug}`,
      metadata: { bookingId: booking.id },
      customerEmail: email,
    });

    await db.booking.update({
      where: { id: booking.id },
      data: { stripePaymentId: checkoutSession.id },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error("Booking checkout error:", error);
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
  }
}
