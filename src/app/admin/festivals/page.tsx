"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Plus, X, Loader2, CalendarRange, ChevronLeft, Pencil } from "lucide-react";
import FestivalForm, { type FestivalEntry } from "./FestivalForm";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function AdminFestivalsPage() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [entries, setEntries] = useState<FestivalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [form, setForm] = useState<{ open: boolean; entry: FestivalEntry | null; month?: number }>({ open: false, entry: null });

  const yearOptions = Array.from({ length: 6 }, (_, i) => now.getFullYear() - 1 + i);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/festivals?year=${year}`);
      const data: FestivalEntry[] = await res.json();
      setEntries(data);
    } catch {
      setEntries([]);
    } finally {
      setLoading(false);
    }
  }, [year]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this festival?")) return;
    setDeleting(id);
    try {
      await fetch(`/api/festivals/${id}`, { method: "DELETE" });
      setEntries((prev) => prev.filter((e) => e.id !== id));
    } finally {
      setDeleting(null);
    }
  };

  const openCreate = (month?: number) => setForm({ open: true, entry: null, month });
  const openEdit = (entry: FestivalEntry) => setForm({ open: true, entry, month: undefined });
  const closeForm = () => setForm({ open: false, entry: null });
  const onSuccess = () => { closeForm(); load(); };

  const byMonth: Record<number, FestivalEntry[]> = {};
  for (const e of entries) {
    (byMonth[e.month] ??= []).push(e);
  }

  return (
    <div className="min-h-screen bg-cream pattern-bg">
      <div className="max-w-6xl mx-auto px-4 py-10">

        {/* Breadcrumb */}
        <Link href="/admin" className="inline-flex items-center gap-1 text-maroon/50 hover:text-maroon text-sm mb-6 transition-colors">
          <ChevronLeft className="w-4 h-4" /> Admin Dashboard
        </Link>

        {/* Page header */}
        <div className="flex items-start justify-between gap-4 mb-8">
          <div>
            <p className="text-maroon font-cinzel text-base font-extrabold uppercase tracking-widest mb-1">Admin</p>
            <h1 className="font-cinzel font-bold text-3xl text-maroon flex items-center gap-3">
              <CalendarRange className="w-8 h-8 text-saffron" />
              Festival Calendar
            </h1>
            <p className="text-foreground/50 text-sm mt-1">Manage the annual festival schedule shown on the Events page.</p>
          </div>
          <button onClick={() => openCreate()} className="btn-primary flex items-center gap-2 text-sm px-5 py-2.5 shrink-0">
            <Plus className="w-4 h-4" /> Add Festival
          </button>
        </div>

        {/* Year filter */}
        <div className="bg-white rounded-2xl gold-border shadow-sm px-5 py-4 mb-6 flex flex-wrap gap-4 items-center">
          <span className="text-sm font-semibold text-maroon/70">Year:</span>
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="px-3 py-1.5 border border-gold/30 rounded-lg text-sm focus:outline-none focus:border-saffron bg-white"
          >
            {yearOptions.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          <span className="text-xs text-foreground/40 ml-auto">
            {entries.length} {entries.length === 1 ? "festival" : "festivals"} in {year}
          </span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-saffron" />
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-3">
            {MONTHS.map((label, i) => {
              const monthNum = i + 1;
              const festivals = byMonth[monthNum] ?? [];
              return (
                <div key={label} className="flex items-start gap-4 p-4 bg-white rounded-xl gold-border">
                  <div className="font-cinzel font-bold text-maroon text-xs w-20 shrink-0 pt-1.5 uppercase tracking-wide">{label}</div>
                  <div className="flex-1 flex flex-wrap gap-1.5 items-center">
                    {festivals.map((f) => (
                      <span
                        key={f.id}
                        className="group inline-flex items-center gap-1.5 bg-cream text-foreground text-[11px] pl-2.5 pr-1.5 py-1 rounded-full border border-gold/20 hover:border-gold/50 transition-colors"
                      >
                        {f.name}
                        <button onClick={() => openEdit(f)} title="Edit" className="text-foreground/30 hover:text-maroon transition-colors">
                          <Pencil className="w-3 h-3" />
                        </button>
                        <button onClick={() => handleDelete(f.id)} disabled={deleting === f.id} title="Delete" className="text-foreground/30 hover:text-red-600 transition-colors">
                          {deleting === f.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <X className="w-3 h-3" />}
                        </button>
                      </span>
                    ))}
                    <button
                      onClick={() => openCreate(monthNum)}
                      className="inline-flex items-center gap-1 text-[11px] text-saffron hover:text-maroon font-medium px-2 py-1 rounded-full border border-dashed border-gold/40 hover:border-saffron transition-colors"
                    >
                      <Plus className="w-3 h-3" /> Add
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {form.open && (
        <FestivalForm
          entry={form.entry}
          defaultYear={year}
          defaultMonth={form.month}
          onClose={closeForm}
          onSuccess={onSuccess}
        />
      )}
    </div>
  );
}
