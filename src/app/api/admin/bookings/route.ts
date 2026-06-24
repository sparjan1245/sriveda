import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatReceiptNumber } from "@/lib/utils";
import { sendBookingEmails } from "@/lib/email";
import { randomBytes } from "crypto";

export async function POST(req: Request) {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  if (role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const {
      firstName, lastName, email, phone,
      serviceId, date, occasion, gotra, nakshatra, sankalpam,
      paymentMode, amount, notes,
    } = await req.json();

    if (!firstName || !lastName || !serviceId || !date) {
      return NextResponse.json({ error: "First name, last name, service and date are required." }, { status: 400 });
    }

    const service = await db.service.findUnique({ where: { id: serviceId } });
    if (!service) return NextResponse.json({ error: "Service not found." }, { status: 404 });

    const guestName = `${firstName} ${lastName}`.trim();

    const counter = await db.counter.upsert({
      where:  { id: "receipt-booking" },
      update: { seq: { increment: 1 } },
      create: { id: "receipt-booking", seq: 1 },
    });

    const receiptNumber = formatReceiptNumber("BKG", counter.seq);
    // Generate a guest token so the devotee can download their receipt via email link
    const guestToken = randomBytes(32).toString("hex");

    const booking = await db.booking.create({
      data: {
        guestName,
        guestEmail:  email    || null,
        guestPhone:  phone    || null,
        guestToken,
        serviceId,
        date:        new Date(date),
        occasion:    occasion  || null,
        gotra:       gotra     || null,
        nakshatra:   nakshatra || null,
        sankalpam:   sankalpam || null,
        notes:       notes     || null,
        paymentMode: paymentMode || "CASH",
        amount:      amount ? parseFloat(amount) : service.price,
        isAdminEntry: true,
        receiptNumber,
        status:      "CONFIRMED",
      },
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:4000";
    // Fire-and-forget — don't block the response
    sendBookingEmails(booking.id, appUrl).catch(console.error);

    return NextResponse.json({ id: booking.id, receiptNumber });
  } catch (error) {
    console.error("Admin booking entry error:", error);
    return NextResponse.json({ error: "Failed to create booking." }, { status: 500 });
  }
}
