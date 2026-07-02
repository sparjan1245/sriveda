import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatCurrency } from "@/lib/utils";
import { ArrowLeft, RefreshCw, Heart } from "lucide-react";
import TierForm from "./TierForm";
import TierActions from "./TierActions";
import TierToggle from "./TierToggle";

export const dynamic = "force-dynamic";

export default async function DonationTiersPage() {
  const session = await auth();
  if ((session?.user as { role?: string })?.role !== "ADMIN") redirect("/dashboard");

  const tiers = await db.donationTier
    .findMany({ orderBy: { order: "asc" } })
    .catch(() => []);

  const activeCount = tiers.filter(t => t.active).length;

  return (
    <div className="min-h-screen bg-cream pattern-bg">
      <div className="max-w-5xl mx-auto px-4 py-10">
        <Link href="/admin" className="inline-flex items-center gap-2 text-maroon/60 hover:text-maroon text-sm mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Admin Dashboard
        </Link>

        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <p className="text-maroon font-cinzel text-base font-extrabold uppercase tracking-widest mb-1">Admin</p>
            <h1 className="font-cinzel font-bold text-3xl text-maroon">Donation Tiers</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-white rounded-xl px-4 py-2 gold-border text-center">
              <div className="font-cinzel font-bold text-xl text-maroon">{activeCount}</div>
              <div className="text-xs text-foreground/50">Active</div>
            </div>
            <div className="bg-white rounded-xl px-4 py-2 gold-border text-center">
              <div className="font-cinzel font-bold text-xl text-maroon">{tiers.length}</div>
              <div className="text-xs text-foreground/50">Total</div>
            </div>
            <TierForm nextOrder={tiers.length} />
          </div>
        </div>

        {tiers.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl gold-border">
            <Heart className="w-12 h-12 text-gold/40 mx-auto mb-4" />
            <p className="text-foreground/50 mb-2 font-cinzel">No donation tiers yet.</p>
            <p className="text-foreground/40 text-sm mb-6">
              Add tiers to let devotees choose a donation amount on the public donate page.
            </p>
            <TierForm nextOrder={0} />
          </div>
        ) : (
          <div className="bg-white rounded-2xl gold-border shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gold/20 bg-cream/50">
                    {[
                      { label: "Order",    w: "w-16" },
                      { label: "Name",     w: "" },
                      { label: "Amount",   w: "w-28" },
                      { label: "Type",     w: "w-28" },
                      { label: "Description", w: "w-56" },
                      { label: "Status",   w: "w-24" },
                      { label: "Actions",  w: "w-24" },
                    ].map(h => (
                      <th key={h.label} className={`text-left px-4 py-3 text-xs font-semibold text-maroon/60 uppercase tracking-wider ${h.w}`}>
                        {h.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gold/10">
                  {tiers.map((tier) => (
                    <tr key={tier.id} className={`transition-colors hover:bg-cream/20 ${!tier.active ? "opacity-55" : ""}`}>
                      <td className="px-4 py-3 align-middle">
                        <span className="text-xs font-mono text-foreground/40 bg-cream px-2 py-0.5 rounded">
                          {tier.order}
                        </span>
                      </td>
                      <td className="px-4 py-3 align-middle">
                        <p className="font-cinzel font-semibold text-maroon text-sm">{tier.name}</p>
                      </td>
                      <td className="px-4 py-3 align-middle">
                        <span className="font-bold text-saffron">{formatCurrency(tier.amount)}</span>
                      </td>
                      <td className="px-4 py-3 align-middle">
                        {tier.recurring ? (
                          <span className="inline-flex items-center gap-1 text-xs bg-blue-50 text-blue-600 border border-blue-200 px-2 py-0.5 rounded-full">
                            <RefreshCw className="w-2.5 h-2.5" /> Monthly
                          </span>
                        ) : (
                          <span className="text-xs text-foreground/40">One-time</span>
                        )}
                      </td>
                      <td className="px-4 py-3 align-middle max-w-56">
                        <p className="text-xs text-foreground/55 truncate">{tier.description || "—"}</p>
                      </td>
                      <td className="px-4 py-3 align-middle">
                        <TierToggle id={tier.id} active={tier.active} />
                      </td>
                      <td className="px-4 py-3 align-middle">
                        <TierActions id={tier.id} name={tier.name} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
