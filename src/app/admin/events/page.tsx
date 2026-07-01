import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatDateTime } from "@/lib/utils";
import { ArrowLeft, Calendar, MapPin, Star, CalendarDays } from "lucide-react";
import { IMAGES } from "@/lib/constants";
import EventForm from "./EventForm";
import DeleteEventButton from "./DeleteEventButton";
import EditEventButton from "./EditEventButton";
import RsvpListButton from "./RsvpListButton";

export default async function AdminEventsPage() {
  const session = await auth();
  if ((session?.user as { role?: string })?.role !== "ADMIN") redirect("/dashboard");

  const events = await db.event.findMany({
    orderBy: { date: "asc" },
    include: {
      _count: { select: { rsvps: true } },
      rsvps: {
        include: { user: { select: { id: true, name: true, email: true, image: true } } },
        orderBy: { createdAt: "asc" },
      },
    },
  }).catch(() => []);

  const now = new Date();
  const upcoming = events.filter((e) => new Date(e.date) >= now).length;
  const total = events.length;

  return (
    <div className="min-h-screen bg-cream pattern-bg">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 text-maroon/60 hover:text-maroon text-sm mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Admin Dashboard
        </Link>

        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-gold font-cinzel text-sm uppercase tracking-widest mb-1">Admin</p>
            <h1 className="font-cinzel font-bold text-3xl text-maroon">Events</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-white rounded-xl px-4 py-2 gold-border text-center">
              <div className="font-cinzel font-bold text-xl text-maroon">{upcoming}</div>
              <div className="text-xs text-foreground/50">Upcoming</div>
            </div>
            <div className="bg-white rounded-xl px-4 py-2 gold-border text-center">
              <div className="font-cinzel font-bold text-xl text-maroon">{total}</div>
              <div className="text-xs text-foreground/50">Total</div>
            </div>
            <EventForm />
          </div>
        </div>

        {events.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl gold-border">
            <CalendarDays className="w-12 h-12 text-gold/40 mx-auto mb-4" />
            <p className="text-foreground/50 mb-2 font-cinzel">No events yet.</p>
            <p className="text-foreground/40 text-sm mb-6">Click &ldquo;Add Event&rdquo; to create your first event.</p>
            <EventForm />
          </div>
        ) : (
          <div className="bg-white rounded-2xl gold-border shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gold/20 bg-cream/50">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-maroon/60 uppercase tracking-wider w-20">Image</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-maroon/60 uppercase tracking-wider">Title</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-maroon/60 uppercase tracking-wider w-40">Date & Time</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-maroon/60 uppercase tracking-wider w-32">Location</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-maroon/60 uppercase tracking-wider w-20">Status</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-maroon/60 uppercase tracking-wider w-20">RSVPs</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-maroon/60 uppercase tracking-wider w-28">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gold/10">
                  {events.map((event) => {
                    const isPast = new Date(event.date) < now;
                    return (
                      <tr
                        key={event.id}
                        className={`transition-colors hover:bg-cream/20 ${isPast ? "opacity-50" : ""}`}
                      >
                        {/* Image */}
                        <td className="px-4 py-3 align-middle">
                          <div className="relative w-14 h-10 rounded-lg overflow-hidden bg-cream">
                            <Image
                              src={event.image || IMAGES.puja}
                              alt={event.title}
                              fill
                              className="object-cover"
                            />
                          </div>
                        </td>

                        {/* Title */}
                        <td className="px-4 py-3 align-middle max-w-xs">
                          <div className="flex items-center gap-2 mb-0.5">
                            <p className="font-cinzel font-semibold text-maroon text-sm line-clamp-1">
                              {event.title}
                            </p>
                            {event.featured && (
                              <span className="inline-flex items-center gap-0.5 text-[10px] bg-saffron/10 text-saffron px-1.5 py-0.5 rounded font-medium shrink-0">
                                <Star className="w-2.5 h-2.5" /> Featured
                              </span>
                            )}
                          </div>
                          {event.description && (
                            <p className="text-foreground/45 text-xs font-light line-clamp-1">
                              {event.description}
                            </p>
                          )}
                        </td>

                        {/* Date */}
                        <td className="px-4 py-3 align-middle">
                          <div className="flex items-center gap-1.5 text-xs text-foreground/60">
                            <Calendar className="w-3 h-3 text-saffron shrink-0" />
                            <span>{formatDateTime(event.date)}</span>
                          </div>
                          {isPast && (
                            <span className="text-[10px] text-foreground/35 font-light">Past event</span>
                          )}
                        </td>

                        {/* Location */}
                        <td className="px-4 py-3 align-middle">
                          {event.location ? (
                            <div className="flex items-center gap-1.5 text-xs text-foreground/60">
                              <MapPin className="w-3 h-3 text-saffron shrink-0" />
                              <span className="line-clamp-1">{event.location}</span>
                            </div>
                          ) : (
                            <span className="text-foreground/30 text-xs">—</span>
                          )}
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3 align-middle">
                          {isPast ? (
                            <span className="inline-flex text-xs bg-gray-100 text-gray-500 px-2.5 py-1 rounded-full font-medium">Past</span>
                          ) : (
                            <span className="inline-flex text-xs bg-green-100 text-green-700 px-2.5 py-1 rounded-full font-medium">Upcoming</span>
                          )}
                        </td>

                        {/* RSVPs */}
                        <td className="px-4 py-3 align-middle">
                          <RsvpListButton rsvps={event.rsvps as Array<{ id: string; createdAt: Date; user: { id: string; name: string | null; email: string | null; image: string | null } }>} />
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3 align-middle">
                          <div className="flex items-center gap-1.5">
                            <EditEventButton event={event} />
                            <DeleteEventButton eventId={event.id} />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
