"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, CheckCircle, Calendar } from "lucide-react";

interface Props {
  eventId: string;
  userId: string | null;
}

export default function RsvpButton({ eventId, userId }: Props) {
  const router = useRouter();
  const [rsvped, setRsvped] = useState(false);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(false);

  useEffect(() => {
    if (!userId) { setFetched(true); return; }
    fetch(`/api/events/${eventId}/rsvp`)
      .then((r) => r.json())
      .then((d) => { setRsvped(d.rsvped); setCount(d.count ?? 0); setFetched(true); });
  }, [eventId, userId]);

  const handleClick = async () => {
    if (!userId) {
      router.push(`/auth/login?redirect=/events`);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/events/${eventId}/rsvp`, { method: "POST" });
      const data = await res.json();
      if (res.ok) { setRsvped(data.rsvped); setCount(data.count ?? 0); }
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

  return (
    <div className="space-y-1.5">
      <button
        onClick={handleClick}
        disabled={loading}
        className={`w-full py-2.5 text-sm font-semibold rounded-md flex items-center justify-center gap-2 transition-all duration-200 ${
          rsvped
            ? "bg-green-600 hover:bg-red-600 text-white"
            : "btn-primary"
        }`}
      >
        {loading ? (
          <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
        ) : rsvped ? (
          <><CheckCircle className="w-4 h-4" /> RSVPed — Click to Cancel</>
        ) : (
          <><Calendar className="w-4 h-4" /> {userId ? "RSVP for this Event" : "Sign in to RSVP"}</>
        )}
      </button>
      {count > 0 && (
        <p className="text-center text-xs text-foreground/40">{count} {count === 1 ? "person" : "people"} attending</p>
      )}
    </div>
  );
}
