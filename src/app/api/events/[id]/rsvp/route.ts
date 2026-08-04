import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { randomBytes } from "crypto";
import type { Prisma } from "@prisma/client";
import { sendEventRegistrationEmail } from "@/lib/email";

// GET — check if current user (or guest token) has RSVPed
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: eventId } = await params;
  const session = await auth();
  const userId = session?.user ? (session.user as { id: string }).id : null;
  const guestToken = new URL(req.url).searchParams.get("token");

  let existing = null;
  if (userId) {
    existing = await db.eventRsvp.findUnique({ where: { userId_eventId: { userId, eventId } } });
  } else if (guestToken) {
    existing = await db.eventRsvp.findUnique({ where: { guestToken } });
  }

  const count = await db.eventRsvp.count({ where: { eventId } });
  return NextResponse.json({
    rsvped: !!existing,
    count,
    familyMembers: existing?.familyMembers ?? [],
  });
}

interface FamilyMember {
  name: string;
  birthStar?: string;
}

function sanitizeFamilyMembers(input: unknown): Prisma.InputJsonValue | undefined {
  if (!Array.isArray(input)) return undefined;
  const members: FamilyMember[] = input
    .filter((m): m is { name?: unknown; birthStar?: unknown } => !!m && typeof m === "object")
    .map((m) => ({
      name: String(m.name ?? "").trim(),
      birthStar: m.birthStar ? String(m.birthStar).trim() : undefined,
    }))
    .filter((m) => m.name.length > 0);
  return members.length > 0 ? (members as unknown as Prisma.InputJsonValue) : undefined;
}

// POST — register for the event, as a logged-in user or a guest
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: eventId } = await params;
  const session = await auth();
  const userId = session?.user ? (session.user as { id: string }).id : null;

  const body = await req.json().catch(() => ({}));
  const familyMembers = sanitizeFamilyMembers(body.familyMembers);

  if (userId) {
    const existing = await db.eventRsvp.findUnique({ where: { userId_eventId: { userId, eventId } } });
    if (existing) {
      await db.eventRsvp.delete({ where: { userId_eventId: { userId, eventId } } });
      const count = await db.eventRsvp.count({ where: { eventId } });
      return NextResponse.json({ rsvped: false, count });
    }
    const created = await db.eventRsvp.create({ data: { userId, eventId, familyMembers } });
    const count = await db.eventRsvp.count({ where: { eventId } });
    sendEventRegistrationEmail(created.id).catch((e) => console.error("Event registration email failed:", e));
    return NextResponse.json({ rsvped: true, count });
  }

  // Guest registration
  const { guestName, guestEmail, guestPhone } = body;
  if (!guestName || !guestEmail) {
    return NextResponse.json({ error: "Name and email are required." }, { status: 400 });
  }
  if (guestPhone) {
    const digits = String(guestPhone).replace(/\D/g, "");
    if (digits.length < 10 || digits.length > 15) {
      return NextResponse.json({ error: "Invalid phone number." }, { status: 400 });
    }
  }

  const guestToken = randomBytes(32).toString("hex");
  const created = await db.eventRsvp.create({
    data: { eventId, guestName, guestEmail, guestPhone: guestPhone || null, guestToken, familyMembers },
  });
  const count = await db.eventRsvp.count({ where: { eventId } });
  sendEventRegistrationEmail(created.id).catch((e) => console.error("Event registration email failed:", e));
  return NextResponse.json({ rsvped: true, count, guestToken });
}

// PATCH — update family members on an existing registration (logged-in user or guest via token)
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: eventId } = await params;
  const session = await auth();
  const userId = session?.user ? (session.user as { id: string }).id : null;

  const body = await req.json().catch(() => ({}));
  const familyMembers = sanitizeFamilyMembers(body.familyMembers) ?? [];

  if (userId) {
    const existing = await db.eventRsvp.findUnique({ where: { userId_eventId: { userId, eventId } } });
    if (!existing) return NextResponse.json({ error: "Not registered for this event." }, { status: 404 });
    await db.eventRsvp.update({ where: { id: existing.id }, data: { familyMembers } });
    return NextResponse.json({ success: true });
  }

  const guestToken = body.token as string | undefined;
  if (!guestToken) return NextResponse.json({ error: "Missing token." }, { status: 400 });
  const existing = await db.eventRsvp.findUnique({ where: { guestToken } });
  if (!existing || existing.eventId !== eventId) {
    return NextResponse.json({ error: "Registration not found." }, { status: 404 });
  }
  await db.eventRsvp.update({ where: { id: existing.id }, data: { familyMembers } });
  return NextResponse.json({ success: true });
}
