import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidateTag } from "next/cache";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const calendar = await db.calendar.findUnique({ where: { id } }).catch(() => null);
  if (!calendar) return new NextResponse("Not found", { status: 404 });
  return NextResponse.json(calendar);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  if (!session?.user || role !== "ADMIN")
    return new NextResponse("Unauthorized", { status: 401 });

  const { id } = await params;
  const data = await req.json();

  const calendar = await db.calendar.update({
    where: { id },
    data: {
      ...(data.year        !== undefined && { year:        Number(data.year) }),
      ...(data.title       !== undefined && { title:       data.title || null }),
      ...(data.images      !== undefined && { images:      data.images }),
      ...(data.downloadUrl !== undefined && { downloadUrl: data.downloadUrl || null }),
      ...(data.active      !== undefined && { active:      data.active }),
    },
  });

  revalidateTag("calendar", "max");
  return NextResponse.json(calendar);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  if (!session?.user || role !== "ADMIN")
    return new NextResponse("Unauthorized", { status: 401 });

  const { id } = await params;
  await db.calendar.delete({ where: { id } });

  revalidateTag("calendar", "max");
  return new NextResponse(null, { status: 204 });
}
