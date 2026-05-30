import Image from "next/image";
import type { Metadata } from "next";
import { IMAGES } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Gallery",
  description: "Photo gallery of Sri Veda Gayatri Temple — rituals, festivals, and community events.",
};

const GALLERY_IMAGES = [
  { src: IMAGES.hero, alt: "Temple exterior", category: "Temple" },
  { src: IMAGES.altar, alt: "Decorated altar with flowers", category: "Rituals" },
  { src: IMAGES.puja, alt: "Puja ceremony", category: "Rituals" },
  { src: IMAGES.temple1, alt: "Temple gopuram", category: "Temple" },
  { src: IMAGES.about1, alt: "Temple ceremony", category: "Events" },
  { src: IMAGES.about2, alt: "Community gathering", category: "Community" },
  { src: IMAGES.about3, alt: "Puja setup", category: "Rituals" },
  { src: IMAGES.about4, alt: "Festival celebration", category: "Events" },
  { src: IMAGES.download4, alt: "Temple deity", category: "Temple" },
  { src: IMAGES.pujaBase, alt: "Sacred rituals", category: "Rituals" },
];

const CATEGORIES = ["All", "Temple", "Rituals", "Events", "Community"];

export default function GalleryPage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative h-64 md:h-80 flex items-center justify-center overflow-hidden">
        <Image src={IMAGES.altar} alt="Gallery" fill className="object-cover" />
        <div className="absolute inset-0" style={{ background: "rgba(107,15,26,0.75)" }} />
        <div className="relative z-10 text-center px-4">
          <p className="text-gold font-cinzel text-sm uppercase tracking-widest mb-2">Sacred Moments</p>
          <h1 className="font-cinzel font-bold text-4xl md:text-5xl text-white">Photo Gallery</h1>
        </div>
      </section>

      <section className="py-16 px-4 bg-cream pattern-bg">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-foreground/60 max-w-xl mx-auto">
              A glimpse into the sacred ceremonies, festivals, and community life at Sri Veda Gayatri Temple.
            </p>
          </div>

          <GalleryGrid images={GALLERY_IMAGES} />
        </div>
      </section>
    </div>
  );
}

function GalleryGrid({ images }: { images: typeof GALLERY_IMAGES }) {
  return (
    <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
      {images.map((img, i) => (
        <div key={i} className="break-inside-avoid rounded-xl overflow-hidden shadow-sm gold-border group cursor-pointer">
          <div className="relative">
            <Image
              src={img.src}
              alt={img.alt}
              width={400}
              height={300}
              className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-maroon/0 group-hover:bg-maroon/40 transition-all duration-300 flex items-end">
              <div className="p-3 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                <span className="bg-gold/90 text-white text-xs px-2 py-0.5 rounded">{img.category}</span>
                <p className="text-white text-sm mt-1">{img.alt}</p>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
