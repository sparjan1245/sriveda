"use client";

import { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";

export interface PanchangamEntry {
  id: string;
  date: string;
  samvatsara?: string | null;
  masam?: string | null;
  ayanam?: string | null;
  ruthuvu?: string | null;
  thithi?: string | null;
  nakshatra?: string | null;
  varjyam?: string | null;
  durmuhurtam?: string | null;
  rahuKalam?: string | null;
  yamagandam?: string | null;
  goodTime?: string | null;
  priestName?: string | null;
}

interface Props {
  entry?: PanchangamEntry | null;
  onClose: () => void;
  onSuccess: () => void;
}

const EMPTY_FORM = {
  date: "",
  samvatsara: "",
  masam: "",
  ayanam: "",
  ruthuvu: "",
  thithi: "",
  nakshatra: "",
  varjyam: "",
  durmuhurtam: "",
  rahuKalam: "",
  yamagandam: "",
  goodTime: "",
  priestName: "",
};

export default function PanchangamForm({ entry, onClose, onSuccess }: Props) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isEdit = !!entry;

  useEffect(() => {
    if (entry) {
      setForm({
        date:        entry.date.split("T")[0],
        samvatsara:  entry.samvatsara  ?? "",
        masam:       entry.masam       ?? "",
        ayanam:      entry.ayanam      ?? "",
        ruthuvu:     entry.ruthuvu     ?? "",
        thithi:      entry.thithi      ?? "",
        nakshatra:   entry.nakshatra   ?? "",
        varjyam:     entry.varjyam     ?? "",
        durmuhurtam: entry.durmuhurtam ?? "",
        rahuKalam:   entry.rahuKalam   ?? "",
        yamagandam:  entry.yamagandam  ?? "",
        goodTime:    entry.goodTime    ?? "",
        priestName:  entry.priestName  ?? "",
      });
    }
  }, [entry]);

  const set = (k: keyof typeof EMPTY_FORM) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.date) { setError("Date is required."); return; }
    setLoading(true);
    setError("");
    try {
      const url    = isEdit ? `/api/panchangam/${entry!.id}` : "/api/panchangam";
      const method = isEdit ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const text = await res.text();
        setError(text || "Something went wrong.");
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
      <div className="bg-white rounded-2xl shadow-2xl gold-border w-full max-w-lg flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gold/15 shrink-0">
          <div>
            <p className="text-gold text-xs font-semibold uppercase tracking-widest mb-0.5">Admin</p>
            <h3 className="font-cinzel font-bold text-maroon text-lg">
              {isEdit ? "Edit Panchangam" : "Add Panchangam"}
            </h3>
          </div>
          <button onClick={onClose} className="text-foreground/40 hover:text-maroon transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form body */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">

            {/* Date */}
            <div>
              <label className={lc}>Date <span className="text-red-500">*</span></label>
              <input type="date" required value={form.date} onChange={set("date")} className={ic} />
            </div>

            {/* Hindu calendar */}
            <div>
              <p className="text-xs font-bold text-maroon/50 uppercase tracking-widest mb-2">Hindu Calendar</p>
              <div className="grid grid-cols-2 gap-3">
                {(["samvatsara", "masam", "ayanam", "ruthuvu"] as const).map((key) => (
                  <div key={key}>
                    <label className={lc}>{key.charAt(0).toUpperCase() + key.slice(1)}</label>
                    <input type="text" value={form[key]} onChange={set(key)} placeholder={`e.g. ${key === "samvatsara" ? "Sri Parabhava..." : key === "masam" ? "Jyeshta Masam" : key === "ayanam" ? "Uttarayanam" : "Greeshma Ruthuvu"}`} className={ic} />
                  </div>
                ))}
              </div>
            </div>

            {/* Daily timings */}
            <div>
              <p className="text-xs font-bold text-maroon/50 uppercase tracking-widest mb-2">Daily Timings</p>
              <div className="space-y-3">
                {([
                  ["thithi",      "Thithi",       "e.g. K.Dwitiya FULL"],
                  ["nakshatra",   "Nakshatra",     "e.g. Jyestha 6:37"],
                  ["varjyam",     "Varjyam",       "e.g. 15:36 - 17:24"],
                  ["durmuhurtam", "Durmuhurtam",   "e.g. (1) 13:38 - 14:36  (2) 16:33 - 17:31"],
                  ["rahuKalam",   "Rahu Kalam",    "e.g. 07:40 - 09:30"],
                  ["yamagandam",  "Yamagandam",    "e.g. 11:19 - 13:09"],
                  ["goodTime",    "Good Time",     "e.g. 26:23 - 28:11"],
                ] as [keyof typeof EMPTY_FORM, string, string][]).map(([key, label, placeholder]) => (
                  <div key={key}>
                    <label className={lc}>{label}</label>
                    <input type="text" value={form[key]} onChange={set(key)} placeholder={placeholder} className={ic} />
                  </div>
                ))}
              </div>
            </div>

            {/* Priest name */}
            <div>
              <label className={lc}>Priest Name (optional)</label>
              <input type="text" value={form.priestName} onChange={set("priestName")} placeholder="e.g. VELURI SUBRAHMANYA SARMA" className={ic} />
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
              {isEdit ? "Save Changes" : "Add Entry"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
