"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, X, ImageIcon, Upload, Heart, Trash2 } from "lucide-react";

interface DonationOptionDraft {
  name: string;
  description: string;
  amount: string;
  recurring: boolean;
  active: boolean;
  highlighted: boolean;
}

const BLANK_OPTION: DonationOptionDraft = {
  name: "", description: "", amount: "", recurring: false, active: true, highlighted: false,
};

export default function EventForm() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const flyerFileRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [flyerUploading, setFlyerUploading] = useState(false);
  const [error, setError] = useState("");
  const [uploadedUrl, setUploadedUrl] = useState("");
  const [previewSrc, setPreviewSrc] = useState("");
  const [flyerUrl, setFlyerUrl] = useState("");
  const [flyerPreviewSrc, setFlyerPreviewSrc] = useState("");
  const [form, setForm] = useState({ title: "", description: "", date: "", endDate: "", location: "", featured: false });
  const [donationOptions, setDonationOptions] = useState<DonationOptionDraft[]>([]);

  const reset = () => {
    setForm({ title: "", description: "", date: "", endDate: "", location: "", featured: false });
    setUploadedUrl(""); setPreviewSrc(""); setError("");
    setFlyerUrl(""); setFlyerPreviewSrc("");
    setDonationOptions([]);
    if (fileRef.current) fileRef.current.value = "";
    if (flyerFileRef.current) flyerFileRef.current.value = "";
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
      fd.append("file", file); fd.append("folder", "temple/events");
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Upload failed."); setPreviewSrc(""); }
      else setUploadedUrl(data.url);
    } catch { setError("Upload failed."); setPreviewSrc(""); }
    finally { setUploading(false); }
  };

  const handleFlyerFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFlyerPreviewSrc(URL.createObjectURL(file));
    setFlyerUrl(""); setError(""); setFlyerUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file); fd.append("folder", "temple/events");
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Upload failed."); setFlyerPreviewSrc(""); }
      else setFlyerUrl(data.url);
    } catch { setError("Upload failed."); setFlyerPreviewSrc(""); }
    finally { setFlyerUploading(false); }
  };

  const addDonationOption = () => setDonationOptions((prev) => [...prev, { ...BLANK_OPTION }]);
  const updateDonationOption = <K extends keyof DonationOptionDraft>(i: number, field: K, value: DonationOptionDraft[K]) =>
    setDonationOptions((prev) => prev.map((o, idx) => (idx === i ? { ...o, [field]: value } : o)));
  const removeDonationOption = (i: number) => setDonationOptions((prev) => prev.filter((_, idx) => idx !== i));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, image: uploadedUrl || null, flyerImage: flyerUrl || null }),
      });
      if (!res.ok) { const d = await res.json(); setError(d.error || "Failed to create."); return; }
      const event = await res.json();

      const validOptions = donationOptions.filter((o) => o.name.trim() && o.amount);
      for (const o of validOptions) {
        await fetch(`/api/events/${event.id}/donation-options`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: o.name,
            description: o.description || null,
            amount: parseFloat(o.amount),
            recurring: o.recurring,
            highlighted: o.highlighted,
          }),
        }).catch(() => {});
      }

      close(); router.refresh();
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
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl gold-border w-full max-w-lg flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gold/15 shrink-0">
              <h3 className="font-cinzel font-bold text-maroon text-xl">Create New Event</h3>
              <button onClick={close} className="text-foreground/40 hover:text-maroon transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
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

                {/* Flyer image upload */}
                <div>
                  <label className={labelClass}>Flyer Image <span className="text-foreground/40 font-normal">(optional poster/pamphlet)</span></label>
                  <div
                    onClick={() => !flyerUploading && flyerFileRef.current?.click()}
                    className={`relative rounded-xl border-2 border-dashed cursor-pointer overflow-hidden transition-colors
                      ${flyerPreviewSrc ? "border-gold/40" : "border-gold/30 hover:border-saffron"}
                      ${flyerUploading ? "cursor-wait" : ""}`}
                    style={{ minHeight: "8rem" }}
                  >
                    {flyerPreviewSrc ? (
                      <>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={flyerPreviewSrc} alt="Flyer preview" className="w-full h-36 object-contain bg-cream" />
                        {flyerUploading && (
                          <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-2 text-white">
                            <Loader2 className="w-6 h-6 animate-spin" /><span className="text-sm">Uploading…</span>
                          </div>
                        )}
                        {flyerUrl && !flyerUploading && (
                          <div className="absolute bottom-2 left-2 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full font-medium">✓ Uploaded</div>
                        )}
                        {!flyerUploading && (
                          <button type="button" onClick={(ev) => { ev.stopPropagation(); setFlyerPreviewSrc(""); setFlyerUrl(""); if (flyerFileRef.current) flyerFileRef.current.value = ""; }}
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
                        <p className="text-sm font-medium">Click to upload flyer</p>
                        <p className="text-xs">JPEG, PNG, WebP · max 10 MB</p>
                      </div>
                    )}
                  </div>
                  <input ref={flyerFileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleFlyerFile} />
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
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" name="featured" checked={form.featured} onChange={handleChange} className="w-4 h-4 accent-saffron" />
                  Featured event
                </label>

                {/* Donation options */}
                <div className="pt-2 border-t border-gold/15">
                  <div className="flex items-center justify-between mb-1">
                    <span className={`${labelClass} mb-0 flex items-center gap-1.5`}>
                      <Heart className="w-3.5 h-3.5 text-saffron" /> Donation Options
                    </span>
                    <button
                      type="button"
                      onClick={addDonationOption}
                      className="flex items-center gap-1 text-xs font-medium text-saffron hover:text-maroon border border-saffron/30 hover:border-maroon/30 rounded-full px-3 py-1.5 transition-colors"
                    >
                      <Plus className="w-3 h-3" /> Add Option
                    </button>
                  </div>
                  <p className="text-xs text-foreground/50 mb-2">Suggested amounts shown on this event&apos;s registration page (optional).</p>
                  {donationOptions.length > 0 && (
                    <div className="space-y-3">
                      {donationOptions.map((o, i) => (
                        <div key={i} className="bg-cream rounded-xl p-3 space-y-2">
                          <div className="flex items-center gap-2">
                            <input
                              value={o.name}
                              onChange={(e) => updateDonationOption(i, "name", e.target.value)}
                              className={`${inputClass} bg-white flex-1`}
                              placeholder="e.g. Vaarahi Homam"
                            />
                            <input
                              type="number"
                              min="1"
                              value={o.amount}
                              onChange={(e) => updateDonationOption(i, "amount", e.target.value)}
                              className={`${inputClass} bg-white w-28`}
                              placeholder="Amount"
                            />
                            <button type="button" onClick={() => removeDonationOption(i)} className="p-2 text-foreground/40 hover:text-red-600 transition-colors shrink-0">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          <input
                            value={o.description}
                            onChange={(e) => updateDonationOption(i, "description", e.target.value)}
                            className={`${inputClass} bg-white`}
                            placeholder="Short description for donors (optional)"
                          />
                          <div className="flex items-center gap-4 pt-0.5">
                            <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                              <input type="checkbox" checked={o.recurring} onChange={(e) => updateDonationOption(i, "recurring", e.target.checked)} className="accent-saffron w-3.5 h-3.5" />
                              <span className="text-maroon/80">Recurring</span>
                            </label>
                            <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                              <input type="checkbox" checked={o.active} onChange={(e) => updateDonationOption(i, "active", e.target.checked)} className="accent-saffron w-3.5 h-3.5" />
                              <span className="text-maroon/80">Active</span>
                            </label>
                            <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                              <input type="checkbox" checked={o.highlighted} onChange={(e) => updateDonationOption(i, "highlighted", e.target.checked)} className="accent-saffron w-3.5 h-3.5" />
                              <span className="text-maroon/80">Highlighted</span>
                            </label>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {error && <p className="text-red-500 text-sm bg-red-50 border border-red-200 p-3 rounded-lg">{error}</p>}
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-gold/15 flex gap-3 shrink-0">
                <button type="submit" disabled={loading || uploading} className="btn-primary flex-1 flex items-center justify-center gap-2 py-2.5 disabled:opacity-50 disabled:cursor-not-allowed">
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
