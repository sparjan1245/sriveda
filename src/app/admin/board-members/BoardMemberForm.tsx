"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Pencil, X } from "lucide-react";
import ImageUpload from "@/components/ui/ImageUpload";

interface BoardMember { id: string; name: string; title: string; image: string | null; bio: string | null; order: number; active: boolean; }

const ic = "w-full px-3 py-2 border border-gold/30 rounded-lg text-sm focus:outline-none focus:border-saffron transition-colors";
const lc = "block text-sm font-medium text-maroon/80 mb-1";

function MemberModal({
  initial, onClose, onSave,
}: { initial: Partial<BoardMember>; onClose: () => void; onSave: (data: Partial<BoardMember>) => Promise<void>; }) {
  const [imageUrl, setImageUrl] = useState(initial.image || "");
  const [form, setForm] = useState({
    name: initial.name || "",
    title: initial.title || "",
    bio: initial.bio || "",
    order: initial.order ?? 0,
    active: initial.active ?? true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError("");
    try { await onSave({ ...form, image: imageUrl }); onClose(); }
    catch { setError("Something went wrong."); }
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl gold-border w-full max-w-lg flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gold/15 shrink-0">
          <h3 className="font-cinzel font-bold text-maroon text-xl">{initial.id ? "Edit Member" : "Add Member"}</h3>
          <button onClick={onClose} className="text-foreground/40 hover:text-maroon transition-colors"><X className="w-5 h-5" /></button>
        </div>

        <form onSubmit={submit} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={lc}>Full Name *</label>
                <input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} required className={ic} placeholder="Dr. Jane Smith" />
              </div>
              <div>
                <label className={lc}>Title / Role *</label>
                <input value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} required className={ic} placeholder="Board Director" />
              </div>
            </div>
            <ImageUpload value={imageUrl} onChange={setImageUrl} folder="temple/board-members" label="Photo" aspect="square" />
            <div>
              <label className={lc}>Bio</label>
              <textarea value={form.bio} onChange={(e) => setForm((p) => ({ ...p, bio: e.target.value }))} rows={3} className={ic} placeholder="Short biography…" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={lc}>Display Order</label>
                <input type="number" value={form.order} onChange={(e) => setForm((p) => ({ ...p, order: parseInt(e.target.value) || 0 }))} className={ic} />
              </div>
              <div className="flex items-center pt-6">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={form.active} onChange={(e) => setForm((p) => ({ ...p, active: e.target.checked }))} className="w-4 h-4 accent-maroon" /> Active
                </label>
              </div>
            </div>
            {error && <p className="text-red-500 text-sm bg-red-50 border border-red-200 p-3 rounded-lg">{error}</p>}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gold/15 flex gap-3 shrink-0">
            <button type="submit" disabled={loading} className="btn-primary flex-1 flex items-center justify-center gap-2 py-2.5 disabled:opacity-50">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</> : (initial.id ? "Save Changes" : "Add Member")}
            </button>
            <button type="button" onClick={onClose} className="btn-secondary flex-1 py-2.5">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function AddMemberButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const save = async (data: Partial<BoardMember>) => {
    await fetch("/api/board-members", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
    router.refresh();
  };
  return (
    <>
      <button onClick={() => setOpen(true)} className="btn-primary flex items-center gap-2 text-sm px-4 py-2">
        <Plus className="w-4 h-4" /> Add Member
      </button>
      {open && <MemberModal initial={{}} onClose={() => setOpen(false)} onSave={save} />}
    </>
  );
}

export function EditMemberButton({ member }: { member: BoardMember }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const save = async (data: Partial<BoardMember>) => {
    await fetch(`/api/board-members/${member.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
    router.refresh();
  };
  return (
    <>
      <button onClick={() => setOpen(true)} className="text-saffron hover:text-saffron/70 p-1 transition-colors"><Pencil className="w-4 h-4" /></button>
      {open && <MemberModal initial={member} onClose={() => setOpen(false)} onSave={save} />}
    </>
  );
}

export function DeleteMemberButton({ id }: { id: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const handleDelete = async () => {
    if (!confirm("Remove this board member?")) return;
    setLoading(true);
    await fetch(`/api/board-members/${id}`, { method: "DELETE" });
    router.refresh();
    setLoading(false);
  };
  return (
    <button onClick={handleDelete} disabled={loading} className="text-red-400 hover:text-red-600 p-1 transition-colors disabled:opacity-50">
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
    </button>
  );
}
