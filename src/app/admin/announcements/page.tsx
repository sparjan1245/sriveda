import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { ArrowLeft, Pin } from "lucide-react";
import { formatDateTime } from "@/lib/utils";
import { NewAnnouncementButton, EditAnnouncementButton, DeleteAnnouncementButton } from "./AnnouncementForm";

const TYPE_COLORS: Record<string, string> = {
  INFO: "bg-blue-100 text-blue-700",
  WARNING: "bg-orange-100 text-orange-700",
  EVENT: "bg-purple-100 text-purple-700",
  NOTICE: "bg-gold/20 text-amber-700",
};

export default async function AnnouncementsPage() {
  const session = await auth();
  if ((session?.user as { role?: string })?.role !== "ADMIN") redirect("/dashboard");

  const items = await db.announcement.findMany({
    orderBy: [{ pinned: "desc" }, { createdAt: "desc" }],
  }).catch(() => []);

  return (
    <div className="min-h-screen bg-cream pattern-bg">
      <div className="max-w-4xl mx-auto px-4 py-10">
        <Link href="/admin" className="inline-flex items-center gap-2 text-maroon/60 hover:text-maroon text-sm mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Admin Dashboard
        </Link>
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-maroon font-cinzel text-base font-extrabold uppercase tracking-widest mb-1">Admin</p>
            <h1 className="font-cinzel font-bold text-3xl text-maroon">Announcements</h1>
          </div>
          <NewAnnouncementButton />
        </div>

        {items.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl gold-border">
            <div className="text-4xl mb-4">📢</div>
            <p className="text-foreground/50">No announcements yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.id} className={`bg-white rounded-2xl p-5 gold-border shadow-sm flex items-start gap-4 ${!item.active ? "opacity-60" : ""}`}>
                {item.pinned && <Pin className="w-4 h-4 text-gold mt-0.5 shrink-0" />}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${TYPE_COLORS[item.type] || "bg-gray-100 text-gray-600"}`}>{item.type}</span>
                    {!item.active && <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Inactive</span>}
                    <span className="text-xs text-foreground/40">{formatDateTime(item.createdAt)}</span>
                  </div>
                  <h3 className="font-cinzel font-semibold text-maroon">{item.title}</h3>
                  <p className="text-sm text-foreground/70 mt-1 line-clamp-2">{item.content}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <EditAnnouncementButton item={item} />
                  <DeleteAnnouncementButton id={item.id} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
