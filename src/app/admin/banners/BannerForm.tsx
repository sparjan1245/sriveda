"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Upload, X, ImageIcon, Pencil } from "lucide-react";

interface Banner {
  id: string;
  image: string;
  title: string | null;
  subtitle: string | null;
  description: string | null;
  ctaText: string | null;
  ctaLink: string | null;
  cta2Text: string | null;
  cta2Link: string | null;
  active: boolean;
  order: number;
}

interface Props {
  banner?: Banner;
}

export default function BannerForm({ banner }: Props = {}) {
  const isEdit = !!banner;
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const [uploadedUrl, setUploadedUrl] = useState(banner?.image ?? "");
  const [previewSrc, setPreviewSrc] = useState(banner?.image ?? "");

  const [form, setForm] = useState({
    title: banner?.title ?? "",
    subtitle: banner?.subtitle ?? "",
    description: banner?.description ?? "",
    ctaText: banner?.ctaText ?? "",
    ctaLink: banner?.ctaLink ?? "",
    cta2Text: banner?.cta2Text ?? "",
    cta2Link: banner?.cta2Link ?? "",
  });

  // Sync form state when banner prop updates (after router.refresh)
  useEffect(() => {
    if (!open) {
      setForm({
        title: banner?.title ?? "",
        subtitle: banner?.subtitle ?? "",
        description: banner?.description ?? "",
        ctaText: banner?.ctaText ?? "",
        ctaLink: banner?.ctaLink ?? "",
        cta2Text: banner?.cta2Text ?? "",
        cta2Link: banner?.cta2Link ?? "",
      });
      setUploadedUrl(banner?.image ?? "");
      setPreviewSrc(banner?.image ?? "");
    }
  }, [banner, open]);

  const reset = () => {
    setForm({
      title: banner?.title ?? "",
      subtitle: banner?.subtitle ?? "",
      description: banner?.description ?? "",
      ctaText: banner?.ctaText ?? "",
      ctaLink: banner?.ctaLink ?? "",
      cta2Text: banner?.cta2Text ?? "",
      cta2Link: banner?.cta2Link ?? "",
    });
    setUploadedUrl(banner?.image ?? "");
    setPreviewSrc(banner?.image ?? "");
    setError("");
    if (fileRef.current) fileRef.current.value = "";
  };

  const close = () => { setOpen(false); reset(); };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const local = URL.createObjectURL(file);
    setPreviewSrc(local);
    setUploadedUrl("");
    setError("");
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", "temple/banners");
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Upload failed.");
        setPreviewSrc(banner?.image ?? "");
      } else {
        setUploadedUrl(data.url);
      }
    } catch {
      setError("Upload failed. Check your connection.");
      setPreviewSrc(banner?.image ?? "");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadedUrl) { setError("Please upload an image first."); return; }
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch(isEdit ? `/api/banners/${banner!.id}` : "/api/banners", {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: uploadedUrl, ...form }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to save banner.");
      } else {
        close();
        router.refresh();
      }
    } catch {
      setError("Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    "w-full px-3 py-2 border border-gold/30 rounded-lg text-sm focus:outline-none focus:border-saffron transition-colors";
  const labelClass = "block text-sm font-medium text-maroon/80 mb-1";

  return (
    <>
      {isEdit ? (
        <button
          onClick={() => setOpen(true)}
          title="Edit banner"
          className="p-1.5 bg-amber-100 text-amber-700 rounded hover:bg-amber-200 transition-colors"
        >
          <Pencil className="w-4 h-4" />
        </button>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="btn-primary flex items-center gap-2 text-sm px-4 py-2"
        >
          <Plus className="w-4 h-4" /> Add Banner
        </button>
      )}

      {open && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-xl gold-border my-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-cinzel font-bold text-maroon text-xl">
                {isEdit ? "Edit Banner" : "Add Hero Banner"}
              </h3>
              <button onClick={close} className="text-foreground/40 hover:text-maroon transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Image Upload */}
              <div>
                <label className={labelClass}>
                  Slide Image {!isEdit && "*"}
                  {isEdit && (
                    <span className="text-foreground/40 font-normal"> (click to replace)</span>
                  )}
                </label>
                <div
                  onClick={() => !uploading && fileRef.current?.click()}
                  className={`relative rounded-xl border-2 border-dashed transition-colors cursor-pointer overflow-hidden
                    ${previewSrc ? "border-gold/40" : "border-gold/30 hover:border-saffron"}
                    ${uploading ? "cursor-wait" : ""}`}
                  style={{ minHeight: "10rem" }}
                >
                  {previewSrc ? (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={previewSrc} alt="Banner preview" className="w-full h-44 object-cover" />
                      {uploading && (
                        <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-2 text-white">
                          <Loader2 className="w-6 h-6 animate-spin" />
                          <span className="text-sm">Uploading to Cloudinary…</span>
                        </div>
                      )}
                      {uploadedUrl && !uploading && (
                        <div className="absolute bottom-2 left-2 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full font-medium">
                          {uploadedUrl === banner?.image ? "✓ Current image" : "✓ Uploaded"}
                        </div>
                      )}
                      {!uploading && (
                        <button
                          type="button"
                          onClick={(ev) => {
                            ev.stopPropagation();
                            setPreviewSrc(banner?.image ?? "");
                            setUploadedUrl(banner?.image ?? "");
                            if (fileRef.current) fileRef.current.value = "";
                          }}
                          className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white rounded-full p-1 transition-colors"
                          title={isEdit ? "Reset to original" : "Remove image"}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center gap-2 py-10 text-foreground/50">
                      <div className="w-12 h-12 rounded-full bg-cream flex items-center justify-center">
                        <ImageIcon className="w-6 h-6 text-gold/60" />
                      </div>
                      <p className="text-sm font-medium">Click to select image</p>
                      <p className="text-xs">JPEG, PNG, WebP · max 10 MB</p>
                    </div>
                  )}
                </div>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                  onChange={handleFile}
                />
              </div>

              <div>
                <label className={labelClass}>
                  Slide Title <span className="text-foreground/40 font-normal">(optional)</span>
                </label>
                <input
                  value={form.title}
                  onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                  className={inputClass}
                  placeholder="Defaults to temple name"
                />
              </div>

              <div>
                <label className={labelClass}>
                  Subtitle <span className="text-foreground/40 font-normal">(optional)</span>
                </label>
                <input
                  value={form.subtitle}
                  onChange={(e) => setForm((p) => ({ ...p, subtitle: e.target.value }))}
                  className={inputClass}
                  placeholder="Defaults to temple tagline"
                />
              </div>

              <div>
                <label className={labelClass}>
                  Description <span className="text-foreground/40 font-normal">(optional)</span>
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                  rows={3}
                  className={inputClass}
                  placeholder="Defaults to temple mission statement"
                />
              </div>

              <div>
                <label className={labelClass}>
                  Primary Button{" "}
                  <span className="text-foreground/40 font-normal">
                    (optional — defaults to &ldquo;Book a Service&rdquo;)
                  </span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    value={form.ctaText}
                    onChange={(e) => setForm((p) => ({ ...p, ctaText: e.target.value }))}
                    className={inputClass}
                    placeholder="Button text"
                  />
                  <input
                    value={form.ctaLink}
                    onChange={(e) => setForm((p) => ({ ...p, ctaLink: e.target.value }))}
                    className={inputClass}
                    placeholder="/services"
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>
                  Secondary Button{" "}
                  <span className="text-foreground/40 font-normal">
                    (optional — defaults to &ldquo;Donate Now&rdquo;)
                  </span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    value={form.cta2Text}
                    onChange={(e) => setForm((p) => ({ ...p, cta2Text: e.target.value }))}
                    className={inputClass}
                    placeholder="Button text"
                  />
                  <input
                    value={form.cta2Link}
                    onChange={(e) => setForm((p) => ({ ...p, cta2Link: e.target.value }))}
                    className={inputClass}
                    placeholder="/donate"
                  />
                </div>
              </div>

              {error && (
                <p className="text-red-500 text-sm bg-red-50 border border-red-200 p-3 rounded-lg">
                  {error}
                </p>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={submitting || uploading || !uploadedUrl}
                  className="btn-primary flex-1 flex items-center justify-center gap-2 py-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
                  ) : uploading ? (
                    <><Upload className="w-4 h-4 animate-pulse" /> Uploading…</>
                  ) : isEdit ? (
                    "Save Changes"
                  ) : (
                    "Save Banner"
                  )}
                </button>
                <button type="button" onClick={close} className="btn-secondary flex-1 py-2.5">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
