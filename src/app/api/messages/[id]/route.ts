import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

async function requireAdmin() {
  const session = await auth();
  return (session?.user as { role?: string })?.role === "ADMIN";
}

export async function PATCH(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const { id } = await params;
  await db.contactMessage.update({ where: { id }, data: { read: true } });
  return NextResponse.json({ success: true });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const { id } = await params;
  await db.contactMessage.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
