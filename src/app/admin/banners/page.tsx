import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { Banner } from "@prisma/client";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { ArrowLeft, ImageIcon, Info } from "lucide-react";
import { TEMPLE } from "@/lib/constants";
import BannerForm from "./BannerForm";
import BannerActions from "./BannerActions";

export default async function AdminBannersPage() {
  const session = await auth();
  if ((session?.user as { role?: string })?.role !== "ADMIN") redirect("/dashboard");

  const banners = await db.banner
    .findMany({ orderBy: { order: "asc" } })
    .catch(() => []);


  return (
    <div className="min-h-screen bg-cream pattern-bg">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 text-maroon/60 hover:text-maroon text-sm mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Admin Dashboard
        </Link>

        <div className="flex items-center justify-between mb-2">
          <div>
            <p className="text-gold font-cinzel text-sm uppercase tracking-widest mb-1">Admin</p>
            <h1 className="font-cinzel font-bold text-3xl text-maroon">Hero Banners</h1>
          </div>
          <BannerForm />
        </div>

        <div className="flex items-start gap-2 bg-blue-50 border border-blue-200 rounded-xl p-4 mb-8 text-sm text-blue-800">
          <Info className="w-4 h-4 mt-0.5 shrink-0" />
          <span>
            When you add banners here, they replace the default slides on the homepage hero.
            If no active banners exist, the 4 default temple images are shown automatically.
            Per-slide titles, subtitles, and button links are optional — if left blank, the
            global temple name and &ldquo;{TEMPLE.tagline}&rdquo; are used.
          </span>
        </div>

        {/* Custom Banners Table */}
        <div className="mb-10">
          <h2 className="font-cinzel font-semibold text-maroon text-lg mb-4">
            Custom Banners{" "}
            <span className="text-foreground/40 text-sm font-normal">({banners.length})</span>
          </h2>

          {banners.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl gold-border">
              <ImageIcon className="w-12 h-12 text-gold/40 mx-auto mb-4" />
              <p className="text-foreground/50 mb-1">No custom banners yet.</p>
              <p className="text-foreground/40 text-sm">
                The 4 default temple images are being used. Add banners above to override them.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl gold-border shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gold/20 bg-cream/50">
                      <th className="text-left px-4 py-3 text-xs font-semibold text-maroon/60 uppercase tracking-wider w-10">
                        #
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-maroon/60 uppercase tracking-wider w-28">
                        Image
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-maroon/60 uppercase tracking-wider">
                        Content
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-maroon/60 uppercase tracking-wider">
                        CTA Buttons
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-maroon/60 uppercase tracking-wider w-24">
                        Status
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-maroon/60 uppercase tracking-wider w-44">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gold/10">
                    {banners.map((banner: Banner, i: number) => (
                      <tr
                        key={banner.id}
                        className={`transition-colors hover:bg-cream/20 ${!banner.active ? "opacity-60" : ""}`}
                      >
                        {/* Order */}
                        <td className="px-4 py-3 text-foreground/40 font-mono text-xs align-middle">
                          {i + 1}
                        </td>

                        {/* Thumbnail */}
                        <td className="px-4 py-3 align-middle">
                          <div className="relative w-20 h-12 rounded-lg overflow-hidden bg-cream">
                            {banner.image ? (
                              <Image
                                src={banner.image}
                                alt={banner.title || `Banner ${i + 1}`}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-foreground/30 text-xs">No img</div>
                            )}
                            {!banner.active && (
                              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                <span className="text-white text-[9px] font-medium">Hidden</span>
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Content */}
                        <td className="px-4 py-3 align-middle max-w-xs">
                          <p className="font-cinzel font-semibold text-maroon text-sm truncate">
                            {banner.title || (
                              <span className="text-foreground/30 italic font-sans font-normal text-xs">
                                Uses temple name
                              </span>
                            )}
                          </p>
                          {banner.subtitle && (
                            <p className="text-foreground/55 text-xs truncate mt-0.5">{banner.subtitle}</p>
                          )}
                          {banner.description && (
                            <p className="text-foreground/40 text-xs mt-0.5 line-clamp-1">
                              {banner.description}
                            </p>
                          )}
                        </td>

                        {/* CTA */}
                        <td className="px-4 py-3 align-middle">
                          {banner.ctaText ? (
                            <div className="space-y-1.5">
                              <div className="flex items-center gap-1.5 text-xs">
                                <span className="bg-saffron/10 text-saffron px-2 py-0.5 rounded font-medium whitespace-nowrap">
                                  {banner.ctaText}
                                </span>
                                {banner.ctaLink && (
                                  <span className="text-foreground/40 font-mono truncate max-w-22.5">
                                    {banner.ctaLink}
                                  </span>
                                )}
                              </div>
                              {banner.cta2Text && (
                                <div className="flex items-center gap-1.5 text-xs">
                                  <span className="bg-maroon/10 text-maroon/70 px-2 py-0.5 rounded font-medium whitespace-nowrap">
                                    {banner.cta2Text}
                                  </span>
                                  {banner.cta2Link && (
                                    <span className="text-foreground/40 font-mono truncate max-w-22.5">
                                      {banner.cta2Link}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-foreground/30 text-xs italic">Defaults</span>
                          )}
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3 align-middle">
                          {banner.active ? (
                            <span className="inline-flex text-xs bg-green-100 text-green-700 px-2.5 py-1 rounded-full font-medium">
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex text-xs bg-gray-100 text-gray-500 px-2.5 py-1 rounded-full font-medium">
                              Hidden
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3 align-middle">
                          <BannerActions banner={banner} total={banners.length} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        
      </div>
    </div>
  );
}
