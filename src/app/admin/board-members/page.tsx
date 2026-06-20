import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { ArrowLeft } from "lucide-react";
import { AddMemberButton, EditMemberButton, DeleteMemberButton } from "./BoardMemberForm";

export default async function BoardMembersPage() {
  const session = await auth();
  if ((session?.user as { role?: string })?.role !== "ADMIN") redirect("/dashboard");

  const members = await db.boardMember.findMany({ orderBy: { order: "asc" } }).catch(() => []);

  return (
    <div className="min-h-screen bg-cream pattern-bg">
      <div className="max-w-5xl mx-auto px-4 py-10">
        <Link href="/admin" className="inline-flex items-center gap-2 text-maroon/60 hover:text-maroon text-sm mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Admin Dashboard
        </Link>
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-gold font-cinzel text-sm uppercase tracking-widest mb-1">Admin</p>
            <h1 className="font-cinzel font-bold text-3xl text-maroon">Board of Directors</h1>
          </div>
          <AddMemberButton />
        </div>

        {members.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl gold-border">
            <div className="text-4xl mb-4">👥</div>
            <p className="text-foreground/50">No board members added yet.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {members.map((m) => (
              <div key={m.id} className={`bg-white rounded-2xl p-5 gold-border shadow-sm ${!m.active ? "opacity-60" : ""}`}>
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-14 h-14 rounded-full overflow-hidden bg-cream border-2 border-gold/30 shrink-0">
                    {m.image ? (
                      <Image src={m.image} alt={m.name} width={56} height={56} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-cinzel font-bold text-maroon text-lg">
                        {m.name.split(" ").map((w) => w[0]).join("").slice(0, 2)}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-cinzel font-semibold text-maroon text-sm leading-tight truncate">{m.name}</p>
                    <p className="text-saffron text-xs mt-0.5">{m.title}</p>
                    {!m.active && <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">Inactive</span>}
                  </div>
                  <div className="flex items-center gap-0.5 shrink-0">
                    <EditMemberButton member={m} />
                    <DeleteMemberButton id={m.id} />
                  </div>
                </div>
                {m.bio && <p className="text-foreground/60 text-xs leading-relaxed line-clamp-3">{m.bio}</p>}
                <p className="text-foreground/30 text-xs mt-2">Order: {m.order}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
