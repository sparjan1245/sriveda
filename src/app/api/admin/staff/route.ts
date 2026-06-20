import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if ((session?.user as { role?: string })?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const staff = await db.user.findMany({
    where: { role: { in: ["ADMIN", "STAFF", "PRIEST"] } },
    orderBy: { createdAt: "asc" },
    select: { id: true, name: true, email: true, role: true, phone: true, createdAt: true },
  });

  return NextResponse.json(staff);
}

export async function PATCH(req: Request) {
  const session = await auth();
  if ((session?.user as { role?: string })?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { userId, role } = await req.json();
  if (!userId || !role) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  const validRoles = ["ADMIN", "STAFF", "PRIEST", "DEVOTEE"];
  if (!validRoles.includes(role)) return NextResponse.json({ error: "Invalid role" }, { status: 400 });

  const updated = await db.user.update({ where: { id: userId }, data: { role } });
  return NextResponse.json({ id: updated.id, role: updated.role });
}
