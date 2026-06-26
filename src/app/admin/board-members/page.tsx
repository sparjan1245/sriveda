import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { ArrowLeft, Users } from "lucide-react";
import { AddMemberButton } from "./BoardMemberForm";
import BoardMemberActions from "./BoardMemberActions";

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
          <div className="bg-white rounded-2xl gold-border shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gold/20 bg-cream/50">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-maroon/60 uppercase tracking-wider w-10">#</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-maroon/60 uppercase tracking-wider w-16">Photo</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-maroon/60 uppercase tracking-wider">Name & Role</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-maroon/60 uppercase tracking-wider">Bio</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-maroon/60 uppercase tracking-wider w-24">Status</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-maroon/60 uppercase tracking-wider w-44">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gold/10">
                  {members.map((m, i) => (
                    <tr
                      key={m.id}
                      className={`transition-colors hover:bg-cream/20 ${!m.active ? "opacity-60" : ""}`}
                    >
                      {/* Order */}
                      <td className="px-4 py-3 text-foreground/40 font-mono text-xs align-middle">
                        {i + 1}
                      </td>

                      {/* Photo */}
                      <td className="px-4 py-3 align-middle">
                        <div className="w-11 h-11 rounded-full overflow-hidden bg-cream border-2 border-gold/30 shrink-0">
                          {m.image ? (
                            <Image src={m.image} alt={m.name} width={44} height={44} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center font-cinzel font-bold text-maroon text-sm">
                              {m.name.split(" ").map((w) => w[0]).join("").slice(0, 2)}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Name & Role */}
                      <td className="px-4 py-3 align-middle max-w-50">
                        <p className="font-cinzel font-semibold text-maroon text-sm leading-tight">{m.name}</p>
                        <p className="text-saffron text-xs mt-0.5">{m.title}</p>
                      </td>

                      {/* Bio */}
                      <td className="px-4 py-3 align-middle max-w-xs">
                        {m.bio ? (
                          <p className="text-foreground/55 text-xs leading-relaxed line-clamp-2">{m.bio}</p>
                        ) : (
                          <span className="text-foreground/30 text-xs italic">No bio</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3 align-middle">
                        {m.active ? (
                          <span className="inline-flex text-xs bg-green-100 text-green-700 px-2.5 py-1 rounded-full font-medium">Active</span>
                        ) : (
                          <span className="inline-flex text-xs bg-gray-100 text-gray-500 px-2.5 py-1 rounded-full font-medium">Hidden</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3 align-middle">
                        <BoardMemberActions member={m} total={members.length} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
