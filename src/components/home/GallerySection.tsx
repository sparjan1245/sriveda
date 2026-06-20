"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Images, PlayCircle } from "lucide-react";

export interface GalleryPhoto {
  src: string;
  alt: string;
  caption?: string;
}

export interface GalleryVideo {
  thumbnail: string;
  title: string;
  description?: string;
  duration?: string;
  href: string;
}

interface Props {
  photos: GalleryPhoto[];
  videos: GalleryVideo[];
}

const GAP = 16;

function useCarousel(total: number, visible: number) {
  const [idx, setIdx] = useState(0);
  const max = Math.max(0, total - visible);
  useEffect(() => { setIdx((i) => Math.min(i, max)); }, [max]);
  return {
    idx,
    max,
    prev: () => setIdx((i) => Math.max(0, i - 1)),
    next: () => setIdx((i) => Math.min(max, i + 1)),
    goTo: (i: number) => setIdx(Math.min(max, Math.max(0, i))),
  };
}

export function GallerySection({ photos, videos }: Props) {
  const [tab, setTab] = useState<"photos" | "videos">("photos");

  // ── Photo carousel ──────────────────────────────────────────────
  const photoRef = useRef<HTMLDivElement>(null);
  const [photoCardW, setPhotoCardW] = useState(300);
  const [photoVisible, setPhotoVisible] = useState(1);
  const photo = useCarousel(photos.length, photoVisible);

  useEffect(() => {
    const measure = () => {
      if (!photoRef.current) return;
      const w = photoRef.current.offsetWidth;
      const v = w >= 1024 ? 6 : w >= 640 ? 4 : 2;
      setPhotoVisible(v);
      setPhotoCardW((w - GAP * (v - 1)) / v);
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (photoRef.current) ro.observe(photoRef.current);
    return () => ro.disconnect();
  }, []);

  // ── Video carousel ──────────────────────────────────────────────
  const videoRef = useRef<HTMLDivElement>(null);
  const [videoCardW, setVideoCardW] = useState(300);
  const [videoVisible, setVideoVisible] = useState(1);
  const video = useCarousel(videos.length, videoVisible);

  useEffect(() => {
    const measure = () => {
      if (!videoRef.current) return;
      const w = videoRef.current.offsetWidth;
      const v = w >= 1024 ? 4 : w >= 640 ? 2 : 1;
      setVideoVisible(v);
      setVideoCardW((w - GAP * (v - 1)) / v);
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (videoRef.current) ro.observe(videoRef.current);
    return () => ro.disconnect();
  }, []);

  const tabs = [
    { key: "photos" as const, label: "Photos", icon: <Images className="w-3.5 h-3.5" /> },
    { key: "videos" as const, label: "Videos", icon: <PlayCircle className="w-3.5 h-3.5" /> },
  ];

  return (
    <div>
      {/* ── Tab switcher ── */}
      <div className="flex items-center justify-center gap-2 mb-8">
        {tabs.map((t) => (
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

      {/* ── Photos panel ── */}
      <div className={tab === "photos" ? "block" : "hidden"}>
        <div ref={photoRef} className="overflow-hidden pb-1">
          <div
            className="flex"
            style={{
              gap: GAP,
              transform: `translateX(-${photo.idx * (photoCardW + GAP)}px)`,
              transition: "transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
            }}
          >
            {photos.map((p, i) => (
              <div
                key={i}
                className="relative shrink-0 rounded-2xl overflow-hidden gold-border card-hover shadow-md aspect-square group cursor-zoom-in"
                style={{ width: photoCardW }}
              >
                <Image
                  src={p.src}
                  alt={p.alt}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-linear-to-t from-maroon/65 via-maroon/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                {p.caption && (
                  <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-2 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <p className="text-white text-xs font-cinzel font-semibold drop-shadow-md">{p.caption}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {photo.max > 0 && (
          <div className="flex items-center justify-center gap-5 mt-6">
            <button
              onClick={photo.prev}
              disabled={photo.idx === 0}
              className="w-10 h-10 rounded-full border border-gold/30 bg-white shadow-sm text-maroon flex items-center justify-center hover:bg-maroon hover:text-white hover:border-maroon disabled:opacity-25 disabled:cursor-not-allowed transition-all duration-200"
              aria-label="Previous"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              {Array.from({ length: photo.max + 1 }, (_, i) => (
                <button
                  key={i}
                  onClick={() => photo.goTo(i)}
                  className={`rounded-full transition-all duration-300 ${
                    i === photo.idx ? "w-7 h-2.5 bg-maroon" : "w-2.5 h-2.5 bg-gold/30 hover:bg-gold/60"
                  }`}
                  aria-label={`Page ${i + 1}`}
                />
              ))}
            </div>
            <button
              onClick={photo.next}
              disabled={photo.idx >= photo.max}
              className="w-10 h-10 rounded-full border border-gold/30 bg-white shadow-sm text-maroon flex items-center justify-center hover:bg-maroon hover:text-white hover:border-maroon disabled:opacity-25 disabled:cursor-not-allowed transition-all duration-200"
              aria-label="Next"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {/* ── Videos panel ── */}
      <div className={tab === "videos" ? "block" : "hidden"}>
        <div ref={videoRef} className="overflow-hidden pb-1">
          <div
            className="flex"
            style={{
              gap: GAP,
              transform: `translateX(-${video.idx * (videoCardW + GAP)}px)`,
              transition: "transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
            }}
          >
            {videos.map((v, i) => (
              <Link
                key={i}
                href={v.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative shrink-0 rounded-2xl overflow-hidden gold-border shadow-md card-hover"
                style={{ width: videoCardW }}
              >
                <div className="relative aspect-video bg-maroon/10 overflow-hidden">
                  <Image
                    src={v.thumbnail}
                    alt={v.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-maroon/45 group-hover:bg-maroon/35 transition-colors duration-300" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-14 h-14 rounded-full bg-gold/90 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-300 ring-4 ring-white/20">
                      <div className="w-0 h-0 border-t-[9px] border-t-transparent border-l-[16px] border-l-white border-b-[9px] border-b-transparent ml-1" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {video.max > 0 && (
          <div className="flex items-center justify-center gap-5 mt-6">
            <button
              onClick={video.prev}
              disabled={video.idx === 0}
              className="w-10 h-10 rounded-full border border-gold/30 bg-white shadow-sm text-maroon flex items-center justify-center hover:bg-maroon hover:text-white hover:border-maroon disabled:opacity-25 disabled:cursor-not-allowed transition-all duration-200"
              aria-label="Previous"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              {Array.from({ length: video.max + 1 }, (_, i) => (
                <button
                  key={i}
                  onClick={() => video.goTo(i)}
                  className={`rounded-full transition-all duration-300 ${
                    i === video.idx ? "w-7 h-2.5 bg-maroon" : "w-2.5 h-2.5 bg-gold/30 hover:bg-gold/60"
                  }`}
                  aria-label={`Page ${i + 1}`}
                />
              ))}
            </div>
            <button
              onClick={video.next}
              disabled={video.idx >= video.max}
              className="w-10 h-10 rounded-full border border-gold/30 bg-white shadow-sm text-maroon flex items-center justify-center hover:bg-maroon hover:text-white hover:border-maroon disabled:opacity-25 disabled:cursor-not-allowed transition-all duration-200"
              aria-label="Next"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
