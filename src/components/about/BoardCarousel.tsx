"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface BoardMemberItem {
  id?: string;
  name: string;
  title: string;
  image: string;
  bio?: string | null;
}

const GAP = 20;

export function BoardCarousel({ members }: { members: BoardMemberItem[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [cardWidth, setCardWidth] = useState(260);
  const [visible, setVisible]   = useState(1);
  const [idx, setIdx]           = useState(0);

  const max = Math.max(0, members.length - visible);

  useEffect(() => { setIdx((i) => Math.min(i, max)); }, [max]);

  useEffect(() => {
    const measure = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.offsetWidth;
      const v = w >= 900 ? 4 : w >= 600 ? 2 : 1;
      setVisible(v);
      setCardWidth((w - GAP * (v - 1)) / v);
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  const prev = () => setIdx((i) => Math.max(0, i - 1));
  const next = () => setIdx((i) => Math.min(max, i + 1));

  return (
    <div className="relative">
      {/* Track */}
      <div ref={containerRef} className="overflow-hidden pb-1">
        <div
          className="flex"
          style={{
            gap: GAP,
            transform: `translateX(-${idx * (cardWidth + GAP)}px)`,
            transition: "transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
          }}
        >
          {members.map((member, i) => {
            const isChairman = i === 0;
            return (
              <div
                key={member.name}
                className={`shrink-0 group relative bg-white rounded-2xl overflow-hidden card-hover flex flex-col items-center text-center ${
                  isChairman ? "gold-border-thick shadow-xl" : "gold-border shadow-md"
                }`}
                style={{ width: cardWidth }}
              >
                {/* Top color bar */}
                <div
                  className={`h-1 w-full bg-linear-to-r from-saffron to-gold ${
                    isChairman
                      ? "opacity-100"
                      : "opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  }`}
                />

                <div className="pt-6 pb-5 px-4 w-full flex flex-col items-center">
                  {/* Avatar */}
                  <div
                    className={`relative rounded-full overflow-hidden mb-4 shrink-0 ${
                      isChairman
                        ? "w-24 h-24 md:w-28 md:h-28 ring-4 ring-gold/40 ring-offset-2"
                        : "w-20 h-20 md:w-24 md:h-24 ring-2 ring-gold/25 ring-offset-2 group-hover:ring-gold/50 transition-all duration-300"
                    }`}
                  >
                    <Image
                      src={member.image}
                      alt={member.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-maroon/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>

                  {isChairman && (
                    <span className="badge-gold mb-2 text-[10px]">Founder</span>
                  )}

                  <h3 className="font-cinzel font-semibold text-maroon text-xs md:text-sm leading-snug mb-1.5">
                    {member.name}
                  </h3>
                  <div className="divider-gold w-8 mb-2" />
                  <p className="text-saffron text-[11px] font-medium tracking-wide mb-2">
                    {member.title}
                  </p>
                  <p className="text-foreground/50 text-[11px] font-light leading-relaxed">
                    {member.bio || "Dedicated to serving the spiritual and cultural needs of our community."}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Controls — only shown when scrollable */}
      {max > 0 && (
        <div className="flex items-center justify-center gap-5 mt-6">
          <button
            onClick={prev}
            disabled={idx === 0}
            aria-label="Previous"
            className="w-10 h-10 rounded-full border border-gold/30 bg-white shadow-sm text-maroon flex items-center justify-center hover:bg-maroon hover:text-white hover:border-maroon disabled:opacity-25 disabled:cursor-not-allowed transition-all duration-200"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2">
            {Array.from({ length: max + 1 }, (_, i) => (
              <button
                key={i}
                onClick={() => setIdx(i)}
                aria-label={`Slide ${i + 1}`}
                className={`rounded-full transition-all duration-300 ${
                  i === idx ? "w-7 h-2.5 bg-maroon" : "w-2.5 h-2.5 bg-gold/30 hover:bg-gold/60"
                }`}
              />
            ))}
          </div>

          <button
            onClick={next}
            disabled={idx >= max}
            aria-label="Next"
            className="w-10 h-10 rounded-full border border-gold/30 bg-white shadow-sm text-maroon flex items-center justify-center hover:bg-maroon hover:text-white hover:border-maroon disabled:opacity-25 disabled:cursor-not-allowed transition-all duration-200"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}
