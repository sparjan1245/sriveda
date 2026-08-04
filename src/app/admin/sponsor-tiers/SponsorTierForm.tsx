"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X, Loader2, Check } from "lucide-react";

interface TierData {
  name: string;
  description: string;
  minAmount: string;
  maxAmount: string;
  benefits: string;
  highlighted: boolean;
}

const BLANK: TierData = { name: "", description: "", minAmount: "", maxAmount: "", benefits: "", highlighted: false };

export default function SponsorTierForm() {
  const router          = useRouter();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<TierData>(BLANK);
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState("");

  const inp = "w-full px-3 py-2.5 border border-gold/30 rounded-lg text-sm focus:outline-none focus:border-saffron transition-colors";

  const save = async () => {
    if (!form.name.trim() || !form.minAmount) { setError("Name and minimum amount are required."); return; }
    setSaving(true);
    setError("");
    const res = await fetch("/api/sponsor-tiers", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({
        name:        form.name,
        description: form.description,
        minAmount:   parseFloat(form.minAmount),
        maxAmount:   form.maxAmount ? parseFloat(form.maxAmount) : null,
        benefits:    form.benefits,
        highlighted: form.highlighted,
      }),
    });
    setSaving(false);
    if (res.ok) { setOpen(false); setForm(BLANK); router.refresh(); }
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
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gold/20">
          <h2 className="font-cinzel font-bold text-maroon text-lg">New Sponsor Tier</h2>
          <button onClick={() => setOpen(false)} className="text-foreground/40 hover:text-maroon"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-maroon/80 mb-1.5">Name *</label>
              <input className={inp} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Bronze Seva" />
            </div>
            <div>
              <label className="block text-xs font-medium text-maroon/80 mb-1.5">Minimum Amount (USD) *</label>
              <input className={inp} type="number" min="1" step="0.01" value={form.minAmount} onChange={e => setForm(f => ({ ...f, minAmount: e.target.value }))} placeholder="1000" />
            </div>
            <div>
              <label className="block text-xs font-medium text-maroon/80 mb-1.5">Maximum Amount (USD)</label>
              <input className={inp} type="number" min="1" step="0.01" value={form.maxAmount} onChange={e => setForm(f => ({ ...f, maxAmount: e.target.value }))} placeholder="Leave blank for no limit" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-maroon/80 mb-1.5">Description</label>
              <input className={inp} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Short description shown to donors" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-maroon/80 mb-1.5">Benefits (one per line)</label>
              <textarea
                className={inp}
                rows={4}
                value={form.benefits}
                onChange={e => setForm(f => ({ ...f, benefits: e.target.value }))}
                placeholder={"Support daily poojas and temple maintenance\nName listed in weekly announcements"}
              />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={form.highlighted} onChange={e => setForm(f => ({ ...f, highlighted: e.target.checked }))} className="accent-saffron w-4 h-4" />
            <span className="text-maroon/80">Highlighted (shown with a &ldquo;Highest Honour&rdquo; badge)</span>
          </label>
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
