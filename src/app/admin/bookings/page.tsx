import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatDate, formatCurrency } from "@/lib/utils";
import { parseListParams } from "@/lib/list-query";
import { ArrowLeft, Plus, Receipt } from "lucide-react";
import BookingActions from "./BookingActions";
import ListSearch from "@/components/admin/ListSearch";
import FilterSelect from "@/components/admin/FilterSelect";
import SortableHeader from "@/components/admin/SortableHeader";
import PaginationBar from "@/components/admin/PaginationBar";

const SORTABLE_FIELDS = ["date", "amount", "status", "createdAt"] as const;
const STATUS_OPTIONS = ["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"];

export default async function AdminBookingsPage({
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
    ...(STATUS_OPTIONS.includes(filter) ? { status: filter as "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED" } : {}),
    ...(q
      ? {
          OR: [
            { guestName: { contains: q, mode: "insensitive" as const } },
            { guestEmail: { contains: q, mode: "insensitive" as const } },
            { receiptNumber: { contains: q, mode: "insensitive" as const } },
            { user: { name: { contains: q, mode: "insensitive" as const } } },
            { user: { email: { contains: q, mode: "insensitive" as const } } },
            { service: { name: { contains: q, mode: "insensitive" as const } } },
          ],
        }
      : {}),
  };
  const orderBy = sortBy ? { [sortBy]: sortDir } : { createdAt: "desc" as const };

  const [bookings, total, pendingCount] = await Promise.all([
    db.booking.findMany({ where, include: { service: true, user: true }, orderBy, skip, take }).catch(() => []),
    db.booking.count({ where }).catch(() => 0),
    db.booking.count({ where: { status: "PENDING" } }).catch(() => 0),
  ]);

  const statusColors: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-700",
    CONFIRMED: "bg-blue-100 text-blue-700",
    COMPLETED: "bg-green-100 text-green-700",
    CANCELLED: "bg-red-100 text-red-700",
  };

  return (
    <div className="min-h-screen bg-cream pattern-bg">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <Link href="/admin" className="inline-flex items-center gap-2 text-maroon/60 hover:text-maroon text-sm mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Admin Dashboard
        </Link>
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <h1 className="font-cinzel font-bold text-3xl text-maroon">Bookings</h1>
          <div className="flex items-center gap-4">
            <span className="bg-yellow-100 text-yellow-700 text-sm px-3 py-1 rounded-full font-medium">
              {pendingCount} Pending
            </span>
            <Link href="/admin/bookings/new" className="btn-primary flex items-center gap-2 text-sm px-4 py-2 whitespace-nowrap">
              <Plus className="w-4 h-4" /> Walk-in Booking
            </Link>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 mb-4">
          <ListSearch placeholder="Search by devotee, service, or receipt…" />
          <FilterSelect paramKey="filter" allLabel="All Statuses" options={STATUS_OPTIONS.map((s) => ({ value: s, label: s }))} />
        </div>

        <div className="bg-white rounded-2xl gold-border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-cream border-b border-gold/20">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-maroon/60 uppercase tracking-wider">Devotee</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-maroon/60 uppercase tracking-wider">Service</th>
                  <SortableHeader field="date" label="Date" defaultDir="desc" />
                  <SortableHeader field="amount" label="Amount" defaultDir="desc" />
                  <SortableHeader field="status" label="Status" />
                  <th className="text-left px-4 py-3 text-xs font-semibold text-maroon/60 uppercase tracking-wider">Receipt</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-maroon/60 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gold/10">
                {bookings.map((b: { id: string; status: string; guestName?: string | null; guestEmail?: string | null; date: Date; amount: number; receiptNumber?: string | null; user?: { name?: string | null; email?: string | null } | null; service: { name: string } }) => (
                  <tr key={b.id} className="hover:bg-cream/50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-maroon">{b.user?.name || b.guestName || "Guest"}</p>
                      <p className="text-xs text-foreground/50">{b.user?.email || b.guestEmail}</p>
                    </td>
                    <td className="px-4 py-3 text-foreground/70">{b.service.name}</td>
                    <td className="px-4 py-3 text-foreground/70">{formatDate(b.date)}</td>
                    <td className="px-4 py-3 font-semibold text-saffron">{formatCurrency(b.amount)}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[b.status]}`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {b.receiptNumber ? (
                        <Link href={`/receipts/booking/${b.id}`} className="flex items-center gap-1 text-xs text-saffron hover:underline whitespace-nowrap">
                          <Receipt className="w-3 h-3" /> {b.receiptNumber}
                        </Link>
                      ) : <span className="text-foreground/30 text-xs">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <BookingActions bookingId={b.id} status={b.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {total === 0 && (
            <p className="text-center text-foreground/50 py-12">
              {q || filter ? "No bookings match your filters." : "No bookings yet."}
            </p>
          )}
          <PaginationBar page={page} pageSize={pageSize} total={total} />
        </div>
      </div>
    </div>
  );
}
