import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendContactNotification } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const { firstName, lastName, email, phone, message } = await req.json();

    if (!firstName || !lastName || !email || !message) {
      return NextResponse.json({ error: "First name, last name, email and message are required." }, { status: 400 });
    }

    const name = `${firstName} ${lastName}`.trim();

    await db.contactMessage.create({
      data: { name, email, phone, message },
    });

    sendContactNotification({ name, email, phone, message }).catch(console.error);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json({ error: "Failed to send message." }, { status: 500 });
  }
}
