import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

function adminOnly(session: Awaited<ReturnType<typeof auth>>) {
  return (session?.user as { role?: string })?.role !== "ADMIN";
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (adminOnly(session)) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const { id } = await params;
  const { title, description, date, endDate, location, image, featured } = await req.json();

  if (!title || !date) {
    return NextResponse.json({ error: "Title and date are required." }, { status: 400 });
  }

  const event = await db.event.update({
    where: { id },
    data: {
      title,
      description,
      date: new Date(date),
      endDate: endDate ? new Date(endDate) : null,
      location,
      image,
      featured: featured ?? false,
    },
  });
  return NextResponse.json(event);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (adminOnly(session)) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const { id } = await params;
  await db.event.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
