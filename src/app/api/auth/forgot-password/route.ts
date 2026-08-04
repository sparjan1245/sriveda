import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import crypto from "crypto";
import { sendPasswordResetEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email) return NextResponse.json({ error: "Email is required." }, { status: 400 });

    const user = await db.user.findUnique({ where: { email } });

    if (!user) {
      return NextResponse.json({ error: "No account exists with this email." }, { status: 404 });
    }

    const token   = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

    await db.passwordReset.create({ data: { email, token, expires } });

    const appUrl   = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:4004";
    const resetUrl = `${appUrl}/auth/reset-password?token=${token}`;

    sendPasswordResetEmail({ email, name: user.name, resetUrl }).catch(console.error);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json({ error: "Failed to process request." }, { status: 500 });
  }
}
