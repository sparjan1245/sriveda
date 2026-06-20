import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  const session = await auth();
  if ((session?.user as { role?: string })?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const format = searchParams.get("format");
  const period = searchParams.get("period") || "monthly"; // "daily" | "monthly"

  const donations = await db.donation.findMany({
    where: { status: "COMPLETED" },
    include: { user: true },
    orderBy: { createdAt: "desc" },
  });

  const bookings = await db.booking.findMany({
    include: { service: true, user: true },
    orderBy: { createdAt: "desc" },
  });

  if (format === "csv-donations") {
    const rows = [
      ["Receipt#", "Date", "Donor Name", "Email", "Cause", "Amount", "Payment Mode", "Type"].join(","),
      ...donations.map((d) => [
        d.receiptNumber || "",
        new Date(d.createdAt).toLocaleDateString("en-US"),
        `"${d.user?.name || d.guestName || "Anonymous"}"`,
        d.user?.email || d.guestEmail || "",
        `"${d.cause}"`,
        d.amount.toFixed(2),
        d.paymentMode || "ONLINE",
        d.isAdminEntry ? "Walk-in" : "Online",
      ].join(",")),
    ].join("\n");

    return new Response(rows, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="donations-${new Date().toISOString().slice(0,10)}.csv"`,
      },
    });
  }

  if (format === "csv-bookings") {
    const rows = [
      ["Receipt#", "Date", "Devotee", "Email", "Service", "Amount", "Status", "Payment Mode", "Type"].join(","),
      ...bookings.map((b) => [
        b.receiptNumber || "",
        new Date(b.createdAt).toLocaleDateString("en-US"),
        `"${b.user?.name || b.guestName || "Guest"}"`,
        b.user?.email || b.guestEmail || "",
        `"${b.service.name}"`,
        b.amount.toFixed(2),
        b.status,
        b.paymentMode || "ONLINE",
        b.isAdminEntry ? "Walk-in" : "Online",
      ].join(",")),
    ].join("\n");

    return new Response(rows, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="bookings-${new Date().toISOString().slice(0,10)}.csv"`,
      },
    });
  }

  // Build grouped summary
  const donationsByPeriod: Record<string, { count: number; total: number }> = {};
  const bookingsByPeriod: Record<string, { count: number; total: number }> = {};

  for (const d of donations) {
    const key = period === "daily"
      ? new Date(d.createdAt).toLocaleDateString("en-US")
      : new Date(d.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short" });
    if (!donationsByPeriod[key]) donationsByPeriod[key] = { count: 0, total: 0 };
    donationsByPeriod[key].count++;
    donationsByPeriod[key].total += d.amount;
  }

  for (const b of bookings) {
    const key = period === "daily"
      ? new Date(b.createdAt).toLocaleDateString("en-US")
      : new Date(b.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short" });
    if (!bookingsByPeriod[key]) bookingsByPeriod[key] = { count: 0, total: 0 };
    bookingsByPeriod[key].count++;
    bookingsByPeriod[key].total += b.amount;
  }

  const causeBreakdown: Record<string, number> = {};
  for (const d of donations) {
    causeBreakdown[d.cause] = (causeBreakdown[d.cause] || 0) + d.amount;
  }

  const paymentModeBreakdown: Record<string, number> = {};
  for (const d of donations) {
    const mode = d.paymentMode || "ONLINE";
    paymentModeBreakdown[mode] = (paymentModeBreakdown[mode] || 0) + d.amount;
  }

  return NextResponse.json({
    summary: {
      totalDonations: donations.length,
      totalDonated: donations.reduce((s, d) => s + d.amount, 0),
      totalBookings: bookings.length,
      totalBookingRevenue: bookings.reduce((s, b) => s + b.amount, 0),
      walkInDonations: donations.filter((d) => d.isAdminEntry).length,
      walkInBookings: bookings.filter((b) => b.isAdminEntry).length,
    },
    donationsByPeriod,
    bookingsByPeriod,
    causeBreakdown,
    paymentModeBreakdown,
  });
}
