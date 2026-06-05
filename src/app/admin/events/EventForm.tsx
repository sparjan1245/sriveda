"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, X, ImageIcon, Upload } from "lucide-react";

export default function EventForm() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const [uploadedUrl, setUploadedUrl] = useState("");
  const [previewSrc, setPreviewSrc] = useState("");

  const [form, setForm] = useState({
    title: "", description: "", date: "", endDate: "",
    location: "", featured: false,
  });

  const reset = () => {
    setForm({ title: "", description: "", date: "", endDate: "", location: "", featured: false });
    setUploadedUrl(""); setPreviewSrc(""); setError("");
    if (fileRef.current) fileRef.current.value = "";
  };

  const close = () => { setOpen(false); reset(); };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const target = e.target as HTMLInputElement;
    setForm((p) => ({ ...p, [target.name]: target.type === "checkbox" ? target.checked : target.value }));
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreviewSrc(URL.createObjectURL(file));
    setUploadedUrl(""); setError(""); setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", "temple/events");
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Upload failed."); setPreviewSrc(""); }
      else setUploadedUrl(data.url);
    } catch { setError("Upload failed."); setPreviewSrc(""); }
    finally { setUploading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, image: uploadedUrl || null }),
      });
      if (!res.ok) { const d = await res.json(); setError(d.error || "Failed to create."); }
      else { close(); router.refresh(); }
    } catch { setError("Something went wrong."); }
    finally { setLoading(false); }
  };

  const inputClass = "w-full px-3 py-2 border border-gold/30 rounded-lg text-sm focus:outline-none focus:border-saffron transition-colors";
  const labelClass = "block text-sm font-medium text-maroon/80 mb-1";

  return (
    <>
      <button onClick={() => setOpen(true)} className="btn-primary flex items-center gap-2 text-sm px-4 py-2">
        <Plus className="w-4 h-4" /> Add Event
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-xl gold-border my-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-cinzel font-bold text-maroon text-xl">Create New Event</h3>
              <button onClick={close} className="text-foreground/40 hover:text-maroon transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Image upload */}
              <div>
                <label className={labelClass}>Event Image</label>
                <div
                  onClick={() => !uploading && fileRef.current?.click()}
                  className={`relative rounded-xl border-2 border-dashed cursor-pointer overflow-hidden transition-colors
                    ${previewSrc ? "border-gold/40" : "border-gold/30 hover:border-saffron"}
                    ${uploading ? "cursor-wait" : ""}`}
                  style={{ minHeight: "8rem" }}
                >
                  {previewSrc ? (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={previewSrc} alt="Preview" className="w-full h-36 object-cover" />
                      {uploading && (
                        <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-2 text-white">
                          <Loader2 className="w-6 h-6 animate-spin" /><span className="text-sm">Uploading…</span>
                        </div>
                      )}
                      {uploadedUrl && !uploading && (
                        <div className="absolute bottom-2 left-2 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full font-medium">✓ Uploaded</div>
                      )}
                      {!uploading && (
                        <button type="button" onClick={(ev) => { ev.stopPropagation(); setPreviewSrc(""); setUploadedUrl(""); if (fileRef.current) fileRef.current.value = ""; }}
                          className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white rounded-full p-1 transition-colors">
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center gap-2 py-8 text-foreground/50">
                      <div className="w-10 h-10 rounded-full bg-cream flex items-center justify-center">
                        <ImageIcon className="w-5 h-5 text-gold/60" />
                      </div>
                      <p className="text-sm font-medium">Click to upload image</p>
                      <p className="text-xs">JPEG, PNG, WebP · max 10 MB</p>
                    </div>
                  )}
                </div>
                <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleFile} />
              </div>

              <div>
                <label className={labelClass}>Title *</label>
                <input name="title" value={form.title} onChange={handleChange} required className={inputClass} placeholder="Event title" />
              </div>
              <div>
                <label className={labelClass}>Description</label>
                <textarea name="description" value={form.description} onChange={handleChange} rows={3} className={inputClass} placeholder="Event description" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Date & Time *</label>
                  <input name="date" type="datetime-local" value={form.date} onChange={handleChange} required className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>End Date & Time</label>
                  <input name="endDate" type="datetime-local" value={form.endDate} onChange={handleChange} className={inputClass} />
                </div>
              </div>
              <div>
                <label className={labelClass}>Location</label>
                <input name="location" value={form.location} onChange={handleChange} className={inputClass} placeholder="e.g. Main Hall" />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" name="featured" id="featured" checked={form.featured} onChange={handleChange} className="w-4 h-4 accent-saffron" />
                <label htmlFor="featured" className="text-sm text-maroon/80">Featured event</label>
              </div>

              {error && <p className="text-red-500 text-sm bg-red-50 border border-red-200 p-3 rounded-lg">{error}</p>}

              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={loading || uploading}
                  className="btn-primary flex-1 flex items-center justify-center gap-2 py-2.5 disabled:opacity-50 disabled:cursor-not-allowed">
                  {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating…</>
                    : uploading ? <><Upload className="w-4 h-4 animate-pulse" /> Uploading…</>
                    : "Create Event"}
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
