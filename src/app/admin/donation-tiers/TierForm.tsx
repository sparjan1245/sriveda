"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X, Loader2, Check } from "lucide-react";

interface TierData {
  name: string;
  description: string;
  amount: string;
  order: string;
  recurring: boolean;
  active: boolean;
  highlighted: boolean;
}

const BLANK: TierData = { name: "", description: "", amount: "", order: "0", recurring: false, active: true, highlighted: false };

export default function TierForm({ nextOrder }: { nextOrder: number }) {
  const router          = useRouter();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<TierData>({ ...BLANK, order: String(nextOrder) });
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState("");

  const inp = "w-full px-3 py-2.5 border border-gold/30 rounded-lg text-sm focus:outline-none focus:border-saffron transition-colors";

  const save = async () => {
    if (!form.name.trim() || !form.amount) { setError("Name and amount are required."); return; }
    setSaving(true);
    setError("");
    const res = await fetch("/api/donation-tiers", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ ...form, amount: parseFloat(form.amount), order: parseInt(form.order) || 0 }),
    });
    setSaving(false);
    if (res.ok) { setOpen(false); setForm({ ...BLANK, order: String(nextOrder + 1) }); router.refresh(); }
    else { const d = await res.json(); setError(d.error || "Failed to create."); }
  };

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="btn-primary flex items-center gap-2 text-sm px-4 py-2">
        <Plus className="w-4 h-4" /> Add Tier
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gold/20">
          <h2 className="font-cinzel font-bold text-maroon text-lg">New Donation Tier</h2>
          <button onClick={() => setOpen(false)} className="text-foreground/40 hover:text-maroon"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-maroon/80 mb-1.5">Name *</label>
              <input className={inp} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Annadanam Sponsor" />
            </div>
            <div>
              <label className="block text-xs font-medium text-maroon/80 mb-1.5">Amount (USD) *</label>
              <input className={inp} type="number" min="1" step="0.01" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} placeholder="51" />
            </div>
            <div>
              <label className="block text-xs font-medium text-maroon/80 mb-1.5">Display Order</label>
              <input className={inp} type="number" min="0" value={form.order} onChange={e => setForm(f => ({ ...f, order: e.target.value }))} />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-maroon/80 mb-1.5">Description</label>
              <input className={inp} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Short description for donors" />
            </div>
          </div>
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={form.recurring} onChange={e => setForm(f => ({ ...f, recurring: e.target.checked }))} className="accent-saffron w-4 h-4" />
              <span className="text-maroon/80">Recurring / Monthly</span>
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={form.active} onChange={e => setForm(f => ({ ...f, active: e.target.checked }))} className="accent-saffron w-4 h-4" />
              <span className="text-maroon/80">Active</span>
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={form.highlighted} onChange={e => setForm(f => ({ ...f, highlighted: e.target.checked }))} className="accent-saffron w-4 h-4" />
              <span className="text-maroon/80">Highlighted</span>
            </label>
          </div>
          {error && <p className="text-red-600 text-xs bg-red-50 border border-red-200 rounded px-3 py-2">{error}</p>}
        </div>
        <div className="px-6 pb-6 flex gap-2">
          <button onClick={save} disabled={saving} className="btn-primary flex items-center gap-2 px-5">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            Create Tier
          </button>
          <button onClick={() => setOpen(false)} className="btn-secondary px-5">Cancel</button>
        </div>
      </div>
    </div>
  );
}
