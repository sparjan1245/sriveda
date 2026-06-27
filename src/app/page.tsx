import Image from "next/image";
import Link from "next/link";
import { Calendar, Heart, Star, Users, ArrowRight, CheckCircle } from "lucide-react";
import { TEMPLE, IMAGES } from "@/lib/constants";
import { db } from "@/lib/db";
import HeroSlider, { type BannerSlide, type PanchangamData } from "@/components/home/HeroSlider";
import { ServiceSlider } from "@/components/home/ServiceSlider";
import { GallerySection } from "@/components/home/GallerySection";
import TestimonialCarousel from "@/components/home/TestimonialCarousel";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const todayStr = new Date().toISOString().split("T")[0];
  const [y, m, d] = todayStr.split("-").map(Number);
  const dayStart = new Date(Date.UTC(y, m - 1, d));
  const dayEnd   = new Date(dayStart.getTime() + 86400000);

  const [dbBanners, dbServices, dbTiers, dbTestimonials, dbBoardMembers, dbGalleryImages, dbGalleryVideos, panchangamRow] = await Promise.all([
    db.banner.findMany({ where: { active: true }, orderBy: { order: "asc" } }).catch(() => []),
    db.service.findMany({ where: { active: true }, orderBy: { createdAt: "desc" } }).catch(() => []),
    db.donationTier.findMany({ where: { active: true }, orderBy: { order: "asc" } }).catch(() => []),
    db.testimonial.findMany({ where: { active: true }, orderBy: { order: "asc" } }).catch(() => []),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (db as any).boardMember.findMany({ where: { active: true }, orderBy: { order: "asc" } }).catch(() => []),
    db.galleryImage.findMany({ orderBy: { createdAt: "desc" }, take: 8 }).catch(() => []),
    db.galleryVideo.findMany({ orderBy: { createdAt: "desc" }, take: 5 }).catch(() => []),
    db.panchangam.findFirst({ where: { date: { gte: dayStart, lt: dayEnd } } }).catch(() => null),
  ]);

  const todayPanchangam: PanchangamData | null = panchangamRow
    ? { ...panchangamRow, date: panchangamRow.date.toISOString() }
    : null;
  const slides: BannerSlide[] = dbBanners;
  const services = dbServices;
  const donationTiers = dbTiers;
  const testimonials = dbTestimonials;

  return (
    <div className="overflow-x-hidden">

      {/* ─────────────────────────── HERO ─────────────────────────── */}
      <HeroSlider slides={slides} panchangam={todayPanchangam} />

      

      {/* ─────────────────── FEATURED EVENT FLYER ─────────────────── */}
      <section className="relative py-10 md:py-14 px-4 overflow-hidden" style={{ background: "linear-gradient(160deg,#FFF8F0 0%,#FDF3E3 50%,#FFF8F0 100%)" }}>
        <div className="absolute inset-0 pattern-bg opacity-30 pointer-events-none" />
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 70% 60% at 50% 0%, rgba(212,160,23,0.10), transparent 70%)" }} />

        <div className="relative max-w-5xl mx-auto">
          {/* Section header */}
          <div className="text-center mb-8">
            <span className="badge-gold mb-4 inline-flex animate-pulse">Upcoming Event</span>
            <h2 className="font-cinzel font-bold text-xl md:text-2xl text-maroon mb-2 leading-tight">
              Moola Vigraha Pratishtha Mahotsavam
            </h2>
            <div className="flex items-center justify-center gap-4 mb-3">
              <span className="block h-px w-16 md:w-28 bg-gradient-to-r from-transparent to-gold/60" />
              <span className="text-gold text-2xl">🪷</span>
              <span className="block h-px w-16 md:w-28 bg-gradient-to-l from-transparent to-gold/60" />
            </div>
            <p className="text-base text-foreground/70 max-w-xl mx-auto leading-relaxed">
              A grand 3-day celebration — July 4 to 6, 2026 at Sri Veda Gayatri Temple, Manteca, CA.
              All devotees are cordially invited.
            </p>
          </div>

          {/* Flyer image card */}
          <div className="flex justify-center">
            <div className="relative rounded-3xl overflow-hidden gold-border shadow-2xl max-w-lg w-full group">
              <div className="h-1 bg-gradient-to-r from-saffron via-gold to-saffron" />
              <Image
                src="/flayer.jpeg"
                alt="Moola Vigraha Pratishtha Mahotsavam — July 4–6 2026"
                width={600}
                height={850}
                className="w-full h-auto object-contain block"
                priority
              />
              <div className="h-1 bg-gradient-to-r from-saffron via-gold to-saffron" />
            </div>
          </div>

          {/* CTA row */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
            <Link href="/events" className="btn-primary px-10 py-3 shadow-lg">
              View All Events
            </Link>
            <Link href="/contact" className="btn-secondary px-10 py-3">
              Contact Us
            </Link>
          </div>
        </div>
      </section>

      {/* ─────────────────────── PURPOSE + STATS ──────────────────── */}
      <section className="relative py-8 md:py-6 px-4 overflow-hidden" style={{ background: "linear-gradient(160deg, #FFF8F0 0%, #F5EBD8 50%, #FFF8F0 100%)" }}>
        {/* Decorative OM watermark */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
          <span className="text-maroon/[0.04] font-cinzel leading-none -translate-y-8" style={{ fontSize: "min(65vw,600px)" }}>ॐ</span>
        </div>

        <div className="relative max-w-6xl mx-auto">
          {/* Section label + heading */}
          <div className="text-center mb-8 md:mb-10">
            <span className="badge-gold mb-5 inline-flex text-md md:text-md text-maroon px-4 py-1.5">Our Purpose</span>
            <h2 className="font-cinzel font-bold text-xl md:text-2xl text-maroon mb-3 leading-tight drop-shadow-sm">
              A Sanctuary for the Soul
            </h2>
            {/* Decorative divider */}
            <div className="flex items-center justify-center gap-4 mb-2">
              <span className="block h-px w-20 md:w-32 bg-gradient-to-r from-transparent to-gold/60" />
              <span className="text-gold text-2xl md:text-3xl drop-shadow-md">🪷</span>
              <span className="block h-px w-20 md:w-32 bg-gradient-to-l from-transparent to-gold/60" />
            </div>
            <p className="text-base font-normal leading-relaxed max-w-3xl mx-auto drop-shadow-sm">
              {TEMPLE.mission} As a&nbsp;
              <strong className="text-maroon font-semibold tracking-wide">California Registered 501(c)(3) Non-Profit</strong>,
              every contribution goes directly toward serving the spiritual needs of our community.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-gold/20 rounded-3xl overflow-hidden shadow-2xl border border-gold/30">
            {[
              { icon: <Star className="w-5 h-5 md:w-6 md:h-6" />, value: "4+",   label: "Sacred Services",   bg: "bg-white" },
              { icon: <Calendar className="w-5 h-5 md:w-6 md:h-6" />, value: "50+",  label: "Events Per Year",   bg: "bg-cream/90" },
              { icon: <Users className="w-5 h-5 md:w-6 md:h-6" />, value: "500+", label: "Community Members", bg: "bg-white" },
              { icon: <Heart className="w-5 h-5 md:w-6 md:h-6" />, value: "2024", label: "Year Founded",       bg: "bg-cream/90" },
            ].map((s) => (
              <div
                key={s.label}
                className={`relative flex flex-col items-center justify-center py-4 md:py-6 px-6 text-center ${s.bg} group transition-all duration-300 hover:bg-saffron/5`}
              >
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-saffron to-gold opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-gradient-to-br from-saffron/10 to-gold/10 flex items-center justify-center text-saffron mb-4 shadow-sm group-hover:from-saffron/20 group-hover:to-gold/20 transition-colors duration-300 group-hover:scale-110 group-hover:shadow-md">
                  {s.icon}
                </div>
                <div className="font-cinzel font-bold text-lg md:text-xl text-maroon mb-1 leading-none drop-shadow-sm group-hover:text-gold transition-colors duration-300">{s.value}</div>
                <div className="text-foreground/60 text-xs md:text-sm font-semibold tracking-widest uppercase">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────── SERVICES ─────────────────────────── */}
      {services.length > 0 && (
        <section className="py-12 md:py-16 px-4 relative overflow-hidden" style={{ background: "linear-gradient(160deg,#ffffff 0%,#FFF8F0 50%,#ffffff 100%)" }}>
          <div className="absolute inset-0 pattern-bg opacity-20 pointer-events-none" />
          <div className="max-w-7xl mx-auto relative">

            {/* Centered header */}
            <div className="text-center mb-10 md:mb-12">
              <span className="badge-gold mb-4 inline-flex">What We Offer</span>
              <h2 className="font-cinzel font-bold text-2xl md:text-3xl text-maroon mb-3 leading-tight drop-shadow-sm">
                Our Sacred Services
              </h2>
              <div className="flex items-center justify-center gap-4 mb-4">
                <span className="block h-px w-20 md:w-32 bg-linear-to-r from-transparent to-gold/60" />
                <span className="text-gold text-2xl md:text-3xl drop-shadow-md">🪷</span>
                <span className="block h-px w-20 md:w-32 bg-linear-to-l from-transparent to-gold/60" />
              </div>
              <p className="text-base max-w-2xl mx-auto leading-relaxed">
                Experience the divine through our traditional Vedic rituals, performed by learned priests to bring peace, prosperity, and spiritual well-being to you and your family.
              </p>
            </div>

            <ServiceSlider services={services} />

            <div className="text-center mt-10">
              <Link href="/services" className="btn-secondary inline-flex items-center gap-2 px-10 py-3">
                View All Services <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ─────────────────────── ABOUT SPLIT ──────────────────────── */}
      <section className=" py-8 md:py-6 px-4  relative overflow-hidden bg-cream">
        {/* Pattern + OM watermark — consistent with other cream sections */}
        <div className="absolute inset-0 pattern-bg opacity-40 pointer-events-none" />
        <div className="absolute inset-0 flex items-center justify-end pr-8 pointer-events-none select-none overflow-hidden">
          <span className="text-maroon/3 font-cinzel leading-none" style={{ fontSize: "min(55vw,480px)" }}>ॐ</span>
        </div>

        <div className="relative max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">

            {/* ── Text column ── */}
            <div>
              <span className="badge-gold mb-5 inline-flex">Who We Are</span>

            <h2 className="font-cinzel font-bold text-xl md:text-2xl text-maroon mb-3 leading-tight drop-shadow-sm">
                About Our Sacred Temple
              </h2>

              {/* Lotus divider */}
              <div className="lotus-divider mb-2 max-w-xs">
                <span className="text-gold text-lg shrink-0">🪷</span>
              </div>

              <p className="leading-relaxed mb-4 text-base">
                Founded in 2024, Sri Veda Gayatri Temple is a spiritual and charitable non-profit
                dedicated to serving the Hindu community in and around Manteca, California.
              </p>
              <p className="leading-relaxed mb-8 text-base">
                We offer daily pujas by trained priests, cultural programs in music, dance, Sanskrit,
                and yoga, community events, and weekly Annadaanam (food offering).
              </p>

              <blockquote className="relative bg-white rounded-2xl p-5 gold-border shadow-sm mb-8">
                <span className="absolute -top-4 left-5 text-6xl text-gold/15 font-serif leading-none select-none">&ldquo;</span>
                <p className="font-cinzel text-maroon text-sm md:text-[15px] italic leading-relaxed relative z-10">
                  {TEMPLE.quote}
                </p>
                <div className="divider-gold mt-4" />
              </blockquote>

              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/about" className="btn-primary px-8">Learn More</Link>
                <Link href="/auth/register" className="btn-secondary px-8">Become a Devotee</Link>
              </div>
            </div>

            {/* ── Single image ── */}
            <div className="relative rounded-3xl overflow-hidden gold-border shadow-xl h-100 lg:h-115 group">
              <Image
                src={IMAGES.about1}
                alt="Sri Veda Gayatri Temple"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-linear-to-t from-maroon/60 via-maroon/10 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <p className="font-cinzel font-bold text-white text-sm md:text-base drop-shadow-lg">
                  Sri Veda Gayatri Temple
                </p>
                <p className="text-white/65 text-xs mt-0.5">Manteca, California · Est. {TEMPLE.founded}</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ────────────────────── DONATE BANNER ─────────────────────── */}
      {donationTiers.length > 0 && (
      <section className="relative py-8 md:py-6 px-4 overflow-hidden" style={{ background: "linear-gradient(135deg,#6B0F1A 0%,#4A0A12 50%,#2D0208 100%)" }}>
        {/* Decorations */}
        <div className="absolute inset-0 pattern-bg opacity-10 pointer-events-none" />
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 80% 70% at 50% 50%, rgba(212,160,23,0.10) 0%, transparent 70%)" }} />
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
          <span className="text-white/2.5 font-cinzel leading-none" style={{ fontSize: "min(65vw,560px)" }}>ॐ</span>
        </div>
        {/* Top + bottom gold lines */}
        <div className="absolute top-0 inset-x-0 h-px bg-linear-to-r from-transparent via-gold/40 to-transparent" />
        <div className="absolute bottom-0 inset-x-0 h-px bg-linear-to-r from-transparent via-gold/40 to-transparent" />

        <div className="relative max-w-5xl mx-auto text-center text-white">

          <h2 className="font-cinzel font-bold text-xl md:text-2xl lg:text-3xl mb-3 leading-tight">
            Support Our Sacred Mission
          </h2>

          {/* Divider */}
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="block h-px w-12 md:w-20 bg-linear-to-r from-transparent to-gold/50" />
            <span className="text-gold/80 text-sm tracking-widest">✦</span>
            <span className="block h-px w-12 md:w-20 bg-linear-to-l from-transparent to-gold/50" />
          </div>

          <p className="text-white text-sm leading-relaxed mb-8 max-w-xl mx-auto">
            Every contribution sustains daily pujas, cultural programs, and community service.
          </p>

          {/* Tier tiles — first 3 from DB + custom */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8 max-w-3xl mx-auto">
            {donationTiers.slice(0, 3).map((t) => (
              <Link
                key={t.id}
                href="/donate"
                className="group relative rounded-2xl py-5 px-4 text-center overflow-hidden transition-all duration-300 hover:-translate-y-1"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(212,160,23,0.20)" }}
              >
                <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-gold/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute inset-0 bg-linear-to-b from-gold/[0.06] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative">
                  <div className="font-cinzel font-bold text-xl md:text-2xl text-gold mb-1 group-hover:scale-105 transition-transform duration-200 inline-block">
                    ${t.amount}
                  </div>
                  <div className="text-white/70 text-[11px] font-semibold uppercase tracking-wide mb-0.5 line-clamp-1">{t.name}</div>
                  <div className="text-white/30 text-[10px] line-clamp-1">{t.description}</div>
                </div>
              </Link>
            ))}
            {/* Custom tile */}
            <Link
              href="/donate"
              className="group relative rounded-2xl py-5 px-4 text-center overflow-hidden transition-all duration-300 hover:-translate-y-1"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(212,160,23,0.20)" }}
            >
              <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-gold/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute inset-0 bg-linear-to-b from-gold/[0.06] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative">
                <div className="font-cinzel font-bold text-xl md:text-2xl text-gold mb-1 group-hover:scale-105 transition-transform duration-200 inline-block">
                  Custom
                </div>
                <div className="text-white/70 text-[11px] font-semibold uppercase tracking-wide mb-0.5">Your Amount</div>
                <div className="text-white/30 text-[10px]">Any contribution</div>
              </div>
            </Link>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 items-center justify-center">
            <Link href="/donate" className="btn-primary px-12 py-3 shadow-xl">
              Donate Now
            </Link>
            <Link href="/donate" className="text-gold/70 hover:text-gold text-xs font-semibold tracking-widest uppercase underline underline-offset-4 decoration-gold/30 hover:decoration-gold transition-all duration-200">
              View All Seva Options
            </Link>
          </div>
        </div>
      </section>
      )}

      {/* ──────────────────── BOARD OF DIRECTORS ──────────────────── */}
      {dbBoardMembers.length > 0 && (
        <section className="py-8 md:py-6 px-4 bg-white relative overflow-hidden">
          <div className="absolute inset-0 pattern-bg opacity-20 pointer-events-none" />
          <div className="relative max-w-6xl mx-auto">
            <div className="text-center mb-8 md:mb-10">
              <span className="badge-gold mb-4 inline-flex text-xs md:text-sm px-4 py-1.5">Leadership</span>
              <h2 className="font-cinzel font-bold text-xl md:text-2xl text-maroon leading-tight mb-3 drop-shadow-sm">
                Board of Directors
              </h2>
              <div className="flex items-center justify-center gap-4">
                <span className="block h-px w-20 md:w-32 bg-linear-to-r from-transparent to-gold/60" />
                <span className="text-gold text-2xl md:text-3xl drop-shadow-md">🪷</span>
                <span className="block h-px w-20 md:w-32 bg-linear-to-l from-transparent to-gold/60" />
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {(dbBoardMembers as any[]).map((member, i) => {
                const isChairman = i === 0;
                return (
                  <div key={member.id} className={`group relative bg-white rounded-2xl overflow-hidden card-hover flex flex-col items-center text-center ${isChairman ? "gold-border-thick shadow-xl" : "gold-border shadow-md"}`}>
                    <div className={`h-1 w-full bg-linear-to-r from-saffron to-gold ${isChairman ? "opacity-100" : "opacity-0 group-hover:opacity-100 transition-opacity duration-300"}`} />
                    <div className="pt-6 pb-4 px-4 w-full flex flex-col items-center">
                      <div className={`relative rounded-full overflow-hidden mb-4 shrink-0 ${isChairman ? "w-24 h-24 md:w-28 md:h-28 ring-4 ring-gold/40 ring-offset-2" : "w-20 h-20 md:w-24 md:h-24 ring-2 ring-gold/25 ring-offset-2 group-hover:ring-gold/50 transition-all duration-300"}`}>
                        {member.image ? (
                          <Image src={member.image} alt={member.name} fill className="object-cover transition-transform duration-500 group-hover:scale-110" />
                        ) : (
                          <div className="w-full h-full bg-maroon/10 flex items-center justify-center font-cinzel font-bold text-maroon text-xl">
                            {member.name[0]}
                          </div>
                        )}
                        <div className="absolute inset-0 bg-linear-to-t from-maroon/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </div>
                      {isChairman && <span className="badge-gold mb-2.5 text-[10px]">Founder</span>}
                      <h4 className="font-cinzel font-semibold text-maroon text-xs md:text-sm leading-snug mb-1.5">{member.name}</h4>
                      <div className="divider-gold w-8 mb-2" />
                      <p className="text-saffron text-[11px] font-medium tracking-wide">{member.title}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="text-center mt-8">
              <Link href="/about" className="btn-secondary px-10">Meet Our Full Team</Link>
            </div>
          </div>
        </section>
      )}

      {/* ──────────────────────── GALLERY ────────────────────────── */}
      {(dbGalleryImages.length > 0 || dbGalleryVideos.length > 0) && (
        <section className="py-8 md:py-6 px-4 bg-white relative overflow-hidden">
          <div className="absolute inset-0 pattern-bg opacity-20 pointer-events-none" />
          <div className="relative max-w-7xl mx-auto">
            <div className="text-center mb-8 md:mb-10">
              <span className="badge-gold mb-4 inline-flex text-xs md:text-sm px-4 py-1.5">Our Moments</span>
              <h2 className="font-cinzel font-bold text-xl md:text-2xl text-maroon leading-tight mb-3 drop-shadow-sm">
                Gallery &amp; Media
              </h2>
              <div className="flex items-center justify-center gap-4">
                <span className="block h-px w-20 md:w-32 bg-linear-to-r from-transparent to-gold/60" />
                <span className="text-gold text-2xl md:text-3xl drop-shadow-md">🪷</span>
                <span className="block h-px w-20 md:w-32 bg-linear-to-l from-transparent to-gold/60" />
              </div>
            </div>
            <GallerySection
              photos={dbGalleryImages.map((img) => ({
                src: img.url,
                alt: img.caption || "Temple photo",
                caption: img.caption || undefined,
              }))}
              videos={dbGalleryVideos.map((v) => {
                const ytMatch = v.url.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
                return {
                  thumbnail: v.thumbnail || (ytMatch ? `https://img.youtube.com/vi/${ytMatch[1]}/mqdefault.jpg` : IMAGES.hero),
                  title: v.title || "Temple Video",
                  href: v.url,
                };
              })}
            />
            <div className="text-center mt-8">
              <Link href="/gallery" className="btn-secondary px-10">View Full Gallery</Link>
            </div>
          </div>
        </section>
      )}

      {/* ─────────────────────── TESTIMONIALS ─────────────────────── */}
      {testimonials.length > 0 && (
        <section className="py-8 md:py-6 px-4 relative overflow-hidden" style={{ background: "linear-gradient(160deg,#FFF8F0 0%,#F5EBD8 50%,#FFF8F0 100%)" }}>
          <div className="absolute inset-0 pattern-bg opacity-40 pointer-events-none" />
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
            <span className="text-maroon/3 font-cinzel leading-none" style={{ fontSize: "min(65vw,560px)" }}>ॐ</span>
          </div>
          <div className="relative max-w-3xl mx-auto">
            <div className="text-center mb-8 md:mb-10">
              <span className="badge-gold mb-4 inline-flex text-xs md:text-sm px-4 py-1.5">Devotee Stories</span>
              <h2 className="font-cinzel font-bold text-xl md:text-2xl text-maroon leading-tight mb-3 drop-shadow-sm">
                Blessings &amp; Testimonials
              </h2>
              <div className="flex items-center justify-center gap-4">
                <span className="block h-px w-20 md:w-32 bg-linear-to-r from-transparent to-gold/60" />
                <span className="text-gold text-2xl md:text-3xl drop-shadow-md">🪷</span>
                <span className="block h-px w-20 md:w-32 bg-linear-to-l from-transparent to-gold/60" />
              </div>
            </div>
            <TestimonialCarousel items={testimonials} />
          </div>
        </section>
      )}

      {/* ────────────────────── REGISTER CTA ──────────────────────── */}
      <section className="relative py-8 md:py-6 px-4 overflow-hidden bg-cream">
        <div className="absolute inset-0 pattern-bg opacity-40 pointer-events-none" />

        <div className="relative max-w-5xl mx-auto">
          <div className="bg-white rounded-3xl gold-border shadow-xl overflow-hidden">
            <div className="h-1 bg-linear-to-r from-saffron via-gold to-saffron" />

            <div className="p-6 md:p-10">
              <div className="text-center mb-6">
                <span className="badge-gold mb-4 inline-flex text-xs md:text-sm px-4 py-1.5">Join Us</span>
                <h2 className="font-cinzel font-bold text-xl md:text-2xl text-maroon mb-3 leading-tight drop-shadow-sm">
                  Become a Devotee
                </h2>
                <div className="flex items-center justify-center gap-4 mb-3">
                  <span className="block h-px w-20 md:w-32 bg-linear-to-r from-transparent to-gold/60" />
                  <span className="text-gold text-xl drop-shadow-md">🪷</span>
                  <span className="block h-px w-20 md:w-32 bg-linear-to-l from-transparent to-gold/60" />
                </div>
                <p className="text-base max-w-lg mx-auto leading-relaxed">
                  Create your free account to unlock all temple services, stay connected,
                  and receive your tax receipts digitally.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-2.5 mb-6">
                {[
                  "Book puja and homam services online",
                  "Receive instant digital receipts for tax deductions",
                  "Get early access to festival registrations",
                  "Track your donation history and download PDFs",
                  "Add family members for collective blessings",
                  "Receive reminders for upcoming temple events",
                ].map((benefit) => (
                  <div key={benefit} className="flex items-start gap-2.5 bg-cream/60 rounded-xl p-3 border border-gold/15">
                    <CheckCircle className="w-3.5 h-3.5 text-saffron shrink-0 mt-0.5" />
                    <span className="text-xs text-foreground/70 leading-snug">{benefit}</span>
                  </div>
                ))}
              </div>

              <div className="text-center">
                <Link href="/auth/register" className="btn-primary px-10 shadow-md">
                  Register Free — It Only Takes a Minute
                </Link>
                <p className="text-sm mt-3">
                  Already a member?{" "}
                  <Link href="/auth/login" className="text-saffron hover:underline">Sign in here</Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="bg-maroon py-8 px-4">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-5">
          <div className="text-center sm:text-left">
            <h3 className="font-cinzel font-bold text-white text-lg mb-1">Have Questions?</h3>
            <p className="text-white/60 text-sm">Our team is here to help with any inquiries about services or events.</p>
          </div>
          <div className="flex gap-3 shrink-0">
            <a href="tel:+16692138780" className="bg-gold text-white font-semibold px-6 py-2.5 rounded-lg text-sm hover:bg-gold/90 transition-colors shadow-sm">
              Call Us
            </a>
            <Link href="/contact" className="border border-white/30 text-white font-semibold px-6 py-2.5 rounded-lg text-sm hover:bg-white/10 transition-colors">
              Contact Us
            </Link>
          </div>
        </div>
      </div>

    </div>
  );
}
