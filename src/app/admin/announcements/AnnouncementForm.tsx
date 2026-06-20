"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Pencil, X } from "lucide-react";

interface Announcement { id: string; title: string; content: string; type: string; active: boolean; pinned: boolean; }

const TYPES = ["INFO", "WARNING", "EVENT", "NOTICE"];

const ic = "w-full px-3 py-2 border border-gold/30 rounded-lg text-sm focus:outline-none focus:border-saffron transition-colors";
const lc = "block text-sm font-medium text-maroon/80 mb-1";

export function NewAnnouncementButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ title: "", content: "", type: "INFO", active: true, pinned: false });

  const close = () => { setOpen(false); setForm({ title: "", content: "", type: "INFO", active: true, pinned: false }); setError(""); };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/admin/announcements", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      if (!res.ok) { const d = await res.json(); setError(d.error || "Failed."); return; }
      close(); router.refresh();
    } catch { setError("Something went wrong."); }
    finally { setLoading(false); }
  };

  return (
    <>
      <button onClick={() => setOpen(true)} className="btn-primary flex items-center gap-2 text-sm px-4 py-2">
        <Plus className="w-4 h-4" /> New Announcement
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl gold-border w-full max-w-lg flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gold/15 shrink-0">
              <h3 className="font-cinzel font-bold text-maroon text-xl">New Announcement</h3>
              <button onClick={close} className="text-foreground/40 hover:text-maroon transition-colors"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={submit} className="flex flex-col flex-1 min-h-0">
              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
                <div>
                  <label className={lc}>Title *</label>
                  <input value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} required className={ic} placeholder="Announcement title" />
                </div>
                <div>
                  <label className={lc}>Content *</label>
                  <textarea value={form.content} onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))} required rows={5} className={ic} placeholder="Announcement details…" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={lc}>Type</label>
                    <select value={form.type} onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))} className={ic}>
                      {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="flex flex-col gap-3 pt-6">
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <input type="checkbox" checked={form.active} onChange={(e) => setForm((p) => ({ ...p, active: e.target.checked }))} className="w-4 h-4 accent-maroon" /> Active
                    </label>
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <input type="checkbox" checked={form.pinned} onChange={(e) => setForm((p) => ({ ...p, pinned: e.target.checked }))} className="w-4 h-4 accent-maroon" /> Pinned
                    </label>
                  </div>
                </div>
                {error && <p className="text-red-500 text-sm bg-red-50 border border-red-200 p-3 rounded-lg">{error}</p>}
              </div>

              <div className="px-6 py-4 border-t border-gold/15 flex gap-3 shrink-0">
                <button type="submit" disabled={loading} className="btn-primary flex-1 flex items-center justify-center gap-2 py-2.5 disabled:opacity-50">
                  {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Publishing…</> : "Publish"}
                </button>
                <button type="button" onClick={close} className="btn-secondary flex-1 py-2.5">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export function EditAnnouncementButton({ item }: { item: Announcement }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ title: item.title, content: item.content, type: item.type, active: item.active, pinned: item.pinned });

  const close = () => { setOpen(false); setError(""); };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const res = await fetch(`/api/admin/announcements/${item.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      if (!res.ok) { const d = await res.json(); setError(d.error || "Failed."); return; }
      close(); router.refresh();
    } catch { setError("Something went wrong."); }
    finally { setLoading(false); }
  };

  return (
    <>
      <button onClick={() => setOpen(true)} className="text-saffron hover:text-saffron/70 p-1 transition-colors"><Pencil className="w-4 h-4" /></button>

      {open && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl gold-border w-full max-w-lg flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gold/15 shrink-0">
              <h3 className="font-cinzel font-bold text-maroon text-xl">Edit Announcement</h3>
              <button onClick={close} className="text-foreground/40 hover:text-maroon transition-colors"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={submit} className="flex flex-col flex-1 min-h-0">
              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
                <div>
                  <label className={lc}>Title</label>
                  <input value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} className={ic} />
                </div>
                <div>
                  <label className={lc}>Content</label>
                  <textarea value={form.content} onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))} rows={5} className={ic} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={lc}>Type</label>
                    <select value={form.type} onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))} className={ic}>
                      {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="flex flex-col gap-3 pt-6">
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <input type="checkbox" checked={form.active} onChange={(e) => setForm((p) => ({ ...p, active: e.target.checked }))} className="w-4 h-4 accent-maroon" /> Active
                    </label>
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <input type="checkbox" checked={form.pinned} onChange={(e) => setForm((p) => ({ ...p, pinned: e.target.checked }))} className="w-4 h-4 accent-maroon" /> Pinned
                    </label>
                  </div>
                </div>
                {error && <p className="text-red-500 text-sm bg-red-50 border border-red-200 p-3 rounded-lg">{error}</p>}
              </div>

              <div className="px-6 py-4 border-t border-gold/15 flex gap-3 shrink-0">
                <button type="submit" disabled={loading} className="btn-primary flex-1 flex items-center justify-center gap-2 py-2.5 disabled:opacity-50">
                  {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</> : "Save Changes"}
                </button>
                <button type="button" onClick={close} className="btn-secondary flex-1 py-2.5">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export function DeleteAnnouncementButton({ id }: { id: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Delete this announcement?")) return;
    setLoading(true);
    await fetch(`/api/admin/announcements/${id}`, { method: "DELETE" });
    router.refresh();
    setLoading(false);
  };

  return (
    <button onClick={handleDelete} disabled={loading} className="text-red-400 hover:text-red-600 p-1 transition-colors disabled:opacity-50">
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
    </button>
  );
}
