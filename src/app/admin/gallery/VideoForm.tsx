"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, X } from "lucide-react";
import ImageUpload from "@/components/ui/ImageUpload";

const CATEGORIES = ["Temple", "Rituals", "Events", "Community", "Festivals"];

export default function VideoForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [form, setForm] = useState({ url: "", title: "", category: "" });

  const close = () => { setOpen(false); setForm({ url: "", title: "", category: "" }); setThumbnailUrl(""); setError(""); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.url) { setError("Video URL is required."); return; }
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/gallery/videos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, thumbnail: thumbnailUrl }),
      });
      if (!res.ok) { const d = await res.json(); setError(d.error || "Failed."); return; }
      close(); router.refresh();
    } catch { setError("Something went wrong."); }
    finally { setLoading(false); }
  };

  const ic = "w-full px-3 py-2 border border-gold/30 rounded-lg text-sm focus:outline-none focus:border-saffron transition-colors";
  const lc = "block text-sm font-medium text-maroon/80 mb-1";

  return (
    <>
      <button onClick={() => setOpen(true)} className="btn-secondary flex items-center gap-2 text-sm px-4 py-2">
        <Plus className="w-4 h-4" /> Add Video
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl gold-border w-full max-w-md flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gold/15 shrink-0">
              <h3 className="font-cinzel font-bold text-maroon text-xl">Add Gallery Video</h3>
              <button onClick={close} className="text-foreground/40 hover:text-maroon transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
                <div>
                  <label className={lc}>YouTube / Video URL *</label>
                  <input value={form.url} onChange={(e) => setForm((p) => ({ ...p, url: e.target.value }))} required className={ic} placeholder="https://youtube.com/watch?v=…" />
                </div>
                <div>
                  <label className={lc}>Title</label>
                  <input value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} className={ic} placeholder="Video title" />
                </div>
                <ImageUpload
                  value={thumbnailUrl}
                  onChange={setThumbnailUrl}
                  folder="temple/gallery/thumbnails"
                  label="Custom Thumbnail (optional)"
                  aspect="video"
                />
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
                <button type="submit" disabled={loading} className="btn-primary flex-1 flex items-center justify-center gap-2 py-2.5 disabled:opacity-50">
                  {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Adding…</> : "Add Video"}
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
