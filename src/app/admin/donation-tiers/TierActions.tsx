"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, Loader2 } from "lucide-react";

export default function TierActions({ id, name }: { id: string; name: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const del = async () => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    setBusy(true);
    await fetch(`/api/donation-tiers/${id}`, { method: "DELETE" });
    setBusy(false);
    router.refresh();
  };

  return (
    <div className="flex items-center gap-1">
      <a
        href={`/admin/donation-tiers/${id}/edit`}
        className="p-2 rounded-lg text-foreground/40 hover:text-maroon hover:bg-cream transition-colors inline-flex"
        title="Edit"
      >
        <Pencil className="w-4 h-4" />
      </a>
      <button
        onClick={del}
        disabled={busy}
        title="Delete"
        className="p-2 rounded-lg text-foreground/40 hover:text-red-600 hover:bg-red-50 transition-colors"
      >
        {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
      </button>
    </div>
  );
}
