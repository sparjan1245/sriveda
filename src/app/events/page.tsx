import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { Calendar, MapPin, Clock } from "lucide-react";
import { IMAGES } from "@/lib/constants";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import RsvpButton from "./RsvpButton";

export const metadata: Metadata = {
  title: "Events",
  description: "Upcoming temple events, festivals, and celebrations at Sri Veda Gayatri Temple.",
};

const FALLBACK_EVENTS = [
  { id: "1", title: "Satyanarayana Pooja",   date: new Date("2026-06-15T17:00:00"), endDate: null, location: "Main Hall",       description: "Monthly Satyanarayana Pooja for the well-being of all devotees. All are welcome.", image: IMAGES.puja,   featured: false },
  { id: "2", title: "Guru Purnima",           date: new Date("2026-07-10T17:00:00"), endDate: null, location: "Temple Grounds",  description: "Annual Guru Purnima celebration with special puja and cultural programs.",           image: IMAGES.about3, featured: true  },
  { id: "3", title: "Krishna Janmashtami",    date: new Date("2026-08-16T17:00:00"), endDate: null, location: "Main Hall",       description: "Celebrate the birth of Lord Krishna with bhajans, abhishekam, and prasadam.",       image: IMAGES.about4, featured: false },
  { id: "4", title: "Ganesh Chaturthi",       date: new Date("2026-08-26T17:00:00"), endDate: null, location: "Temple Grounds",  description: "Grand Ganesh Chaturthi celebrations with homam and cultural programs.",               image: IMAGES.about1, featured: true  },
  { id: "5", title: "Navaratri Festival",     date: new Date("2026-09-23T17:00:00"), endDate: null, location: "Temple Grounds",  description: "Nine nights of celebration with special pujas, cultural dance, and prasadam.",       image: IMAGES.about2, featured: false },
  { id: "6", title: "Diwali Celebration",     date: new Date("2026-10-20T17:00:00"), endDate: null, location: "Temple Grounds",  description: "Festival of lights with special Lakshmi puja and community dinner.",                  image: IMAGES.hero,   featured: true  },
];

