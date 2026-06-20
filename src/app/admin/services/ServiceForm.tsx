"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Upload, X, ImageIcon, Pencil } from "lucide-react";

interface Service {
  id: string;
  slug: string;
  name: string;
  shortDesc: string | null;
  description: string;
  price: number;
  duration: string | null;
  image: string | null;
  category: string | null;
  active: boolean;
  order: number;
}

function toSlug(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-");
}

export default function ServiceForm({ service }: { service?: Service } = {}) {
  const isEdit = !!service;
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [slugEdited, setSlugEdited] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState(service?.image ?? "");
  const [previewSrc, setPreviewSrc] = useState(service?.image ?? "");

  const emptyForm = () => ({
    name: service?.name ?? "",
    slug: service?.slug ?? "",
    shortDesc: service?.shortDesc ?? "",
    description: service?.description ?? "",
    price: service?.price?.toString() ?? "",
    duration: service?.duration ?? "",
    category: service?.category ?? "",
    active: service?.active ?? true,
  });

  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (!open) {
      setForm(emptyForm());
      setUploadedUrl(service?.image ?? "");
      setPreviewSrc(service?.image ?? "");
      setSlugEdited(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [service, open]);

  const reset = () => {
    setForm(emptyForm());
    setUploadedUrl(service?.image ?? "");
    setPreviewSrc(service?.image ?? "");
    setError(""); setSlugEdited(false);
    if (fileRef.current) fileRef.current.value = "";
  };

  const close = () => { setOpen(false); reset(); };

  const handleNameChange = (name: string) => {
    setForm((p) => ({ ...p, name, slug: slugEdited ? p.slug : toSlug(name) }));
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreviewSrc(URL.createObjectURL(file));
    setUploadedUrl(""); setError(""); setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file); fd.append("folder", "temple/services");
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Upload failed."); setPreviewSrc(service?.image ?? ""); }
      else setUploadedUrl(data.url);
    } catch { setError("Upload failed."); setPreviewSrc(service?.image ?? ""); }
    finally { setUploading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.slug || !form.price) { setError("Name, slug, and price are required."); return; }
    setSubmitting(true); setError("");
    try {
      const res = await fetch(isEdit ? `/api/services/${service!.id}` : "/api/services", {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, image: uploadedUrl || null, price: parseFloat(form.price) }),
      });
      if (!res.ok) { const d = await res.json(); setError(d.error || "Failed to save service."); }
      else { close(); router.refresh(); }
    } catch { setError("Something went wrong."); }
    finally { setSubmitting(false); }
  };

  const inputClass = "w-full px-3 py-2 border border-gold/30 rounded-lg text-sm focus:outline-none focus:border-saffron transition-colors";
  const labelClass = "block text-sm font-medium text-maroon/80 mb-1";

  return (
    <>
      {isEdit ? (
        <button onClick={() => setOpen(true)} title="Edit service" className="p-1.5 bg-amber-100 text-amber-700 rounded hover:bg-amber-200 transition-colors">
          <Pencil className="w-4 h-4" />
        </button>
      ) : (
        <button onClick={() => setOpen(true)} className="btn-primary flex items-center gap-2 text-sm px-4 py-2">
          <Plus className="w-4 h-4" /> Add Service
        </button>
      )}

      {open && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl gold-border w-full max-w-2xl flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gold/15 shrink-0">
              <h3 className="font-cinzel font-bold text-maroon text-xl">
                {isEdit ? "Edit Service" : "Add New Service"}
              </h3>
              <button onClick={close} className="text-foreground/40 hover:text-maroon transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
                {/* Image upload */}
                <div>
                  <label className={labelClass}>
                    Service Image {isEdit && <span className="text-foreground/40 font-normal">(click to replace)</span>}
                  </label>
                  <div
                    onClick={() => !uploading && fileRef.current?.click()}
                    className={`relative rounded-xl border-2 border-dashed transition-colors cursor-pointer overflow-hidden
                      ${previewSrc ? "border-gold/40" : "border-gold/30 hover:border-saffron"}
                      ${uploading ? "cursor-wait" : ""}`}
                    style={{ minHeight: "8rem" }}
                  >
                    {previewSrc ? (
                      <>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={previewSrc} alt="Service preview" className="w-full h-36 object-cover" />
                        {uploading && (
                          <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-2 text-white">
                            <Loader2 className="w-6 h-6 animate-spin" /><span className="text-sm">Uploading…</span>
                          </div>
                        )}
                        {uploadedUrl && !uploading && (
                          <div className="absolute bottom-2 left-2 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full font-medium">
                            {uploadedUrl === service?.image ? "✓ Current image" : "✓ Uploaded"}
                          </div>
                        )}
                        {!uploading && (
                          <button type="button" onClick={(ev) => { ev.stopPropagation(); setPreviewSrc(service?.image ?? ""); setUploadedUrl(service?.image ?? ""); if (fileRef.current) fileRef.current.value = ""; }}
                            className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white rounded-full p-1 transition-colors" title="Remove image">
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center gap-2 py-8 text-foreground/50">
                        <div className="w-10 h-10 rounded-full bg-cream flex items-center justify-center">
                          <ImageIcon className="w-5 h-5 text-gold/60" />
                        </div>
                        <p className="text-sm font-medium">Click to select image</p>
                        <p className="text-xs">JPEG, PNG, WebP · max 10 MB</p>
                      </div>
                    )}
                  </div>
                  <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleFile} />
                </div>

                {/* Name + Slug */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Service Name *</label>
                    <input value={form.name} onChange={(e) => handleNameChange(e.target.value)} required className={inputClass} placeholder="Archana & Abhishekam" />
                  </div>
                  <div>
                    <label className={labelClass}>Slug * <span className="text-foreground/40 font-normal text-xs">(URL path)</span></label>
                    <input value={form.slug} onChange={(e) => { setForm((p) => ({ ...p, slug: e.target.value })); setSlugEdited(true); }} required className={`${inputClass} font-mono`} placeholder="archana-abhishekam" />
                  </div>
                </div>

                {/* Price + Duration + Category */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className={labelClass}>Price ($) *</label>
                    <input type="number" min="0" step="0.01" value={form.price} onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))} required className={inputClass} placeholder="51" />
                  </div>
                  <div>
                    <label className={labelClass}>Duration</label>
                    <input value={form.duration} onChange={(e) => setForm((p) => ({ ...p, duration: e.target.value }))} className={inputClass} placeholder="1 hour" />
                  </div>
                  <div>
                    <label className={labelClass}>Category</label>
                    <input value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))} className={inputClass} placeholder="Daily Rituals" />
                  </div>
                </div>

                {/* Short Description */}
                <div>
                  <label className={labelClass}>Short Description <span className="text-foreground/40 font-normal">(shown on listing cards)</span></label>
                  <textarea value={form.shortDesc} onChange={(e) => setForm((p) => ({ ...p, shortDesc: e.target.value }))} rows={2} className={inputClass} placeholder="One or two sentences summarising the service…" />
                </div>

                {/* Full Description */}
                <div>
                  <label className={labelClass}>Full Description <span className="text-foreground/40 font-normal">(shown on detail page)</span></label>
                  <textarea value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} rows={4} className={inputClass} placeholder="Detailed description of the service…" />
                </div>

                {/* Active */}
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" id="svc-active" checked={form.active} onChange={(e) => setForm((p) => ({ ...p, active: e.target.checked }))} className="w-4 h-4 accent-saffron" />
                  Active (visible on public site)
                </label>

                {error && <p className="text-red-500 text-sm bg-red-50 border border-red-200 p-3 rounded-lg">{error}</p>}
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-gold/15 flex gap-3 shrink-0">
                <button type="submit" disabled={submitting || uploading} className="btn-primary flex-1 flex items-center justify-center gap-2 py-2.5 disabled:opacity-50 disabled:cursor-not-allowed">
                  {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
                    : uploading ? <><Upload className="w-4 h-4 animate-pulse" /> Uploading…</>
                    : isEdit ? "Save Changes" : "Create Service"}
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
