"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function BookingActions({ bookingId, status }: { bookingId: string; status: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const updateStatus = async (newStatus: string) => {
    setLoading(true);
    await fetch(`/api/bookings/${bookingId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    router.refresh();
    setLoading(false);
  };

  if (status === "COMPLETED" || status === "CANCELLED") return <span className="text-xs text-foreground/40">—</span>;

  return (
    <div className="flex gap-2">
      {status === "PENDING" && (
        <button
          onClick={() => updateStatus("CONFIRMED")}
          disabled={loading}
          className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200 transition-colors disabled:opacity-50"
        >
          Confirm
        </button>
      )}
      {status === "CONFIRMED" && (
        <button
          onClick={() => updateStatus("COMPLETED")}
          disabled={loading}
          className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200 transition-colors disabled:opacity-50"
        >
          Complete
        </button>
      )}
      <button
        onClick={() => updateStatus("CANCELLED")}
        disabled={loading}
        className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200 transition-colors disabled:opacity-50"
      >
        Cancel
      </button>
    </div>
  );
}
