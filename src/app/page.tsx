import Image from "next/image";
import Link from "next/link";
import { Calendar, Heart, Star, Users, Phone, MapPin, Clock, ArrowRight, CheckCircle, Sparkles } from "lucide-react";
import { TEMPLE, IMAGES, BOARD_MEMBERS, SERVICES as STATIC_SERVICES } from "@/lib/constants";
import { db } from "@/lib/db";
import HeroSlider, { type BannerSlide } from "@/components/home/HeroSlider";
import { ServiceSlider } from "@/components/home/ServiceSlider";
import { GallerySection } from "@/components/home/GallerySection";

const DEFAULT_SLIDES: BannerSlide[] = [
  { id: "d1", image: IMAGES.hero },
  { id: "d3", image: IMAGES.temple1 },
  { id: "d4", image: IMAGES.puja },
];

export default async function HomePage() {
  const dbBanners = await db.banner
    .findMany({ where: { active: true }, orderBy: { order: "asc" } })
    .catch(() => []);

  const dbServices = await db.service
    .findMany({ where: { active: true }, orderBy: { createdAt: "desc" } })
    .catch(() => []);

  const slides: BannerSlide[] = dbBanners.length > 0 ? dbBanners : DEFAULT_SLIDES;
  const services = dbServices.length > 0 ? dbServices : STATIC_SERVICES;

  return (
    <div className="overflow-x-hidden">

      {/* ─────────────────────────── HERO ─────────────────────────── */}
      <HeroSlider slides={slides} />

      {/* ─────────────────────── INFO STRIP ───────────────────────── */}
      <div className="bg-maroon text-cream">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-white/10">
            {[
              { icon: <Clock className="w-4 h-4" />, text: "Mon–Sun: 5:00 PM – 9:00 PM" },
              { icon: <MapPin className="w-4 h-4" />, text: "702 W Yosemite Ave, Manteca, CA" },
              { icon: <Phone className="w-4 h-4" />, text: "+1 (669) 213-8780", href: "tel:+16692138780" },
            ].map((item) => (
              <div key={item.text} className="flex items-center justify-center gap-2.5 py-3 px-4 text-xs font-medium">
                <span className="text-gold shrink-0">{item.icon}</span>
                {item.href
                  ? <a href={item.href} className="hover:text-gold transition-colors">{item.text}</a>
                  : <span className="text-cream/80">{item.text}</span>}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─────────────────────── PURPOSE + STATS ──────────────────── */}
      <section className="relative py-8 md:py-6 px-4 overflow-hidden" style={{ background: "linear-gradient(160deg, #FFF8F0 0%, #F5EBD8 50%, #FFF8F0 100%)" }}>
        {/* Decorative OM watermark */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
          <span className="text-maroon/[0.04] font-cinzel leading-none -translate-y-8" style={{ fontSize: "min(65vw,600px)" }}>ॐ</span>
        </div>

        <div className="relative max-w-6xl mx-auto">
          {/* Section label + heading */}
          <div className="text-center mb-8 md:mb-10">
            <span className="badge-gold mb-5 inline-flex text-xs md:text-sm px-4 py-1.5">Our Purpose</span>
            <h2 className="font-cinzel font-bold text-lg md:text-xl text-maroon mb-3 leading-tight drop-shadow-sm">
              A Sanctuary for the Soul
            </h2>
            {/* Decorative divider */}
            <div className="flex items-center justify-center gap-4 mb-2">
              <span className="block h-px w-20 md:w-32 bg-gradient-to-r from-transparent to-gold/60" />
              <span className="text-gold text-2xl md:text-3xl drop-shadow-md">🪷</span>
              <span className="block h-px w-20 md:w-32 bg-gradient-to-l from-transparent to-gold/60" />
            </div>
            <p className="text-foreground/75 text-sm font-light leading-relaxed max-w-3xl mx-auto drop-shadow-sm">
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
      <section className="py-8 md:py-6 px-4 bg-white relative">
        <div className="max-w-7xl mx-auto">

          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10">
            <div>
              <span className="badge-gold mb-4 inline-flex text-xs md:text-sm px-4 py-1.5">What We Offer</span>
              <h2 className="font-cinzel font-bold text-lg md:text-xl text-maroon leading-tight drop-shadow-sm">
                Our Sacred Services
              </h2>
            </div>
            <Link href="/services" className="btn-secondary px-6 py-2.5 text-xs md:text-sm shrink-0 self-start md:self-auto hover:-translate-y-0.5 transition-transform">
              View All Services <ArrowRight className="inline w-3.5 h-3.5 ml-1" />
            </Link>
          </div>

          <ServiceSlider services={services} />
        </div>
      </section>

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

            <h2 className="font-cinzel font-bold text-lg md:text-xl text-maroon mb-3 leading-tight drop-shadow-sm">
                About Our Sacred Temple
              </h2>

              {/* Lotus divider */}
              <div className="lotus-divider mb-2 max-w-xs">
                <span className="text-gold text-lg shrink-0">🪷</span>
              </div>

              <p className="text-foreground/65 leading-relaxed mb-4 text-[15px]">
                Founded in 2024, Sri Veda Gayatri Temple is a spiritual and charitable non-profit
                dedicated to serving the Hindu community in and around Manteca, California.
              </p>
              <p className="text-foreground/65 leading-relaxed mb-8 text-[15px]">
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

            {/* ── Photo mosaic ── */}
            <div className="grid grid-cols-12 grid-rows-6 gap-3 h-100 lg:h-115">
              <div className="col-span-7 row-span-4 relative rounded-2xl overflow-hidden gold-border card-hover shadow-md">
                <Image src={IMAGES.about1} alt="Temple interior" fill className="object-cover" />
                <div className="absolute inset-0 bg-linear-to-t from-maroon/30 to-transparent opacity-60" />
              </div>
              <div className="col-span-5 row-span-3 relative rounded-2xl overflow-hidden gold-border card-hover shadow-md">
                <Image src={IMAGES.about2} alt="Temple puja" fill className="object-cover" />
              </div>
              <div className="col-span-5 row-span-3 relative rounded-2xl overflow-hidden gold-border card-hover shadow-md">
                <Image src={IMAGES.about3} alt="Temple community" fill className="object-cover" />
              </div>
              <div className="col-span-7 row-span-2 relative rounded-2xl overflow-hidden gold-border card-hover shadow-md">
                <Image src={IMAGES.about4} alt="Temple event" fill className="object-cover" />
                <div className="absolute inset-0 bg-linear-to-t from-maroon/30 to-transparent opacity-60" />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ────────────────────── DONATE BANNER ─────────────────────── */}
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

          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-gold/10 border border-gold/25 rounded-full px-4 py-1.5 text-[11px] font-semibold tracking-widest uppercase mb-5">
            <Sparkles className="w-3 h-3 text-gold" />
            <span className="text-gold">501(c)(3) Nonprofit · Tax Deductible</span>
          </div>

          <h2 className="font-cinzel font-bold text-xl md:text-2xl lg:text-3xl mb-3 leading-tight">
            Support Our Sacred Mission
          </h2>

          {/* Divider */}
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="block h-px w-12 md:w-20 bg-linear-to-r from-transparent to-gold/50" />
            <span className="text-gold/80 text-sm tracking-widest">✦</span>
            <span className="block h-px w-12 md:w-20 bg-linear-to-l from-transparent to-gold/50" />
          </div>

          <p className="text-white/55 text-sm leading-relaxed mb-2 max-w-xl mx-auto">
            Every contribution sustains daily pujas, cultural programs, and community service.
          </p>
          <p className="text-gold/50 text-[11px] mb-8 font-medium tracking-wide">
            Tax ID: {TEMPLE.taxId} · Fully tax-deductible under U.S. law
          </p>

          {/* Tier tiles */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8 max-w-3xl mx-auto">
            {[
              { amount: "$51",    label: "Anna Prasadam",   desc: "Feed the community" },
              { amount: "$75",    label: "Pushpa Alankara", desc: "Flower offerings" },
              { amount: "$116",   label: "Abhishekam Seva", desc: "Sacred bath ritual" },
              { amount: "Custom", label: "Your Amount",     desc: "Any contribution" },
            ].map((t) => (
              <Link
                key={t.label}
                href="/donate"
                className="group relative rounded-2xl py-5 px-4 text-center overflow-hidden transition-all duration-300 hover:-translate-y-1"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(212,160,23,0.20)" }}
              >
                <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-gold/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute inset-0 bg-linear-to-b from-gold/[0.06] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative">
                  <div className="font-cinzel font-bold text-xl md:text-2xl text-gold mb-1 group-hover:scale-105 transition-transform duration-200 inline-block">
                    {t.amount}
                  </div>
                  <div className="text-white/70 text-[11px] font-semibold uppercase tracking-wide mb-0.5">{t.label}</div>
                  <div className="text-white/30 text-[10px]">{t.desc}</div>
                </div>
              </Link>
            ))}
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

      {/* ──────────────────── BOARD OF DIRECTORS ──────────────────── */}
      <section className="py-8 md:py-6 px-4 bg-white relative overflow-hidden">
        <div className="absolute inset-0 pattern-bg opacity-20 pointer-events-none" />

        <div className="relative max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8 md:mb-10">
            <span className="badge-gold mb-4 inline-flex text-xs md:text-sm px-4 py-1.5">Leadership</span>
            <h2 className="font-cinzel font-bold text-lg md:text-xl text-maroon leading-tight mb-3 drop-shadow-sm">
              Board of Directors
            </h2>
            <div className="flex items-center justify-center gap-4">
              <span className="block h-px w-20 md:w-32 bg-linear-to-r from-transparent to-gold/60" />
              <span className="text-gold text-2xl md:text-3xl drop-shadow-md">🪷</span>
              <span className="block h-px w-20 md:w-32 bg-linear-to-l from-transparent to-gold/60" />
            </div>
          </div>

          {/* Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {BOARD_MEMBERS.map((member, i) => {
              const isChairman = i === 0;
              return (
                <div
                  key={member.name}
                  className={`group relative bg-white rounded-2xl overflow-hidden card-hover flex flex-col items-center text-center ${isChairman ? "gold-border-thick shadow-xl" : "gold-border shadow-md"}`}
                >
                  <div className={`h-1 w-full bg-linear-to-r from-saffron to-gold ${isChairman ? "opacity-100" : "opacity-0 group-hover:opacity-100 transition-opacity duration-300"}`} />

                  <div className="pt-6 pb-4 px-4 w-full flex flex-col items-center">
                    <div className={`relative rounded-full overflow-hidden mb-4 shrink-0 ${isChairman ? "w-24 h-24 md:w-28 md:h-28 ring-4 ring-gold/40 ring-offset-2" : "w-20 h-20 md:w-24 md:h-24 ring-2 ring-gold/25 ring-offset-2 group-hover:ring-gold/50 transition-all duration-300"}`}>
                      <Image
                        src={member.image}
                        alt={member.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-linear-to-t from-maroon/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>

                    {isChairman && (
                      <span className="badge-gold mb-2.5 text-[10px]">Founder</span>
                    )}

                    <h4 className="font-cinzel font-semibold text-maroon text-xs md:text-sm leading-snug mb-1.5">
                      {member.name}
                    </h4>
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

      {/* ──────────────────────── GALLERY ────────────────────────── */}
      <section className="py-8 md:py-6 px-4 bg-white relative overflow-hidden">
        <div className="absolute inset-0 pattern-bg opacity-20 pointer-events-none" />

        <div className="relative max-w-7xl mx-auto">
          <div className="text-center mb-8 md:mb-10">
            <span className="badge-gold mb-4 inline-flex text-xs md:text-sm px-4 py-1.5">Our Moments</span>
            <h2 className="font-cinzel font-bold text-lg md:text-xl text-maroon leading-tight mb-3 drop-shadow-sm">
              Gallery &amp; Media
            </h2>
            <div className="flex items-center justify-center gap-4">
              <span className="block h-px w-20 md:w-32 bg-linear-to-r from-transparent to-gold/60" />
              <span className="text-gold text-2xl md:text-3xl drop-shadow-md">🪷</span>
              <span className="block h-px w-20 md:w-32 bg-linear-to-l from-transparent to-gold/60" />
            </div>
          </div>

          <GallerySection
            photos={[
              { src: IMAGES.about1, alt: "Temple ceremony",      caption: "Sacred Ceremony" },
              { src: IMAGES.about2, alt: "Puja ritual",          caption: "Daily Puja" },
              { src: IMAGES.about3, alt: "Community gathering",  caption: "Community Event" },
              { src: IMAGES.about4, alt: "Festival celebration", caption: "Festival" },
              { src: IMAGES.puja,   alt: "Sacred fire ritual",   caption: "Homam Ritual" },
              { src: IMAGES.temple1,alt: "Temple exterior",      caption: "Our Temple" },
              { src: IMAGES.hero,   alt: "Devotee service",      caption: "Devotee Service" },
              { src: IMAGES.download4, alt: "Cultural program",  caption: "Cultural Program" },
            ]}
            videos={[
              {
                thumbnail: IMAGES.hero,
                title: "Archana & Abhishekam — Sacred Daily Ritual",
                description: "Watch our priests perform the traditional Archana and Abhishekam ceremonies with full Vedic procedures.",
                duration: "12:34",
                href: "https://www.youtube.com/@srivedagayatritemple",
              },
              {
                thumbnail: IMAGES.puja,
                title: "Ganapathi Homam — Sacred Fire Ritual",
                description: "A powerful Homam performed to remove obstacles and invoke divine blessings for the community.",
                duration: "28:15",
                href: "https://www.youtube.com/@srivedagayatritemple",
              },
              {
                thumbnail: IMAGES.about2,
                title: "Annadaanam — Weekly Community Food Offering",
                description: "Our Sunday Annadaanam program where blessed food is distributed to all devotees and visitors.",
                duration: "8:42",
                href: "https://www.youtube.com/@srivedagayatritemple",
              },
              {
                thumbnail: IMAGES.temple1,
                title: "Navaratri Celebrations 2024",
                description: "Highlights from our vibrant Navaratri festival — nine nights of devotion, dance, and divine worship.",
                duration: "18:05",
                href: "https://www.youtube.com/@srivedagayatritemple",
              },
              {
                thumbnail: IMAGES.about3,
                title: "Upanayana Samskara Ceremony",
                description: "Sacred thread ceremony performed with full Vedic rituals, marking a young devotee's spiritual journey.",
                duration: "45:20",
                href: "https://www.youtube.com/@srivedagayatritemple",
              },
            ]}
          />

          <div className="text-center mt-8">
            <Link href="/gallery" className="btn-secondary px-10">View Full Gallery</Link>
          </div>
        </div>
      </section>

      {/* ─────────────────────── TESTIMONIALS ─────────────────────── */}
      <section className="py-8 md:py-6 px-4 relative overflow-hidden" style={{ background: "linear-gradient(160deg,#FFF8F0 0%,#F5EBD8 50%,#FFF8F0 100%)" }}>
        <div className="absolute inset-0 pattern-bg opacity-40 pointer-events-none" />
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
          <span className="text-maroon/3 font-cinzel leading-none" style={{ fontSize: "min(65vw,560px)" }}>ॐ</span>
        </div>

        <div className="relative max-w-6xl mx-auto">
          <div className="text-center mb-8 md:mb-10">
            <span className="badge-gold mb-4 inline-flex text-xs md:text-sm px-4 py-1.5">Devotee Stories</span>
            <h2 className="font-cinzel font-bold text-lg md:text-xl text-maroon leading-tight mb-3 drop-shadow-sm">
              Blessings &amp; Testimonials
            </h2>
            <div className="flex items-center justify-center gap-4">
              <span className="block h-px w-20 md:w-32 bg-linear-to-r from-transparent to-gold/60" />
              <span className="text-gold text-2xl md:text-3xl drop-shadow-md">🪷</span>
              <span className="block h-px w-20 md:w-32 bg-linear-to-l from-transparent to-gold/60" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                name: "Priya Sharma",
                location: "Stockton, CA",
                avatar: "PS",
                text: "The Abhishekam ceremony was deeply moving. The chanting and rituals were conducted with such devotion and authenticity. Sri Veda Gayatri Temple has truly become our spiritual home in California.",
              },
              {
                name: "Rajan & Meena Patel",
                location: "Tracy, CA",
                avatar: "RP",
                text: "We had our son's Upanayana Samskara performed here and it was a beautiful experience. The priest explained each step with such depth. The temple team was incredibly welcoming throughout.",
              },
              {
                name: "Dr. Ananya Krishnan",
                location: "Modesto, CA",
                avatar: "AK",
                text: "The weekly Annadaanam is a wonderful initiative. I can see the incredible love and dedication the founders and priests put into every ritual and community event. Truly a blessed place.",
              },
            ].map((t) => (
              <div key={t.name} className="group relative bg-white rounded-2xl p-6 gold-border card-hover shadow-md flex flex-col">
                <span className="absolute top-3 right-5 text-5xl text-gold/10 font-serif leading-none select-none">&rdquo;</span>

                {/* Stars */}
                <div className="flex gap-0.5 mb-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-gold text-gold" />
                  ))}
                </div>

                <p className="text-foreground/70 text-sm leading-relaxed flex-1 mb-4 italic">
                  &ldquo;{t.text}&rdquo;
                </p>

                <div className="divider-gold mb-4" />

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-linear-to-br from-saffron/20 to-gold/20 border border-gold/30 flex items-center justify-center shrink-0">
                    <span className="font-cinzel font-bold text-xs text-maroon">{t.avatar}</span>
                  </div>
                  <div>
                    <p className="font-cinzel font-semibold text-maroon text-xs leading-snug">{t.name}</p>
                    <p className="text-foreground/45 text-[11px]">{t.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ────────────────────── REGISTER CTA ──────────────────────── */}
      <section className="relative py-8 md:py-6 px-4 overflow-hidden bg-cream">
        <div className="absolute inset-0 pattern-bg opacity-40 pointer-events-none" />

        <div className="relative max-w-5xl mx-auto">
          <div className="bg-white rounded-3xl gold-border shadow-xl overflow-hidden">
            <div className="h-1 bg-linear-to-r from-saffron via-gold to-saffron" />

            <div className="p-6 md:p-10">
              <div className="text-center mb-6">
                <span className="badge-gold mb-4 inline-flex text-xs md:text-sm px-4 py-1.5">Join Us</span>
                <h2 className="font-cinzel font-bold text-lg md:text-xl text-maroon mb-3 leading-tight drop-shadow-sm">
                  Become a Devotee
                </h2>
                <div className="flex items-center justify-center gap-4 mb-3">
                  <span className="block h-px w-20 md:w-32 bg-linear-to-r from-transparent to-gold/60" />
                  <span className="text-gold text-xl drop-shadow-md">🪷</span>
                  <span className="block h-px w-20 md:w-32 bg-linear-to-l from-transparent to-gold/60" />
                </div>
                <p className="text-foreground/55 text-sm max-w-lg mx-auto leading-relaxed">
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
                <p className="text-foreground/40 text-xs mt-3">
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
