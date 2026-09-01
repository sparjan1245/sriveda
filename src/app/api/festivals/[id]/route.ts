import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if ((session?.user as { role?: string })?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id } = await params;
  const { year, month, name, order } = await req.json();
  if (month !== undefined && (month < 1 || month > 12)) {
    return NextResponse.json({ error: "Month must be between 1 and 12." }, { status: 400 });
  }

  const item = await db.festival.update({
    where: { id },
    data: {
      year: year !== undefined ? Number(year) : undefined,
      month: month !== undefined ? Number(month) : undefined,
      name: name !== undefined ? String(name).trim() : undefined,
      order: order !== undefined ? Number(order) : undefined,
    },
  });
  return NextResponse.json(item);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if ((session?.user as { role?: string })?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id } = await params;
  await db.festival.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
