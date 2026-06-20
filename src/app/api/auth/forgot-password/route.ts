import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email) return NextResponse.json({ error: "Email is required." }, { status: 400 });

    const user = await db.user.findUnique({ where: { email } });

    // Always return success to prevent email enumeration
    if (!user) return NextResponse.json({ success: true });

    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

    await db.passwordReset.create({ data: { email, token, expires } });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:4000";
    const resetUrl = `${appUrl}/auth/reset-password?token=${token}`;

    // TODO: Send via Resend/email provider
    // For now, log the link (remove in production)
    console.log(`[Password Reset] ${email}: ${resetUrl}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json({ error: "Failed to process request." }, { status: 500 });
  }
}
