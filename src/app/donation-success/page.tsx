import Link from "next/link";
import { CheckCircle, Download, Home, Phone, Mail, LayoutDashboard } from "lucide-react";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { TEMPLE } from "@/lib/constants";
import { sendDonationEmails } from "@/lib/email";
import { formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function DonationSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ donationId?: string; token?: string; gateway?: string }>;
}) {
  const { donationId, token, gateway } = await searchParams;
  const session  = await auth();
  const loggedIn = !!(session?.user);

  if (!donationId) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-foreground/60">Invalid donation reference.</p>
          <Link href="/" className="text-saffron hover:underline mt-4 inline-block">Go home</Link>
        </div>
      </div>
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const donation = await db.donation.findUnique({ where: { id: donationId }, include: { user: true } }).catch(() => null) as any;

  if (!donation) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-foreground/60">Donation not found.</p>
          <Link href="/" className="text-saffron hover:underline mt-4 inline-block">Go home</Link>
        </div>
      </div>
    );
  }

  // Access guard: admin | owner | guest token
  const userId   = session?.user ? (session.user as { id: string }).id : null;
  const role     = session?.user ? (session.user as { role?: string }).role : null;
  const isAdmin  = role === "ADMIN";
  const isOwner  = !!(userId && donation.userId && donation.userId === userId);
  const isGuestOk = !!(token && donation.guestToken && token === donation.guestToken);

  if (!isAdmin && !isOwner && !isGuestOk) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-foreground/60">Access denied.</p>
          <Link href="/" className="text-saffron hover:underline mt-4 inline-block">Go home</Link>
        </div>
      </div>
    );
  }

  // Square redirects here on success — mark COMPLETED + send emails
  if (gateway === "square" && donation.status === "PENDING") {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:4000";
    await db.donation.update({ where: { id: donationId }, data: { status: "COMPLETED" } }).catch(() => null);
    sendDonationEmails(donationId, appUrl).catch(console.error);
  }

  const receiptNo   = donation.receiptNumber || `VGCC/DON/${donationId.slice(-6).toUpperCase()}`;
  const receiptLink = token
    ? `/api/receipts/donation/${donationId}?token=${token}`
    : `/api/receipts/donation/${donationId}`;

  const donorName  = donation.user?.name || donation.guestName || "Devotee";
  const donorEmail = donation.user?.email || donation.guestEmail || null;

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

            <span className="badge-gold inline-flex mb-3">Donation Received</span>
            <h1 className="font-cinzel font-bold text-2xl text-maroon mb-2">
              Thank You for Your Generosity!
            </h1>
            <p className="text-foreground/60 text-sm leading-relaxed mb-6">
              Your donation has been received. May your offering bring blessings to you
              and your family. A receipt has been sent to{" "}
              {donorEmail ? (
                <strong className="text-maroon">{donorEmail}</strong>
              ) : (
                "your email"
              )}.
            </p>

            {/* Donation summary */}
            <div className="bg-cream rounded-xl p-5 mb-6 text-left space-y-2.5">
              <div className="flex justify-between text-sm">
                <span className="text-foreground/55">Donor</span>
                <span className="font-semibold text-maroon">{donorName}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-foreground/55">Cause</span>
                <span className="font-medium">{donation.cause}</span>
              </div>
              {donation.message && (
                <div className="flex justify-between text-sm">
                  <span className="text-foreground/55">Message</span>
                  <span className="font-medium text-right max-w-[220px] truncate">{donation.message}</span>
                </div>
              )}
              <div className="flex justify-between text-sm border-t border-gold/20 pt-2 mt-2">
                <span className="text-foreground/55">Receipt #</span>
                <span className="font-mono text-saffron font-semibold">{receiptNo}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-foreground/55">Amount</span>
                <span className="font-bold text-maroon">{formatCurrency(donation.amount)}</span>
              </div>
              <p className="text-xs text-foreground/40 pt-1">
                Tax-deductible · 501(c)(3) · Tax ID: {TEMPLE.taxId}
              </p>
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
                  href="/dashboard/donations"
                  className="btn-secondary flex items-center justify-center gap-2 py-2.5"
                >
                  <LayoutDashboard className="w-4 h-4" /> View My Donations
                </Link>
              ) : (
                <Link
                  href="/donate"
                  className="btn-secondary flex items-center justify-center gap-2 py-2.5"
                >
                  Make Another Donation
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
          <a href={`tel:${TEMPLE.phones[0]}`} className="flex items-center gap-2 hover:text-maroon transition-colors justify-center">
            <Phone className="w-3.5 h-3.5 text-saffron" /> {TEMPLE.phones[0]}
          </a>
          <span className="hidden sm:block text-gold/40">·</span>
          <a href={`mailto:${TEMPLE.emails[0]}`} className="flex items-center gap-2 hover:text-maroon transition-colors justify-center">
            <Mail className="w-3.5 h-3.5 text-saffron" /> {TEMPLE.emails[0]}
          </a>
        </div>
      </div>
    </div>
  );
}
