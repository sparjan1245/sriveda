"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, CheckCircle, Calendar, X, LogIn, User } from "lucide-react";

interface Props {
  eventId: string;
  eventTitle: string;
  userId: string | null;
}

const tokenKeyFor = (eventId: string) => `eventRsvpToken:${eventId}`;

export default function EventRegisterModal({ eventId, eventTitle, userId }: Props) {
  const router = useRouter();
  const [rsvped, setRsvped] = useState(false);
  const [count, setCount] = useState(0);
  const [fetched, setFetched] = useState(false);
  const [toggling, setToggling] = useState(false);

  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"login" | "guest">("guest");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");

  useEffect(() => {
    const token = userId ? null : localStorage.getItem(tokenKeyFor(eventId));
    const qs = token ? `?token=${token}` : "";
    fetch(`/api/events/${eventId}/rsvp${qs}`)
      .then((r) => r.json())
      .then((d) => { setRsvped(d.rsvped); setCount(d.count ?? 0); setFetched(true); });
  }, [eventId, userId]);

  const handleClick = async () => {
    if (userId) {
      setToggling(true);
      try {
        const res = await fetch(`/api/events/${eventId}/rsvp`, { method: "POST" });
        const data = await res.json();
        if (res.ok) { setRsvped(data.rsvped); setCount(data.count ?? 0); }
      } finally {
        setToggling(false);
      }
      return;
    }
    setOpen(true);
  };

  const close = () => {
    setOpen(false);
    setError("");
  };

  const submitGuest = async () => {
    if (!guestName.trim() || !guestEmail.trim()) {
      setError("Name and email are required.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/events/${eventId}/rsvp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guestName, guestEmail, guestPhone }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Registration failed."); return; }
      localStorage.setItem(tokenKeyFor(eventId), data.guestToken);
      setRsvped(true);
      setCount(data.count ?? 0);
      close();
    } catch {
      setError("Unable to register. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!fetched) {
    return (
      <button disabled className="btn-primary w-full py-2.5 text-sm opacity-60">
        <Loader2 className="w-4 h-4 animate-spin inline mr-2" />Loading...
      </button>
    );
  }

  const inputClass =
    "w-full px-3 py-2.5 border border-gold/30 rounded-lg text-sm focus:outline-none focus:border-saffron transition-colors";

  return (
    <>
      <div className="space-y-1.5">
        <button
          onClick={handleClick}
          disabled={toggling}
          className={`w-full py-2.5 text-sm font-semibold rounded-md flex items-center justify-center gap-2 transition-all duration-200 ${
            rsvped ? "bg-green-600 hover:bg-red-600 text-white" : "btn-primary"
          }`}
        >
          {toggling ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
          ) : rsvped ? (
            <><CheckCircle className="w-4 h-4" /> {userId ? "RSVPed — Click to Cancel" : "Registered"}</>
          ) : (
            <><Calendar className="w-4 h-4" /> {userId ? "RSVP for this Event" : "Quick RSVP"}</>
          )}
        </button>
        {/* {count > 0 && (
          <p className="text-center text-xs text-foreground/40">{count} {count === 1 ? "person" : "people"} attending</p>
        )} */}
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={close}>
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-gold/15">
              <h3 className="font-cinzel font-bold text-maroon text-lg leading-tight">Quick RSVP</h3>
              <button onClick={close} className="text-foreground/40 hover:text-maroon transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              <p className="text-foreground/60 text-xs mb-4">{eventTitle}</p>

              {/* Login / Guest tabs */}
              <div className="grid grid-cols-2 gap-2 mb-5 p-1 bg-cream rounded-xl">
                <button
                  type="button"
                  onClick={() => setMode("login")}
                  className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-semibold transition-colors ${
                    mode === "login" ? "bg-white text-maroon shadow-sm" : "text-foreground/50"
                  }`}
                >
                  <LogIn className="w-3.5 h-3.5" /> Login
                </button>
                <button
                  type="button"
                  onClick={() => setMode("guest")}
                  className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-semibold transition-colors ${
                    mode === "guest" ? "bg-white text-maroon shadow-sm" : "text-foreground/50"
                  }`}
                >
                  <User className="w-3.5 h-3.5" /> Guest
                </button>
              </div>

              {mode === "login" ? (
                <div className="text-center py-6">
                  <p className="text-foreground/60 text-sm mb-4">
                    Sign in to register with your devotee account and track your RSVPs.
                  </p>
                  <button
                    onClick={() => router.push(`/auth/login?redirect=/events`)}
                    className="btn-primary px-6 py-2.5 inline-flex items-center gap-2"
                  >
                    <LogIn className="w-4 h-4" /> Sign In
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-maroon/80 mb-1.5">Full Name *</label>
                    <input value={guestName} onChange={(e) => setGuestName(e.target.value)} className={inputClass} placeholder="Your full name" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-maroon/80 mb-1.5">Email *</label>
                    <input type="email" value={guestEmail} onChange={(e) => setGuestEmail(e.target.value)} className={inputClass} placeholder="your@email.com" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-maroon/80 mb-1.5">
                      Mobile Number <span className="text-foreground/40 font-normal">(optional)</span>
                    </label>
                    <input value={guestPhone} onChange={(e) => setGuestPhone(e.target.value)} className={inputClass} placeholder="+1 (555) 000-0000" />
                  </div>
                  {error && (
                    <p className="text-red-500 text-xs bg-red-50 border border-red-200 p-3 rounded-lg">{error}</p>
                  )}
                  <button
                    onClick={submitGuest}
                    disabled={loading}
                    className="btn-primary w-full py-2.5 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Registering…</> : "Register as Guest"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
