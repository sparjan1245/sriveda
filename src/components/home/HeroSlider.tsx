"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { TEMPLE } from "@/lib/constants";

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

interface Props {
  slides: BannerSlide[];
}

export default function HeroSlider({ slides }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 5500);
    return () => clearInterval(timer);
  }, [slides.length]);

  const goToPrevious = () =>
    setCurrentIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  const goToNext = () =>
    setCurrentIndex((prev) => (prev + 1) % slides.length);

  const current = slides[currentIndex];

  return (
    <section className="relative min-h-155 md:min-h-180 flex items-center justify-center overflow-hidden">

      {/* ── Background image ── */}
      <div className="absolute inset-0">
        <AnimatePresence initial={false}>
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, scale: 1.06 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.6, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            <Image
              src={current.image}
              alt={current.title || "Sri Veda Gayatri Temple"}
              fill
              className="object-cover"
              priority={currentIndex === 0}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Multi-layer overlay for crisp text contrast ── */}
      <div className="absolute inset-0 z-1" style={{ background: "linear-gradient(to bottom, rgba(20,5,8,0.55) 0%, rgba(107,15,26,0.35) 40%, rgba(30,8,12,0.80) 100%)" }} />
      {/* Soft center radial to darken edges */}
      <div className="absolute inset-0 z-2" style={{ background: "radial-gradient(ellipse at center, transparent 30%, rgba(10,2,4,0.45) 100%)" }} />

      {/* ── Nav Arrows ── */}
      {slides.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute z-20 left-4 md:left-8 top-1/2 -translate-y-1/2 w-10 h-10 md:w-11 md:h-11 rounded-full bg-white/10 hover:bg-white/25 border border-white/25 text-white flex items-center justify-center backdrop-blur-sm transition-all duration-200"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
          </button>
          <button
            onClick={goToNext}
            className="absolute z-20 right-4 md:right-8 top-1/2 -translate-y-1/2 w-10 h-10 md:w-11 md:h-11 rounded-full bg-white/10 hover:bg-white/25 border border-white/25 text-white flex items-center justify-center backdrop-blur-sm transition-all duration-200"
            aria-label="Next slide"
          >
            <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
          </button>
        </>
      )}

      {/* ── Slide dots ── */}
      {slides.length > 1 && (
        <div className="absolute z-20 bottom-20 left-1/2 -translate-x-1/2 flex gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={`rounded-full transition-all duration-300 ${
                currentIndex === i ? "w-7 h-2 bg-gold" : "w-2 h-2 bg-white/40 hover:bg-white/70"
              }`}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
      )}

      {/* ── Content ── */}
      <div className="relative z-10 text-center px-5 w-full max-w-4xl mx-auto py-16">

        {/* Logo */}
        {/* <motion.div
          className="flex justify-center mb-7"
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.1 }}
        >
          <div className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden border-2 border-gold/60 shadow-[0_0_30px_rgba(212,160,23,0.3)] ring-4 ring-white/10">
            <Image
              src="/logo.png"
              alt="Sri Veda Gayatri Temple"
              width={96}
              height={96}
              className="w-full h-full object-cover"
              priority
            />
          </div>
        </motion.div> */}

        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -14 }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col items-center"
          >
            {/* Overline label */}
           
            {/* Main title */}
            <h1
              className="font-cinzel font-bold text-white leading-tight drop-shadow-2xl mb-5"
              style={{ fontSize: "clamp(1rem, 2vw, 3rem)", letterSpacing: "0.015em" }}
            >
              {current.title || TEMPLE.name}
            </h1>

            {/* Gold rule */}
            <div className="flex items-center gap-3 mb-5">
              <span className="block w-12 h-px bg-gold/50" />
              <span className="text-gold text-lg">🪷</span>
              <span className="block w-12 h-px bg-gold/50" />
            </div>
             <p className="text-gold text-xs md:text-sm font-semibold tracking-[0.25em] uppercase mb-4 flex items-center gap-3">
              <span className="block w-8 h-px bg-gold/60" />
              {current.subtitle || TEMPLE.tagline}
              <span className="block w-8 h-px bg-gold/60" />
            </p>


            {/* Description */}
            <p
              className="text-white/82 leading-relaxed mb-9 font-light max-w-2xl mx-auto"
              style={{ fontSize: "clamp(0.85rem, 1.6vw, 1.05rem)" }}
            >
              {current.description || TEMPLE.mission}
            </p>

            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={current.ctaLink || "/services"}
                className="btn-primary text-sm md:text-base px-8 md:px-10 py-3 md:py-3.5 shadow-xl"
              >
                {current.ctaText || "Book a Service"}
              </Link>
              <Link
                href={current.cta2Link || "/donate"}
                className="btn-ghost text-sm md:text-base px-8 md:px-10 py-3 md:py-3.5"
              >
                {current.cta2Text || "Donate Now"}
              </Link>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Scroll cue ── */}
      <div className="absolute bottom-7 left-1/2 -translate-x-1/2 z-10 animate-bounce">
        <div className="w-5 h-8 border-2 border-white/30 rounded-full flex items-start justify-center pt-1.5">
          <div className="w-0.5 h-1.5 bg-white/50 rounded-full" />
        </div>
      </div>

    </section>
  );
}
