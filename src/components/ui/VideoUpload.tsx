"use client";

import { useRef, useState } from "react";
import { Video, X, CheckCircle, Loader2 } from "lucide-react";

interface Props {
  value: string;
  onChange: (url: string) => void;
  folder?: string;
  label?: string;
}

export default function VideoUpload({
  value,
  onChange,
  folder = "temple/gallery/videos",
  label = "Video File",
}: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setError("");
    setProgress(0);
    setUploading(true);
    onChange("");

    const fd = new FormData();
    fd.append("file", file);
    fd.append("folder", folder);

    const xhr = new XMLHttpRequest();

    xhr.upload.onprogress = (ev) => {
      if (ev.lengthComputable) setProgress(Math.round((ev.loaded / ev.total) * 100));
    };

    xhr.onload = () => {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
      if (xhr.status >= 200 && xhr.status < 300) {
        const data = JSON.parse(xhr.responseText);
        onChange(data.url);
      } else {
        try {
          const data = JSON.parse(xhr.responseText);
          setError(data.error || "Upload failed.");
        } catch {
          setError("Upload failed.");
        }
        setProgress(0);
      }
    };

    xhr.onerror = () => {
      setUploading(false);
      setError("Upload failed. Check your connection.");
      setProgress(0);
      if (fileRef.current) fileRef.current.value = "";
    };

    xhr.open("POST", "/api/upload/video");
    xhr.send(fd);
  };

  const clear = () => {
    onChange("");
    setFileName("");
    setProgress(0);
    setError("");
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <div>
      <label className="block text-sm font-medium text-maroon/80 mb-1">{label}</label>

      {/* Drop zone — shown when nothing is uploading/uploaded */}
      {!value && !uploading && (
        <div
          onClick={() => fileRef.current?.click()}
          className="border-2 border-dashed border-gold/40 rounded-xl p-8 text-center cursor-pointer hover:border-saffron/50 hover:bg-saffron/5 transition-all duration-200"
        >
          <Video className="w-10 h-10 text-foreground/30 mx-auto mb-2" />
          <p className="text-sm font-medium text-foreground mb-1">Click to upload video</p>
          <p className="text-xs text-foreground/50">MP4, MOV, WebM · Max 200 MB</p>
        </div>
      )}

      {/* Upload progress */}
      {uploading && (
        <div className="border border-gold/30 rounded-xl p-5 bg-cream/50">
          <div className="flex items-center gap-3 mb-3">
            <Loader2 className="w-5 h-5 text-saffron animate-spin shrink-0" />
            <div className="min-w-0">
              <p className="text-sm font-medium text-maroon truncate">{fileName}</p>
              <p className="text-xs text-foreground/60">Uploading to Cloudinary…</p>
            </div>
          </div>
          <div className="w-full bg-gold/15 rounded-full h-2.5">
            <div
              className="bg-saffron h-2.5 rounded-full transition-all duration-200"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-foreground/50 text-right mt-1">{progress}%</p>
        </div>
      )}

      {/* Uploaded — show preview + remove */}
      {value && !uploading && (
        <div className="border border-gold/30 rounded-xl p-4 bg-cream/50">
          <div className="flex items-start gap-3 mb-3">
            <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-green-700">Uploaded successfully</p>
              <p className="text-xs text-foreground/50 truncate">{fileName || value.split("/").pop()}</p>
            </div>
            <button type="button" onClick={clear} className="text-foreground/40 hover:text-red-500 transition-colors shrink-0">
              <X className="w-4 h-4" />
            </button>
          </div>
          <video
            src={value}
            controls
            className="w-full rounded-lg aspect-video bg-black"
          />
        </div>
      )}

      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}

      <input
        ref={fileRef}
        type="file"
        accept="video/mp4,video/webm,video/quicktime,video/avi"
        className="hidden"
        onChange={handleFile}
      />
    </div>
  );
}
