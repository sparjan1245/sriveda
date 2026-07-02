"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Pencil, Trash2, Loader2, CalendarRange, ChevronLeft, ExternalLink, Download } from "lucide-react";
import Link from "next/link";
import CalendarForm, { type CalendarEntry } from "./CalendarForm";

export default function AdminCalendarPage() {
  const [entries,  setEntries]  = useState<CalendarEntry[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [form,     setForm]     = useState<{ open: boolean; entry: CalendarEntry | null }>({ open: false, entry: null });
  const [deleting, setDeleting] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/calendar");
      setEntries(await res.json());
    } catch { setEntries([]); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this calendar? This cannot be undone.")) return;
    setDeleting(id);
    try {
      await fetch(`/api/calendar/${id}`, { method: "DELETE" });
      setEntries((prev) => prev.filter((e) => e.id !== id));
    } finally { setDeleting(null); }
  };

  return (
    <div className="min-h-screen bg-cream pattern-bg">
      <div className="max-w-5xl mx-auto px-4 py-10">

        {/* Breadcrumb */}
        <Link href="/admin" className="inline-flex items-center gap-1 text-maroon/50 hover:text-maroon text-sm mb-6 transition-colors">
          <ChevronLeft className="w-4 h-4" /> Admin Dashboard
        </Link>

        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-8">
          <div>
            <p className="text-maroon font-cinzel text-base font-extrabold uppercase tracking-widest mb-1">Admin</p>
            <h1 className="font-cinzel font-bold text-3xl text-maroon flex items-center gap-3">
              <CalendarRange className="w-8 h-8 text-saffron" />
              Calendar Management
            </h1>
            <p className="text-foreground/50 text-sm mt-1">Upload yearly Hindu calendar images with download link.</p>
          </div>
          <button
            onClick={() => setForm({ open: true, entry: null })}
            className="btn-primary flex items-center gap-2 text-sm px-5 py-2.5 shrink-0"
          >
            <Plus className="w-4 h-4" /> Add Calendar
          </button>
        </div>

        {/* List */}
        <div className="bg-white rounded-2xl gold-border shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-saffron" />
            </div>
          ) : entries.length === 0 ? (
            <div className="text-center py-20">
              <CalendarRange className="w-12 h-12 text-foreground/20 mx-auto mb-3" />
              <p className="text-foreground/40 font-medium">No calendars yet</p>
              <button
                onClick={() => setForm({ open: true, entry: null })}
                className="btn-primary mt-4 text-sm px-6 py-2"
              >
                Add First Calendar
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-cream border-b border-gold/15">
                    <th className="text-left px-5 py-3 font-cinzel text-maroon text-xs uppercase tracking-wider">Year</th>
                    <th className="text-left px-5 py-3 font-cinzel text-maroon text-xs uppercase tracking-wider hidden sm:table-cell">Title</th>
                    <th className="text-left px-5 py-3 font-cinzel text-maroon text-xs uppercase tracking-wider hidden md:table-cell">Images</th>
                    <th className="text-left px-5 py-3 font-cinzel text-maroon text-xs uppercase tracking-wider hidden lg:table-cell">Download</th>
                    <th className="text-left px-5 py-3 font-cinzel text-maroon text-xs uppercase tracking-wider">Status</th>
                    <th className="text-right px-5 py-3 font-cinzel text-maroon text-xs uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gold/10">
                  {entries.map((entry) => (
                    <tr key={entry.id} className="hover:bg-cream/40 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-maroon/8 flex items-center justify-center shrink-0">
                            <span className="font-cinzel font-bold text-maroon text-xs">{entry.year}</span>
                          </div>
                          <div>
                            <p className="font-bold text-maroon">{entry.year}</p>
                            <Link
                              href={`/calendar?year=${entry.year}`}
                              target="_blank"
                              className="text-xs text-saffron hover:underline flex items-center gap-1"
                            >
                              View page <ExternalLink className="w-3 h-3" />
                            </Link>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 hidden sm:table-cell">
                        <p className="text-foreground/70 text-sm">{entry.title || <span className="italic text-foreground/35">—</span>}</p>
                      </td>
                      <td className="px-5 py-4 hidden md:table-cell">
                        <div className="flex items-center gap-2">
                          {/* Thumbnail strip */}
                          <div className="flex -space-x-2">
                            {entry.images.slice(0, 4).map((img, i) => (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                key={i}
                                src={img}
                                alt=""
                                className="w-7 h-9 object-cover rounded border-2 border-white"
                              />
                            ))}
                          </div>
                          <span className="text-xs text-foreground/50">{entry.images.length} images</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 hidden lg:table-cell">
                        {entry.downloadUrl ? (
                          <a
                            href={entry.downloadUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 text-xs text-saffron hover:text-maroon transition-colors"
                          >
                            <Download className="w-3.5 h-3.5" /> Link set
                          </a>
                        ) : (
                          <span className="text-xs text-foreground/30 italic">None</span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                          entry.active
                            ? "bg-green-50 text-green-700 border border-green-200"
                            : "bg-gray-50 text-gray-500 border border-gray-200"
                        }`}>
                          {entry.active ? "Published" : "Hidden"}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setForm({ open: true, entry })}
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
      </div>

      {form.open && (
        <CalendarForm
          entry={form.entry}
          onClose={() => setForm({ open: false, entry: null })}
          onSuccess={() => { setForm({ open: false, entry: null }); load(); }}
        />
      )}
    </div>
  );
}
