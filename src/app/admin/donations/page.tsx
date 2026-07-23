import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatDate, formatCurrency } from "@/lib/utils";
import { parseListParams } from "@/lib/list-query";
import { ArrowLeft, Plus, Receipt } from "lucide-react";
import DonationActions from "./DonationActions";
import ListSearch from "@/components/admin/ListSearch";
import FilterSelect from "@/components/admin/FilterSelect";
import SortableHeader from "@/components/admin/SortableHeader";
import PaginationBar from "@/components/admin/PaginationBar";

const SORTABLE_FIELDS = ["amount", "status", "cause", "createdAt"] as const;
const STATUS_OPTIONS = ["PENDING", "COMPLETED", "FAILED", "REFUNDED"];

export default async function AdminDonationsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await auth();
  if ((session?.user as { role?: string })?.role !== "ADMIN") redirect("/dashboard");

  const { page, pageSize, skip, take, q, sortBy, sortDir, filter } = parseListParams(await searchParams, {
    sortableFields: SORTABLE_FIELDS,
    pageSize: 15,
  });

  const where = {
    ...(STATUS_OPTIONS.includes(filter) ? { status: filter as "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED" } : {}),
    ...(q
      ? {
          OR: [
            { guestName: { contains: q, mode: "insensitive" as const } },
            { guestEmail: { contains: q, mode: "insensitive" as const } },
            { cause: { contains: q, mode: "insensitive" as const } },
            { receiptNumber: { contains: q, mode: "insensitive" as const } },
            { user: { name: { contains: q, mode: "insensitive" as const } } },
            { user: { email: { contains: q, mode: "insensitive" as const } } },
          ],
        }
      : {}),
  };
  const orderBy = sortBy ? { [sortBy]: sortDir } : { createdAt: "desc" as const };

  const [donations, total, totalReceivedAgg] = await Promise.all([
    db.donation.findMany({ where, include: { user: true }, orderBy, skip, take }).catch(() => []),
    db.donation.count({ where }).catch(() => 0),
    db.donation.aggregate({ where: { status: "COMPLETED" }, _sum: { amount: true } }).catch(() => ({ _sum: { amount: 0 } })),
  ]);

  const totalReceived = totalReceivedAgg._sum.amount || 0;

  return (
    <div className="min-h-screen bg-cream pattern-bg">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <Link href="/admin" className="inline-flex items-center gap-2 text-maroon/60 hover:text-maroon text-sm mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Admin Dashboard
        </Link>
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <h1 className="font-cinzel font-bold text-3xl text-maroon">Donations</h1>
          <div className="flex items-center gap-4">
            <div className="bg-white rounded-xl px-5 py-3 gold-border shadow-sm text-center">
              <p className="text-xs text-foreground/50">Total Received</p>
              <p className="font-cinzel font-bold text-green-600 text-xl">{formatCurrency(totalReceived)}</p>
            </div>
            <Link href="/admin/donation-tiers" className="btn-secondary flex items-center gap-2 text-sm px-4 py-2 whitespace-nowrap">
              Manage Tiers
            </Link>
            <Link href="/admin/donations/new" className="btn-primary flex items-center gap-2 text-sm px-4 py-2 whitespace-nowrap">
              <Plus className="w-4 h-4" /> Walk-in Donation
            </Link>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 mb-4">
          <ListSearch placeholder="Search by donor, cause, or receipt…" />
          <FilterSelect paramKey="filter" allLabel="All Statuses" options={STATUS_OPTIONS.map((s) => ({ value: s, label: s }))} />
        </div>

        <div className="bg-white rounded-2xl gold-border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-cream border-b border-gold/20">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-maroon/60 uppercase tracking-wider">Donor</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-maroon/60 uppercase tracking-wider">Email</th>
                  <SortableHeader field="cause" label="Cause" />
                  <SortableHeader field="amount" label="Amount" defaultDir="desc" />
                  <th className="text-left px-4 py-3 text-xs font-semibold text-maroon/60 uppercase tracking-wider">Recurring</th>
                  <SortableHeader field="status" label="Status" />
                  <SortableHeader field="createdAt" label="Date" defaultDir="desc" />
                  <th className="text-left px-4 py-3 text-xs font-semibold text-maroon/60 uppercase tracking-wider">Receipt</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-maroon/60 uppercase tracking-wider"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gold/10">
                {donations.map((d: { id: string; status: string; cause: string; amount: number; recurring: boolean; guestName?: string | null; guestEmail?: string | null; receiptNumber?: string | null; createdAt: Date; user?: { name?: string | null; email?: string | null } | null }) => (
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
                    <td className="px-4 py-3">
                      {d.receiptNumber ? (
                        <Link href={`/receipts/donation/${d.id}`} className="flex items-center gap-1 text-xs text-saffron hover:underline whitespace-nowrap">
                          <Receipt className="w-3 h-3" /> {d.receiptNumber}
                        </Link>
                      ) : <span className="text-foreground/30 text-xs">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <DonationActions id={d.id} status={d.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {total === 0 && (
            <p className="text-center text-foreground/50 py-12">
              {q || filter ? "No donations match your filters." : "No donations yet."}
            </p>
          )}
          <PaginationBar page={page} pageSize={pageSize} total={total} />
        </div>
      </div>
    </div>
  );
}
