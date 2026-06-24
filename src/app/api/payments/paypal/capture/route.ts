import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { capturePayPalOrder } from "@/lib/payments/paypal";
import { sendBookingEmails } from "@/lib/email";

// PayPal redirects here after user approves: ?token=ORDER_ID&bookingId=xxx[&token2=guestToken]
export async function GET(req: NextRequest) {
  const appUrl     = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:4000";
  const ppToken    = req.nextUrl.searchParams.get("token");   // PayPal order ID
  const donationId = req.nextUrl.searchParams.get("donationId");
  const bookingId  = req.nextUrl.searchParams.get("bookingId");
  // guestToken is embedded in the URL from the checkout route
  const guestTok   = req.nextUrl.searchParams.get("guestToken");

  if (!ppToken) {
    const dest = donationId ? "/donate" : "/services";
    return NextResponse.redirect(`${appUrl}${dest}?error=payment_cancelled`);
  }

  try {
    const result = await capturePayPalOrder(ppToken);

    if (result.status !== "COMPLETED") {
      throw new Error(`Unexpected PayPal status: ${result.status}`);
    }

    // ── Booking ──────────────────────────────────────────────────────────────
    if (bookingId) {
      // Look up existing guestToken if not passed in URL
      const record = await db.booking.findUnique({
        where:  { id: bookingId },
        select: { guestToken: true },
      });
      const tok = guestTok || record?.guestToken || null;

      await db.booking.update({
        where: { id: bookingId },
        data:  {
          status:         "CONFIRMED",
          paypalOrderId:  ppToken,
          paymentGateway: "paypal",
        },
      });

      // Send emails (non-blocking)
      sendBookingEmails(bookingId, appUrl).catch(console.error);

      const tokenParam = tok ? `&token=${tok}` : "";
      return NextResponse.redirect(
        `${appUrl}/booking-success?bookingId=${bookingId}${tokenParam}`
      );
    }

    // ── Donation ─────────────────────────────────────────────────────────────
    if (donationId) {
      await db.donation.update({
        where: { id: donationId },
        data:  {
          status:         "COMPLETED",
          paypalOrderId:  ppToken,
          paymentGateway: "paypal",
        },
      });
      return NextResponse.redirect(
        `${appUrl}/donate?success=true&donationId=${donationId}`
      );
    }

    return NextResponse.redirect(`${appUrl}?success=true`);
  } catch (err) {
    console.error("PayPal capture error:", err);
    const dest = donationId ? "/donate" : "/services";
    return NextResponse.redirect(`${appUrl}${dest}?error=payment_failed`);
  }
}
