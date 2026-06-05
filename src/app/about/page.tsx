import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { Calendar, Users, Heart, Star, ArrowRight, MapPin, Phone, Clock, Mail } from "lucide-react";
import { TEMPLE, IMAGES, BOARD_MEMBERS } from "@/lib/constants";
import { db } from "@/lib/db";
import { GallerySection } from "@/components/home/GallerySection";
import { ServiceSlider } from "@/components/home/ServiceSlider";
import { BoardCarousel, type BoardMemberItem } from "@/components/about/BoardCarousel";

export const metadata: Metadata = {
  title: "About Us",
  description: "Learn about Sri Veda Gayatri Temple — our mission, history, and board of directors.",
};

const STATIC_VIDEOS = [
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
    description: "Our Sunday Annadaanam program where blessed food is distributed to all devotees.",
    duration: "8:42",
    href: "https://www.youtube.com/@srivedagayatritemple",
  },
];

const FALLBACK_PHOTOS = [
  { src: IMAGES.about1, alt: "Temple ceremony",     caption: "Sacred Ceremony" },
  { src: IMAGES.about2, alt: "Puja ritual",         caption: "Daily Puja" },
  { src: IMAGES.about3, alt: "Community gathering", caption: "Community Event" },
  { src: IMAGES.about4, alt: "Festival",            caption: "Festival" },
  { src: IMAGES.puja,   alt: "Homam ritual",        caption: "Homam Ritual" },
  { src: IMAGES.temple1,alt: "Temple exterior",     caption: "Our Temple" },
  { src: IMAGES.hero,   alt: "Devotee service",     caption: "Devotee Service" },
  { src: IMAGES.download4, alt: "Cultural program", caption: "Cultural Program" },
];

