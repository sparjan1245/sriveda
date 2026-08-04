import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatAmountRange } from "@/lib/utils";
import { parseListParams } from "@/lib/list-query";
import { ArrowLeft, Award, Star } from "lucide-react";
import SponsorTierForm from "./SponsorTierForm";
import SponsorTierActions from "./SponsorTierActions";
import SponsorTierToggle from "./SponsorTierToggle";
import ListSearch from "@/components/admin/ListSearch";
import SortableHeader from "@/components/admin/SortableHeader";
import PaginationBar from "@/components/admin/PaginationBar";

export const dynamic = "force-dynamic";

const SORTABLE_FIELDS = ["name", "minAmount"] as const;

export default async function SponsorTiersPage({
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
  const orderBy = sortBy ? { [sortBy]: sortDir } : { minAmount: "asc" as const };

  const [tiers, total, activeCount, totalAll] = await Promise.all([
    db.sponsorTier.findMany({ where, orderBy, skip, take }).catch(() => []),
    db.sponsorTier.count({ where }).catch(() => 0),
    db.sponsorTier.count({ where: { active: true } }).catch(() => 0),
    db.sponsorTier.count().catch(() => 0),
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
            <h1 className="font-cinzel font-bold text-3xl text-maroon">Sponsor Tiers</h1>
            <p className="text-foreground/50 text-sm mt-1">
              Named Seva sponsorship tiers with a dollar range (e.g. &ldquo;Bronze Seva — $1,000–$2,499&rdquo;), shown on the Donate page.
            </p>
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
            <SponsorTierForm />
          </div>
        </div>

        <div className="mb-4">
          <ListSearch placeholder="Search by name or description…" />
        </div>

        {total === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl gold-border">
            <Award className="w-12 h-12 text-gold/40 mx-auto mb-4" />
            {q ? (
              <p className="text-foreground/50 mb-2 font-cinzel">No tiers match &ldquo;{q}&rdquo;.</p>
            ) : (
              <>
                <p className="text-foreground/50 mb-2 font-cinzel">No sponsor tiers yet.</p>
                <p className="text-foreground/40 text-sm mb-6">
                  Add ranged sponsorship tiers to showcase on the Donate page.
                </p>
                <SponsorTierForm />
              </>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-2xl gold-border shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gold/20 bg-cream/50">
                    <SortableHeader field="name" label="Name" />
                    <SortableHeader field="minAmount" label="Range" className="w-40" />
                    <th className="text-left px-4 py-3 text-xs font-semibold text-maroon/60 uppercase tracking-wider w-64">Description</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-maroon/60 uppercase tracking-wider w-24">Status</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-maroon/60 uppercase tracking-wider w-24">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gold/10">
                  {tiers.map((tier) => (
                    <tr key={tier.id} className={`transition-colors hover:bg-cream/20 ${!tier.active ? "opacity-55" : ""}`}>
                      <td className="px-4 py-3 align-middle">
                        <p className="font-cinzel font-semibold text-maroon text-sm flex items-center gap-1.5">
                          {tier.name}
                          {tier.highlighted && <Star className="w-3.5 h-3.5 text-gold fill-gold" />}
                        </p>
                      </td>
                      <td className="px-4 py-3 align-middle">
                        <span className="font-bold text-saffron">{formatAmountRange(tier.minAmount, tier.maxAmount)}</span>
                      </td>
                      <td className="px-4 py-3 align-middle max-w-64">
                        <p className="text-xs text-foreground/55 truncate">{tier.description || "—"}</p>
                      </td>
                      <td className="px-4 py-3 align-middle">
                        <SponsorTierToggle id={tier.id} active={tier.active} />
                      </td>
                      <td className="px-4 py-3 align-middle">
                        <SponsorTierActions id={tier.id} name={tier.name} />
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
