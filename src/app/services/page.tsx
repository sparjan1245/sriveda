import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { Clock, ArrowRight, Phone } from "lucide-react";
import { IMAGES } from "@/lib/constants";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Our Services",
  description: "Explore our sacred services including Archana, Abhishekam, Homams, Samskaras, and Astrological Consultations.",
};

interface ServiceRow {
  id: string;
  slug: string;
  name: string;
  shortDesc: string | null;
  description: string;
  price: number;
  duration: string | null;
  image: string | null;
  category: string | null;
  active: boolean;
  order: number;
}

export default async function ServicesPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const raw = await (db.service as any)
    .findMany({ where: { active: true }, orderBy: { order: "asc" } })
    .catch(() => []);
  const services = raw as ServiceRow[];

  return (
    <div>

      {/* ── Inner Page Banner ── */}
      <section className="relative h-20 md:h-22 flex items-center justify-center overflow-hidden">
        <Image src={IMAGES.temple1} alt="Temple Services" fill className="object-cover object-center" priority />
        <div className="absolute inset-0 bg-black/55" />
        <div className="absolute inset-0 bg-maroon/60" />
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 70% 80% at 50% 50%, rgba(212,160,23,0.15) 0%, transparent 70%)" }} />
        <div className="absolute bottom-0 inset-x-0 h-px bg-linear-to-r from-transparent via-gold/60 to-transparent" />

        <div className="relative z-10 text-center px-4">
          <div className="flex items-center justify-center gap-2 text-white/70 text-[11px] tracking-widest uppercase mb-3">
            <span>Home</span>
            <span className="text-gold/60">›</span>
            <span className="text-gold/80">Services</span>
          </div>
         
        </div>
      </section>

      {/* ── Intro strip ── */}
      <div className="bg-linear-to-r from-saffron/10 via-gold/10 to-saffron/10 border-y border-gold/20 py-4 px-4">
        <p className="text-center text-foreground/70 text-xs md:text-sm max-w-2xl mx-auto font-cinzel tracking-wide font-light">
          🙏 &nbsp; Each service is a sacred opportunity to connect with the Divine and seek blessings
          for you and your loved ones &nbsp; 🙏
        </p>
      </div>

      {/* ── Services Grid ── */}
      <section className="py-10 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          {services.length === 0 ? (
            <div className="text-center py-16 bg-cream rounded-2xl gold-border">
              <p className="text-foreground/40 font-cinzel text-sm">
                No services available at this time. Please check back soon.
              </p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {services.map((service) => (
                <div
                  key={service.slug}
                  className="group bg-white rounded-2xl overflow-hidden gold-border shadow-sm card-hover flex flex-col"
                >
                  {/* Hover top accent */}
                  <div className="h-1 w-full bg-linear-to-r from-saffron to-gold opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  {/* Image — clean, just category badge on top */}
                  <div className="relative h-48 overflow-hidden bg-cream">
                    <Image
                      src={service.image || IMAGES.puja}
                      alt={service.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-black/20 to-transparent group-hover:from-black/10 transition-colors" />

                    {service.category && (
                      <div className="absolute top-3 left-3">
                        <span className="bg-white/95 backdrop-blur-sm text-maroon text-[10px] font-cinzel font-bold px-3 py-1.5 rounded-full uppercase tracking-widest shadow-sm">
                          {service.category}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Content — all text lives here, never on image */}
                  <div className="flex flex-col flex-1 p-5">

                    {/* Title */}
                    <h2 className="font-cinzel font-bold text-maroon text-sm md:text-base leading-snug mb-3 line-clamp-2">
                      {service.name}
                    </h2>

                    {/* Price + Duration row */}
                    <div className="flex items-center justify-between mb-3 pb-3 border-b border-gold/20">
                      <div>
                        <p className="text-[10px] text-foreground/40 uppercase tracking-wide leading-none mb-1">
                          Starting from
                        </p>
                        <p className="font-cinzel font-bold text-saffron text-xl leading-none">
                          ${service.price}
                        </p>
                      </div>
                      {service.duration && (
                        <div className="flex items-center gap-1.5 bg-cream rounded-lg px-3 py-2 text-foreground/55 text-xs">
                          <Clock className="w-3 h-3 text-gold shrink-0" />
                          {service.duration}
                        </div>
                      )}
                    </div>

                    {/* Description */}
                    <p className="text-foreground/60 text-xs font-light leading-relaxed flex-1 mb-4 line-clamp-2">
                      {service.shortDesc || service.description}
                    </p>

                    {/* CTA */}
                    <Link
                      href={`/services/${service.slug}`}
                      className="btn-primary w-full py-2.5 text-xs flex items-center justify-center gap-2"
                    >
                      Book This Service <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                    <Link
                      href={`/services/${service.slug}`}
                      className="text-center text-[11px] text-foreground/35 hover:text-saffron transition-colors mt-2"
                    >
                      View Details →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── What to expect strip ── */}
      <section className="py-8 md:py-6 px-4 bg-cream pattern-bg">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <span className="badge-gold mb-4 inline-flex text-xs px-3 py-1">Every Booking Includes</span>
            <h2 className="font-cinzel font-bold text-maroon text-lg md:text-xl">What Every Service Includes</h2>
            <div className="flex items-center justify-center gap-4 mt-3">
              <span className="block h-px w-16 md:w-24 bg-linear-to-r from-transparent to-gold/60" />
              <span className="text-gold text-xl">🪷</span>
              <span className="block h-px w-16 md:w-24 bg-linear-to-l from-transparent to-gold/60" />
            </div>
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: "🛕", label: "Trained Priests",       desc: "Vedic procedures" },
              { icon: "🌺", label: "Materials Provided",    desc: "All puja items included" },
              { icon: "🍱", label: "Prasadam Distributed",  desc: "Blessed food after ceremony" },
              { icon: "📧", label: "Digital Receipt",       desc: "Emailed after booking" },
            ].map((item) => (
              <div key={item.label} className="bg-white rounded-2xl p-4 gold-border text-center shadow-sm">
                <div className="text-2xl mb-2">{item.icon}</div>
                <div className="font-cinzel font-semibold text-maroon text-xs mb-1">{item.label}</div>
                <div className="text-foreground/50 text-[11px] font-light">{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Custom service CTA ── */}
      <section className="py-8 md:py-6 px-4 bg-white">
        <div className="max-w-3xl mx-auto">
          <div className="relative rounded-3xl p-7 md:p-10 gold-border-thick shadow-lg overflow-hidden text-center" style={{ background: "linear-gradient(135deg, #FFF8F0 0%, #F5EBD8 100%)" }}>
            <div className="absolute inset-0 pattern-bg opacity-40" />
            <div className="relative">
              <div className="text-3xl mb-3">🙏</div>
              <h3 className="font-cinzel font-bold text-maroon text-lg md:text-xl mb-3">Need a Custom Service?</h3>
              <div className="flex items-center justify-center gap-3 mb-4">
                <span className="block h-px w-12 bg-linear-to-r from-transparent to-gold/60" />
                <span className="text-gold">🪷</span>
                <span className="block h-px w-12 bg-linear-to-l from-transparent to-gold/60" />
              </div>
              <p className="text-foreground/65 text-sm font-light mb-6 max-w-md mx-auto leading-relaxed">
                Our priests can perform home visits for special ceremonies and rituals.
                Contact us to discuss your specific spiritual needs.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/contact" className="btn-primary px-8 py-2.5">
                  <Phone className="w-4 h-4 mr-2" /> Contact Us
                </Link>
                <Link href="/auth/register" className="btn-secondary px-8 py-2.5">Register as Devotee</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
