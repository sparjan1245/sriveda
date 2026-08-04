import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatReceiptNumber } from "@/lib/utils";
import { sendDonationEmails } from "@/lib/email";
import { randomBytes } from "crypto";

export async function POST(req: Request) {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  if (role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const {
      firstName, lastName, email, phone, address,
      cause, amount, paymentMode, checkRef, message, date,
    } = await req.json();

    if (!firstName || !lastName || !amount || !cause) {
      return NextResponse.json({ error: "First name, last name, cause and amount are required." }, { status: 400 });
    }

    const guestName = `${firstName} ${lastName}`.trim();

    const counter = await db.counter.upsert({
      where:  { id: "receipt-donation" },
      update: { seq: { increment: 1 } },
      create: { id: "receipt-donation", seq: 1 },
    });

    const receiptNumber = formatReceiptNumber("DON", counter.seq);
    // Token allows donor to download their receipt via the email link without an account
    const guestToken = randomBytes(32).toString("hex");

    const donation = await db.donation.create({
      data: {
        guestName,
        guestEmail:  email   || null,
        guestPhone:  phone   || null,
        guestToken,
        address:     address  || null,
        cause,
        amount:      parseFloat(amount),
        paymentMode: paymentMode || "CASH",
        checkRef:    checkRef    || null,
        message:     message     || null,
        isAdminEntry: true,
        receiptNumber,
        status:      "COMPLETED",
        createdAt:   date ? new Date(date) : new Date(),
      },
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:4004";
    sendDonationEmails(donation.id, appUrl).catch(console.error);

    return NextResponse.json({ id: donation.id, receiptNumber });
  } catch (error) {
    console.error("Admin donation entry error:", error);
    return NextResponse.json({ error: "Failed to create donation." }, { status: 500 });
  }
}
