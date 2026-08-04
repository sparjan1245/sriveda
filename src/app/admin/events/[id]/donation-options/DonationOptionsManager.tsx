"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, Loader2, Check, X, Heart, RefreshCw, Star } from "lucide-react";

interface Option {
  id: string;
  name: string;
  description: string | null;
  amount: number;
  recurring: boolean;
  order: number;
  active: boolean;
  highlighted: boolean;
}

interface Draft {
  name: string;
  description: string;
  amount: string;
  recurring: boolean;
  active: boolean;
  highlighted: boolean;
}

const BLANK: Draft = { name: "", description: "", amount: "", recurring: false, active: true, highlighted: false };

function toDraft(o: Option): Draft {
  return {
    name: o.name,
    description: o.description || "",
    amount: String(o.amount),
    recurring: o.recurring,
    active: o.active,
    highlighted: o.highlighted,
  };
}

export default function DonationOptionsManager({ eventId, initialOptions }: { eventId: string; initialOptions: Option[] }) {
  const [options, setOptions] = useState<Option[]>(initialOptions);
  const [adding, setAdding] = useState(false);
  const [newDraft, setNewDraft] = useState<Draft>(BLANK);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<Draft>(BLANK);

  const inputClass = "w-full px-3 py-2 border border-gold/30 rounded-lg text-sm focus:outline-none focus:border-saffron bg-white";

  const addOption = async () => {
    if (!newDraft.name.trim() || !newDraft.amount) { setError("Name and amount are required."); return; }
    setSaving(true);
    setError("");
    const res = await fetch(`/api/events/${eventId}/donation-options`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: newDraft.name,
        description: newDraft.description || null,
        amount: parseFloat(newDraft.amount),
        recurring: newDraft.recurring,
        highlighted: newDraft.highlighted,
        order: options.length,
      }),
    });
    setSaving(false);
    if (!res.ok) { const d = await res.json(); setError(d.error || "Failed to add."); return; }
    const created = await res.json();
    setOptions((prev) => [...prev, created]);
    setNewDraft(BLANK); setAdding(false);
  };

  const startEdit = (o: Option) => {
    setEditingId(o.id);
    setEditDraft(toDraft(o));
  };

  const saveEdit = async (id: string) => {
    if (!editDraft.name.trim() || !editDraft.amount) return;
    setSaving(true);
    const res = await fetch(`/api/events/${eventId}/donation-options/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: editDraft.name,
        description: editDraft.description || null,
        amount: parseFloat(editDraft.amount),
        recurring: editDraft.recurring,
        active: editDraft.active,
        highlighted: editDraft.highlighted,
      }),
    });
    setSaving(false);
    if (!res.ok) return;
    const updated = await res.json();
    setOptions((prev) => prev.map((o) => (o.id === id ? updated : o)));
    setEditingId(null);
  };

  const deleteOption = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    setOptions((prev) => prev.filter((o) => o.id !== id));
    await fetch(`/api/events/${eventId}/donation-options/${id}`, { method: "DELETE" });
  };

  const checkboxRow = (draft: Draft, setDraft: (d: Draft) => void) => (
    <div className="flex items-center gap-4">
      <label className="flex items-center gap-1.5 text-xs cursor-pointer">
        <input type="checkbox" checked={draft.recurring} onChange={(e) => setDraft({ ...draft, recurring: e.target.checked })} className="accent-saffron w-3.5 h-3.5" />
        <span className="text-maroon/80">Recurring</span>
      </label>
      <label className="flex items-center gap-1.5 text-xs cursor-pointer">
        <input type="checkbox" checked={draft.active} onChange={(e) => setDraft({ ...draft, active: e.target.checked })} className="accent-saffron w-3.5 h-3.5" />
        <span className="text-maroon/80">Active</span>
      </label>
      <label className="flex items-center gap-1.5 text-xs cursor-pointer">
        <input type="checkbox" checked={draft.highlighted} onChange={(e) => setDraft({ ...draft, highlighted: e.target.checked })} className="accent-saffron w-3.5 h-3.5" />
        <span className="text-maroon/80">Highlighted</span>
      </label>
    </div>
  );

  return (
    <div className="bg-white rounded-2xl gold-border shadow-sm overflow-hidden">
      <div className="divide-y divide-gold/10">
        {options.length === 0 && !adding && (
          <div className="text-center py-12">
            <Heart className="w-10 h-10 text-gold/40 mx-auto mb-3" />
            <p className="text-foreground/50 text-sm">No donation options yet for this event.</p>
          </div>
        )}
        {options.map((o) => (
          <div key={o.id} className={`px-5 py-3 ${!o.active && editingId !== o.id ? "opacity-50" : ""}`}>
            {editingId === o.id ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <input value={editDraft.name} onChange={(e) => setEditDraft({ ...editDraft, name: e.target.value })} className={`${inputClass} flex-1`} placeholder="Name" />
                  <input type="number" min="1" value={editDraft.amount} onChange={(e) => setEditDraft({ ...editDraft, amount: e.target.value })} className={`${inputClass} w-28`} placeholder="Amount" />
                </div>
                <input value={editDraft.description} onChange={(e) => setEditDraft({ ...editDraft, description: e.target.value })} className={inputClass} placeholder="Description (optional)" />
                <div className="flex items-center justify-between">
                  {checkboxRow(editDraft, setEditDraft)}
                  <div className="flex items-center gap-1">
                    <button onClick={() => saveEdit(o.id)} disabled={saving} className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                    </button>
                    <button onClick={() => setEditingId(null)} className="p-2 text-foreground/40 hover:bg-cream rounded-lg transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-saffron/10 flex items-center justify-center shrink-0">
                  <Heart className="w-3.5 h-3.5 text-saffron" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-cinzel font-semibold text-maroon text-sm">{o.name}</span>
                    {o.recurring && (
                      <span className="inline-flex items-center gap-1 text-[10px] bg-blue-50 text-blue-600 border border-blue-200 px-1.5 py-0.5 rounded-full">
                        <RefreshCw className="w-2.5 h-2.5" /> Monthly
                      </span>
                    )}
                    {o.highlighted && (
                      <span className="inline-flex items-center gap-1 text-[10px] bg-gold/15 text-maroon px-1.5 py-0.5 rounded-full">
                        <Star className="w-2.5 h-2.5" /> Highlighted
                      </span>
                    )}
                    {!o.active && (
                      <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full">Inactive</span>
                    )}
                  </div>
                  {o.description && <p className="text-foreground/50 text-xs mt-0.5 truncate">{o.description}</p>}
                </div>
                <span className="font-bold text-saffron shrink-0">${o.amount}</span>
                <button onClick={() => startEdit(o)} className="p-2 text-foreground/40 hover:text-maroon hover:bg-cream rounded-lg transition-colors shrink-0" title="Edit">
                  <Pencil className="w-4 h-4" />
                </button>
                <button onClick={() => deleteOption(o.id, o.name)} className="p-2 text-foreground/40 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors shrink-0" title="Delete">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="p-5 border-t border-gold/15 bg-cream/40">
        {adding ? (
          <div className="space-y-3">
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-maroon/80 mb-1.5">Name *</label>
                <input value={newDraft.name} onChange={(e) => setNewDraft({ ...newDraft, name: e.target.value })} className={inputClass} placeholder="e.g. Vaarahi Homam" />
              </div>
              <div>
                <label className="block text-xs font-medium text-maroon/80 mb-1.5">Amount (USD) *</label>
                <input type="number" min="1" value={newDraft.amount} onChange={(e) => setNewDraft({ ...newDraft, amount: e.target.value })} className={inputClass} placeholder="101" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-maroon/80 mb-1.5">Description</label>
                <input value={newDraft.description} onChange={(e) => setNewDraft({ ...newDraft, description: e.target.value })} className={inputClass} placeholder="Short description for donors (optional)" />
              </div>
            </div>
            {checkboxRow(newDraft, setNewDraft)}
            {error && <p className="text-red-600 text-xs bg-red-50 border border-red-200 rounded px-3 py-2">{error}</p>}
            <div className="flex gap-2">
              <button onClick={addOption} disabled={saving} className="btn-primary flex items-center gap-2 px-5 py-2">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />} Save
              </button>
              <button onClick={() => { setAdding(false); setError(""); setNewDraft(BLANK); }} className="btn-secondary px-5 py-2">Cancel</button>
            </div>
          </div>
        ) : (
          <button onClick={() => setAdding(true)} className="btn-primary flex items-center gap-2 text-sm px-4 py-2">
            <Plus className="w-4 h-4" /> Add Donation Option
          </button>
        )}
      </div>
    </div>
  );
}
