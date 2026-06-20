import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { token, password } = await req.json();
    if (!token || !password) {
      return NextResponse.json({ error: "Token and password are required." }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
    }

    const reset = await db.passwordReset.findUnique({ where: { token } });
    if (!reset || reset.used || reset.expires < new Date()) {
      return NextResponse.json({ error: "Reset link is invalid or has expired." }, { status: 400 });
    }

    const hashed = await bcrypt.hash(password, 12);

    await db.user.update({
      where: { email: reset.email },
      data: { password: hashed },
    });

    await db.passwordReset.update({ where: { token }, data: { used: true } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json({ error: "Failed to reset password." }, { status: 500 });
  }
}
