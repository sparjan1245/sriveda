import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatDate, formatCurrency } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";

export default async function AdminDonationsPage() {
  const session = await auth();
  if ((session?.user as { role?: string })?.role !== "ADMIN") redirect("/dashboard");

  const donations = await db.donation.findMany({
    include: { user: true },
    orderBy: { createdAt: "desc" },
  }).catch(() => []);

  const total = donations.filter((d: { status: string }) => d.status === "COMPLETED").reduce((sum: number, d: { amount: number }) => sum + d.amount, 0);

  return (
    <div className="min-h-screen bg-cream pattern-bg">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <Link href="/admin" className="inline-flex items-center gap-2 text-maroon/60 hover:text-maroon text-sm mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Admin Dashboard
        </Link>
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-cinzel font-bold text-3xl text-maroon">Donations</h1>
          <div className="bg-white rounded-xl px-5 py-3 gold-border shadow-sm text-center">
            <p className="text-xs text-foreground/50">Total Received</p>
            <p className="font-cinzel font-bold text-green-600 text-xl">{formatCurrency(total)}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl gold-border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-cream border-b border-gold/20">
                <tr>
                  {["Donor", "Email", "Cause", "Amount", "Recurring", "Status", "Date"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left font-cinzel font-medium text-maroon text-xs">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gold/10">
                {donations.map((d: { id: string; status: string; cause: string; amount: number; recurring: boolean; guestName?: string | null; guestEmail?: string | null; createdAt: Date; user?: { name?: string | null; email?: string | null } | null }) => (
                  <tr key={d.id} className="hover:bg-cream/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-maroon">{d.user?.name || d.guestName || "Anonymous"}</td>
                    <td className="px-4 py-3 text-foreground/70 text-xs">{d.user?.email || d.guestEmail || "—"}</td>
                    <td className="px-4 py-3 text-foreground/70">{d.cause}</td>
                    <td className="px-4 py-3 font-bold text-saffron">{formatCurrency(d.amount)}</td>
                    <td className="px-4 py-3 text-center">{d.recurring ? "✓" : "—"}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${d.status === "COMPLETED" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                        {d.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-foreground/50 text-xs">{formatDate(d.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {donations.length === 0 && (
            <p className="text-center text-foreground/50 py-12">No donations yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
