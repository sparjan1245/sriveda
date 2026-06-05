import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatDateTime } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";
import MarkReadButton from "./MarkReadButton";
import DeleteMessageButton from "./DeleteMessageButton";

export default async function AdminMessagesPage() {
  const session = await auth();
  if ((session?.user as { role?: string })?.role !== "ADMIN") redirect("/dashboard");

  const messages = await db.contactMessage.findMany({
    orderBy: { createdAt: "desc" },
  }).catch(() => []);

  return (
    <div className="min-h-screen bg-cream pattern-bg">
      <div className="max-w-4xl mx-auto px-4 py-10">
        <Link href="/admin" className="inline-flex items-center gap-2 text-maroon/60 hover:text-maroon text-sm mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Admin Dashboard
        </Link>
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-cinzel font-bold text-3xl text-maroon">Contact Messages</h1>
          <span className="bg-red-100 text-red-700 text-sm px-3 py-1 rounded-full font-medium">
            {messages.filter((m: { read: boolean }) => !m.read).length} Unread
          </span>
        </div>

        {messages.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl gold-border">
            <p className="text-foreground/50">No messages yet.</p>
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
      </div>
    </div>
  );
}
