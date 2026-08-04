import Link from "next/link";
import { CheckCircle, Download, Home, Phone, Mail, LayoutDashboard } from "lucide-react";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { getContactInfo } from "@/lib/contact";
import { sendBookingEmails } from "@/lib/email";

export const dynamic = "force-dynamic";

export default async function BookingSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ bookingId?: string; token?: string; gateway?: string }>;
}) {
  const { bookingId, token, gateway } = await searchParams;
  const session  = await auth();
  const loggedIn = !!(session?.user);

  if (!bookingId) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-foreground/60">Invalid booking reference.</p>
          <Link href="/" className="text-saffron hover:underline mt-4 inline-block">Go home</Link>
        </div>
      </div>
    );
  }

  const booking = await db.booking.findUnique({
    where: { id: bookingId },
    include: { service: true },
  }).catch(() => null);

  if (!booking) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-foreground/60">Booking not found.</p>
          <Link href="/" className="text-saffron hover:underline mt-4 inline-block">Go home</Link>
        </div>
      </div>
    );
  }

  // Square redirects on success — mark confirmed + send emails here
  if (gateway === "square" && booking.status === "PENDING") {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:4004";
    await db.booking.update({
      where: { id: bookingId },
      data:  { status: "CONFIRMED", paymentGateway: "square" },
    }).catch(() => null);
    sendBookingEmails(bookingId, appUrl).catch(console.error);
  }

  const receiptNo  = booking.receiptNumber || `VGCC/BKG/${bookingId.slice(-6).toUpperCase()}`;
  const receiptLink = token
    ? `/api/receipts/booking/${bookingId}?token=${token}`
    : `/api/receipts/booking/${bookingId}`;

  const serviceDate = new Date(booking.date).toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });
  const contact = await getContactInfo();

  return (
    <div className="min-h-screen bg-cream pattern-bg flex items-center justify-center px-4 py-10">
      <div className="max-w-lg w-full">
        {/* Card */}
        <div className="bg-white rounded-2xl gold-border shadow-lg overflow-hidden">
          <div className="h-1.5 bg-linear-to-r from-saffron via-gold to-saffron" />

          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-5">
              <CheckCircle className="w-9 h-9 text-green-600" />
            </div>

            <span className="badge-gold inline-flex mb-3">Booking Confirmed</span>
            <h1 className="font-cinzel font-bold text-2xl text-maroon mb-2">
              Your Seva is Booked!
            </h1>
            <p className="text-foreground/60 text-sm leading-relaxed mb-6">
              Your booking for{" "}
              <strong className="text-maroon">{booking.service.name}</strong> has been
              confirmed. A confirmation email with your receipt PDF has been sent to you.
            </p>

            {/* Booking summary */}
            <div className="bg-cream rounded-xl p-5 mb-6 text-left space-y-2.5">
              <div className="flex justify-between text-sm">
                <span className="text-foreground/55">Service</span>
                <span className="font-semibold text-maroon">{booking.service.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-foreground/55">Date</span>
                <span className="font-medium">{serviceDate}</span>
              </div>
              {booking.occasion && (
                <div className="flex justify-between text-sm">
                  <span className="text-foreground/55">Occasion</span>
                  <span className="font-medium">{booking.occasion}</span>
                </div>
              )}
              <div className="flex justify-between text-sm border-t border-gold/20 pt-2 mt-2">
                <span className="text-foreground/55">Receipt #</span>
                <span className="font-mono text-saffron font-semibold">{receiptNo}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-foreground/55">Amount Paid</span>
                <span className="font-bold text-maroon">${booking.amount}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3">
              <a
                href={receiptLink}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary flex items-center justify-center gap-2 py-3"
              >
                <Download className="w-4 h-4" /> Download Receipt PDF
              </a>
              {loggedIn ? (
                <Link
                  href="/dashboard/bookings"
                  className="btn-secondary flex items-center justify-center gap-2 py-2.5"
                >
                  <LayoutDashboard className="w-4 h-4" /> View My Bookings
                </Link>
              ) : (
                <Link
                  href={`/services/${booking.service.slug ?? ""}`}
                  className="btn-secondary flex items-center justify-center gap-2 py-2.5"
                >
                  Book Another Service
                </Link>
              )}
              <Link
                href="/"
                className="flex items-center justify-center gap-2 py-2 text-sm text-foreground/50 hover:text-maroon transition-colors"
              >
                <Home className="w-4 h-4" /> Back to Home
              </Link>
            </div>
          </div>
        </div>

        {/* Contact footer */}
        <div className="mt-5 bg-white/70 rounded-xl gold-border p-4 flex flex-col sm:flex-row gap-3 justify-center text-sm text-foreground/60">
          <a href={`tel:${contact.phones[0]}`} className="flex items-center gap-2 hover:text-maroon transition-colors justify-center">
            <Phone className="w-3.5 h-3.5 text-saffron" /> {contact.phones[0]}
          </a>
          <span className="hidden sm:block text-gold/40">·</span>
          <a href={`mailto:${contact.emails[0]}`} className="flex items-center gap-2 hover:text-maroon transition-colors justify-center">
            <Mail className="w-3.5 h-3.5 text-saffron" /> {contact.emails[0]}
          </a>
        </div>
      </div>
    </div>
  );
}
