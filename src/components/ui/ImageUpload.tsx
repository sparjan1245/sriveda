"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Upload, Loader2, ImageIcon, X } from "lucide-react";

interface Props {
  value: string;
  onChange: (url: string) => void;
  folder?: string;
  label?: string;
  aspect?: "square" | "video" | "auto";
  className?: string;
}

export default function ImageUpload({
  value,
  onChange,
  folder = "temple/gallery",
  label = "Photo",
  aspect = "square",
  className = "",
}: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState(value);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const aspectClass = aspect === "square" ? "aspect-square" : aspect === "video" ? "aspect-video" : "h-40";

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const local = URL.createObjectURL(file);
    setPreview(local);
    onChange("");
    setError("");
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", folder);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Upload failed.");
        setPreview(value);
      } else {
        setPreview(data.url);
        onChange(data.url);
      }
    } catch {
      setError("Upload failed. Check your connection.");
      setPreview(value);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const clear = () => {
    setPreview("");
    onChange("");
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-maroon/80 mb-1">{label}</label>
      <div  style={{height:"100px"}} className={`relative ${aspectClass} w-full rounded-lg overflow-hidden border-2 border-dashed border-gold/40 bg-cream/60 flex items-center justify-center group`}>
        {preview ? (
          <>
            <Image src={preview} alt={label} fill className="object-cover" unoptimized={preview.startsWith("blob:")} />
            {/* overlay on hover */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="bg-white text-maroon text-xs font-medium px-3 py-1.5 rounded-lg flex items-center gap-1 hover:bg-cream transition-colors"
              >
                {uploading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
                {uploading ? "Uploading…" : "Replace"}
              </button>
              <button type="button" onClick={clear} className="bg-red-500 text-white text-xs font-medium px-3 py-1.5 rounded-lg flex items-center gap-1 hover:bg-red-600 transition-colors">
                <X className="w-3 h-3" /> Remove
              </button>
            </div>
          </>
        ) : (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="flex flex-col items-center gap-2 text-foreground/40 hover:text-saffron transition-colors p-4"
          >
            {uploading ? (
              <Loader2 className="w-8 h-8 animate-spin text-saffron" />
            ) : (
              <ImageIcon className="w-8 h-8" />
            )}
            <span className="text-xs">{uploading ? "Uploading…" : "Click to upload"}</span>
          </button>
        )}
      </div>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
      <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={handleFile} />
    </div>
  );
}
