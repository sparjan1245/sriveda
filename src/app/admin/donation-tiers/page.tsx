import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatCurrency } from "@/lib/utils";
import { parseListParams } from "@/lib/list-query";
import { ArrowLeft, RefreshCw, Heart } from "lucide-react";
import TierForm from "./TierForm";
import TierActions from "./TierActions";
import TierToggle from "./TierToggle";
import ListSearch from "@/components/admin/ListSearch";
import SortableHeader from "@/components/admin/SortableHeader";
import PaginationBar from "@/components/admin/PaginationBar";

export const dynamic = "force-dynamic";

const SORTABLE_FIELDS = ["name", "amount", "order", "createdAt"] as const;

export default async function DonationTiersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await auth();
  if ((session?.user as { role?: string })?.role !== "ADMIN") redirect("/dashboard");

  const { page, pageSize, skip, take, q, sortBy, sortDir } = parseListParams(await searchParams, {
    sortableFields: SORTABLE_FIELDS,
    pageSize: 10,
  });

  const where = q
    ? {
        OR: [
          { name: { contains: q, mode: "insensitive" as const } },
          { description: { contains: q, mode: "insensitive" as const } },
        ],
      }
    : {};
  const orderBy = sortBy ? { [sortBy]: sortDir } : { order: "asc" as const };

  const [tiers, total, activeCount, totalAll] = await Promise.all([
    db.donationTier.findMany({ where, orderBy, skip, take }).catch(() => []),
    db.donationTier.count({ where }).catch(() => 0),
    db.donationTier.count({ where: { active: true } }).catch(() => 0),
    db.donationTier.count().catch(() => 0),
  ]);

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
              <div className="font-cinzel font-bold text-xl text-maroon">{totalAll}</div>
              <div className="text-xs text-foreground/50">Total</div>
            </div>
            <TierForm nextOrder={totalAll} />
          </div>
        </div>

        <div className="mb-4">
          <ListSearch placeholder="Search by name or description…" />
        </div>

        {total === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl gold-border">
            <Heart className="w-12 h-12 text-gold/40 mx-auto mb-4" />
            {q ? (
              <p className="text-foreground/50 mb-2 font-cinzel">No tiers match &ldquo;{q}&rdquo;.</p>
            ) : (
              <>
                <p className="text-foreground/50 mb-2 font-cinzel">No donation tiers yet.</p>
                <p className="text-foreground/40 text-sm mb-6">
                  Add tiers to let devotees choose a donation amount on the public donate page.
                </p>
                <TierForm nextOrder={0} />
              </>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-2xl gold-border shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gold/20 bg-cream/50">
                    <SortableHeader field="order" label="Order" className="w-16" />
                    <SortableHeader field="name" label="Name" />
                    <SortableHeader field="amount" label="Amount" className="w-28" />
                    <th className="text-left px-4 py-3 text-xs font-semibold text-maroon/60 uppercase tracking-wider w-28">Type</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-maroon/60 uppercase tracking-wider w-56">Description</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-maroon/60 uppercase tracking-wider w-24">Status</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-maroon/60 uppercase tracking-wider w-24">Actions</th>
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
            <PaginationBar page={page} pageSize={pageSize} total={total} />
          </div>
        )}
      </div>
    </div>
  );
}
