"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Images, PlayCircle } from "lucide-react";

interface GalleryImage {
  src: string;
  alt: string;
  category: string;
}

interface GalleryVideo {
  thumbnail: string;
  title: string;
  href: string;
}

interface Props {
  images: GalleryImage[];
  videos: GalleryVideo[];
}

const TABS = [
  { key: "images" as const, label: "Images", icon: <Images className="w-3.5 h-3.5" /> },
  { key: "videos" as const, label: "Videos", icon: <PlayCircle className="w-3.5 h-3.5" /> },
];

export default function GalleryClient({ images, videos }: Props) {
  const [tab, setTab] = useState<"images" | "videos">("images");

  const count = tab === "images" ? images.length : videos.length;
  const label = tab === "images"
    ? `${count} photo${count !== 1 ? "s" : ""}`
    : `${count} video${count !== 1 ? "s" : ""}`;

  return (
    <>
      {/* Tab switcher */}
      <div className="flex items-center justify-center gap-2 mb-10">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`inline-flex items-center gap-2 px-6 py-2 rounded-full text-xs font-semibold tracking-widest uppercase transition-all duration-300 border ${
              tab === t.key
                ? "bg-maroon text-white border-maroon shadow-md"
                : "bg-white text-maroon border-gold/35 hover:border-maroon/50 hover:bg-cream"
            }`}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {/* Count */}
      <p className="text-center text-foreground/40 text-xs font-medium uppercase tracking-widest mb-8">
        {label}
      </p>

      {/* ── Images grid ── */}
      {tab === "images" && (
        images.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-4xl mb-4">🖼️</div>
            <p className="text-foreground/50">No photos available yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
            {images.map((img, i) => (
              <div
                key={i}
                className="relative aspect-square rounded-2xl overflow-hidden border border-gold/20 group cursor-zoom-in shadow-sm hover:shadow-md hover:border-gold/50 transition-all duration-300"
              >
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 16vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-maroon/0 group-hover:bg-maroon/55 transition-all duration-300 flex items-end">
                  <div className="p-2 w-full translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                    <p className="text-white text-[10px] font-cinzel font-semibold leading-snug drop-shadow-md line-clamp-2">
                      {img.alt}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* ── Videos grid ── */}
      {tab === "videos" && (
        videos.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-4xl mb-4">▶️</div>
            <p className="text-foreground/50">No videos available yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
            {videos.map((v, i) => (
              <Link
                key={i}
                href={v.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={v.title}
                className="group relative rounded-2xl overflow-hidden border border-gold/20 hover:border-gold/50 shadow-sm hover:shadow-md transition-all duration-300"
              >
                <div className="relative aspect-video overflow-hidden bg-maroon/10">
                  <Image
                    src={v.thumbnail}
                    alt={v.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-maroon/45 group-hover:bg-maroon/30 transition-colors duration-300" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-gold/90 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-300 ring-4 ring-white/20">
                      <div className="w-0 h-0 border-t-8 border-t-transparent border-l-14 border-l-white border-b-8 border-b-transparent ml-1" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )
      )}
    </>
  );
}
