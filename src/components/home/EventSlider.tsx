"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Calendar, ChevronLeft, ChevronRight, MapPin } from "lucide-react";
import { IMAGES } from "@/lib/constants";

const GAP = 24;

type EventItem = {
  id: string;
  title: string;
  description: string | null;
  date: Date;
  location: string | null;
  image: string | null;
  featured: boolean;
};

export function EventSlider({ events }: { events: EventItem[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [cardWidth, setCardWidth] = useState(280);
  const [visibleCount, setVisibleCount] = useState(1);
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const maxIndex = Math.max(0, events.length - visibleCount);

  const prev = useCallback(() => setCurrent((i) => Math.max(0, i - 1)), []);
  const next = useCallback(
    () => setCurrent((i) => Math.min(maxIndex, i + 1)),
    [maxIndex]
  );

  useEffect(() => {
    setCurrent((i) => Math.min(i, maxIndex));
  }, [maxIndex]);

  useEffect(() => {
    const measure = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.offsetWidth;
      const visible = w >= 1280 ? 3 : w >= 768 ? 2 : 1;
      setVisibleCount(visible);
      setCardWidth((w - GAP * (visible - 1)) / visible);
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (isPaused || maxIndex === 0) return;
    const id = setInterval(() => {
      setCurrent((i) => (i >= maxIndex ? 0 : i + 1));
    }, 4500);
    return () => clearInterval(id);
  }, [isPaused, maxIndex]);

  if (!events || events.length === 0) return null;

  const pages = maxIndex + 1;
  const offset = current * (cardWidth + GAP);

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div ref={containerRef} className="overflow-hidden">
        <div
          className="flex pb-2"
          style={{
            gap: GAP,
            transform: `translateX(-${offset}px)`,
            transition: "transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
          }}
        >
          {events.map((event) => {
            const d = new Date(event.date);
            const day = d.getDate();
            const month = d.toLocaleString("en-US", { month: "short" }).toUpperCase();
            return (
              <Link
                key={event.id}
                href={`/events/${event.id}/register`}
                className="group relative bg-white rounded-2xl overflow-hidden border border-gold/25 shadow-md hover:shadow-2xl hover:border-gold/50 transition-all duration-400 flex flex-col hover:-translate-y-2 shrink-0"
                style={{ width: cardWidth }}
              >
                <div className="h-0.5 w-full bg-linear-to-r from-saffron via-gold to-saffron opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Image */}
                <div className="relative h-52 overflow-hidden bg-cream shrink-0">
                  <Image
                    src={event.image || IMAGES.puja}
                    alt={event.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-maroon/85 via-maroon/20 to-transparent" />

                  {/* Date badge */}
                  <div className="absolute top-3 left-3 bg-white rounded-xl px-3 py-2 text-center shadow-md">
                    <div className="font-cinzel font-bold text-maroon text-lg leading-none">{day}</div>
                    <div className="text-saffron text-[10px] font-bold tracking-widest">{month}</div>
                  </div>

                  {event.featured && (
                    <div className="absolute top-3 right-3 bg-gold text-white text-[10px] font-cinzel font-bold px-2.5 py-1 rounded-full uppercase tracking-widest">
                      Featured
                    </div>
                  )}

                  {/* Title over image */}
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="font-cinzel font-bold text-white text-sm md:text-[15px] leading-snug drop-shadow-md line-clamp-2">
                      {event.title}
                    </h3>
                  </div>
                </div>

                {/* Body */}
                <div className="flex flex-col flex-1 px-5 pt-4 pb-5">
                  <div className="flex items-center gap-1.5 text-xs text-foreground/70 mb-2">
                    <Calendar className="w-3.5 h-3.5 text-gold shrink-0" />
                    {d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}
                  </div>
                  {event.location && (
                    <div className="flex items-center gap-1.5 text-xs text-foreground/70 mb-3">
                      <MapPin className="w-3.5 h-3.5 text-gold shrink-0" />
                      <span className="line-clamp-1">{event.location}</span>
                    </div>
                  )}
                  <p className="text-sm leading-relaxed line-clamp-2 flex-1 mb-4">
                    {event.description}
                  </p>
                  <div className="flex items-center justify-between pt-3 border-t border-gold/15">
                    <span className="ml-auto text-xs font-semibold text-saffron group-hover:text-maroon flex items-center gap-1 transition-colors duration-200">
                      View Details <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Controls */}
      {pages > 1 && (
        <div className="flex items-center justify-center gap-5 mt-8">
          <button
            onClick={prev}
            disabled={current === 0}
            className="w-10 h-10 rounded-full border border-gold/30 bg-white shadow-sm text-maroon flex items-center justify-center hover:bg-maroon hover:text-white hover:border-maroon disabled:opacity-25 disabled:cursor-not-allowed transition-all duration-200"
            aria-label="Previous"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2">
            {Array.from({ length: pages }, (_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                aria-label={`Slide ${i + 1}`}
                className={`rounded-full transition-all duration-300 ${
                  i === current
                    ? "w-7 h-2.5 bg-maroon"
                    : "w-2.5 h-2.5 bg-gold/35 hover:bg-gold/70"
                }`}
              />
            ))}
          </div>

          <button
            onClick={next}
            disabled={current >= maxIndex}
            className="w-10 h-10 rounded-full border border-gold/30 bg-white shadow-sm text-maroon flex items-center justify-center hover:bg-maroon hover:text-white hover:border-maroon disabled:opacity-25 disabled:cursor-not-allowed transition-all duration-200"
            aria-label="Next"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}
