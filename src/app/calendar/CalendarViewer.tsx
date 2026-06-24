"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft, ChevronRight, Download, X, ZoomIn, CalendarDays, ImageOff,
} from "lucide-react";

interface CalendarData {
  id: string;
  year: number;
  title?: string | null;
  images: string[];
  downloadUrl?: string | null;
}

interface Props {
  calendar: CalendarData | null;
  currentYear: number;
  availableYears: number[];
}

const MONTH_NAMES = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

export default function CalendarViewer({ calendar, currentYear, availableYears }: Props) {
  const router  = useRouter();
  const [lightbox, setLightbox] = useState<number | null>(null);

  const images  = calendar?.images ?? [];
  const total   = images.length;

  const goPrev  = () => setLightbox((i) => (i != null ? (i === 0 ? total - 1 : i - 1) : null));
  const goNext  = () => setLightbox((i) => (i != null ? (i === total - 1 ? 0 : i + 1) : null));

  const prevYear = availableYears.find((y) => y < currentYear);
  const nextYear = availableYears.find((y) => y > currentYear);

  // label each image: if exactly 12 or 13 (cover + 12), label by month
  const getLabel = (i: number): string => {
    if (total === 12) return MONTH_NAMES[i];
    if (total === 13) return i === 0 ? "Cover" : MONTH_NAMES[i - 1];
    return `Page ${i + 1}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">

      {/* ── Page header ── */}
      <div className="text-center mb-8">
        <span className="badge-gold mb-4 inline-flex text-xs px-4 py-1.5">Sri Veda Gayatri Temple</span>
        <h1 className="font-cinzel font-bold text-2xl md:text-3xl text-maroon mb-2">
          {calendar?.title || `${currentYear} Hindu Calendar`}
        </h1>
        <div className="flex items-center justify-center gap-3 mb-4">
          <span className="block h-px w-16 bg-gold/50" />
          <span className="text-gold text-xl">🪷</span>
          <span className="block h-px w-16 bg-gold/50" />
        </div>
        <p className="text-foreground/50 text-sm">
          {total > 0 ? `${total} pages` : "No pages uploaded yet"}
        </p>
      </div>

      {/* ── Year navigation + Download ── */}
      <div className="flex items-center justify-between mb-8 gap-4 flex-wrap">
        {/* Year nav */}
        <div className="flex items-center gap-2 bg-white rounded-xl gold-border shadow-sm px-4 py-2">
          <button
            onClick={() => prevYear && router.push(`/calendar?year=${prevYear}`)}
            disabled={!prevYear}
            className="p-1.5 rounded-lg text-maroon/40 hover:text-maroon hover:bg-cream disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2 px-2">
            <CalendarDays className="w-4 h-4 text-saffron" />
            <span className="font-cinzel font-bold text-maroon text-lg">{currentYear}</span>
          </div>
          <button
            onClick={() => nextYear && router.push(`/calendar?year=${nextYear}`)}
            disabled={!nextYear}
            className="p-1.5 rounded-lg text-maroon/40 hover:text-maroon hover:bg-cream disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Available years chips */}
        {availableYears.length > 1 && (
          <div className="flex gap-2 flex-wrap">
            {availableYears.map((y) => (
              <button
                key={y}
                onClick={() => router.push(`/calendar?year=${y}`)}
                className={`px-3 py-1.5 rounded-lg font-cinzel text-xs font-semibold transition-all ${
                  y === currentYear
                    ? "bg-maroon text-white shadow-sm"
                    : "bg-white text-maroon/60 border border-gold/30 hover:border-saffron hover:text-maroon"
                }`}
              >
                {y}
              </button>
            ))}
          </div>
        )}

        {/* Download button */}
        {calendar?.downloadUrl && (
          <a
            href={calendar.downloadUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary flex items-center gap-2 px-6 py-2.5 text-sm"
          >
            <Download className="w-4 h-4" />
            Download PDF
          </a>
        )}
      </div>

      {/* ── Image grid ── */}
      {total === 0 ? (
        <div className="text-center py-24 bg-white rounded-2xl gold-border">
          <ImageOff className="w-12 h-12 text-foreground/20 mx-auto mb-3" />
          <p className="text-foreground/40 font-medium">No calendar images for {currentYear}</p>
          {availableYears.length > 0 && availableYears[0] !== currentYear && (
            <button
              onClick={() => router.push(`/calendar?year=${availableYears[0]}`)}
              className="btn-secondary mt-4 text-sm px-6 py-2"
            >
              View {availableYears[0]} Calendar
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {images.map((src, i) => (
            <button
              key={i}
              onClick={() => setLightbox(i)}
              className="group relative bg-white rounded-2xl overflow-hidden gold-border shadow-md hover:shadow-xl hover:border-saffron/50 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-saffron"
            >
              <div className="aspect-4/3 overflow-hidden bg-cream">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt={getLabel(i)}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading={i < 4 ? "eager" : "lazy"}
                />
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-colors duration-300 flex items-center justify-center">
                  <ZoomIn className="w-10 h-10 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 drop-shadow-lg" />
                </div>
              </div>
              {/* Month label */}
              <div className="px-3 py-2 text-center border-t border-gold/10">
                <span className="font-cinzel text-xs font-semibold text-maroon uppercase tracking-wide">
                  {getLabel(i)}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* ── Lightbox ── */}
      {lightbox !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex flex-col"
          onClick={() => setLightbox(null)}
        >
          {/* Top bar */}
          <div className="flex items-center justify-between px-4 py-3 shrink-0" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3">
              <span className="font-cinzel text-white/70 text-sm">
                {getLabel(lightbox)}
              </span>
              <span className="text-white/30 text-xs">
                {lightbox + 1} / {total}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <a
                href={images[lightbox]}
                download
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                title="Download this image"
              >
                <Download className="w-4 h-4" />
              </a>
              <button
                onClick={() => setLightbox(null)}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Image area */}
          <div className="flex-1 flex items-center justify-center px-12 min-h-0" onClick={(e) => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={images[lightbox]}
              alt={getLabel(lightbox)}
              className="max-w-full max-h-full object-contain select-none"
            />
          </div>

          {/* Bottom nav */}
          {total > 1 && (
            <div className="flex items-center justify-center gap-6 py-4 shrink-0" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={goPrev}
                className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                aria-label="Previous"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              {/* Dot strip */}
              <div className="flex gap-1.5 max-w-xs overflow-hidden">
                {images.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setLightbox(i)}
                    className={`rounded-full transition-all duration-200 shrink-0 ${
                      i === lightbox ? "w-4 h-2 bg-gold" : "w-2 h-2 bg-white/30 hover:bg-white/60"
                    }`}
                  />
                ))}
              </div>
              <button
                onClick={goNext}
                className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                aria-label="Next"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Keyboard support */}
      {lightbox !== null && (
        <div
          className="sr-only"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "ArrowLeft")  goPrev();
            if (e.key === "ArrowRight") goNext();
            if (e.key === "Escape")     setLightbox(null);
          }}
        />
      )}
    </div>
  );
}
