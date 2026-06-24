import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidateTag } from "next/cache";

export async function GET() {
  const calendars = await db.calendar
    .findMany({ where: { active: true }, orderBy: { year: "desc" } })
    .catch(() => []);
  return NextResponse.json(calendars);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  if (!session?.user || role !== "ADMIN")
    return new NextResponse("Unauthorized", { status: 401 });

  const data = await req.json();
  if (!data.year) return new NextResponse("Year is required", { status: 400 });

  const calendar = await db.calendar.create({
    data: {
      year:        Number(data.year),
      title:       data.title       || null,
      images:      data.images      || [],
      downloadUrl: data.downloadUrl || null,
      active:      data.active      ?? true,
    },
  });

  revalidateTag("calendar", "max");
  return NextResponse.json(calendar, { status: 201 });
}
