import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatDate, formatCurrency, amountToWords } from "@/lib/utils";
import { TEMPLE } from "@/lib/constants";
import DownloadPDFButton from "./PrintButton";

export default async function DonationReceiptPage({
  params,
  searchParams,
}: {
  params:       Promise<{ id: string }>;
  searchParams: Promise<{ token?: string }>;
}) {
  const { id }    = await params;
  const { token } = await searchParams;

  const donation = await db.donation.findUnique({
    where: { id },
    include: { user: true },
  }).catch(() => null);

  if (!donation) notFound();

  // ── Access control ──────────────────────────────────────────────────────────
  const session = await auth();
  const userId  = session?.user ? (session.user as { id: string }).id    : null;
  const role    = session?.user ? (session.user as { role?: string }).role : null;

  const isAdmin   = role === "ADMIN";
  const isOwner   = !!(userId && donation.userId && donation.userId === userId);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const isGuestOk = !!(token && (donation as any).guestToken && token === (donation as any).guestToken);

  if (!isAdmin && !isOwner && !isGuestOk) {
    redirect(`/auth/login?redirect=/receipts/donation/${id}`);
  }
  // ────────────────────────────────────────────────────────────────────────────

  const donorName  = donation.user?.name  || donation.guestName  || "Devotee";
  const donorEmail = donation.user?.email || donation.guestEmail;
  const donorPhone = donation.user?.phone || donation.guestPhone;
  const receiptNo  = donation.receiptNumber || `VGCC/DON/${id.slice(-6).toUpperCase()}`;

  const backHref  = isAdmin ? "/admin/donations" : isOwner ? "/dashboard/donations" : "/";
  const backLabel = isAdmin ? "Back to Donations" : isOwner ? "Back to My Donations" : "Home";

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
            <p className="text-white/70 text-xs mt-0.5">{TEMPLE.address}</p>
            <p className="text-white/70 text-xs">{TEMPLE.phones[0]} · {TEMPLE.emails[0]}</p>
          </div>

          <div style={{ background: "linear-gradient(90deg,#D4A017,#F5C842,#D4A017)" }} className="h-1" />

          <div className="px-8 pt-7 pb-4 text-center border-b border-gold/20">
            <p className="font-cinzel font-bold text-maroon text-xl tracking-widest uppercase">Official Donation Receipt</p>
            <div className="flex items-center justify-between mt-3 text-sm">
              <span className="text-foreground/50">Receipt No. <span className="font-cinzel font-bold text-maroon text-base">{receiptNo}</span></span>
              <span className="text-foreground/50">Date: {formatDate(donation.createdAt)}</span>
            </div>
          </div>

          <div className="px-8 py-6 space-y-6">
            {/* Donor info */}
            <div>
              <p className="font-cinzel font-semibold text-maroon text-xs uppercase tracking-widest mb-3">Received From</p>
              <div className="bg-cream rounded-xl p-4 grid sm:grid-cols-2 gap-2 text-sm">
                <div><span className="text-foreground/50 text-xs">Name</span><p className="font-semibold text-maroon">{donorName}</p></div>
                {donorPhone && <div><span className="text-foreground/50 text-xs">Phone</span><p>{donorPhone}</p></div>}
                {donorEmail && <div><span className="text-foreground/50 text-xs">Email</span><p className="break-all">{donorEmail}</p></div>}
                {donation.address && <div><span className="text-foreground/50 text-xs">Address</span><p>{donation.address}</p></div>}
              </div>
            </div>

            {/* Donation details */}
            <div>
              <p className="font-cinzel font-semibold text-maroon text-xs uppercase tracking-widest mb-3">Donation Details</p>
              <table className="w-full text-sm border border-gold/20 rounded-xl overflow-hidden">
                <tbody className="divide-y divide-gold/15">
                  {[
                    ["Cause / Purpose", donation.cause],
                    ["Payment Mode",    donation.paymentMode],
                    ...(donation.checkRef ? [["Check / Ref No.", donation.checkRef]] : []),
                    ...(donation.message  ? [["Dedication",      donation.message]]  : []),
                    ["Date", formatDate(donation.createdAt)],
                  ].map(([label, value]) => (
                    <tr key={label}>
                      <td className="px-4 py-2.5 text-foreground/50 w-40">{label}</td>
                      <td className="px-4 py-2.5 font-medium text-maroon">{value}</td>
                    </tr>
                  ))}
                  <tr className="bg-maroon/5">
                    <td className="px-4 py-3 font-cinzel font-bold text-maroon">Amount</td>
                    <td className="px-4 py-3 font-cinzel font-bold text-saffron text-lg">{formatCurrency(donation.amount)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="bg-gold/5 border border-gold/20 rounded-xl px-4 py-3">
              <span className="text-foreground/50 text-xs uppercase tracking-wide">Amount in words: </span>
              <span className="font-medium text-maroon text-sm">{amountToWords(donation.amount)}</span>
            </div>

            <div className="text-center bg-green-50 border border-green-200 rounded-xl px-4 py-3">
              <p className="text-green-800 text-xs font-medium">
                This donation is fully tax-deductible under IRS 501(c)(3) provisions.
              </p>
              <p className="text-green-700 text-xs mt-0.5">Tax ID (EIN): {TEMPLE.taxId}</p>
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
