import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

// GET — list donation options for an event (active only, unless ?all=true for admin)
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: eventId } = await params;
  const showAll = new URL(req.url).searchParams.get("all") === "true";
  const where = showAll ? { eventId } : { eventId, active: true };
  const options = await db.eventDonationOption
    .findMany({ where, orderBy: { order: "asc" } })
    .catch(() => []);
  return NextResponse.json(options);
}

// POST — admin, create a donation option for an event
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if ((session?.user as { role?: string })?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  const { id: eventId } = await params;
  const { name, description, amount, recurring, order, highlighted } = await req.json();
  if (!name || !amount) {
    return NextResponse.json({ error: "Name and amount are required." }, { status: 400 });
  }
  const count = await db.eventDonationOption.count({ where: { eventId } });
  const option = await db.eventDonationOption.create({
    data: {
      eventId,
      name,
      description,
      amount: parseFloat(amount),
      recurring: !!recurring,
      order: order ?? count,
      highlighted: !!highlighted,
    },
  });
  return NextResponse.json(option);
}
