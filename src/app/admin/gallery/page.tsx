import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { ArrowLeft, ImageIcon, Video } from "lucide-react";
import { IMAGES } from "@/lib/constants";
import GalleryForm from "./GalleryForm";
import DeleteImageButton from "./DeleteImageButton";
import VideoForm from "./VideoForm";
import DeleteVideoButton from "./DeleteVideoButton";

function getYouTubeThumb(url: string): string | null {
  const match = url.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match ? `https://img.youtube.com/vi/${match[1]}/mqdefault.jpg` : null;
}

export default async function AdminGalleryPage() {
  const session = await auth();
  if ((session?.user as { role?: string })?.role !== "ADMIN") redirect("/dashboard");

  const [images, videos] = await Promise.all([
    db.galleryImage.findMany({ orderBy: { createdAt: "desc" } }).catch(() => []),
    db.galleryVideo.findMany({ orderBy: { createdAt: "desc" } }).catch(() => []),
  ]);

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
            <p className="text-maroon font-cinzel text-base font-extrabold uppercase tracking-widest mb-1">Admin</p>
            <h1 className="font-cinzel font-bold text-3xl text-maroon">Gallery</h1>
          </div>
          <div className="flex gap-2">
            <VideoForm />
            <GalleryForm />
          </div>
        </div>

        {/* Images Section */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <ImageIcon className="w-5 h-5 text-saffron" />
            <h2 className="font-cinzel font-semibold text-maroon text-lg">
              Photos <span className="text-foreground/40 text-sm font-normal">({images.length} uploaded)</span>
            </h2>
          </div>

          {images.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-6">
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
          ) : (
            <div className="text-center py-8 bg-white rounded-2xl gold-border mb-6">
              <ImageIcon className="w-10 h-10 text-gold/40 mx-auto mb-3" />
              <p className="text-foreground/50 mb-1">No photos uploaded yet.</p>
              <p className="text-foreground/40 text-sm">Click &ldquo;Add Photo&rdquo; to add images by URL.</p>
            </div>
          )}

         
        </div>

        {/* Videos Section */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Video className="w-5 h-5 text-saffron" />
            <h2 className="font-cinzel font-semibold text-maroon text-lg">
              Videos <span className="text-foreground/40 text-sm font-normal">({videos.length} added)</span>
            </h2>
          </div>

          {videos.length === 0 ? (
            <div className="text-center py-8 bg-white rounded-2xl gold-border">
              <Video className="w-10 h-10 text-gold/40 mx-auto mb-3" />
              <p className="text-foreground/50 mb-1">No videos added yet.</p>
              <p className="text-foreground/40 text-sm">Click &ldquo;Add Video&rdquo; to embed YouTube links.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {videos.map((v) => {
                const thumb = v.thumbnail || getYouTubeThumb(v.url);
                return (
                  <div key={v.id} className="group relative rounded-xl overflow-hidden gold-border bg-white shadow-sm">
                    <div className="relative aspect-video bg-black/10">
                      {thumb ? (
                        <Image src={thumb} alt={v.title || "Video"} fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Video className="w-10 h-10 text-foreground/20" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                        <div className="w-10 h-10 bg-white/80 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="w-0 h-0 border-y-[6px] border-y-transparent border-l-10 border-l-maroon ml-1" />
                        </div>
                      </div>
                      <DeleteVideoButton videoId={v.id} />
                    </div>
                    <div className="p-2">
                      {v.title && <p className="text-xs text-foreground/70 truncate">{v.title}</p>}
                      {v.category && <span className="text-xs text-gold">{v.category}</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
