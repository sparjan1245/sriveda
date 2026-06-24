"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Pencil, Loader2, Check, X } from "lucide-react";

const STATUSES = ["PENDING", "COMPLETED", "FAILED"] as const;

export default function DonationActions({ id, status }: { id: string; status: string }) {
  const router = useRouter();
  const [editing, setEditing]   = useState(false);
  const [newStatus, setNewStatus] = useState(status);
  const [saving, setSaving]     = useState(false);

  const save = async () => {
    setSaving(true);
    const res = await fetch(`/api/admin/donations/${id}`, {
      method:  "PATCH",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ status: newStatus }),
    });
    setSaving(false);
    if (res.ok) { setEditing(false); router.refresh(); }
  };

  const del = async () => {
    if (!confirm("Delete this donation record? This cannot be undone.")) return;
    setSaving(true);
    await fetch(`/api/admin/donations/${id}`, { method: "DELETE" });
    setSaving(false);
    router.refresh();
  };

  if (editing) {
    return (
      <div className="flex items-center gap-1">
        <select
          value={newStatus}
          onChange={e => setNewStatus(e.target.value)}
          className="text-xs border border-gold/30 rounded px-1.5 py-1 focus:outline-none focus:border-saffron"
        >
          {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <button onClick={save} disabled={saving} className="p-1 rounded text-green-600 hover:bg-green-50">
          {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
        </button>
        <button onClick={() => setEditing(false)} className="p-1 rounded text-foreground/40 hover:bg-cream">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => setEditing(true)}
        title="Edit status"
        className="p-1.5 rounded text-foreground/40 hover:text-maroon hover:bg-cream transition-colors"
      >
        <Pencil className="w-3.5 h-3.5" />
      </button>
      <button
        onClick={del}
        disabled={saving}
        title="Delete"
        className="p-1.5 rounded text-foreground/40 hover:text-red-600 hover:bg-red-50 transition-colors"
      >
        {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
      </button>
    </div>
  );
}
