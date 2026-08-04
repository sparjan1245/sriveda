import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatDate, formatDateTime } from "@/lib/utils";
import { getContactInfo } from "@/lib/contact";
import React from "react";
import { renderToBuffer } from "@react-pdf/renderer";
import EventRegistrationDoc from "@/components/pdf/EventRegistrationDoc";

export const maxDuration = 30;

interface FamilyMember {
  name: string;
  birthStar?: string;
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const token = req.nextUrl.searchParams.get("token");

  const rsvp = await db.eventRsvp
    .findUnique({ where: { id }, include: { user: true, event: true } })
    .catch(() => null);

  if (!rsvp) return new NextResponse("Not found", { status: 404 });

  const session = await auth();
  const userId = session?.user ? (session.user as { id: string }).id : null;
  const role = session?.user ? (session.user as { role?: string }).role : null;

  const isAdmin = role === "ADMIN";
  const isOwner = !!(userId && rsvp.userId && rsvp.userId === userId);
  const isGuestOk = !!(token && rsvp.guestToken && token === rsvp.guestToken);

  if (!isAdmin && !isOwner && !isGuestOk) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const confirmationNo = `VGCC/REG/${id.slice(-6).toUpperCase()}`;
  const attendeeName = rsvp.user?.name || rsvp.guestName || "Devotee";
  const contact = await getContactInfo();
  const familyMembers = (Array.isArray(rsvp.familyMembers) ? rsvp.familyMembers : []) as unknown as FamilyMember[];

  const proto = req.headers.get("x-forwarded-proto") ?? "http";
  const host = req.headers.get("host") ?? "localhost:4004";
  const baseUrl = `${proto}://${host}`;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const buffer = await (renderToBuffer as any)(
    React.createElement(EventRegistrationDoc, {
      logoUrl: `${baseUrl}/logo.png`,
      confirmationNo,
      createdAt: formatDate(rsvp.createdAt),
      attendeeName,
      attendeeEmail: rsvp.user?.email || rsvp.guestEmail || undefined,
      attendeePhone: rsvp.user?.phone || rsvp.guestPhone || undefined,
      eventTitle: rsvp.event.title,
      eventDate: formatDateTime(rsvp.event.date),
      eventLocation: rsvp.event.location || undefined,
      familyMembers,
      templeAddress: contact.address,
      templePhone: contact.phones[0],
      templeEmail: contact.emails[0],
    })
  ) as Buffer;

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="event-registration-${confirmationNo}.pdf"`,
    },
  });
}
