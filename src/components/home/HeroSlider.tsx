"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import PanchangamSlide, { type PanchangamData } from "@/components/home/PanchangamSlide";

export type { PanchangamData };

export interface BannerSlide {
  id: string;
  image: string;
  title?: string | null;
  subtitle?: string | null;
  description?: string | null;
  ctaText?: string | null;
  ctaLink?: string | null;
  cta2Text?: string | null;
  cta2Link?: string | null;
}

type SlideItem =
  | { type: "banner";     data: BannerSlide }
  | { type: "panchangam"; data: PanchangamData };

export interface PanchangamContact {
  address: string;
  phone: string;
  email: string;
}

interface Props {
  slides: BannerSlide[];
  panchangam?: PanchangamData | null;
  contact?: PanchangamContact;
}

export default function HeroSlider({ slides, panchangam, contact }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const allSlides: SlideItem[] = (() => {
    const banners = slides.map((s): SlideItem => ({ type: "banner", data: s }));
    if (!panchangam) return banners;
    const p: SlideItem = { type: "panchangam", data: panchangam };
    if (banners.length >= 2) return [...banners.slice(0, 2), p, ...banners.slice(2)];
    return [...banners, p];
  })();

  const total = allSlides.length;

  useEffect(() => {
    if (total <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % total);
    }, 5500);
    return () => clearInterval(timer);
  }, [total]);

  if (total === 0) return null;

  const goToPrevious = () => setCurrentIndex((prev) => (prev === 0 ? total - 1 : prev - 1));
  const goToNext    = () => setCurrentIndex((prev) => (prev + 1) % total);

  const current = allSlides[currentIndex];
  const isBanner = current.type === "banner";
  const bannerData = isBanner ? (current.data as BannerSlide) : null;
  // Slide has no text content — image itself carries the message, skip overlays
  const isImageOnly = isBanner && !bannerData?.title && !bannerData?.subtitle && !bannerData?.description;

  return (
    <section className="relative w-full aspect-24/9 flex items-center justify-center overflow-hidden">

      {/* ── Background layer ── */}
      <div className={`absolute inset-0 ${isImageOnly ? "bg-black" : ""}`}>
        <AnimatePresence initial={false}>
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, scale: 1.06 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.6, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            {isBanner ? (
              <Image
                src={(current.data as BannerSlide).image}
                alt={(current.data as BannerSlide).title || "Sri Veda Gayatri Temple"}
                fill
                className={isImageOnly ? "object-contain" : "object-cover"}
                priority={currentIndex === 0}
              />
            ) : (
              <div className="w-full h-full" style={{ background: "linear-gradient(135deg,#FFF8F0 0%,#FCEABC 40%,#FFF8F0 100%)" }} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Dark overlays — banner only, skipped for image-only slides ── */}
      {isBanner && !isImageOnly && (
        <>
          <div className="absolute inset-0 z-1" style={{ background: "linear-gradient(to bottom, rgba(20,5,8,0.55) 0%, rgba(107,15,26,0.35) 40%, rgba(30,8,12,0.80) 100%)" }} />
          <div className="absolute inset-0 z-2" style={{ background: "radial-gradient(ellipse at center, transparent 30%, rgba(10,2,4,0.45) 100%)" }} />
        </>
      )}

      {/* ── Nav Arrows ── */}
      {total > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className={`absolute z-20 left-4 md:left-8 top-1/2 -translate-y-1/2 w-10 h-10 md:w-11 md:h-11 rounded-full border flex items-center justify-center backdrop-blur-sm transition-all duration-200 ${isBanner ? "bg-white/10 hover:bg-white/25 border-white/25 text-white" : "bg-white/60 hover:bg-white/90 border-maroon/20 text-maroon"}`}
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
          </button>
          <button
            onClick={goToNext}
            className={`absolute z-20 right-4 md:right-8 top-1/2 -translate-y-1/2 w-10 h-10 md:w-11 md:h-11 rounded-full border flex items-center justify-center backdrop-blur-sm transition-all duration-200 ${isBanner ? "bg-white/10 hover:bg-white/25 border-white/25 text-white" : "bg-white/60 hover:bg-white/90 border-maroon/20 text-maroon"}`}
            aria-label="Next slide"
          >
            <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
          </button>
        </>
      )}

      {/* ── Slide dots ── */}
      {total > 1 && (
        <div className="absolute z-20 bottom-20 left-1/2 -translate-x-1/2 flex gap-2">
          {allSlides.map((s, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={`rounded-full transition-all duration-300 ${
                currentIndex === i
                  ? "w-7 h-2 bg-gold"
                  : s.type === "panchangam"
                  ? "w-2 h-2 bg-maroon/30 hover:bg-maroon/60"
                  : "w-2 h-2 bg-white/40 hover:bg-white/70"
              }`}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
      )}

      {/* ── Slide content ── */}
      <AnimatePresence mode="wait">
        {isBanner && isImageOnly ? null : isBanner ? (
          <motion.div
            key={`banner-${currentIndex}`}
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -14 }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 text-center px-5 w-full max-w-4xl mx-auto py-16 flex flex-col items-center"
          >
            {(current.data as BannerSlide).title && (
              <h1
                className="font-cinzel font-bold text-white leading-tight drop-shadow-2xl mb-5"
                style={{ fontSize: "clamp(1rem, 2vw, 3rem)", letterSpacing: "0.015em" }}
              >
                {(current.data as BannerSlide).title}
              </h1>
            )}

            {((current.data as BannerSlide).title || (current.data as BannerSlide).subtitle) && (
              <div className="flex items-center gap-3 mb-5">
                <span className="block w-12 h-px bg-gold/50" />
                <span className="text-gold text-lg">🪷</span>
                <span className="block w-12 h-px bg-gold/50" />
              </div>
            )}

            {(current.data as BannerSlide).subtitle && (
              <p className="text-gold text-xs md:text-sm font-semibold tracking-[0.25em] uppercase mb-4 flex items-center gap-3">
                <span className="block w-8 h-px bg-gold/60" />
                {(current.data as BannerSlide).subtitle}
                <span className="block w-8 h-px bg-gold/60" />
              </p>
            )}

            {(current.data as BannerSlide).description && (
              <p
                className="text-white/82 leading-relaxed mb-9 font-light max-w-2xl mx-auto"
                style={{ fontSize: "clamp(0.85rem, 1.6vw, 1.05rem)" }}
              >
                {(current.data as BannerSlide).description}
              </p>
            )}

            {((current.data as BannerSlide).ctaText && (current.data as BannerSlide).ctaLink ||
              (current.data as BannerSlide).cta2Text && (current.data as BannerSlide).cta2Link) && (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {(current.data as BannerSlide).ctaText && (current.data as BannerSlide).ctaLink && (
                  <Link
                    href={(current.data as BannerSlide).ctaLink!}
                    className="btn-primary text-sm md:text-base px-8 md:px-10 py-3 md:py-3.5 shadow-xl"
                  >
                    {(current.data as BannerSlide).ctaText}
                  </Link>
                )}
                {(current.data as BannerSlide).cta2Text && (current.data as BannerSlide).cta2Link && (
                  <Link
                    href={(current.data as BannerSlide).cta2Link!}
                    className="btn-ghost text-sm md:text-base px-8 md:px-10 py-3 md:py-3.5"
                  >
                    {(current.data as BannerSlide).cta2Text}
                  </Link>
                )}
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key={`panchangam-${currentIndex}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.55 }}
            className="absolute inset-0 z-3"
          >
            <PanchangamSlide data={(current.data as PanchangamData)} contact={contact} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Scroll cue — banner only, not on image-only slides ── */}
      {isBanner && !isImageOnly && (
        <div className="absolute bottom-7 left-1/2 -translate-x-1/2 z-10 animate-bounce">
          <div className="w-5 h-8 border-2 border-white/30 rounded-full flex items-start justify-center pt-1.5">
            <div className="w-0.5 h-1.5 bg-white/50 rounded-full" />
          </div>
        </div>
      )}

    </section>
  );
}
