import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

function adminOnly(session: { user?: { role?: string } | null } | null) {
  return session?.user?.role !== "ADMIN";
}

export async function PATCH(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (adminOnly(session)) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const { id } = await params;
  await db.contactMessage.update({ where: { id }, data: { read: true } });
  return NextResponse.json({ success: true });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (adminOnly(session)) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const { id } = await params;
  await db.contactMessage.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
