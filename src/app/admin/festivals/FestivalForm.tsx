"use client";

import { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";

export interface FestivalEntry {
  id: string;
  year: number;
  month: number;
  name: string;
  order: number;
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

interface Props {
  entry?: FestivalEntry | null;
  defaultYear: number;
  defaultMonth?: number;
  onClose: () => void;
  onSuccess: () => void;
}

export default function FestivalForm({ entry, defaultYear, defaultMonth, onClose, onSuccess }: Props) {
  const isEdit = !!entry;
  const [year, setYear] = useState(entry?.year ?? defaultYear);
  const [month, setMonth] = useState(entry?.month ?? defaultMonth ?? 1);
  const [name, setName] = useState(entry?.name ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (entry) {
      setYear(entry.year);
      setMonth(entry.month);
      setName(entry.name);
    }
  }, [entry]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setError("Festival name is required."); return; }
    setLoading(true);
    setError("");
    try {
      const url = isEdit ? `/api/festivals/${entry!.id}` : "/api/festivals";
      const method = isEdit ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ year, month, name: name.trim() }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setError(d.error || "Something went wrong.");
      } else {
        onSuccess();
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const ic = "w-full px-3 py-2 border border-gold/30 rounded-lg text-sm focus:outline-none focus:border-saffron transition-colors bg-white";
  const lc = "block text-xs font-semibold text-maroon/70 mb-1 uppercase tracking-wide";

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl gold-border w-full max-w-md flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gold/15 shrink-0">
          <div>
            <p className="text-gold text-xs font-semibold uppercase tracking-widest mb-0.5">Admin</p>
            <h3 className="font-cinzel font-bold text-maroon text-lg">
              {isEdit ? "Edit Festival" : "Add Festival"}
            </h3>
          </div>
          <button onClick={onClose} className="text-foreground/40 hover:text-maroon transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form body */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={lc}>Month <span className="text-red-500">*</span></label>
                <select value={month} onChange={(e) => setMonth(Number(e.target.value))} className={ic}>
                  {MONTHS.map((m, i) => (
                    <option key={m} value={i + 1}>{m}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={lc}>Year <span className="text-red-500">*</span></label>
                <input type="number" value={year} onChange={(e) => setYear(Number(e.target.value))} className={ic} />
              </div>
            </div>

            <div>
              <label className={lc}>Festival Name <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Maha Shivaratri"
                className={ic}
                autoFocus
              />
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
              {isEdit ? "Save Changes" : "Add Festival"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