export default async function AboutPage() {
  const [userCount, bookingCount, dbServices, galleryImages, upcomingEvents, dbBoardMembers] = await Promise.all([
    db.user.count().catch(() => 0),
    db.booking.count().catch(() => 0),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (db.service as any).findMany({ where: { active: true }, orderBy: { order: "asc" } }).catch(() => []),
    db.galleryImage.findMany({ take: 8, orderBy: { createdAt: "desc" } }).catch(() => []),
    db.event.findMany({ where: { date: { gte: new Date() } }, orderBy: { date: "asc" }, take: 3 }).catch(() => []),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (db as any).boardMember.findMany({ where: { active: true }, orderBy: { order: "asc" } }).catch(() => []),
  ]);

  // Fall back to static constants if no DB board members seeded yet
  const boardMembers: BoardMemberItem[] = (dbBoardMembers as BoardMemberItem[]).length > 0
    ? (dbBoardMembers as BoardMemberItem[])
    : BOARD_MEMBERS.map((m) => ({ name: m.name, title: m.title, image: m.image }));

  const galleryPhotos = galleryImages.length > 0
    ? galleryImages.map((img) => ({ src: img.url, alt: img.caption || "Temple photo", caption: img.caption || undefined }))
    : FALLBACK_PHOTOS;

  const stats = [
    { icon: <Star className="w-5 h-5" />,    value: dbServices.length > 0 ? `${dbServices.length}+` : "4+",   label: "Sacred Services"    },
    { icon: <Calendar className="w-5 h-5" />, value: "50+",                                                     label: "Events Per Year"    },
    { icon: <Users className="w-5 h-5" />,    value: userCount > 10 ? `${userCount}+` : "500+",                label: "Devotees"           },
    { icon: <Heart className="w-5 h-5" />,    value: bookingCount > 0 ? `${bookingCount}+` : "100+",           label: "Bookings Served"    },
  ];

  return (
    <div>

      {/* ── Inner Page Banner ── */}
      <section className="relative h-40 md:h-52 flex items-center justify-center overflow-hidden">
        <Image
          src={IMAGES.temple1}
          alt="About Sri Veda Gayatri Temple"
          fill
          className="object-cover object-center"
          priority
        />
        {/* Dark overlays — two layers for full coverage over bright sky */}
        <div className="absolute inset-0 bg-black/55" />
        <div className="absolute inset-0 bg-maroon/60" />
        {/* Radial glow */}
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 70% 80% at 50% 50%, rgba(212,160,23,0.15) 0%, transparent 70%)" }} />
        {/* Bottom gold border */}
        <div className="absolute bottom-0 inset-x-0 h-px bg-linear-to-r from-transparent via-gold/60 to-transparent" />

        <div className="relative z-10 text-center px-4">
          {/* Breadcrumb */}
          <div className="flex items-center justify-center gap-2 text-white/70 text-[11px] tracking-widest uppercase mb-3">
            <span>Home</span>
            <span className="text-gold/60">›</span>
            <span className="text-gold/80">About Us</span>
          </div>
          <h1 className="font-cinzel font-bold text-2xl md:text-3xl text-white drop-shadow-md leading-tight">
            About Our Temple
          </h1>
          {/* Divider */}
          <div className="flex items-center justify-center gap-3 my-2">
            <span className="block h-px w-10 md:w-16 bg-linear-to-r from-transparent to-gold/60" />
            <span className="text-gold text-base drop-shadow-sm">🪷</span>
            <span className="block h-px w-10 md:w-16 bg-linear-to-l from-transparent to-gold/60" />
          </div>
          <p className="text-white/80 text-xs max-w-md mx-auto drop-shadow-sm">
            A spiritual &amp; charitable non-profit serving the Hindu community since {TEMPLE.founded}
          </p>
        </div>
      </section>

      {/* ── Mission ── */}
      <section className="relative py-8 md:py-6 px-4 overflow-hidden" style={{ background: "linear-gradient(160deg, #FFF8F0 0%, #F5EBD8 50%, #FFF8F0 100%)" }}>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
          <span className="text-maroon/[0.04] font-cinzel leading-none -translate-y-8" style={{ fontSize: "min(65vw,600px)" }}>ॐ</span>
        </div>
        <div className="relative max-w-6xl mx-auto">
          <div className="text-center mb-8 md:mb-10">
            <span className="badge-gold mb-5 inline-flex text-xs md:text-sm px-4 py-1.5">Our Purpose</span>
            <h2 className="font-cinzel font-bold text-lg md:text-xl text-maroon mb-3 leading-tight drop-shadow-sm">
              A Sanctuary for the Soul
            </h2>
            <div className="flex items-center justify-center gap-4 mb-2">
              <span className="block h-px w-20 md:w-32 bg-linear-to-r from-transparent to-gold/60" />
              <span className="text-gold text-2xl md:text-3xl drop-shadow-md">🪷</span>
              <span className="block h-px w-20 md:w-32 bg-linear-to-l from-transparent to-gold/60" />
            </div>
            <p className="text-foreground/75 text-sm font-light leading-relaxed max-w-3xl mx-auto">
              {TEMPLE.mission} As a&nbsp;
              <strong className="text-maroon font-semibold">California Registered 501(c)(3) Non-Profit</strong>,
              every contribution goes directly toward serving the spiritual needs of our community.
            </p>
          </div>
        </div>
      </section>

      {/* ── Story + Live Stats ── */}
      <section className="py-8 md:py-6 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">

            {/* Text */}
            <div>
              <span className="badge-gold mb-4 inline-flex text-xs md:text-sm px-4 py-1.5">Our Story</span>
              <h2 className="font-cinzel font-bold text-lg md:text-xl text-maroon mb-3 leading-tight drop-shadow-sm">
                Founded With Purpose
              </h2>
              <div className="flex items-center gap-4 mb-5">
                <span className="block h-px w-16 bg-linear-to-r from-transparent to-gold/60" />
                <span className="text-gold text-xl drop-shadow-md">🪷</span>
              </div>
              <p className="text-foreground/70 text-sm font-light leading-relaxed mb-3">
                Sri Veda Gayatri Temple was founded in {TEMPLE.founded} with a singular vision: to create a
                spiritual home for the Hindu community in California&apos;s Central Valley. Located in
                Manteca, CA, our temple serves as a beacon of spirituality, culture, and community.
              </p>
              <p className="text-foreground/70 text-sm font-light leading-relaxed mb-3">
                As a <strong className="text-maroon font-semibold">California Registered 501(c)(3) Non-Profit</strong> (Tax ID: {TEMPLE.taxId}),
                we are committed to transparency, service, and the highest standards of Vedic tradition.
                All donations are fully tax-deductible under U.S. law.
              </p>
              <p className="text-foreground/70 text-sm font-light leading-relaxed mb-6">
                Our offerings include daily pujas, sacred homams, life-cycle samskaras, Vedic astrology,
                cultural programs in classical music, Kuchipudi dance, Sanskrit, and yoga — along with
                weekly Annadaanam (food offering) and vibrant community events.
              </p>

              {/* Live stats row */}
              <div className="grid grid-cols-4 gap-2">
                {stats.map((s) => (
                  <div key={s.label} className="bg-cream rounded-xl py-3 px-2 gold-border text-center">
                    <div className="text-saffron flex justify-center mb-1">{s.icon}</div>
                    <div className="font-cinzel font-bold text-sm md:text-base text-maroon leading-none mb-1">{s.value}</div>
                    <div className="text-foreground/50 text-[10px] uppercase tracking-wide font-medium leading-tight">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Single image */}
            <div className="relative rounded-3xl overflow-hidden shadow-xl gold-border h-100 md:h-125 group">
              <Image
                src={IMAGES.about1}
                alt="Sri Veda Gayatri Temple"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-linear-to-t from-maroon/60 via-maroon/10 to-transparent" />
              <div className="absolute bottom-5 left-5 right-5">
                <p className="font-cinzel font-bold text-white text-sm md:text-base drop-shadow-lg leading-snug">
                  Sri Veda Gayatri Temple
                </p>
                <p className="text-white/70 text-xs mt-0.5">Manteca, California · Est. {TEMPLE.founded}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Board of Directors ── */}
      <section className="py-8 md:py-6 px-4 bg-cream pattern-bg relative overflow-hidden">
        <div className="absolute inset-0 pattern-bg opacity-20 pointer-events-none" />
        <div className="relative max-w-6xl mx-auto">
          <div className="text-center mb-8 md:mb-10">
            <span className="badge-gold mb-4 inline-flex text-xs md:text-sm px-4 py-1.5">Our Leadership</span>
            <h2 className="font-cinzel font-bold text-lg md:text-xl text-maroon mb-3 leading-tight drop-shadow-sm">
              Board of Directors
            </h2>
            <div className="flex items-center justify-center gap-4 mb-3">
              <span className="block h-px w-20 md:w-32 bg-linear-to-r from-transparent to-gold/60" />
              <span className="text-gold text-2xl md:text-3xl drop-shadow-md">🪷</span>
              <span className="block h-px w-20 md:w-32 bg-linear-to-l from-transparent to-gold/60" />
            </div>
            <p className="text-foreground/60 text-sm font-light max-w-xl mx-auto">
              Our dedicated board guides the temple with wisdom, devotion, and an unwavering
              commitment to serving our community.
            </p>
          </div>

          <BoardCarousel members={boardMembers} />
        </div>
      </section>

      {/* ── Programs ── */}
      <section className="py-8 md:py-6 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8 md:mb-10">
            <span className="badge-gold mb-4 inline-flex text-xs md:text-sm px-4 py-1.5">What We Do</span>
            <h2 className="font-cinzel font-bold text-lg md:text-xl text-maroon mb-3 leading-tight drop-shadow-sm">
              Our Programs
            </h2>
            <div className="flex items-center justify-center gap-4 mb-3">
              <span className="block h-px w-20 md:w-32 bg-linear-to-r from-transparent to-gold/60" />
              <span className="text-gold text-2xl md:text-3xl drop-shadow-md">🪷</span>
              <span className="block h-px w-20 md:w-32 bg-linear-to-l from-transparent to-gold/60" />
            </div>
            <p className="text-foreground/60 text-sm font-light max-w-xl mx-auto">
              From sacred rituals to cultural education, we offer a complete spiritual and community experience.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {[
              {
                icon: "🕉",
                title: "Spiritual Services",
                color: "from-maroon/5 to-saffron/5",
                accent: "bg-saffron/10 text-saffron",
                items: ["Daily Archana & Abhishekam", "Special Pujas & Homams", "Samskaras", "Astrological Consultations"],
              },
              {
                icon: "🎭",
                title: "Cultural Programs",
                color: "from-gold/5 to-maroon/5",
                accent: "bg-gold/10 text-gold",
                items: ["Classical Music", "Kuchipudi Dance", "Sanskrit Language", "Yoga & Meditation"],
              },
              {
                icon: "🤝",
                title: "Community Service",
                color: "from-saffron/5 to-gold/5",
                accent: "bg-maroon/10 text-maroon",
                items: ["Weekly Annadaanam", "Festival Celebrations", "Youth Engagement", "Volunteer Programs"],
              },
            ].map((program) => (
              <div
                key={program.title}
                className={`relative rounded-2xl p-5 gold-border shadow-sm card-hover overflow-hidden bg-linear-to-br ${program.color}`}
              >
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl mb-3 shadow-sm ${program.accent}`}>
                  {program.icon}
                </div>
                <h3 className="font-cinzel font-bold text-maroon text-sm mb-2.5">{program.title}</h3>
                <ul className="space-y-1.5">
                  {program.items.map((item) => (
                    <li key={item} className="flex items-center gap-2 text-xs font-light text-foreground/70">
                      <span className="w-1.5 h-1.5 rounded-full bg-gold shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Services ── */}
      {dbServices.length > 0 && (
        <section className="py-8 md:py-6 px-4 bg-cream pattern-bg relative overflow-hidden">
          <div className="max-w-7xl mx-auto">

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8 md:mb-10">
              <div>
                <span className="badge-gold mb-4 inline-flex text-xs md:text-sm px-4 py-1.5">Divine Offerings</span>
                <h2 className="font-cinzel font-bold text-lg md:text-xl text-maroon leading-tight drop-shadow-sm">
                  Our Sacred Services
                </h2>
              </div>
              <Link href="/services" className="btn-secondary px-5 py-2 text-xs shrink-0 self-start md:self-auto">
                View All Services <ArrowRight className="inline w-3.5 h-3.5 ml-1" />
              </Link>
            </div>

            {/* Cards grid — same design as /services page */}
            <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-5">
              {dbServices.map((service: {
                id: string; slug: string; name: string; shortDesc: string | null;
                description: string; price: number; duration: string | null;
                image: string | null; category: string | null;
              }) => (
                <div
                  key={service.slug}
                  className="group bg-white rounded-3xl overflow-hidden shadow-md border border-gold/20 card-hover flex flex-col"
                >
                  {/* Image */}
                  <div className="relative h-44 overflow-hidden">
                    <Image
                      src={service.image || IMAGES.puja}
                      alt={service.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-maroon/80 via-maroon/20 to-transparent" />

                    {service.category && (
                      <div className="absolute top-3 left-3">
                        <span className="bg-white/90 text-maroon text-[10px] font-cinzel font-bold px-2.5 py-1 rounded-full uppercase tracking-wide shadow-sm">
                          {service.category}
                        </span>
                      </div>
                    )}

                    <div className="absolute bottom-3 right-3 bg-black/50 backdrop-blur-sm rounded-xl px-3 py-1.5 text-right">
                      <div className="text-white/60 text-[10px]">From</div>
                      <div className="font-cinzel font-bold text-base text-gold">${service.price}</div>
                    </div>

                    <div className="absolute bottom-3 left-3">
                      <h3 className="font-cinzel font-bold text-white text-sm leading-snug drop-shadow-md">
                        {service.name}
                      </h3>
                      {service.duration && (
                        <div className="flex items-center gap-1 text-white/70 text-[10px] mt-0.5">
                          <Clock className="w-3 h-3" />
                          {service.duration}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Body */}
                  <div className="flex flex-col flex-1 p-4">
                    <p className="text-foreground/65 text-xs font-light leading-relaxed flex-1 mb-4">
                      {service.shortDesc || service.description}
                    </p>
                    <div className="flex items-center gap-2 pt-3 border-t border-gold/15">
                      <Link
                        href={`/services/${service.slug}`}
                        className="btn-primary flex-1 py-2 text-xs flex items-center justify-center gap-1.5"
                      >
                        Book Now <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                      <Link
                        href={`/services/${service.slug}`}
                        className="text-[11px] text-maroon/50 hover:text-maroon transition-colors font-medium whitespace-nowrap"
                      >
                        Details →
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* What's included strip */}
            <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { icon: "🛕", label: "Trained Priests",        desc: "Vedic procedures" },
                { icon: "🌺", label: "Materials Provided",     desc: "All puja items included" },
                { icon: "🍱", label: "Prasadam Distributed",   desc: "Blessed food after ceremony" },
                { icon: "📧", label: "Digital Receipt",        desc: "Emailed after booking" },
              ].map((item) => (
                <div key={item.label} className="bg-white rounded-2xl p-4 gold-border text-center shadow-sm">
                  <div className="text-2xl mb-2">{item.icon}</div>
                  <div className="font-cinzel font-semibold text-maroon text-xs mb-0.5">{item.label}</div>
                  <div className="text-foreground/50 text-[11px] font-light">{item.desc}</div>
                </div>
              ))}
            </div>

          </div>
        </section>
      )}

      {/* ── Upcoming Events (live) ── */}
      {upcomingEvents.length > 0 && (
        <section className="py-8 md:py-6 px-4 bg-cream pattern-bg">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-8 md:mb-10">
              <span className="badge-gold mb-4 inline-flex text-xs md:text-sm px-4 py-1.5">What&apos;s Coming</span>
              <h2 className="font-cinzel font-bold text-lg md:text-xl text-maroon mb-3 leading-tight drop-shadow-sm">
                Upcoming Events
              </h2>
              <div className="flex items-center justify-center gap-4">
                <span className="block h-px w-20 md:w-32 bg-linear-to-r from-transparent to-gold/60" />
                <span className="text-gold text-2xl drop-shadow-md">🪷</span>
                <span className="block h-px w-20 md:w-32 bg-linear-to-l from-transparent to-gold/60" />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {upcomingEvents.map((event) => (
                <div key={event.id} className="bg-white rounded-2xl overflow-hidden gold-border shadow-sm card-hover">
                  {event.image && (
                    <div className="relative h-32 overflow-hidden">
                      <Image src={event.image} alt={event.title} fill className="object-cover" />
                      <div className="absolute inset-0 bg-linear-to-t from-maroon/60 to-transparent" />
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="font-cinzel font-semibold text-maroon text-xs md:text-sm mb-2 leading-snug line-clamp-2">
                      {event.title}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-foreground/55 mb-1">
                      <Calendar className="w-3 h-3 text-saffron shrink-0" />
                      {new Date(event.date).toLocaleDateString("en-US", {
                        weekday: "short", month: "long", day: "numeric", year: "numeric",
                      })}
                    </div>
                    {event.location && (
                      <div className="flex items-center gap-2 text-xs text-foreground/55">
                        <MapPin className="w-3 h-3 text-saffron shrink-0" />
                        {event.location}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center mt-8">
              <Link href="/events" className="btn-secondary px-10">View All Events</Link>
            </div>
          </div>
        </section>
      )}

      {/* ── Contact Info ── */}
      <section className="py-8 md:py-6 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              {
                icon: <MapPin className="w-4 h-4 text-saffron" />,
                label: "Temple Address",
                content: TEMPLE.address,
                href: `https://maps.google.com/?q=${encodeURIComponent(TEMPLE.address)}`,
              },
              {
                icon: <Clock className="w-4 h-4 text-saffron" />,
                label: "Temple Hours",
                content: TEMPLE.hours,
                href: null,
              },
              {
                icon: <Phone className="w-4 h-4 text-saffron" />,
                label: "Call Us",
                content: TEMPLE.phones[0],
                href: `tel:${TEMPLE.phones[0].replace(/\D/g, "")}`,
              },
            ].map((item) => (
              <div key={item.label} className="bg-cream rounded-2xl p-4 gold-border text-center shadow-sm">
                <div className="w-9 h-9 rounded-xl bg-saffron/10 flex items-center justify-center mx-auto mb-2.5">
                  {item.icon}
                </div>
                <p className="font-cinzel font-semibold text-maroon text-xs md:text-sm mb-1.5">{item.label}</p>
                <div className="divider-gold mb-2 w-8 mx-auto" />
                {item.href ? (
                  <a href={item.href} target={item.href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer"
                    className="text-foreground/60 text-xs font-light leading-relaxed hover:text-saffron transition-colors">
                    {item.content}
                  </a>
                ) : (
                  <p className="text-foreground/60 text-xs font-light leading-relaxed">{item.content}</p>
                )}
              </div>
            ))}
          </div>

          <div className="mt-4 bg-cream rounded-2xl p-4 gold-border flex flex-col sm:flex-row items-center justify-center gap-3 shadow-sm">
            <Mail className="w-4 h-4 text-saffron shrink-0" />
            <span className="font-cinzel font-semibold text-maroon text-xs md:text-sm">Email Us:</span>
            <div className="flex flex-col sm:flex-row gap-3">
              {TEMPLE.emails.map((email) => (
                <a key={email} href={`mailto:${email}`}
                  className="text-xs font-light text-foreground/60 hover:text-saffron transition-colors">
                  {email}
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-8 md:py-6 px-4 relative overflow-hidden" style={{ background: "linear-gradient(135deg, #6B0F1A 0%, #4A0A12 60%, #3A0810 100%)" }}>
        <div className="absolute inset-0 pattern-bg opacity-30 pointer-events-none" />
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 80% 70% at 50% 50%, rgba(212,160,23,0.08) 0%, transparent 70%)" }} />
        <div className="absolute top-0 inset-x-0 h-px bg-linear-to-r from-transparent via-gold/40 to-transparent" />
        <div className="absolute bottom-0 inset-x-0 h-px bg-linear-to-r from-transparent via-gold/40 to-transparent" />

        <div className="relative max-w-3xl mx-auto text-center text-white">
          <div className="text-3xl mb-3">🙏</div>
          <h2 className="font-cinzel font-bold text-lg md:text-xl mb-3 leading-tight drop-shadow-sm">
            Join Our Spiritual Community
          </h2>
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="block h-px w-12 md:w-20 bg-linear-to-r from-transparent to-gold/50" />
            <span className="text-gold/80 text-sm tracking-widest">✦</span>
            <span className="block h-px w-12 md:w-20 bg-linear-to-l from-transparent to-gold/50" />
          </div>
          <p className="text-white/70 text-sm font-light mb-6 max-w-xl mx-auto leading-relaxed">
            Register as a devotee to access all temple services, stay updated on events, and be part
            of our growing community.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/auth/register" className="btn-primary px-8 py-2.5">
              Register as Devotee
            </Link>
            <Link href="/contact" className="btn-ghost px-8 py-2.5">
              Contact Us
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
