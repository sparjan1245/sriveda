"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Pencil, Trash2, Loader2, CalendarDays, ChevronLeft } from "lucide-react";
import Link from "next/link";
import PanchangamForm, { type PanchangamEntry } from "./PanchangamForm";

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

function fmtDate(iso: string): string {
  const datePart = iso.split("T")[0];
  const [y, m, d] = datePart.split("-").map(Number);
  return `${MONTHS[m - 1]} ${d}, ${y}`;
}

function fmtShort(iso: string): string {
  const [, , d] = iso.split("T")[0].split("-").map(Number);
  return String(d);
}

export default function AdminPanchangamPage() {
  const now   = new Date();
  const [year,    setYear]    = useState(now.getUTCFullYear());
  const [month,   setMonth]   = useState(now.getUTCMonth() + 1);
  const [entries, setEntries] = useState<PanchangamEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [form,    setForm]    = useState<{ open: boolean; entry: PanchangamEntry | null }>({ open: false, entry: null });
  const [deleting, setDeleting] = useState<string | null>(null);

  const yearOptions = Array.from({ length: 5 }, (_, i) => now.getUTCFullYear() - 1 + i);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/panchangam?month=${month}&year=${year}`);
      const data: PanchangamEntry[] = await res.json();
      setEntries(data);
    } catch {
      setEntries([]);
    } finally {
      setLoading(false);
    }
  }, [month, year]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this Panchangam entry?")) return;
    setDeleting(id);
    try {
      await fetch(`/api/panchangam/${id}`, { method: "DELETE" });
      setEntries((prev) => prev.filter((e) => e.id !== id));
    } finally {
      setDeleting(null);
    }
  };

  const openCreate = () => setForm({ open: true, entry: null });
  const openEdit   = (e: PanchangamEntry) => setForm({ open: true, entry: e });
  const closeForm  = () => setForm({ open: false, entry: null });
  const onSuccess  = () => { closeForm(); load(); };

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
              <CalendarDays className="w-8 h-8 text-saffron" />
              Daily Panchangam
            </h1>
            <p className="text-foreground/50 text-sm mt-1">Manage Hindu daily calendar entries shown on the home banner.</p>
          </div>
          <button onClick={openCreate} className="btn-primary flex items-center gap-2 text-sm px-5 py-2.5 shrink-0">
            <Plus className="w-4 h-4" /> Add Entry
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl gold-border shadow-sm px-5 py-4 mb-6 flex flex-wrap gap-4 items-center">
          <span className="text-sm font-semibold text-maroon/70">Filter by:</span>
          <div className="flex items-center gap-2">
            <label className="text-xs text-foreground/50 font-medium">Month</label>
            <select
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              className="px-3 py-1.5 border border-gold/30 rounded-lg text-sm focus:outline-none focus:border-saffron bg-white"
            >
              {MONTHS.map((m, i) => (
                <option key={m} value={i + 1}>{m}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-foreground/50 font-medium">Year</label>
            <select
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="px-3 py-1.5 border border-gold/30 rounded-lg text-sm focus:outline-none focus:border-saffron bg-white"
            >
              {yearOptions.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
          <span className="text-xs text-foreground/40 ml-auto">
            {entries.length} {entries.length === 1 ? "entry" : "entries"} found
          </span>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl gold-border shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-saffron" />
            </div>
          ) : entries.length === 0 ? (
            <div className="text-center py-20">
              <CalendarDays className="w-12 h-12 text-foreground/20 mx-auto mb-3" />
              <p className="text-foreground/40 font-medium">No entries for {MONTHS[month - 1]} {year}</p>
              <button onClick={openCreate} className="btn-primary mt-4 text-sm px-6 py-2">
                Add First Entry
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-cream border-b border-gold/15">
                    <th className="text-left px-5 py-3 font-cinzel text-maroon text-xs uppercase tracking-wider">Date</th>
                    <th className="text-left px-5 py-3 font-cinzel text-maroon text-xs uppercase tracking-wider hidden md:table-cell">Samvatsara / Masam</th>
                    <th className="text-left px-5 py-3 font-cinzel text-maroon text-xs uppercase tracking-wider hidden sm:table-cell">Thithi / Nakshatra</th>
                    <th className="text-left px-5 py-3 font-cinzel text-maroon text-xs uppercase tracking-wider hidden lg:table-cell">Rahu Kalam</th>
                    <th className="text-right px-5 py-3 font-cinzel text-maroon text-xs uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gold/10">
                  {entries.map((entry) => (
                    <tr key={entry.id} className="hover:bg-cream/40 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-maroon/8 flex items-center justify-center shrink-0">
                            <span className="font-cinzel font-bold text-maroon text-sm">{fmtShort(entry.date)}</span>
                          </div>
                          <div>
                            <p className="font-semibold text-maroon text-sm">{fmtDate(entry.date)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 hidden md:table-cell">
                        <p className="text-foreground/70 text-xs">{entry.samvatsara || "—"}</p>
                        <p className="text-foreground/50 text-xs">{entry.masam || ""}</p>
                      </td>
                      <td className="px-5 py-4 hidden sm:table-cell">
                        <p className="text-saffron font-medium text-xs">{entry.thithi || "—"}</p>
                        <p className="text-foreground/50 text-xs">{entry.nakshatra || ""}</p>
                      </td>
                      <td className="px-5 py-4 hidden lg:table-cell">
                        <p className="text-foreground/60 text-xs font-mono">{entry.rahuKalam || "—"}</p>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEdit(entry)}
                            className="p-1.5 rounded-lg text-foreground/40 hover:text-maroon hover:bg-maroon/8 transition-colors"
                            title="Edit"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(entry.id)}
                            disabled={deleting === entry.id}
                            className="p-1.5 rounded-lg text-foreground/40 hover:text-red-600 hover:bg-red-50 transition-colors"
                            title="Delete"
                          >
                            {deleting === entry.id
                              ? <Loader2 className="w-4 h-4 animate-spin" />
                              : <Trash2 className="w-4 h-4" />
                            }
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Legend */}
        <p className="text-xs text-foreground/35 text-center mt-4">
          Today&apos;s entry (if any) automatically appears as a slide in the home page hero banner.
        </p>
      </div>

      {/* Form modal */}
      {form.open && (
        <PanchangamForm entry={form.entry} onClose={closeForm} onSuccess={onSuccess} />
      )}
    </div>
  );
}
