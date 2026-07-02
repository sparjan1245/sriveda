"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";

export interface Testimonial {
  id: string;
  name: string;
  location?: string | null;
  avatar?: string | null;
  text: string;
  rating: number;
}

function initials(name: string) {
  return name
    .split(/\s+&?\s*/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function TestimonialCarousel({ items }: { items: Testimonial[] }) {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);
  const total = items.length;

  const go = useCallback(
    (next: number, dir: number) => {
      setDirection(dir);
      setCurrent((next + total) % total);
    },
    [total]
  );

  // Auto-advance every 6 s
  useEffect(() => {
    if (total <= 1) return;
    const t = setInterval(() => go((current + 1) % total, 1), 6000);
    return () => clearInterval(t);
  }, [current, total, go]);

  const variants = {
    enter: (dir: number) => ({ x: dir > 0 ? 80 : -80, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -80 : 80, opacity: 0 }),
  };

  const item = items[current];

  return (
    <div className="relative">
      {/* Card */}
      <div className="overflow-hidden rounded-3xl">
        <AnimatePresence custom={direction} mode="wait">
          <motion.div
            key={item.id}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="group relative bg-white rounded-3xl px-6 py-6 md:px-10 md:py-8 gold-border shadow-lg flex flex-col items-center text-center"
          >
            {/* Large quote mark */}
            <span className="absolute top-6 left-8 text-7xl text-gold/10 font-serif leading-none select-none pointer-events-none">&ldquo;</span>
            <span className="absolute bottom-6 right-8 text-7xl text-gold/10 font-serif leading-none select-none pointer-events-none">&rdquo;</span>

            {/* Stars */}
            <div className="flex gap-1 mb-4">
              {Array.from({ length: item.rating }).map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-gold text-gold" />
              ))}
            </div>

            {/* Quote text */}
            <p className="text-foreground text-base md:text-lg leading-relaxed italic max-w-2xl mx-auto mb-5 relative z-10">
              &ldquo;{item.text}&rdquo;
            </p>

            {/* Divider */}
            <div className="flex items-center gap-3 mb-4">
              <span className="block h-px w-10 bg-gold/40" />
              <span className="text-gold text-sm">🪷</span>
              <span className="block h-px w-10 bg-gold/40" />
            </div>

            {/* Author */}
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-saffron/20 to-gold/25 border-2 border-gold/35 flex items-center justify-center shadow-sm">
                <span className="font-cinzel font-bold text-sm text-maroon">
                  {item.avatar || initials(item.name)}
                </span>
              </div>
              <div>
                <p className="font-cinzel font-bold text-maroon text-sm leading-snug">{item.name}</p>
                {item.location && (
                  <p className="text-foreground/70 font-bold text-xs mt-0.5">{item.location}</p>
                )}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      {total > 1 && (
        <div className="flex items-center justify-center gap-5 mt-7">
          <button
            onClick={() => go(current - 1, -1)}
            className="w-10 h-10 rounded-full border border-gold/30 bg-white shadow-sm text-maroon flex items-center justify-center hover:bg-maroon hover:text-white hover:border-maroon transition-all duration-200"
            aria-label="Previous testimonial"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2">
            {items.map((_, i) => (
              <button
                key={i}
                onClick={() => go(i, i > current ? 1 : -1)}
                className={`rounded-full transition-all duration-300 ${
                  i === current ? "w-7 h-2.5 bg-maroon" : "w-2.5 h-2.5 bg-gold/30 hover:bg-gold/60"
                }`}
                aria-label={`Testimonial ${i + 1}`}
              />
            ))}
          </div>

          <button
            onClick={() => go(current + 1, 1)}
            className="w-10 h-10 rounded-full border border-gold/30 bg-white shadow-sm text-maroon flex items-center justify-center hover:bg-maroon hover:text-white hover:border-maroon transition-all duration-200"
            aria-label="Next testimonial"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}
