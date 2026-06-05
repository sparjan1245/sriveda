import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

// GET — check if current user has RSVPed
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ rsvped: false });

  const { id: eventId } = await params;
  const userId = (session.user as { id: string }).id;

  const existing = await db.eventRsvp.findUnique({
    where: { userId_eventId: { userId, eventId } },
  });

  const count = await db.eventRsvp.count({ where: { eventId } });
  return NextResponse.json({ rsvped: !!existing, count });
}

// POST — toggle RSVP (create or delete)
export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Login required to RSVP." }, { status: 401 });
  }

  const { id: eventId } = await params;
  const userId = (session.user as { id: string }).id;

  const existing = await db.eventRsvp.findUnique({
    where: { userId_eventId: { userId, eventId } },
  });

  if (existing) {
    await db.eventRsvp.delete({ where: { userId_eventId: { userId, eventId } } });
    const count = await db.eventRsvp.count({ where: { eventId } });
    return NextResponse.json({ rsvped: false, count });
  } else {
    await db.eventRsvp.create({ data: { userId, eventId } });
    const count = await db.eventRsvp.count({ where: { eventId } });
    return NextResponse.json({ rsvped: true, count });
  }
}
