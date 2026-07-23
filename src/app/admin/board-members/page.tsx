import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { ArrowLeft, Users } from "lucide-react";
import { AddMemberButton } from "./BoardMemberForm";
import BoardMembersTable from "./BoardMembersTable";

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
            <p className="text-maroon font-cinzel text-base font-extrabold uppercase tracking-widest mb-1">Admin</p>
            <h1 className="font-cinzel font-bold text-3xl text-maroon">Board of Directors</h1>
          </div>
          <AddMemberButton />
        </div>

        <div className="mb-4">
          <h2 className="font-cinzel font-semibold text-maroon text-lg">
            Members{" "}
            <span className="text-foreground/40 text-sm font-normal">({members.length})</span>
          </h2>
        </div>

        {members.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl gold-border">
            <Users className="w-12 h-12 text-gold/40 mx-auto mb-4" />
            <p className="text-foreground/50">No board members added yet.</p>
          </div>
        ) : (
          <BoardMembersTable members={members} />
        )}
      </div>
    </div>
  );
}
