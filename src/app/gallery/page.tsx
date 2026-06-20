import type { Metadata } from "next";
import Image from "next/image";
import { IMAGES } from "@/lib/constants";
import { db } from "@/lib/db";
import GalleryClient from "./GalleryClient";

export const metadata: Metadata = {
  title: "Gallery",
  description: "Photo gallery of Sri Veda Gayatri Temple — rituals, festivals, and community events.",
};

function getYouTubeThumb(url: string): string | null {
  const match = url.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match ? `https://img.youtube.com/vi/${match[1]}/mqdefault.jpg` : null;
}

export default async function GalleryPage() {
  const [dbImages, dbVideos] = await Promise.all([
    db.galleryImage.findMany({ orderBy: { createdAt: "desc" } }).catch(() => [] as { url: string; caption: string | null; category: string | null }[]),
    db.galleryVideo.findMany({ orderBy: { createdAt: "desc" } }).catch(() => [] as { url: string; title: string | null; thumbnail: string | null }[]),
  ]);

  const images = dbImages.map((img: { url: string; caption: string | null; category: string | null }) => ({
    src: img.url,
    alt: img.caption || "Temple photo",
    category: img.category || "Gallery",
  }));

  const videos = (dbVideos as { url: string; title: string | null; thumbnail: string | null }[]).map((v) => ({
    thumbnail: v.thumbnail || getYouTubeThumb(v.url) || IMAGES.hero,
    title: v.title || "Temple Video",
    href: v.url,
  }));

  return (
    <div>

      {/* ── Inner Page Banner ── */}
      <section className="relative h-40 md:h-22 flex items-center justify-center overflow-hidden">
        <Image src={IMAGES.altar} alt="Gallery" fill className="object-cover object-center" priority />
        <div className="absolute inset-0 bg-black/55" />
        <div className="absolute inset-0 bg-maroon/60" />
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 70% 80% at 50% 50%, rgba(212,160,23,0.15) 0%, transparent 70%)" }} />
        <div className="absolute bottom-0 inset-x-0 h-px bg-linear-to-r from-transparent via-gold/60 to-transparent" />
        <div className="relative z-10 text-center px-4">
          <div className="flex items-center justify-center gap-2 text-white/70 text-[11px] tracking-widest uppercase mb-3">
            <span>Home</span>
            <span className="text-gold/60">›</span>
            <span className="text-gold/80">Gallery</span>
          </div>
         
        </div>
      </section>

      {/* ── Grid ── */}
      <section className="py-16 px-4 bg-cream pattern-bg">
        <div className="max-w-7xl mx-auto">
          <GalleryClient images={images} videos={videos} />
        </div>
      </section>

    </div>
  );
}
