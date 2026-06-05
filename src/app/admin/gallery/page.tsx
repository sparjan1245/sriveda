import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { ArrowLeft, ImageIcon } from "lucide-react";
import { IMAGES } from "@/lib/constants";
import GalleryForm from "./GalleryForm";
import DeleteImageButton from "./DeleteImageButton";

export default async function AdminGalleryPage() {
  const session = await auth();
  if ((session?.user as { role?: string })?.role !== "ADMIN") redirect("/dashboard");

  const images = await db.galleryImage.findMany({
    orderBy: { createdAt: "desc" },
  }).catch(() => []);

  const staticImages = [
    { id: "s1", url: IMAGES.hero, caption: "Temple exterior", category: "Temple" },
    { id: "s2", url: IMAGES.altar, caption: "Decorated altar", category: "Rituals" },
    { id: "s3", url: IMAGES.puja, caption: "Puja ceremony", category: "Rituals" },
    { id: "s4", url: IMAGES.temple1, caption: "Temple gopuram", category: "Temple" },
    { id: "s5", url: IMAGES.about1, caption: "Temple ceremony", category: "Events" },
    { id: "s6", url: IMAGES.about2, caption: "Community gathering", category: "Community" },
  ];

  return (
    <div className="min-h-screen bg-cream pattern-bg">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <Link href="/admin" className="inline-flex items-center gap-2 text-maroon/60 hover:text-maroon text-sm mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Admin Dashboard
        </Link>

        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-gold font-cinzel text-sm uppercase tracking-widest mb-1">Admin</p>
            <h1 className="font-cinzel font-bold text-3xl text-maroon">Gallery</h1>
          </div>
          <GalleryForm />
        </div>

        {/* DB images */}
        {images.length > 0 && (
          <div className="mb-10">
            <h2 className="font-cinzel font-semibold text-maroon text-lg mb-4">
              Uploaded Photos <span className="text-foreground/40 text-sm font-normal">({images.length})</span>
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {images.map((img) => (
                <div key={img.id} className="group relative rounded-xl overflow-hidden gold-border bg-white shadow-sm">
                  <div className="relative aspect-square">
                    <Image src={img.url} alt={img.caption || "Gallery photo"} fill className="object-cover" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors" />
                    <DeleteImageButton imageId={img.id} />
                  </div>
                  <div className="p-2">
                    {img.caption && <p className="text-xs text-foreground/70 truncate">{img.caption}</p>}
                    {img.category && <span className="text-xs text-gold">{img.category}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {images.length === 0 && (
          <div className="text-center py-10 bg-white rounded-2xl gold-border mb-10">
            <ImageIcon className="w-12 h-12 text-gold/40 mx-auto mb-4" />
            <p className="text-foreground/50 mb-2">No photos uploaded yet.</p>
            <p className="text-foreground/40 text-sm">Click &ldquo;Add Photo&rdquo; to add images by URL.</p>
          </div>
        )}

        {/* Static images (read-only reference) */}
        <div>
          <h2 className="font-cinzel font-semibold text-maroon text-lg mb-1">
            Default Gallery Photos
          </h2>
          <p className="text-foreground/50 text-sm mb-4">These are the built-in temple photos shown on the public gallery page.</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {staticImages.map((img) => (
              <div key={img.id} className="rounded-xl overflow-hidden border border-gold/20 bg-white shadow-sm">
                <div className="relative aspect-square">
                  <Image src={img.url} alt={img.caption} fill className="object-cover" />
                </div>
                <div className="p-2">
                  <p className="text-xs text-foreground/70 truncate">{img.caption}</p>
                  <span className="text-xs text-gold">{img.category}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
