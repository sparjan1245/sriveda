import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { Calendar, Users, Heart, Star, MapPin, Phone, Clock, Mail } from "lucide-react";
import { TEMPLE, IMAGES } from "@/lib/constants";
import { db } from "@/lib/db";
import { BoardCarousel, type BoardMemberItem } from "@/components/about/BoardCarousel";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "About Us",
  description: "Learn about Sri Veda Gayatri Temple — our mission, history, and board of directors.",
};


export default async function AboutPage() {
  const [userCount, bookingCount, dbServices, dbBoardMembers] = await Promise.all([
    db.user.count().catch(() => 0),
    db.booking.count().catch(() => 0),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (db.service as any).findMany({ where: { active: true }, orderBy: { order: "asc" } }).catch(() => []),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (db as any).boardMember.findMany({ where: { active: true }, orderBy: { order: "asc" } }).catch(() => []),
  ]);

  const boardMembers: BoardMemberItem[] = dbBoardMembers as BoardMemberItem[];

  const stats = [
    { icon: <Star className="w-5 h-5" />,    value: dbServices.length > 0 ? `${dbServices.length}+` : "4+",   label: "Sacred Services"    },
    { icon: <Calendar className="w-5 h-5" />, value: "50+",                                                     label: "Events Per Year"    },
    { icon: <Users className="w-5 h-5" />,    value: userCount > 10 ? `${userCount}+` : "500+",                label: "Devotees"           },
    { icon: <Heart className="w-5 h-5" />,    value: bookingCount > 0 ? `${bookingCount}+` : "100+",           label: "Bookings Served"    },
  ];

  return (
    <div>

      {/* ── Inner Page Banner ── */}
      <section className="relative h-20 md:h-22 flex items-center justify-center overflow-hidden">
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
         
        </div>
      </section>

      {/* ── Mission ── */}
      
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
      {boardMembers.length > 0 && (
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
