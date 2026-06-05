"use client";

import { useState } from "react";
import Image from "next/image";

interface GalleryImage {
  src: string;
  alt: string;
  category: string;
}

const CATEGORIES = ["All", "Temple", "Rituals", "Events", "Community"];

export default function GalleryClient({ images }: { images: GalleryImage[] }) {
  const [active, setActive] = useState("All");

  const filtered = active === "All" ? images : images.filter((img) => img.category === active);

  return (
    <>
      {/* Category filters */}
      <div className="flex flex-wrap justify-center gap-2 mb-10">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActive(cat)}
            className={`relative px-5 py-2 rounded-full text-sm font-cinzel font-semibold tracking-wide transition-all duration-200 ${
              active === cat
                ? "bg-maroon text-white shadow-md shadow-maroon/30"
                : "bg-white text-maroon border border-gold/30 hover:border-saffron hover:text-saffron"
            }`}
          >
            {cat}
            {active === cat && (
              <span className="absolute -bottom-px left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-gold" />
            )}
          </button>
        ))}
      </div>

      {/* Count */}
      <p className="text-center text-foreground/40 text-xs font-medium uppercase tracking-widest mb-8">
        {filtered.length} photo{filtered.length !== 1 ? "s" : ""}
        {active !== "All" ? ` · ${active}` : ""}
      </p>

      {/* Masonry grid */}
      <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
        {filtered.map((img, i) => (
          <div
            key={i}
            className="break-inside-avoid rounded-2xl overflow-hidden shadow-sm border border-gold/20 group cursor-pointer hover:shadow-lg hover:border-gold/50 transition-all duration-300"
          >
            <div className="relative">
              <Image
                src={img.src}
                alt={img.alt}
                width={400}
                height={300}
                className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-maroon/0 group-hover:bg-maroon/50 transition-all duration-300 flex items-end">
                <div className="p-3 w-full translate-y-3 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                  <span className="inline-block bg-gold text-white text-xs px-2.5 py-0.5 rounded-full font-semibold mb-1">
                    {img.category}
                  </span>
                  <p className="text-white text-xs leading-snug">{img.alt}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <div className="text-4xl mb-4">🖼️</div>
          <p className="text-foreground/50">No photos in this category yet.</p>
        </div>
      )}
    </>
  );
}