export default async function EventsPage() {
  const session = await auth();
  const userId = (session?.user as { id?: string })?.id ?? null;

  const dbEvents = await db.event
    .findMany({ where: { date: { gte: new Date() } }, orderBy: { date: "asc" } })
    .catch(() => []);

  const events = dbEvents.length > 0 ? dbEvents : FALLBACK_EVENTS;
  const featuredEvent = events.find((e) => e.featured) || events[0];
  const otherEvents = events.filter((e) => e.id !== featuredEvent?.id);

  return (
    <div>

      {/* ── Inner Page Banner ── */}
      <section className="relative h-40 md:h-52 flex items-center justify-center overflow-hidden">
        <Image src={IMAGES.puja} alt="Temple Events" fill className="object-cover object-center" priority />
        <div className="absolute inset-0 bg-black/55" />
        <div className="absolute inset-0 bg-maroon/60" />
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 70% 80% at 50% 50%, rgba(212,160,23,0.15) 0%, transparent 70%)" }} />
        <div className="absolute bottom-0 inset-x-0 h-px bg-linear-to-r from-transparent via-gold/60 to-transparent" />
        <div className="relative z-10 text-center px-4">
          <div className="flex items-center justify-center gap-2 text-white/70 text-[11px] tracking-widest uppercase mb-3">
            <span>Home</span>
            <span className="text-gold/60">›</span>
            <span className="text-gold/80">Events</span>
          </div>
          <h1 className="font-cinzel font-bold text-2xl md:text-3xl text-white drop-shadow-md leading-tight">
            Temple Events
          </h1>
          <div className="flex items-center justify-center gap-3 my-2">
            <span className="block h-px w-10 md:w-16 bg-linear-to-r from-transparent to-gold/60" />
            <span className="text-gold text-base drop-shadow-sm">🪷</span>
            <span className="block h-px w-10 md:w-16 bg-linear-to-l from-transparent to-gold/60" />
          </div>
          <p className="text-white/80 text-xs max-w-md mx-auto drop-shadow-sm">
            Join us in celebrating the timeless festivals and rituals of our rich Vedic heritage
          </p>
        </div>
      </section>

      {/* ── Featured Event ── */}
      {featuredEvent && (
        <section className="py-8 md:py-6 px-4 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="relative rounded-3xl overflow-hidden gold-border shadow-xl">
              <div className="relative h-64 md:h-80 lg:h-96">
                <Image
                  src={featuredEvent.image || IMAGES.puja}
                  alt={featuredEvent.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-linear-to-r from-maroon/90 via-maroon/50 to-transparent" />
              </div>
              <div className="absolute inset-0 flex items-end md:items-center px-6 md:px-10 pb-6 md:pb-0">
                <div className="max-w-xl">
                  {featuredEvent.featured && (
                    <span className="inline-flex bg-gold text-white text-[10px] font-cinzel font-bold px-3 py-1.5 rounded-full uppercase tracking-widest mb-3">
                      Featured Event
                    </span>
                  )}
                  <h2 className="font-cinzel font-bold text-xl md:text-3xl text-white leading-tight mb-3 drop-shadow-lg">
                    {featuredEvent.title}
                  </h2>
                  <div className="flex flex-wrap items-center gap-3 mb-3">
                    <div className="flex items-center gap-1.5 text-white/75 text-xs">
                      <Calendar className="w-3.5 h-3.5 text-gold shrink-0" />
                      {new Date(featuredEvent.date).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
                    </div>
                    {featuredEvent.location && (
                      <div className="flex items-center gap-1.5 text-white/75 text-xs">
                        <MapPin className="w-3.5 h-3.5 text-gold shrink-0" />
                        {featuredEvent.location}
                      </div>
                    )}
                  </div>
                  <p className="text-white/70 text-sm font-light leading-relaxed mb-4 line-clamp-2">
                    {featuredEvent.description}
                  </p>
                  <div className="w-48">
                    <RsvpButton eventId={featuredEvent.id} userId={userId} />
                  </div>
                </div>
              </div>
              {/* Date badge */}
              <div className="absolute top-5 right-5 bg-white rounded-2xl px-4 py-3 text-center shadow-lg">
                <div className="font-cinzel font-bold text-maroon text-2xl leading-none">
                  {new Date(featuredEvent.date).getDate()}
                </div>
                <div className="text-saffron text-[11px] font-bold tracking-widest mt-0.5">
                  {new Date(featuredEvent.date).toLocaleString("en-US", { month: "short" }).toUpperCase()}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── All Upcoming Events ── */}
      <section className="py-8 md:py-6 px-4 bg-cream pattern-bg">
        <div className="max-w-7xl mx-auto">
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

          {otherEvents.length === 0 && !featuredEvent ? (
            <div className="text-center py-16 bg-white rounded-2xl gold-border">
              <div className="text-4xl mb-3">📅</div>
              <p className="text-foreground/55 text-sm font-light">No upcoming events at the moment. Check back soon.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {otherEvents.map((event) => {
                const d = new Date(event.date);
                const day = d.getDate();
                const month = d.toLocaleString("en-US", { month: "short" }).toUpperCase();
                return (
                  <div
                    key={event.id}
                    className="group bg-white rounded-2xl overflow-hidden gold-border shadow-sm card-hover flex flex-col"
                  >
                    <div className="h-0.5 w-full bg-linear-to-r from-saffron to-gold opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    {/* Image */}
                    <div className="relative h-44 overflow-hidden bg-cream">
                      <Image
                        src={event.image || IMAGES.puja}
                        alt={event.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-linear-to-t from-maroon/60 via-maroon/10 to-transparent" />

                      {/* Date badge */}
                      <div className="absolute top-3 left-3 bg-white rounded-xl px-3 py-2 text-center shadow-md">
                        <div className="font-cinzel font-bold text-maroon text-lg leading-none">{day}</div>
                        <div className="text-saffron text-[10px] font-bold tracking-widest">{month}</div>
                      </div>

                      {event.featured && (
                        <div className="absolute top-3 right-3 bg-gold text-white text-[10px] font-cinzel font-bold px-2.5 py-1 rounded-full uppercase tracking-widest">
                          Featured
                        </div>
                      )}
                    </div>

                    {/* Body */}
                    <div className="flex flex-col flex-1 p-4">
                      <h3 className="font-cinzel font-bold text-maroon text-sm md:text-base leading-snug mb-2 line-clamp-2">
                        {event.title}
                      </h3>
                      <div className="space-y-1 mb-3">
                        <div className="flex items-center gap-2 text-xs text-foreground/55 font-light">
                          <Clock className="w-3 h-3 text-gold shrink-0" />
                          {d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                          {" · "}{d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                        </div>
                        {event.location && (
                          <div className="flex items-center gap-2 text-xs text-foreground/55 font-light">
                            <MapPin className="w-3 h-3 text-gold shrink-0" />
                            {event.location}
                          </div>
                        )}
                      </div>
                      <p className="text-foreground/60 text-xs font-light leading-relaxed flex-1 mb-4 line-clamp-2">
                        {event.description}
                      </p>
                      <RsvpButton eventId={event.id} userId={userId} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ── Festival Calendar ── */}
      <section className="py-8 md:py-6 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8 md:mb-10">
            <span className="badge-gold mb-4 inline-flex text-xs md:text-sm px-4 py-1.5">Annual Schedule</span>
            <h2 className="font-cinzel font-bold text-lg md:text-xl text-maroon mb-3 leading-tight drop-shadow-sm">
              2026 Festival Calendar
            </h2>
            <div className="flex items-center justify-center gap-4">
              <span className="block h-px w-20 md:w-32 bg-linear-to-r from-transparent to-gold/60" />
              <span className="text-gold text-2xl drop-shadow-md">🪷</span>
              <span className="block h-px w-20 md:w-32 bg-linear-to-l from-transparent to-gold/60" />
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            {[
              { month: "January",   festivals: ["Sankranti / Pongal", "Vaikuntha Ekadashi"] },
              { month: "February",  festivals: ["Maha Shivaratri", "Thai Poosam"] },
              { month: "March",     festivals: ["Ugadi (Telugu New Year)", "Holi", "Ram Navami"] },
              { month: "April",     festivals: ["Hanuman Jayanti", "Akshaya Tritiya"] },
              { month: "May",       festivals: ["Buddha Purnima", "Shankaracharya Jayanti"] },
              { month: "June",      festivals: ["Vat Purnima", "Satyanarayana Pooja"] },
              { month: "July",      festivals: ["Guru Purnima", "Ashadha Ekadashi"] },
              { month: "August",    festivals: ["Krishna Janmashtami", "Ganesh Chaturthi", "Onam"] },
              { month: "September", festivals: ["Navaratri", "Dussehra"] },
              { month: "October",   festivals: ["Diwali", "Lakshmi Puja", "Karthik Poornima"] },
              { month: "November",  festivals: ["Skanda Sashti", "Karthigai Deepam"] },
              { month: "December",  festivals: ["Gita Jayanti", "Vaikunta Ekadashi"] },
            ].map((row) => (
              <div key={row.month} className="flex items-start gap-4 p-4 bg-cream rounded-xl gold-border hover:border-saffron/40 transition-colors">
                <div className="font-cinzel font-bold text-maroon text-xs w-20 shrink-0 pt-0.5 uppercase tracking-wide">{row.month}</div>
                <div className="flex flex-wrap gap-1.5">
                  {row.festivals.map((f) => (
                    <span key={f} className="bg-white text-foreground/65 text-[11px] font-light px-2.5 py-1 rounded-full border border-gold/20 hover:border-gold/50 transition-colors">
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-8 md:py-6 px-4 relative overflow-hidden" style={{ background: "linear-gradient(135deg, #6B0F1A 0%, #4A0A12 60%, #3A0810 100%)" }}>
        <div className="absolute inset-0 pattern-bg opacity-30 pointer-events-none" />
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 80% 70% at 50% 50%, rgba(212,160,23,0.08) 0%, transparent 70%)" }} />
        <div className="absolute top-0 inset-x-0 h-px bg-linear-to-r from-transparent via-gold/40 to-transparent" />
        <div className="absolute bottom-0 inset-x-0 h-px bg-linear-to-r from-transparent via-gold/40 to-transparent" />
        <div className="relative max-w-2xl mx-auto text-center text-white">
          <Calendar className="w-8 h-8 text-gold mx-auto mb-3" />
          <h2 className="font-cinzel font-bold text-lg md:text-xl mb-3 leading-tight drop-shadow-sm">Stay Updated</h2>
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="block h-px w-12 bg-linear-to-r from-transparent to-gold/50" />
            <span className="text-gold/80 tracking-widest">✦</span>
            <span className="block h-px w-12 bg-linear-to-l from-transparent to-gold/50" />
          </div>
          <p className="text-white/70 text-sm font-light mb-6 max-w-md mx-auto leading-relaxed">
            Register as a devotee to receive event reminders and festival notifications directly to your inbox.
          </p>
          <Link href="/auth/register" className="btn-primary px-10 py-2.5">
            Register Now — It&apos;s Free
          </Link>
        </div>
      </section>

    </div>
  );
}
