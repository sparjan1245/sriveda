"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function TierToggle({ id, active }: { id: string; active: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const toggle = async () => {
    setBusy(true);
    await fetch(`/api/donation-tiers/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !active }),
    });
    setBusy(false);
    router.refresh();
  };

  return (
    <button
      onClick={toggle}
      disabled={busy}
      className={`text-xs px-2.5 py-1 rounded-full border font-medium transition-colors ${
        active
          ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
          : "bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100"
      }`}
    >
      {busy ? <Loader2 className="w-3 h-3 animate-spin inline" /> : active ? "Active" : "Inactive"}
    </button>
  );
}
