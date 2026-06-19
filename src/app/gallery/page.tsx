import type { Metadata } from "next";
import Image from "next/image";
import { IMAGES } from "@/lib/constants";
import { db } from "@/lib/db";
import GalleryClient from "./GalleryClient";

export const metadata: Metadata = {
  title: "Gallery",
  description: "Photo gallery of Sri Veda Gayatri Temple — rituals, festivals, and community events.",
};

const STATIC_IMAGES = [
  { src: IMAGES.hero,      alt: "Temple exterior",              category: "Temple" },
  { src: IMAGES.altar,     alt: "Decorated altar with flowers", category: "Rituals" },
  { src: IMAGES.puja,      alt: "Puja ceremony",                category: "Rituals" },
  { src: IMAGES.temple1,   alt: "Temple gopuram",               category: "Temple" },
  { src: IMAGES.about1,    alt: "Temple ceremony",              category: "Events" },
  { src: IMAGES.about2,    alt: "Community gathering",          category: "Community" },
  { src: IMAGES.about3,    alt: "Puja setup",                   category: "Rituals" },
  { src: IMAGES.about4,    alt: "Festival celebration",         category: "Events" },
  { src: IMAGES.download4, alt: "Temple deity",                 category: "Temple" },
  { src: IMAGES.pujaBase,  alt: "Sacred rituals",               category: "Rituals" },
];

export default async function GalleryPage() {
  // Fetch DB-managed images and prepend them before static fallbacks
  const dbImages = await db.galleryImage
    .findMany({ orderBy: { createdAt: "desc" } })
    .catch(() => []);

  const dbMapped = dbImages.map((img) => ({
    src: img.url,
    alt: img.caption || "Temple photo",
    category: img.category || "Gallery",
  }));

  // DB images first; static images de-duped by src
  const dbSrcs = new Set(dbMapped.map((i) => i.src));
  const combined = [...dbMapped, ...STATIC_IMAGES.filter((i) => !dbSrcs.has(i.src))];

  const STATIC_VIDEOS = [
    { thumbnail: IMAGES.hero,      title: "Archana & Abhishekam",        href: "https://www.youtube.com/@srivedagayatritemple" },
    { thumbnail: IMAGES.puja,      title: "Ganapathi Homam",             href: "https://www.youtube.com/@srivedagayatritemple" },
    { thumbnail: IMAGES.about2,    title: "Annadaanam",                  href: "https://www.youtube.com/@srivedagayatritemple" },
    { thumbnail: IMAGES.temple1,   title: "Navaratri Celebrations 2024", href: "https://www.youtube.com/@srivedagayatritemple" },
    { thumbnail: IMAGES.about3,    title: "Satyanarayan Puja",           href: "https://www.youtube.com/@srivedagayatritemple" },
    { thumbnail: IMAGES.about4,    title: "Cultural Program",            href: "https://www.youtube.com/@srivedagayatritemple" },
    { thumbnail: IMAGES.download4, title: "Devotee Service",             href: "https://www.youtube.com/@srivedagayatritemple" },
    { thumbnail: IMAGES.about1,    title: "Temple Inauguration",         href: "https://www.youtube.com/@srivedagayatritemple" },
  ];

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
          <GalleryClient images={combined} videos={STATIC_VIDEOS} />
        </div>
      </section>

    </div>
  );
}
