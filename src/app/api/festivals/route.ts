import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const yearParam = searchParams.get("year");
  const year = yearParam ? parseInt(yearParam) : new Date().getFullYear();

  const items = await db.festival
    .findMany({
      where: { year },
      orderBy: [{ month: "asc" }, { order: "asc" }, { createdAt: "asc" }],
    })
    .catch(() => []);

  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if ((session?.user as { role?: string })?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { year, month, name, order } = await req.json();
  if (!year || !month || !name?.trim()) {
    return NextResponse.json({ error: "Year, month, and name are required." }, { status: 400 });
  }
  if (month < 1 || month > 12) {
    return NextResponse.json({ error: "Month must be between 1 and 12." }, { status: 400 });
  }

  const item = await db.festival.create({
    data: { year: Number(year), month: Number(month), name: name.trim(), order: order ?? 0 },
  });
  return NextResponse.json(item, { status: 201 });
}
