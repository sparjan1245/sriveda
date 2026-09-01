import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatDate, formatCurrency, amountToWords } from "@/lib/utils";
import { getContactInfo } from "@/lib/contact";
import DownloadPDFButton from "./PrintButton";

export default async function BookingReceiptPage({
  params,
  searchParams,
}: {
  params:       Promise<{ id: string }>;
  searchParams: Promise<{ token?: string }>;
}) {
  const { id }    = await params;
  const { token } = await searchParams;

  const booking = await db.booking.findUnique({
    where: { id },
    include: { service: true, user: true },
  }).catch(() => null);

  if (!booking) notFound();

  // ── Access control ──────────────────────────────────────────────────────────
  const session = await auth();
  const userId  = session?.user ? (session.user as { id: string }).id    : null;
  const role    = session?.user ? (session.user as { role?: string }).role : null;

  const isAdmin   = role === "ADMIN";
  const isOwner   = !!(userId && booking.userId && booking.userId === userId);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const isGuestOk = !!(token && (booking as any).guestToken && token === (booking as any).guestToken);

  if (!isAdmin && !isOwner && !isGuestOk) {
    // No session and no valid token → send to login
    redirect(`/auth/login?redirect=/receipts/booking/${id}`);
  }
  // ────────────────────────────────────────────────────────────────────────────

  const devoteeName  = booking.user?.name  || booking.guestName  || "Devotee";
  const devoteeEmail = booking.user?.email || booking.guestEmail;
  const devoteePhone = booking.user?.phone || booking.guestPhone;
  const receiptNo    = booking.receiptNumber || `VGCC/BKG/${id.slice(-6).toUpperCase()}`;

  const backHref = isAdmin ? "/admin/bookings" : isOwner ? "/dashboard/bookings" : "/";
  const backLabel = isAdmin ? "Back to Bookings" : isOwner ? "Back to My Bookings" : "Home";
  const contact = await getContactInfo();

  const statusColors: Record<string, string> = {
    PENDING:   "text-yellow-700 bg-yellow-50 border-yellow-200",
    CONFIRMED: "text-blue-700 bg-blue-50 border-blue-200",
    COMPLETED: "text-green-700 bg-green-50 border-green-200",
    CANCELLED: "text-red-700 bg-red-50 border-red-200",
  };

  return (
    <>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
          .receipt-card { box-shadow: none !important; border: none !important; }
        }
      `}</style>

      <div className="min-h-screen bg-cream pattern-bg py-10 px-4">
        <div className="no-print max-w-2xl mx-auto mb-6 flex items-center justify-between">
          <a href={backHref} className="text-maroon/60 hover:text-maroon text-sm transition-colors">
            ← {backLabel}
          </a>
          <DownloadPDFButton id={id} receiptNo={receiptNo} token={token} />
        </div>

        <div id="receipt-content" className="receipt-card max-w-2xl mx-auto bg-white shadow-xl rounded-2xl overflow-hidden border border-gold/30">

          <div style={{ background: "linear-gradient(135deg,#6B0F1A 0%,#4A0A12 100%)" }} className="px-8 py-6 text-white text-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="Sri Veda Gayatri Temple" className="h-16 w-auto mx-auto mb-3" />
            <p className="font-cinzel font-bold text-lg tracking-wide text-white">Sri Veda Gayatri Cultural Center</p>
            <p className="text-white/70 text-xs mt-0.5">{contact.address}</p>
            <p className="text-white/70 text-xs">{contact.phones[0]} · {contact.emails[0]}</p>
          </div>

          <div style={{ background: "linear-gradient(90deg,#D4A017,#F5C842,#D4A017)" }} className="h-1" />

          <div className="px-8 pt-7 pb-4 text-center border-b border-gold/20">
            <p className="font-cinzel font-bold text-maroon text-xl tracking-widest uppercase">Service Booking Receipt</p>
            <div className="flex items-center justify-between mt-3 text-sm">
              <span className="text-foreground/50">Receipt No. <span className="font-cinzel font-bold text-maroon text-base">{receiptNo}</span></span>
              
              <span className="text-foreground/50">Date: {formatDate(booking.createdAt)}</span>
            </div>
          </div>

          <div className="px-8 py-6 space-y-6">
            <div className={`text-center text-sm font-semibold px-4 py-2 rounded-lg border ${statusColors[booking.status] || "text-gray-700 bg-gray-50 border-gray-200"}`}>
              Booking Status: {booking.status}
            </div>

            {/* Devotee info */}
            <div>
              <p className="font-cinzel font-semibold text-maroon text-xs uppercase tracking-widest mb-3">Devotee Details</p>
              <div className="bg-cream rounded-xl p-4 grid sm:grid-cols-2 gap-2 text-sm">
                <div><span className="text-foreground/50 text-xs">Name</span><p className="font-semibold text-maroon">{devoteeName}</p></div>
                {devoteePhone && <div><span className="text-foreground/50 text-xs">Phone</span><p>{devoteePhone}</p></div>}
                {devoteeEmail && <div><span className="text-foreground/50 text-xs">Email</span><p className="break-all">{devoteeEmail}</p></div>}
                {booking.gotra     && <div><span className="text-foreground/50 text-xs">Gotra</span><p>{booking.gotra}</p></div>}
                {booking.nakshatra && <div><span className="text-foreground/50 text-xs">Nakshatra</span><p>{booking.nakshatra}</p></div>}
              </div>
            </div>

            {booking.sankalpam && (
              <div>
                <p className="font-cinzel font-semibold text-maroon text-xs uppercase tracking-widest mb-2">Sankalpam</p>
                <div className="bg-saffron/5 border border-gold/20 rounded-xl px-4 py-3 text-sm italic text-foreground/80">{booking.sankalpam}</div>
              </div>
            )}

            {/* Booking details */}
            <div>
              <p className="font-cinzel font-semibold text-maroon text-xs uppercase tracking-widest mb-3">Service Details</p>
              <table className="w-full text-sm border border-gold/20 rounded-xl overflow-hidden">
                <tbody className="divide-y divide-gold/15">
                  {[
                    ["Service",      booking.service.name],
                    ["Service Date", formatDate(booking.date)],
                    ...(booking.occasion ? [["Occasion", booking.occasion]] : []),
                    ["Payment Mode", booking.paymentMode],
                    ...(booking.notes ? [["Notes", booking.notes]] : []),
                  ].map(([label, value]) => (
                    <tr key={label}>
                      <td className="px-4 py-2.5 text-foreground/50 w-40">{label}</td>
                      <td className="px-4 py-2.5 font-medium text-maroon">{value}</td>
                    </tr>
                  ))}
                  <tr className="bg-maroon/5">
                    <td className="px-4 py-3 font-cinzel font-bold text-maroon">Amount</td>
                    <td className="px-4 py-3 font-cinzel font-bold text-saffron text-lg">{formatCurrency(booking.amount)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="bg-gold/5 border border-gold/20 rounded-xl px-4 py-3">
              <span className="text-foreground/50 text-xs uppercase tracking-wide">Amount in words: </span>
              <span className="font-medium text-maroon text-sm">{amountToWords(booking.amount)}</span>
            </div>
          </div>

          <div style={{ background: "linear-gradient(135deg,#6B0F1A 0%,#4A0A12 100%)" }} className="px-8 py-3 text-center text-white/60 text-[11px]">
            www.srivedagayatritemple.org · This is a computer-generated receipt
          </div>
        </div>
      </div>
    </>
  );
}
