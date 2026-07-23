import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { parseListParams } from "@/lib/list-query";
import { ArrowLeft } from "lucide-react";
import StaffClient from "./StaffClient";
import ListSearch from "@/components/admin/ListSearch";
import FilterSelect from "@/components/admin/FilterSelect";
import PaginationBar from "@/components/admin/PaginationBar";

const SORTABLE_FIELDS = ["name", "email", "role", "createdAt"] as const;
const ROLE_OPTIONS = ["ADMIN", "STAFF", "PRIEST"];

export default async function StaffPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await auth();
  if ((session?.user as { role?: string })?.role !== "ADMIN") redirect("/dashboard");

  const currentUserId = (session!.user as { id: string }).id;

  const { page, pageSize, skip, take, q, sortBy, sortDir, filter } = parseListParams(await searchParams, {
    sortableFields: SORTABLE_FIELDS,
    pageSize: 15,
  });

  const where = {
    role: { in: ROLE_OPTIONS.includes(filter) ? [filter as "ADMIN" | "STAFF" | "PRIEST"] : (ROLE_OPTIONS as ("ADMIN" | "STAFF" | "PRIEST")[]) },
    ...(q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" as const } },
            { email: { contains: q, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };
  const orderBy = sortBy ? { [sortBy]: sortDir } : { createdAt: "asc" as const };

  const [staff, total] = await Promise.all([
    db.user.findMany({
      where,
      orderBy,
      skip,
      take,
      select: { id: true, name: true, email: true, role: true, phone: true, createdAt: true },
    }).catch(() => []),
    db.user.count({ where }).catch(() => 0),
  ]);

  return (
    <div className="min-h-screen bg-cream pattern-bg">
      <div className="max-w-5xl mx-auto px-4 py-10">
        <Link href="/admin" className="inline-flex items-center gap-2 text-maroon/60 hover:text-maroon text-sm mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Admin Dashboard
        </Link>
        <div className="mb-8">
          <p className="text-maroon font-cinzel text-base font-extrabold uppercase tracking-widest mb-1">Admin</p>
          <h1 className="font-cinzel font-bold text-3xl text-maroon">Staff Management</h1>
          <p className="text-foreground/50 text-sm mt-2">Manage roles for Admins, Staff, and Priests. To add a new staff member, first ask them to register as a devotee, then promote their role here.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3 mb-5">
          <ListSearch placeholder="Search by name or email…" />
          <FilterSelect paramKey="filter" allLabel="All Roles" options={ROLE_OPTIONS.map((r) => ({ value: r, label: r }))} />
        </div>

        <StaffClient
          staff={staff.map((u) => ({ ...u, createdAt: u.createdAt.toISOString() }))}
          currentUserId={currentUserId}
          total={total}
          hasFilters={Boolean(q || filter)}
        />

        {total > 0 && (
          <div className="bg-white rounded-2xl gold-border shadow-sm mt-4">
            <PaginationBar page={page} pageSize={pageSize} total={total} />
          </div>
        )}
      </div>
    </div>
  );
}
