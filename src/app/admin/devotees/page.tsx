import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/utils";
import { parseListParams } from "@/lib/list-query";
import { ArrowLeft } from "lucide-react";
import ListSearch from "@/components/admin/ListSearch";
import SortableHeader from "@/components/admin/SortableHeader";
import PaginationBar from "@/components/admin/PaginationBar";

const SORTABLE_FIELDS = ["name", "email", "city", "createdAt"] as const;

export default async function AdminDevoteesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await auth();
  if ((session?.user as { role?: string })?.role !== "ADMIN") redirect("/dashboard");

  const { page, pageSize, skip, take, q, sortBy, sortDir } = parseListParams(await searchParams, {
    sortableFields: SORTABLE_FIELDS,
    pageSize: 15,
  });

  const where = {
    role: "DEVOTEE" as const,
    ...(q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" as const } },
            { email: { contains: q, mode: "insensitive" as const } },
            { phone: { contains: q, mode: "insensitive" as const } },
            { city: { contains: q, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };
  const orderBy = sortBy ? { [sortBy]: sortDir } : { createdAt: "desc" as const };

  const [devotees, total, totalAll] = await Promise.all([
    db.user.findMany({
      where,
      orderBy,
      skip,
      take,
      include: { _count: { select: { bookings: true, donations: true } } },
    }).catch(() => []),
    db.user.count({ where }).catch(() => 0),
    db.user.count({ where: { role: "DEVOTEE" } }).catch(() => 0),
  ]);

  return (
    <div className="min-h-screen bg-cream pattern-bg">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <Link href="/admin" className="inline-flex items-center gap-2 text-maroon/60 hover:text-maroon text-sm mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Admin Dashboard
        </Link>
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-cinzel font-bold text-3xl text-maroon">Devotees</h1>
          <span className="bg-blue-100 text-blue-700 text-sm px-3 py-1 rounded-full font-medium">
            {totalAll} Total
          </span>
        </div>

        <div className="mb-4">
          <ListSearch placeholder="Search by name, email, phone, or city…" />
        </div>

        <div className="bg-white rounded-2xl gold-border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-cream border-b border-gold/20">
                <tr>
                  <SortableHeader field="name" label="Name" />
                  <SortableHeader field="email" label="Email" />
                  <th className="text-left px-4 py-3 text-xs font-semibold text-maroon/60 uppercase tracking-wider">Phone</th>
                  <SortableHeader field="city" label="City" />
                  <th className="text-left px-4 py-3 text-xs font-semibold text-maroon/60 uppercase tracking-wider">Bookings</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-maroon/60 uppercase tracking-wider">Donations</th>
                  <SortableHeader field="createdAt" label="Joined" defaultDir="desc" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gold/10">
                {devotees.map((d: { id: string; name?: string | null; email: string; phone?: string | null; city?: string | null; createdAt: Date; _count: { bookings: number; donations: number } }) => (
                  <tr key={d.id} className="hover:bg-cream/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-maroon">{d.name || "—"}</td>
                    <td className="px-4 py-3 text-foreground/70">{d.email}</td>
                    <td className="px-4 py-3 text-foreground/70">{d.phone || "—"}</td>
                    <td className="px-4 py-3 text-foreground/70">{d.city || "—"}</td>
                    <td className="px-4 py-3 text-center">{d._count.bookings}</td>
                    <td className="px-4 py-3 text-center">{d._count.donations}</td>
                    <td className="px-4 py-3 text-foreground/50 text-xs">{formatDate(d.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {total === 0 && (
            <p className="text-center text-foreground/50 py-12">
              {q ? "No devotees match your search." : "No devotees registered yet."}
            </p>
          )}
          <PaginationBar page={page} pageSize={pageSize} total={total} />
        </div>
      </div>
    </div>
  );
}
