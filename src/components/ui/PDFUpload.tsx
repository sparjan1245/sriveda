"use client";

import { useRef, useState } from "react";
import { FileText, Upload, X, Loader2, ExternalLink } from "lucide-react";

interface Props {
  value: string;
  onChange: (url: string) => void;
  folder?: string;
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function PDFUpload({ value, onChange, folder = "temple/docs" }: Props) {
  const inputRef   = useRef<HTMLInputElement>(null);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const [fileName, setFileName] = useState("");
  const [fileSize, setFileSize] = useState(0);

  const handleFile = async (file: File) => {
    if (file.type !== "application/pdf") {
      setError("Only PDF files are allowed.");
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      setError("PDF must be under 20 MB.");
      return;
    }

    setError("");
    setLoading(true);
    setFileName(file.name);
    setFileSize(file.size);

    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", folder);

      const res = await fetch("/api/upload", { method: "POST", body: fd });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Upload failed");
      }
      const { url } = await res.json();
      onChange(url);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Upload failed";
      setError(msg);
      setFileName("");
      setFileSize(0);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const clear = () => {
    onChange("");
    setFileName("");
    setFileSize(0);
    setError("");
  };

  if (value) {
    return (
      <div className="flex items-center gap-3 px-3 py-2.5 bg-green-50 border border-green-200 rounded-lg">
        <FileText className="w-5 h-5 text-green-600 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-green-800 truncate">
            {fileName || "PDF uploaded"}
          </p>
          {fileSize > 0 && (
            <p className="text-xs text-green-600">{formatBytes(fileSize)}</p>
          )}
        </div>
        <a
          href={value}
          target="_blank"
          rel="noopener noreferrer"
          className="p-1 text-green-600 hover:text-green-800 transition-colors"
          title="Open PDF"
        >
          <ExternalLink className="w-4 h-4" />
        </a>
        <button
          type="button"
          onClick={clear}
          className="p-1 text-green-600 hover:text-red-600 transition-colors"
          title="Remove PDF"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div>
      <div
        onClick={() => !loading && inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className={`flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-xl p-6 cursor-pointer transition-colors ${
          loading ? "opacity-60 cursor-default" : "hover:border-saffron"
        } border-gold/30`}
      >
        {loading ? (
          <Loader2 className="w-7 h-7 text-saffron animate-spin" />
        ) : (
          <Upload className="w-7 h-7 text-foreground/30" />
        )}
        <p className="text-sm text-foreground/50 text-center">
          {loading ? "Uploading…" : (
            <>
              <span className="text-saffron font-medium">Click to upload PDF</span> or drag &amp; drop
              <br />
              <span className="text-xs">PDF only, max 20 MB</span>
            </>
          )}
        </p>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={handleChange}
      />
      {error && (
        <p className="text-red-500 text-xs mt-1">{error}</p>
      )}
    </div>
  );
}
