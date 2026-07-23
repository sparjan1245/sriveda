"use client";

import { useState } from "react";
import Image from "next/image";
import type { Banner } from "@prisma/client";
import { Search, X } from "lucide-react";
import BannerActions from "./BannerActions";

export default function BannersTable({ banners }: { banners: Banner[] }) {
  const [query, setQuery] = useState("");

  const filtered = banners.filter((b) => {
    if (!query) return true;
    const q = query.toLowerCase();
    return (b.title || "").toLowerCase().includes(q) || (b.subtitle || "").toLowerCase().includes(q);
  });

  return (
    <div className="space-y-4">
      <div className="relative w-full sm:w-72">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by title or subtitle…"
          className="w-full pl-9 pr-8 py-2.5 border border-gold/30 rounded-lg text-sm focus:outline-none focus:border-saffron bg-white"
        />
        {query && (
          <button type="button" onClick={() => setQuery("")} aria-label="Clear search" className="absolute right-2.5 top-1/2 -translate-y-1/2 text-foreground/30 hover:text-foreground/60">
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl gold-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gold/20 bg-cream/50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-maroon/60 uppercase tracking-wider w-10">#</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-maroon/60 uppercase tracking-wider w-28">Image</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-maroon/60 uppercase tracking-wider">Content</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-maroon/60 uppercase tracking-wider">CTA Buttons</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-maroon/60 uppercase tracking-wider w-24">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-maroon/60 uppercase tracking-wider w-44">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gold/10">
              {filtered.map((banner) => {
                const i = banners.findIndex((b) => b.id === banner.id);
                return (
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
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <p className="text-center text-foreground/40 py-10">No banners match &ldquo;{query}&rdquo;.</p>
        )}
      </div>
    </div>
  );
}
