import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as { id: string }).id;
  const { currentPassword, newPassword } = await req.json();

  if (!currentPassword || !newPassword) {
    return NextResponse.json({ error: "All fields required." }, { status: 400 });
  }
  if (newPassword.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
  }

  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user?.password) {
    return NextResponse.json({ error: "Cannot change password for OAuth accounts." }, { status: 400 });
  }

  const valid = await bcrypt.compare(currentPassword, user.password);
  if (!valid) return NextResponse.json({ error: "Current password is incorrect." }, { status: 400 });

  const hashed = await bcrypt.hash(newPassword, 12);
  await db.user.update({ where: { id: userId }, data: { password: hashed } });

  return NextResponse.json({ success: true });
}
