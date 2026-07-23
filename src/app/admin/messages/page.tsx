import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatDateTime } from "@/lib/utils";
import { parseListParams } from "@/lib/list-query";
import { ArrowLeft } from "lucide-react";
import MarkReadButton from "./MarkReadButton";
import DeleteMessageButton from "./DeleteMessageButton";
import ListSearch from "@/components/admin/ListSearch";
import FilterSelect from "@/components/admin/FilterSelect";
import PaginationBar from "@/components/admin/PaginationBar";

export default async function AdminMessagesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await auth();
  if ((session?.user as { role?: string })?.role !== "ADMIN") redirect("/dashboard");

  const { page, pageSize, skip, take, q, sortDir, filter } = parseListParams(await searchParams, {
    sortableFields: [],
    pageSize: 10,
  });

  const where = {
    ...(filter === "unread" ? { read: false } : filter === "read" ? { read: true } : {}),
    ...(q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" as const } },
            { email: { contains: q, mode: "insensitive" as const } },
            { message: { contains: q, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [messages, total, unreadCount] = await Promise.all([
    db.contactMessage.findMany({ where, orderBy: { createdAt: sortDir }, skip, take }).catch(() => []),
    db.contactMessage.count({ where }).catch(() => 0),
    db.contactMessage.count({ where: { read: false } }).catch(() => 0),
  ]);

  return (
    <div className="min-h-screen bg-cream pattern-bg">
      <div className="max-w-4xl mx-auto px-4 py-10">
        <Link href="/admin" className="inline-flex items-center gap-2 text-maroon/60 hover:text-maroon text-sm mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Admin Dashboard
        </Link>
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-cinzel font-bold text-3xl text-maroon">Contact Messages</h1>
          <span className="bg-red-100 text-red-700 text-sm px-3 py-1 rounded-full font-medium">
            {unreadCount} Unread
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-3 mb-6">
          <ListSearch placeholder="Search by name, email, or message…" />
          <FilterSelect paramKey="filter" allLabel="All Messages" options={[{ value: "unread", label: "Unread" }, { value: "read", label: "Read" }]} />
          <FilterSelect paramKey="dir" allLabel="Newest First" options={[{ value: "asc", label: "Oldest First" }]} />
        </div>

        {total === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl gold-border">
            <p className="text-foreground/50">{q || filter ? "No messages match your filters." : "No messages yet."}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg: { id: string; read: boolean; name: string; email: string; phone?: string | null; message: string; createdAt: Date }) => (
              <div key={msg.id} className={`bg-white rounded-2xl p-6 gold-border shadow-sm ${!msg.read ? "border-saffron/50" : ""}`}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-maroon">{msg.name}</h3>
                    <div className="flex gap-3 text-xs text-foreground/50 mt-1">
                      <a href={`mailto:${msg.email}`} className="hover:text-saffron">{msg.email}</a>
                      {msg.phone && <span>{msg.phone}</span>}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-foreground/40">{formatDateTime(msg.createdAt)}</p>
                    {!msg.read && <span className="text-xs bg-saffron text-white px-2 py-0.5 rounded-full mt-1 inline-block">New</span>}
                  </div>
                </div>
                <p className="text-foreground/70 text-sm leading-relaxed">{msg.message}</p>
                <div className="mt-4 flex gap-3 flex-wrap">
                  <a href={`mailto:${msg.email}`} className="btn-primary text-xs px-4 py-2">
                    Reply via Email
                  </a>
                  {!msg.read && <MarkReadButton messageId={msg.id} />}
                  <DeleteMessageButton messageId={msg.id} />
                </div>
              </div>
            ))}
          </div>
        )}

        {total > 0 && (
          <div className="bg-white rounded-2xl gold-border shadow-sm mt-4">
            <PaginationBar page={page} pageSize={pageSize} total={total} />
          </div>
        )}
      </div>
    </div>
  );
}
