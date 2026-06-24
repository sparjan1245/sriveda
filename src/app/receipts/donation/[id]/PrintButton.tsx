"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";

export default function DownloadPDFButton({ id, receiptNo, token }: { id: string; receiptNo: string; token?: string }) {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    setLoading(true);
    try {
      const apiUrl = token ? `/api/receipts/donation/${id}?token=${token}` : `/api/receipts/donation/${id}`;
      const res = await fetch(apiUrl);
      if (!res.ok) throw new Error(await res.text());
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `donation-receipt-${receiptNo}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("PDF download failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={loading}
      className="inline-flex items-center gap-2 bg-maroon text-white text-sm font-semibold px-5 py-2 rounded-lg hover:bg-maroon/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {loading ? (
        <><Loader2 className="w-4 h-4 animate-spin" /> Generating…</>
      ) : (
        <><Download className="w-4 h-4" /> Download PDF</>
      )}
    </button>
  );
}
