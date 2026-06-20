import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatDate, formatCurrency } from "@/lib/utils";
import { ArrowLeft, Download, Receipt } from "lucide-react";

export default async function DonationsPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");

  const userId = (session.user as { id: string }).id;
  const donations = await db.donation.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  }).catch(() => []);

  const total = donations.reduce((sum: number, d: { amount: number }) => sum + d.amount, 0);

  return (
    <div className="min-h-screen bg-cream pattern-bg">
      <div className="max-w-4xl mx-auto px-4 py-10">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-maroon/60 hover:text-maroon text-sm mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-cinzel font-bold text-3xl text-maroon">My Donations</h1>
          {donations.length > 0 && (
            <div className="bg-white rounded-xl px-5 py-3 gold-border shadow-sm text-center">
              <p className="text-xs text-foreground/50">Total Donated</p>
              <p className="font-cinzel font-bold text-saffron text-xl">{formatCurrency(total)}</p>
              <p className="text-xs text-foreground/40">Tax ID: 99-4945072</p>
            </div>
          )}
        </div>

        {donations.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl gold-border">
            <div className="text-4xl mb-4">🙏</div>
            <p className="text-foreground/60 mb-6">You have not made any donations yet.</p>
            <Link href="/donate" className="btn-primary px-8">Make a Donation</Link>
          </div>
        ) : (
          <>
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 text-sm text-blue-700">
              📄 All donations are tax-deductible. Download individual receipts below for your records.
            </div>
            <div className="space-y-4">
              {donations.map((d: { id: string; status: string; cause: string; amount: number; recurring: boolean; message?: string | null; receiptUrl?: string | null; receiptNumber?: string | null; createdAt: Date }) => (
                <div key={d.id} className="bg-white rounded-2xl p-6 gold-border shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="font-cinzel font-semibold text-maroon text-lg">{d.cause}</h3>
                      <p className="text-foreground/60 text-sm mt-1">{formatDate(d.createdAt)}</p>
                      {d.message && <p className="text-foreground/50 text-sm italic mt-1">"{d.message}"</p>}
                      {d.recurring && <span className="text-xs bg-saffron/10 text-saffron px-2 py-0.5 rounded-full mt-1 inline-block">Monthly Recurring</span>}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className="font-bold text-saffron text-2xl">{formatCurrency(d.amount)}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${d.status === "COMPLETED" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                        {d.status}
                      </span>
                      {d.receiptNumber && (
                        <Link href={`/receipts/donation/${d.id}`} className="text-xs text-saffron hover:underline flex items-center gap-1">
                          <Receipt className="w-3 h-3" /> View Receipt
                        </Link>
                      )}
                      {d.receiptUrl && !d.receiptNumber && (
                        <a href={d.receiptUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-saffron hover:underline flex items-center gap-1">
                          <Download className="w-3 h-3" /> Download Receipt
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
