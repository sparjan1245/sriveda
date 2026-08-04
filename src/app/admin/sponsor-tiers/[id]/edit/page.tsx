"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Loader2 } from "lucide-react";

export default function EditSponsorTierPage() {
  const { id }     = useParams<{ id: string }>();
  const router     = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState("");
  const [form, setForm] = useState({
    name: "", description: "", minAmount: "", maxAmount: "", benefits: "", active: true, highlighted: false,
  });

  useEffect(() => {
    fetch(`/api/sponsor-tiers/${id}`)
      .then(r => r.json())
      .then((t: { name: string; description: string | null; minAmount: number; maxAmount: number | null; benefits: string | null; active: boolean; highlighted: boolean }) => {
        setForm({
          name: t.name,
          description: t.description || "",
          minAmount: String(t.minAmount),
          maxAmount: t.maxAmount != null ? String(t.maxAmount) : "",
          benefits: t.benefits || "",
          active: t.active,
          highlighted: t.highlighted,
        });
      })
      .finally(() => setLoading(false));
  }, [id]);

  const save = async () => {
    if (!form.name.trim() || !form.minAmount) { setError("Name and minimum amount are required."); return; }
    setSaving(true);
    setError("");
    const res = await fetch(`/api/sponsor-tiers/${id}`, {
      method:  "PATCH",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({
        name:        form.name,
        description: form.description,
        minAmount:   parseFloat(form.minAmount),
        maxAmount:   form.maxAmount ? parseFloat(form.maxAmount) : null,
        benefits:    form.benefits,
        active:      form.active,
        highlighted: form.highlighted,
      }),
    });
    setSaving(false);
    if (res.ok) router.push("/admin/sponsor-tiers");
    else { const d = await res.json(); setError(d.error || "Save failed."); }
  };

  const inp = "w-full px-3 py-2.5 border border-gold/30 rounded-lg text-sm focus:outline-none focus:border-saffron transition-colors";

  return (
    <div className="min-h-screen bg-cream pattern-bg">
      <div className="max-w-xl mx-auto px-4 py-10">
        <Link href="/admin/sponsor-tiers" className="inline-flex items-center gap-2 text-maroon/60 hover:text-maroon text-sm mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Sponsor Tiers
        </Link>
        <h1 className="font-cinzel font-bold text-3xl text-maroon mb-8">Edit Sponsor Tier</h1>

        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-saffron" /></div>
        ) : (
          <div className="bg-white rounded-2xl p-8 gold-border shadow-sm space-y-5">
            <div>
              <label className="block text-xs font-medium text-maroon/80 mb-1.5">Name *</label>
              <input className={inp} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-maroon/80 mb-1.5">Minimum Amount (USD) *</label>
                <input className={inp} type="number" min="1" step="0.01" value={form.minAmount} onChange={e => setForm(f => ({ ...f, minAmount: e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs font-medium text-maroon/80 mb-1.5">Maximum Amount (USD)</label>
                <input className={inp} type="number" min="1" step="0.01" value={form.maxAmount} onChange={e => setForm(f => ({ ...f, maxAmount: e.target.value }))} placeholder="Leave blank for no limit" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-maroon/80 mb-1.5">Description</label>
              <input className={inp} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Short description shown to donors" />
            </div>
            <div>
              <label className="block text-xs font-medium text-maroon/80 mb-1.5">Benefits (one per line)</label>
              <textarea className={inp} rows={4} value={form.benefits} onChange={e => setForm(f => ({ ...f, benefits: e.target.value }))} />
            </div>
            <div className="flex items-center gap-6 pt-1">
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
            <div className="flex gap-3 pt-2">
              <button onClick={save} disabled={saving} className="btn-primary flex items-center gap-2 px-6">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Changes
              </button>
              <Link href="/admin/sponsor-tiers" className="btn-secondary px-6">Cancel</Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
