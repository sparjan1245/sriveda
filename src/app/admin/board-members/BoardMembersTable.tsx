"use client";

import { useState } from "react";
import Image from "next/image";
import { Search, X } from "lucide-react";
import BoardMemberActions from "./BoardMemberActions";

interface BoardMember {
  id: string;
  name: string;
  title: string;
  image: string | null;
  bio: string | null;
  order: number;
  active: boolean;
}

export default function BoardMembersTable({ members }: { members: BoardMember[] }) {
  const [query, setQuery] = useState("");

  const filtered = members.filter((m) => {
    if (!query) return true;
    const q = query.toLowerCase();
    return m.name.toLowerCase().includes(q) || m.title.toLowerCase().includes(q) || (m.bio || "").toLowerCase().includes(q);
  });

  return (
    <div className="space-y-4">
      <div className="relative w-full sm:w-72">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name or title…"
          className="w-full pl-9 pr-8 py-2.5 border border-gold/30 rounded-lg text-sm focus:outline-none focus:border-saffron bg-white"
        />
        {query && (
          <button type="button" onClick={() => setQuery("")} aria-label="Clear search" className="absolute right-2.5 top-1/2 -translate-y-1/2 text-foreground/30 hover:text-foreground/60">
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

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
              {filtered.map((m) => {
                const i = members.findIndex((x) => x.id === m.id);
                return (
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
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <p className="text-center text-foreground/40 py-10">No board members match &ldquo;{query}&rdquo;.</p>
        )}
      </div>
    </div>
  );
}
