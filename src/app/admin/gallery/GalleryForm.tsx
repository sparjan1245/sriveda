"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, X } from "lucide-react";
import ImageUpload from "@/components/ui/ImageUpload";

const CATEGORIES = ["Temple", "Rituals", "Events", "Community", "Festivals"];

export default function GalleryForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [form, setForm] = useState({ caption: "", category: "" });

  const close = () => { setOpen(false); setImageUrl(""); setForm({ caption: "", category: "" }); setError(""); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrl) { setError("Please upload an image first."); return; }
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/gallery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: imageUrl, ...form }),
      });
      if (!res.ok) { const d = await res.json(); setError(d.error || "Failed to add image."); }
      else { close(); router.refresh(); }
    } catch { setError("Something went wrong."); }
    finally { setLoading(false); }
  };

  const ic = "w-full px-3 py-2 border border-gold/30 rounded-lg text-sm focus:outline-none focus:border-saffron transition-colors";
  const lc = "block text-sm font-medium text-maroon/80 mb-1";

  return (
    <>
      <button onClick={() => setOpen(true)} className="btn-primary flex items-center gap-2 text-sm px-4 py-2">
        <Plus className="w-4 h-4" /> Add Photo
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl gold-border w-full max-w-md flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gold/15 shrink-0">
              <h3 className="font-cinzel font-bold text-maroon text-xl">Add Gallery Photo</h3>
              <button onClick={close} className="text-foreground/40 hover:text-maroon transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable body + sticky footer inside form */}
            <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
                <ImageUpload
                  value={imageUrl}
                  onChange={setImageUrl}
                  folder="temple/gallery"
                  label="Photo *"
                  aspect="square"
                />
                <div>
                  <label className={lc}>Caption</label>
                  <input value={form.caption} onChange={(e) => setForm((p) => ({ ...p, caption: e.target.value }))} className={ic} placeholder="Photo description" />
                </div>
                <div>
                  <label className={lc}>Category</label>
                  <select value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))} className={ic}>
                    <option value="">Select category</option>
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                {error && <p className="text-red-500 text-sm bg-red-50 border border-red-200 p-3 rounded-lg">{error}</p>}
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-gold/15 flex gap-3 shrink-0">
                <button type="submit" disabled={loading || !imageUrl} className="btn-primary flex-1 flex items-center justify-center gap-2 py-2.5 disabled:opacity-50">
                  {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</> : "Add Photo"}
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
