import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatDate, formatCurrency, amountToWords } from "@/lib/utils";
import { TEMPLE } from "@/lib/constants";
import React from "react";
import { renderToBuffer } from "@react-pdf/renderer";
import BookingReceiptDoc from "@/components/pdf/BookingReceiptDoc";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const session = await auth();
  if (!session?.user) return new NextResponse("Unauthorized", { status: 401 });

  const userId = (session.user as { id: string }).id;
  const role = (session.user as { role?: string }).role;

  const booking = await db.booking
    .findUnique({ where: { id }, include: { service: true, user: true } })
    .catch(() => null);

  if (!booking) return new NextResponse("Not found", { status: 404 });

  const isOwner = booking.userId && booking.userId === userId;
  if (role !== "ADMIN" && !isOwner) return new NextResponse("Forbidden", { status: 403 });

  const receiptNo = booking.receiptNumber || `SVT-BKG-${id.slice(-6).toUpperCase()}`;
  const devoteeName = booking.user?.name || booking.guestName || "Devotee";

  const proto = req.headers.get("x-forwarded-proto") ?? "http";
  const host = req.headers.get("host") ?? "localhost:4000";
  const baseUrl = `${proto}://${host}`;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const buffer = await (renderToBuffer as any)(
    React.createElement(BookingReceiptDoc, {
      logoUrl: `${baseUrl}/logo.png`,
      receiptNo,
      createdAt: formatDate(booking.createdAt),
      status: booking.status,
      devoteeName,
      devoteeEmail: booking.user?.email || booking.guestEmail || undefined,
      devoteePhone: booking.user?.phone || booking.guestPhone || undefined,
      gotra: booking.gotra || undefined,
      nakshatra: booking.nakshatra || undefined,
      sankalpam: booking.sankalpam || undefined,
      serviceName: booking.service.name,
      serviceDate: formatDate(booking.date),
      occasion: booking.occasion || undefined,
      paymentMode: booking.paymentMode,
      notes: booking.notes || undefined,
      amountFormatted: formatCurrency(booking.amount),
      amountInWords: amountToWords(booking.amount),
      templeAddress: TEMPLE.address,
      templePhone: TEMPLE.phones[0],
      templeEmail: TEMPLE.emails[0],
    })
  ) as Buffer;

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="booking-receipt-${receiptNo}.pdf"`,
    },
  });
}
