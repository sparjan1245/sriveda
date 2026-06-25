import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatDate, formatCurrency, amountToWords } from "@/lib/utils";
import { TEMPLE } from "@/lib/constants";
import React from "react";
import { renderToBuffer } from "@react-pdf/renderer";
import DonationReceiptDoc from "@/components/pdf/DonationReceiptDoc";

export const maxDuration = 30;

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id }  = await params;
  const token   = req.nextUrl.searchParams.get("token");

  const donation = await db.donation
    .findUnique({ where: { id }, include: { user: true } })
    .catch(() => null);

  if (!donation) return new NextResponse("Not found", { status: 404 });

  // Access: admin, donation owner, or valid guest token
  const session  = await auth();
  const userId   = session?.user ? (session.user as { id: string }).id    : null;
  const role     = session?.user ? (session.user as { role?: string }).role : null;

  const isAdmin   = role === "ADMIN";
  const isOwner   = !!(userId && donation.userId && donation.userId === userId);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const isGuestOk = !!(token && (donation as any).guestToken && token === (donation as any).guestToken);

  if (!isAdmin && !isOwner && !isGuestOk) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const receiptNo = donation.receiptNumber || `VGCC/DON/${id.slice(-6).toUpperCase()}`;
  const donorName = donation.user?.name || donation.guestName || "Devotee";

  const proto   = req.headers.get("x-forwarded-proto") ?? "http";
  const host    = req.headers.get("host") ?? "localhost:4000";
  const baseUrl = `${proto}://${host}`;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const buffer = await (renderToBuffer as any)(
    React.createElement(DonationReceiptDoc, {
      logoUrl:         `${baseUrl}/logo.png`,
      receiptNo,
      createdAt:       formatDate(donation.createdAt),
      donorName,
      donorEmail:      donation.user?.email || donation.guestEmail || undefined,
      donorPhone:      donation.user?.phone || donation.guestPhone || undefined,
      address:         donation.address     || undefined,
      cause:           donation.cause,
      paymentMode:     donation.paymentMode,
      checkRef:        donation.checkRef    || undefined,
      message:         donation.message     || undefined,
      amountFormatted: formatCurrency(donation.amount),
      amountInWords:   amountToWords(donation.amount),
      taxId:           TEMPLE.taxId,
      templeAddress:   TEMPLE.address,
      templePhone:     TEMPLE.phones[0],
      templeEmail:     TEMPLE.emails[0],
    })
  ) as Buffer;

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type":        "application/pdf",
      "Content-Disposition": `attachment; filename="donation-receipt-${receiptNo}.pdf"`,
    },
  });
}
