"use client";

import { useState } from "react";
import Image from "next/image";
import { X, Users } from "lucide-react";

interface RsvpUser {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
}

interface Rsvp {
  id: string;
  createdAt: Date;
  user: RsvpUser;
}

function Avatar({ user, size = "sm" }: { user: RsvpUser; size?: "sm" | "lg" }) {
  const dim = size === "lg" ? "w-10 h-10" : "w-7 h-7";
  const text = size === "lg" ? "text-sm" : "text-[11px]";
  const initials = (user.name || user.email || "?")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className={`${dim} rounded-full overflow-hidden bg-maroon/10 border-2 border-white flex items-center justify-center shrink-0`}>
      {user.image ? (
        <Image src={user.image} alt={user.name || ""} width={40} height={40} className="object-cover w-full h-full" />
      ) : (
        <span className={`font-cinzel font-bold text-maroon ${text}`}>{initials}</span>
      )}
    </div>
  );
}

export default function RsvpListButton({ rsvps }: { rsvps: Rsvp[] }) {
  const [open, setOpen] = useState(false);
  const count = rsvps.length;

  if (count === 0) {
    return <span className="text-foreground/30 text-xs">—</span>;
  }

  const shown = rsvps.slice(0, 3);
  const extra = count - 3;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 group"
        title={`${count} RSVP${count !== 1 ? "s" : ""} — click to view`}
      >
        {/* Stacked avatars */}
        <div className="flex -space-x-2">
          {shown.map((r) => (
            <Avatar key={r.id} user={r.user} size="sm" />
          ))}
          {extra > 0 && (
            <div className="w-7 h-7 rounded-full bg-saffron/15 border-2 border-white flex items-center justify-center">
              <span className="text-[10px] font-bold text-saffron">+{extra}</span>
            </div>
          )}
        </div>
        <span className="text-xs text-foreground/50 group-hover:text-maroon transition-colors">{count}</span>
      </button>

      {/* Modal */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[80vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gold/20">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-saffron" />
                <span className="font-cinzel font-semibold text-maroon text-base">
                  RSVPs
                </span>
                <span className="bg-saffron/10 text-saffron text-xs font-bold px-2 py-0.5 rounded-full">
                  {count}
                </span>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-cream flex items-center justify-center text-foreground/40 hover:text-maroon transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* List */}
            <div className="overflow-y-auto flex-1 p-4 space-y-2">
              {rsvps.map((r, i) => (
                <div key={r.id} className="flex items-center gap-3 p-3 bg-cream rounded-xl gold-border">
                  <span className="text-xs text-foreground/30 w-5 text-right shrink-0">{i + 1}</span>
                  <Avatar user={r.user} size="lg" />
                  <div className="min-w-0">
                    <p className="font-semibold text-maroon text-sm truncate">
                      {r.user.name || "—"}
                    </p>
                    <p className="text-foreground/60 text-xs truncate">{r.user.email || "—"}</p>
                    <p className="text-foreground/40 text-[11px] mt-0.5">
                      RSVPed {new Date(r.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
