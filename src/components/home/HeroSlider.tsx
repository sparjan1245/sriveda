"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { TEMPLE, IMAGES } from "@/lib/constants";

const sliderImages = [
  IMAGES.hero,
  IMAGES.altar,
  IMAGES.temple1,
  IMAGES.puja
];

export default function HeroSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % sliderImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? sliderImages.length - 1 : prevIndex - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % sliderImages.length);
  };

  return (
    <section className="relative min-h-[600px] md:min-h-[700px] flex items-center justify-center overflow-hidden">
      {/* Background Slider */}
      <div className="absolute inset-0">
        <AnimatePresence initial={false}>
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            <Image
              src={sliderImages[currentIndex]}
              alt={`Sri Veda Gayatri Temple ${currentIndex + 1}`}
              fill
              className="object-cover"
              priority={currentIndex === 0}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      <div
        className="absolute inset-0 z-[5]"
        style={{ background: "linear-gradient(to bottom, rgba(107,15,26,0.65), rgba(107,15,26,0.45), rgba(107,15,26,0.85))" }}
      />

      {/* Navigation Arrows */}
      <div className="absolute z-[15] inset-y-0 left-4 md:left-8 flex items-center">
        <button
          onClick={goToPrevious}
          className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-black/20 hover:bg-black/50 border border-white/20 text-white flex items-center justify-center backdrop-blur-sm transition-all"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-6 h-6 md:w-8 md:h-8" />
        </button>
      </div>
      <div className="absolute z-[15] inset-y-0 right-4 md:right-8 flex items-center">
        <button
          onClick={goToNext}
          className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-black/20 hover:bg-black/50 border border-white/20 text-white flex items-center justify-center backdrop-blur-sm transition-all"
          aria-label="Next slide"
        >
          <ChevronRight className="w-6 h-6 md:w-8 md:h-8" />
        </button>
      </div>

      {/* Slide Indicators */}
      <div className="absolute z-[15] bottom-24 left-1/2 -translate-x-1/2 flex gap-2">
        {sliderImages.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`transition-all duration-300 rounded-full ${
              currentIndex === index ? "w-8 h-2 bg-saffron" : "w-2 h-2 bg-white/50 hover:bg-white/80"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <div className="flex justify-center mb-6">
          <Image
            src="/logo.png"
            alt="Sri Veda Gayatri Temple Logo"
            width={120}
            height={120}
            className="rounded-full object-contain shadow-2xl bg-white/10 p-2 backdrop-blur-md border border-white/30"
          />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <h1 className="font-cinzel font-bold text-3xl md:text-5xl lg:text-6xl text-white mb-4 leading-tight drop-shadow-lg">
            Sri Veda Gayatri Temple
          </h1>
          <p className="font-cinzel text-gold text-lg md:text-2xl mb-6 drop-shadow-md">
            {TEMPLE.tagline}
          </p>
          <p className="text-white/95 text-sm md:text-base max-w-2xl mx-auto leading-relaxed mb-8 drop-shadow-md font-medium">
            {TEMPLE.mission}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/services" className="btn-primary text-base px-8 py-3.5 shadow-lg">
              Book a Service
            </Link>
            <Link
              href="/donate"
              className="text-white border-2 border-white/80 font-semibold text-base px-8 py-3.5 rounded hover:bg-white hover:text-maroon transition-colors inline-block text-center shadow-lg backdrop-blur-sm"
            >
              Donate Now
            </Link>
          </div>
        </motion.div>
      </div>
      
      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/60 animate-bounce z-10">
        <div className="w-6 h-10 border-2 border-white/40 rounded-full flex items-start justify-center pt-2">
          <div className="w-1 h-2 bg-white/60 rounded-full" />
        </div>
      </div>
    </section>
  );
}
