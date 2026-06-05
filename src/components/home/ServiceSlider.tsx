"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";

const GAP = 24;

export function ServiceSlider({ services }: { services: any[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [cardWidth, setCardWidth] = useState(280);
  const [visibleCount, setVisibleCount] = useState(1);
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const maxIndex = Math.max(0, services.length - visibleCount);

  const prev = useCallback(() => setCurrent((i) => Math.max(0, i - 1)), []);
  const next = useCallback(
    () => setCurrent((i) => Math.min(maxIndex, i + 1)),
    [maxIndex]
  );

  // Clamp current when maxIndex shrinks on resize
  useEffect(() => {
    setCurrent((i) => Math.min(i, maxIndex));
  }, [maxIndex]);

  useEffect(() => {
    const measure = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.offsetWidth;
      const visible = w >= 1280 ? 4 : w >= 900 ? 3 : w >= 540 ? 2 : 1;
      setVisibleCount(visible);
      setCardWidth((w - GAP * (visible - 1)) / visible);
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  // Auto-advance
  useEffect(() => {
    if (isPaused || maxIndex === 0) return;
    const id = setInterval(() => {
      setCurrent((i) => (i >= maxIndex ? 0 : i + 1));
    }, 4500);
    return () => clearInterval(id);
  }, [isPaused, maxIndex]);

  if (!services || services.length === 0) return null;

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
          {services.map((service) => (
            <Link
              key={service.slug}
              href={`/services/${service.slug}`}
              className="group relative bg-white rounded-3xl overflow-hidden border border-gold/20 shadow-sm hover:shadow-xl hover:border-gold/60 transition-all duration-300 flex flex-col hover:-translate-y-1 shrink-0"
              style={{ width: cardWidth }}
            >
              {/* Image */}
              <div className="relative h-56 overflow-hidden bg-cream">
                {service.image ? (
                  <Image
                    src={service.image}
                    alt={service.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-5xl">
                    🛕
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-maroon/90 via-maroon/30 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

                <div className="absolute top-4 left-4">
                  <span className="bg-white/95 backdrop-blur-sm text-maroon text-[10px] font-cinzel font-bold px-3 py-1.5 rounded-full uppercase tracking-widest shadow-md">
                    {service.category || "Service"}
                  </span>
                </div>

                <div className="absolute bottom-4 left-4 right-4 translate-y-1 group-hover:translate-y-0 transition-transform duration-300">
                  <h3 className="font-cinzel font-bold text-white text-[15px] leading-snug mb-1 drop-shadow-md truncate">
                    {service.name}
                  </h3>
                  <span className="text-gold font-semibold text-xs drop-shadow-sm">
                    From ${service.price}
                  </span>
                </div>
              </div>

              {/* Body */}
              <div className="flex flex-col flex-1 p-5 md:p-6 bg-white relative z-10">
                <p className="text-foreground/70 text-[13px] leading-relaxed line-clamp-3 flex-1 mb-5 font-light">
                  {service.shortDesc || service.description}
                </p>
                <div className="flex items-center justify-between pt-4 border-t border-gold/15">
                  <span className="text-[11px] font-medium text-foreground/40 uppercase tracking-wide">
                    {service.duration}
                  </span>
                  <span className="text-[13px] font-semibold text-saffron group-hover:text-maroon flex items-center gap-1.5 transition-all">
                    Book Now <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
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
