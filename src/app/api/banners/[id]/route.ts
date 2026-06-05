import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

async function requireAdmin() {
  const session = await auth();
  return (session?.user as { role?: string })?.role === "ADMIN";
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  const { id } = await params;
  const data = await req.json();
  const allowed = ["active", "order", "image", "title", "subtitle", "description", "ctaText", "ctaLink", "cta2Text", "cta2Link"] as const;
  const update = Object.fromEntries(allowed.filter((k) => k in data).map((k) => [k, data[k]]));
  const banner = await db.banner.update({ where: { id }, data: update });
  return NextResponse.json(banner);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  const { id } = await params;
  await db.banner.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
