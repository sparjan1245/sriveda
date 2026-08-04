import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatDate, formatCurrency, amountToWords } from "@/lib/utils";
import { getContactInfo } from "@/lib/contact";
import React from "react";
import { renderToBuffer } from "@react-pdf/renderer";
import BookingReceiptDoc from "@/components/pdf/BookingReceiptDoc";

export const maxDuration = 30;

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const token   = req.nextUrl.searchParams.get("token");

  const booking = await db.booking
    .findUnique({ where: { id }, include: { service: true, user: true } })
    .catch(() => null);

  if (!booking) return new NextResponse("Not found", { status: 404 });

  // Access: admin, booking owner, or valid guest token
  const session = await auth();
  const userId  = session?.user ? (session.user as { id: string }).id : null;
  const role    = session?.user ? (session.user as { role?: string }).role : null;

  const isAdmin   = role === "ADMIN";
  const isOwner   = !!(userId && booking.userId && booking.userId === userId);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const isGuestOk = !!(token && (booking as any).guestToken && token === (booking as any).guestToken);

  if (!isAdmin && !isOwner && !isGuestOk) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const receiptNo   = booking.receiptNumber || `VGCC/BKG/${id.slice(-6).toUpperCase()}`;
  const devoteeName = booking.user?.name || booking.guestName || "Devotee";
  const contact     = await getContactInfo();

  const proto   = req.headers.get("x-forwarded-proto") ?? "http";
  const host    = req.headers.get("host") ?? "localhost:4004";
  const baseUrl = `${proto}://${host}`;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const buffer = await (renderToBuffer as any)(
    React.createElement(BookingReceiptDoc, {
      logoUrl:         `${baseUrl}/logo.png`,
      receiptNo,
      createdAt:       formatDate(booking.createdAt),
      status:          booking.status,
      devoteeName,
      devoteeEmail:    booking.user?.email || booking.guestEmail  || undefined,
      devoteePhone:    booking.user?.phone || booking.guestPhone  || undefined,
      gotra:           booking.gotra       || undefined,
      nakshatra:       booking.nakshatra   || undefined,
      sankalpam:       booking.sankalpam   || undefined,
      serviceName:     booking.service.name,
      serviceDate:     formatDate(booking.date),
      occasion:        booking.occasion    || undefined,
      paymentMode:     booking.paymentMode,
      notes:           booking.notes       || undefined,
      amountFormatted: formatCurrency(booking.amount),
      amountInWords:   amountToWords(booking.amount),
      templeAddress:   contact.address,
      templePhone:     contact.phones[0],
      templeEmail:     contact.emails[0],
    })
  ) as Buffer;

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type":        "application/pdf",
      "Content-Disposition": `attachment; filename="booking-receipt-${receiptNo}.pdf"`,
    },
  });
}
