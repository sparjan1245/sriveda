import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { Calendar, MapPin, Clock } from "lucide-react";
import { IMAGES } from "@/lib/constants";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Events",
  description: "Upcoming temple events, festivals, and celebrations at Sri Veda Gayatri Temple.",
};

const SAMPLE_EVENTS = [
  { id: "1", title: "Satyanarayana Pooja", date: new Date("2026-06-15T17:00:00"), location: "Main Hall", description: "Monthly Satyanarayana Pooja for the well-being of all devotees.", image: IMAGES.puja },
  { id: "2", title: "Guru Purnima Celebration", date: new Date("2026-07-10T17:00:00"), location: "Temple Grounds", description: "Annual Guru Purnima celebration with special puja and cultural programs.", image: IMAGES.altar },
  { id: "3", title: "Krishna Janmashtami", date: new Date("2026-08-16T17:00:00"), location: "Main Hall", description: "Celebrate the birth of Lord Krishna with bhajans, abhishekam, and prasadam.", image: IMAGES.about3 },
  { id: "4", title: "Ganesh Chaturthi", date: new Date("2026-08-26T17:00:00"), location: "Temple Grounds", description: "Grand Ganesh Chaturthi celebrations with homam and cultural programs.", image: IMAGES.about4 },
  { id: "5", title: "Navaratri Festival", date: new Date("2026-09-23T17:00:00"), location: "Temple Grounds", description: "Nine nights of celebration with special pujas, cultural dance performances, and prasadam.", image: IMAGES.about1 },
  { id: "6", title: "Diwali Celebration", date: new Date("2026-10-20T17:00:00"), location: "Temple Grounds", description: "Festival of lights with special Lakshmi puja, fireworks, and community dinner.", image: IMAGES.about2 },
];

export default async function EventsPage() {
  let events = SAMPLE_EVENTS;
  try {
    const dbEvents = await db.event.findMany({ orderBy: { date: "asc" }, where: { date: { gte: new Date() } } });
    if (dbEvents.length > 0) events = dbEvents as typeof SAMPLE_EVENTS;
  } catch {
    // Use sample events
  }

  const upcoming = events.filter((e) => new Date(e.date) >= new Date());
  const past = events.filter((e) => new Date(e.date) < new Date());

  return (
    <div>
      {/* Hero */}
      <section className="relative h-64 md:h-80 flex items-center justify-center overflow-hidden">
        <Image src={IMAGES.altar} alt="Temple Events" fill className="object-cover" />
        <div className="absolute inset-0" style={{ background: "rgba(107,15,26,0.75)" }} />
        <div className="relative z-10 text-center px-4">
          <p className="text-gold font-cinzel text-sm uppercase tracking-widest mb-2">Sacred Celebrations</p>
          <h1 className="font-cinzel font-bold text-4xl md:text-5xl text-white">Temple Events</h1>
        </div>
      </section>

      {/* Upcoming Events */}
      <section className="py-16 px-4 bg-cream pattern-bg">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-gold font-cinzel text-sm uppercase tracking-widest mb-3">What&apos;s Coming</p>
            <h2 className="section-heading text-3xl font-bold mb-4">Upcoming Events</h2>
          </div>

          {upcoming.length === 0 ? (
            <p className="text-center text-foreground/60">No upcoming events at the moment. Check back soon.</p>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcoming.map((event) => (
                <div key={event.id} className="bg-white rounded-2xl overflow-hidden shadow-sm gold-border card-hover group">
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={event.image || IMAGES.altar}
                      alt={event.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-maroon/70 to-transparent" />
                    <div className="absolute top-3 left-3 bg-saffron text-white text-xs px-2 py-1 rounded font-medium">
                      Upcoming
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="font-cinzel font-semibold text-maroon text-lg mb-3">{event.title}</h3>
                    <div className="space-y-1.5 mb-4">
                      <div className="flex items-center gap-2 text-sm text-foreground/60">
                        <Calendar className="w-4 h-4 text-gold" />
                        {formatDate(event.date)}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-foreground/60">
                        <Clock className="w-4 h-4 text-gold" />
                        5:00 PM – 9:00 PM
                      </div>
                      {event.location && (
                        <div className="flex items-center gap-2 text-sm text-foreground/60">
                          <MapPin className="w-4 h-4 text-gold" />
                          {event.location}
                        </div>
                      )}
                    </div>
                    <p className="text-foreground/60 text-sm leading-relaxed mb-4 line-clamp-2">{event.description}</p>
                    <Link href="/auth/login" className="btn-primary w-full text-center text-sm py-2.5">
                      RSVP for this Event
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 2026 Calendar */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-gold font-cinzel text-sm uppercase tracking-widest mb-3">Annual Schedule</p>
          <h2 className="section-heading text-3xl font-bold mb-4">2026 Festival Calendar</h2>
          <p className="text-foreground/60 mb-8">Major Hindu festivals and celebrations throughout the year.</p>
          <div className="grid md:grid-cols-2 gap-4 text-left">
            {[
              { month: "January", festivals: ["Sankranti / Pongal", "Vaikuntha Ekadashi"] },
              { month: "February", festivals: ["Maha Shivaratri", "Thai Poosam"] },
              { month: "March", festivals: ["Ugadi (Telugu New Year)", "Holi", "Ram Navami"] },
              { month: "April", festivals: ["Hanuman Jayanti", "Akshaya Tritiya"] },
              { month: "May", festivals: ["Buddha Purnima", "Shankaracharya Jayanti"] },
              { month: "June", festivals: ["Vat Purnima", "Satyanarayana Pooja"] },
              { month: "July", festivals: ["Guru Purnima", "Ashadha Ekadashi"] },
              { month: "August", festivals: ["Krishna Janmashtami", "Ganesh Chaturthi", "Onam"] },
              { month: "September", festivals: ["Navaratri", "Dussehra"] },
              { month: "October", festivals: ["Diwali", "Lakshmi Puja", "Karthik Poornima"] },
              { month: "November", festivals: ["Skanda Sashti", "Karthigai Deepam"] },
              { month: "December", festivals: ["Gita Jayanti", "Vaikunta Ekadashi"] },
            ].map((month) => (
              <div key={month.month} className="flex items-start gap-4 p-4 bg-cream rounded-xl gold-border">
                <div className="font-cinzel font-bold text-maroon w-24 shrink-0">{month.month}</div>
                <div className="flex flex-wrap gap-2">
                  {month.festivals.map((f) => (
                    <span key={f} className="bg-white text-foreground/70 text-xs px-3 py-1 rounded-full border border-gold/20">
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Subscribe */}
      <section className="py-12 px-4" style={{ background: "linear-gradient(135deg, #6B0F1A, #4A0A12)" }}>
        <div className="max-w-2xl mx-auto text-center text-white">
          <h2 className="font-cinzel font-bold text-2xl mb-3">Stay Updated</h2>
          <p className="text-white/80 mb-6 text-sm">
            Register as a devotee to receive event reminders and festival notifications.
          </p>
          <Link href="/auth/register" className="btn-primary px-10 py-3">
            Register Now
          </Link>
        </div>
      </section>
    </div>
  );
}
