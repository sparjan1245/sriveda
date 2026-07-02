"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, X, Upload, Link as LinkIcon } from "lucide-react";
import ImageUpload from "@/components/ui/ImageUpload";
import VideoUpload from "@/components/ui/VideoUpload";

const CATEGORIES = ["Temple", "Rituals", "Events", "Community", "Festivals"];

type VideoTab = "upload" | "url";

export default function VideoForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<VideoTab>("upload");
  const [videoUrl, setVideoUrl] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [form, setForm] = useState({ title: "", category: "" });

  const close = () => {
    setOpen(false);
    setForm({ title: "", category: "" });
    setVideoUrl("");
    setThumbnailUrl("");
    setError("");
    setTab("upload");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoUrl) { setError("Please provide a video (upload or URL)."); return; }
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/gallery/videos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: videoUrl, ...form, thumbnail: thumbnailUrl }),
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

                {/* Source tabs */}
                <div className="flex rounded-lg border border-gold/25 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => { setTab("upload"); setVideoUrl(""); }}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold tracking-wide transition-colors ${tab === "upload" ? "bg-maroon text-white" : "bg-transparent text-maroon hover:bg-cream"}`}
                  >
                    <Upload className="w-3.5 h-3.5" /> Upload File
                  </button>
                  <button
                    type="button"
                    onClick={() => { setTab("url"); setVideoUrl(""); }}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold tracking-wide transition-colors ${tab === "url" ? "bg-maroon text-white" : "bg-transparent text-maroon hover:bg-cream"}`}
                  >
                    <LinkIcon className="w-3.5 h-3.5" /> YouTube / URL
                  </button>
                </div>

                {/* Upload panel */}
                {tab === "upload" && (
                  <VideoUpload
                    value={videoUrl}
                    onChange={setVideoUrl}
                    folder="temple/gallery/videos"
                    label="Video File *"
                  />
                )}

                {/* URL panel */}
                {tab === "url" && (
                  <div>
                    <label className={lc}>YouTube / Video URL *</label>
                    <input
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                      className={ic}
                      placeholder="https://youtube.com/watch?v=…"
                    />
                  </div>
                )}

                <div>
                  <label className={lc}>Title</label>
                  <input value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} className={ic} placeholder="Video title" />
                </div>

                {tab === "url" && (
                  <ImageUpload
                    value={thumbnailUrl}
                    onChange={setThumbnailUrl}
                    folder="temple/gallery/thumbnails"
                    label="Custom Thumbnail (optional)"
                    aspect="video"
                  />
                )}

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
