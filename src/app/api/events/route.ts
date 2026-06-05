import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const upcoming = searchParams.get("upcoming") !== "false"; // default: upcoming only

  const events = await db.event
    .findMany({
      where: upcoming ? { date: { gte: new Date() } } : undefined,
      orderBy: { date: "asc" },
    })
    .catch(() => []);
  return NextResponse.json(events);
}

export async function POST(req: Request) {
  const session = await auth();
  if ((session?.user as { role?: string })?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { title, description, date, endDate, location, image, featured } = await req.json();

  if (!title || !date) {
    return NextResponse.json({ error: "Title and date are required." }, { status: 400 });
  }

  const event = await db.event.create({
    data: {
      title,
      description,
      date: new Date(date),
      endDate: endDate ? new Date(endDate) : undefined,
      location,
      image,
      featured: featured || false,
    },
  });

  return NextResponse.json(event);
}
