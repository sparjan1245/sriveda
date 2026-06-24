"use client";

import { useState, useEffect } from "react";
import { X, Loader2, Plus, Trash2 } from "lucide-react";
import ImageUpload from "@/components/ui/ImageUpload";
import PDFUpload from "@/components/ui/PDFUpload";

export interface CalendarEntry {
  id: string;
  year: number;
  title?: string | null;
  images: string[];
  downloadUrl?: string | null;
  active: boolean;
}

interface Props {
  entry?: CalendarEntry | null;
  onClose: () => void;
  onSuccess: () => void;
}

const EMPTY = {
  year: String(new Date().getFullYear()),
  title: "",
  downloadUrl: "",
  active: true,
};

export default function CalendarForm({ entry, onClose, onSuccess }: Props) {
  const [form, setForm]     = useState(EMPTY);
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState("");

  const isEdit = !!entry;

  useEffect(() => {
    if (entry) {
      setForm({
        year:        String(entry.year),
        title:       entry.title       ?? "",
        downloadUrl: entry.downloadUrl ?? "",
        active:      entry.active,
      });
      setImages(entry.images ?? []);
    }
  }, [entry]);

  const addSlot    = () => setImages((prev) => [...prev, ""]);
  const removeSlot = (i: number) => setImages((prev) => prev.filter((_, idx) => idx !== i));
  const updateImg  = (i: number, url: string) =>
    setImages((prev) => { const a = [...prev]; a[i] = url; return a; });

  const set = (k: keyof typeof EMPTY) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!form.year) { setError("Year is required."); return; }
    const validImages = images.filter((u) => u.trim());
    setLoading(true);
    setError("");
    try {
      const url    = isEdit ? `/api/calendar/${entry!.id}` : "/api/calendar";
      const method = isEdit ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          year:        Number(form.year),
          title:       form.title       || null,
          images:      validImages,
          downloadUrl: form.downloadUrl || null,
          active:      form.active,
        }),
      });
      if (!res.ok) { setError((await res.text()) || "Something went wrong."); }
      else { onSuccess(); }
    } catch { setError("Network error. Please try again."); }
    finally { setLoading(false); }
  };

  const ic = "w-full px-3 py-2 border border-gold/30 rounded-lg text-sm focus:outline-none focus:border-saffron transition-colors bg-white";
  const lc = "block text-xs font-semibold text-maroon/70 mb-1 uppercase tracking-wide";

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl gold-border w-full max-w-2xl flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gold/15 shrink-0">
          <div>
            <p className="text-gold text-xs font-semibold uppercase tracking-widest mb-0.5">Admin</p>
            <h3 className="font-cinzel font-bold text-maroon text-lg">
              {isEdit ? "Edit Calendar" : "Add Calendar"}
            </h3>
          </div>
          <button onClick={onClose} className="text-foreground/40 hover:text-maroon transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

            {/* Year + Title */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={lc}>Year <span className="text-red-500">*</span></label>
                <input
                  type="number"
                  required
                  min={2020}
                  max={2100}
                  value={form.year}
                  onChange={set("year")}
                  className={ic}
                  placeholder="e.g. 2026"
                />
              </div>
              <div>
                <label className={lc}>Title (optional)</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={set("title")}
                  className={ic}
                  placeholder="e.g. 2026 Hindu Calendar"
                />
              </div>
            </div>

            {/* Download PDF */}
            <div>
              <label className={lc}>Download PDF (optional)</label>
              <PDFUpload
                value={form.downloadUrl}
                onChange={(url) => setForm((f) => ({ ...f, downloadUrl: url }))}
                folder="temple/calendar"
              />
              <p className="text-xs text-foreground/40 mt-1">
                Upload the full calendar PDF. Leave blank to hide the download button on the public page.
              </p>
            </div>

            {/* Active toggle */}
            <div className="flex items-center gap-3">
              <input
                id="cal-active"
                type="checkbox"
                checked={form.active}
                onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))}
                className="w-4 h-4 accent-saffron"
              />
              <label htmlFor="cal-active" className="text-sm font-medium text-maroon/80">
                Published (visible on the public website)
              </label>
            </div>

            {/* Images */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className={lc + " mb-0"}>Calendar Images</p>
                  <p className="text-xs text-foreground/40">
                    Upload in order — images display as a grid. {images.length} image{images.length !== 1 ? "s" : ""} added.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={addSlot}
                  className="flex items-center gap-1.5 text-xs font-semibold text-saffron hover:text-maroon transition-colors border border-gold/30 rounded-lg px-3 py-1.5 hover:border-saffron"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Image
                </button>
              </div>

              {images.length === 0 && (
                <div
                  onClick={addSlot}
                  className="border-2 border-dashed border-gold/30 rounded-xl p-8 text-center cursor-pointer hover:border-saffron transition-colors"
                >
                  <Plus className="w-8 h-8 text-foreground/25 mx-auto mb-2" />
                  <p className="text-sm text-foreground/40">Click "Add Image" or here to start uploading</p>
                </div>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {images.map((img, i) => (
                  <div key={i} className="relative">
                    <div className="absolute top-2 right-2 z-10 flex gap-1">
                      <button
                        type="button"
                        onClick={() => removeSlot(i)}
                        className="p-1 rounded bg-red-500/90 hover:bg-red-600 text-white transition-colors"
                        title="Remove"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="absolute top-2 left-2 z-10">
                      <span className="bg-maroon/70 text-white text-[10px] font-bold px-1.5 py-0.5 rounded font-cinzel">
                        {i + 1}
                      </span>
                    </div>
                    <ImageUpload
                      value={img}
                      onChange={(url) => updateImg(i, url)}
                      folder="temple/calendar"
                      label=""
                      aspect="auto"
                    />
                  </div>
                ))}
              </div>
            </div>

            {error && <p className="text-red-500 text-sm bg-red-50 rounded-lg px-3 py-2">{error}</p>}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gold/15 shrink-0 flex gap-3 justify-end">
            <button type="button" onClick={onClose} className="btn-secondary px-5 py-2 text-sm">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-primary px-6 py-2 text-sm flex items-center gap-2">
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {isEdit ? "Save Changes" : "Create Calendar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
