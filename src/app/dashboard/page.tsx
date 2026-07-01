import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatDate, formatCurrency } from "@/lib/utils";
import { Calendar, Heart, BookOpen, User, ArrowRight, MapPin } from "lucide-react";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/login?redirect=/dashboard");

  const userId = (session.user as { id: string }).id;

  const [bookings, donations, rsvps] = await Promise.all([
    db.booking.findMany({
      where: { userId },
      include: { service: true },
      orderBy: { createdAt: "desc" },
      take: 5,
    }).catch(() => []),
    db.donation.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 5,
    }).catch(() => []),
    db.eventRsvp.findMany({
      where: { userId },
      include: { event: true },
      orderBy: { createdAt: "desc" },
    }).catch(() => []),
  ]);

  const upcomingRsvps = (rsvps as Array<{ id: string; event: { id: string; title: string; date: Date; location: string | null; image: string | null } }>)
    .filter((r) => new Date(r.event.date) >= new Date())
    .sort((a, b) => new Date(a.event.date).getTime() - new Date(b.event.date).getTime());

  const totalDonated = donations.reduce((sum: number, d: { amount: number }) => sum + d.amount, 0);

  const statusColors: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-700",
    CONFIRMED: "bg-blue-100 text-blue-700",
    COMPLETED: "bg-green-100 text-green-700",
    CANCELLED: "bg-red-100 text-red-700",
  };

  return (
    <div className="min-h-screen bg-cream pattern-bg">
      <div className="max-w-7xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="mb-8">
          <p className="text-gold font-cinzel text-sm uppercase tracking-widest mb-1">Devotee Portal</p>
          <h1 className="font-cinzel font-bold text-3xl text-maroon">
            Welcome, {session.user.name?.split(" ")[0]} 🙏
          </h1>
          <p className="text-foreground/60 mt-1">Manage your bookings, donations, and profile.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { icon: <BookOpen className="w-6 h-6" />, label: "Total Bookings", value: bookings.length },
            { icon: <Heart className="w-6 h-6" />, label: "Total Donated", value: formatCurrency(totalDonated) },
            { icon: <Calendar className="w-6 h-6" />, label: "RSVPed Events", value: upcomingRsvps.length },
            { icon: <User className="w-6 h-6" />, label: "Account Status", value: "Active" },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl p-5 gold-border shadow-sm text-center">
              <div className="text-saffron flex justify-center mb-2">{stat.icon}</div>
              <div className="font-cinzel font-bold text-xl text-maroon">{stat.value}</div>
              <div className="text-xs text-foreground/60 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Recent Bookings */}
          <div className="bg-white rounded-2xl shadow-sm gold-border p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-cinzel font-semibold text-maroon text-lg">Recent Bookings</h2>
              <Link href="/dashboard/bookings" className="text-saffron text-sm flex items-center gap-1 hover:underline">
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            {bookings.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-foreground/50 text-sm mb-4">No bookings yet.</p>
                <Link href="/services" className="btn-primary text-sm px-6">Book a Service</Link>
              </div>
            ) : (
              <div className="space-y-3">
                {bookings.map((b: { id: string; status: string; amount: number; date: Date; service: { name: string } }) => (
                  <div key={b.id} className="flex items-center justify-between p-3 bg-cream rounded-lg">
                    <div>
                      <p className="font-medium text-sm text-maroon">{b.service.name}</p>
                      <p className="text-xs text-foreground/50">{formatDate(b.date)}</p>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[b.status]}`}>
                        {b.status}
                      </span>
                      <p className="text-xs text-foreground/60 mt-1">{formatCurrency(b.amount)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Donations */}
          <div className="bg-white rounded-2xl shadow-sm gold-border p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-cinzel font-semibold text-maroon text-lg">Recent Donations</h2>
              <Link href="/dashboard/donations" className="text-saffron text-sm flex items-center gap-1 hover:underline">
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            {donations.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-foreground/50 text-sm mb-4">No donations yet.</p>
                <Link href="/donate" className="btn-primary text-sm px-6">Make a Donation</Link>
              </div>
            ) : (
              <div className="space-y-3">
                {donations.map((d: { id: string; status: string; cause: string; amount: number; createdAt: Date }) => (
                  <div key={d.id} className="flex items-center justify-between p-3 bg-cream rounded-lg">
                    <div>
                      <p className="font-medium text-sm text-maroon">{d.cause}</p>
                      <p className="text-xs text-foreground/50">{formatDate(d.createdAt)}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-saffron text-sm">{formatCurrency(d.amount)}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[d.status]}`}>
                        {d.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* My RSVPs */}
        <div className="mt-8 bg-white rounded-2xl shadow-sm gold-border p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-cinzel font-semibold text-maroon text-lg">My RSVPs</h2>
            <Link href="/events" className="text-saffron text-sm flex items-center gap-1 hover:underline">
              Browse Events <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {upcomingRsvps.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-foreground/60 text-sm mb-4">You haven&apos;t RSVPed to any upcoming events.</p>
              <Link href="/events" className="btn-primary text-sm px-6">Browse Events</Link>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {upcomingRsvps.map((r) => {
                const d = new Date(r.event.date);
                const day   = d.getDate();
                const month = d.toLocaleString("en-US", { month: "short" }).toUpperCase();
                return (
                  <div key={r.id} className="flex items-start gap-3 p-4 bg-cream rounded-xl gold-border">
                    {/* Date badge */}
                    <div className="shrink-0 bg-white rounded-xl px-3 py-2 text-center shadow-sm gold-border">
                      <div className="font-cinzel font-bold text-maroon text-xl leading-none">{day}</div>
                      <div className="text-saffron text-[10px] font-bold tracking-widest mt-0.5">{month}</div>
                    </div>
                    <div className="min-w-0">
                      <p className="font-cinzel font-semibold text-maroon text-sm leading-snug mb-1 truncate">{r.event.title}</p>
                      <p className="text-foreground/70 text-xs mb-1">
                        {d.toLocaleString("en-US", { weekday: "short", hour: "numeric", minute: "2-digit" })}
                      </p>
                      {r.event.location && (
                        <p className="flex items-center gap-1 text-foreground/60 text-xs truncate">
                          <MapPin className="w-3 h-3 text-gold shrink-0" />{r.event.location}
                        </p>
                      )}
                      <div className="mt-2 inline-flex items-center gap-1 text-[11px] text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full font-medium">
                        ✓ RSVPed
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid sm:grid-cols-3 gap-4">
          {[
            { label: "Book a Service", href: "/services", icon: "🕉", desc: "Schedule a puja or homam" },
            { label: "Make a Donation", href: "/donate", icon: "🙏", desc: "Support the temple" },
            { label: "Edit Profile", href: "/dashboard/profile", icon: "👤", desc: "Update your details" },
          ].map((action) => (
            <Link key={action.label} href={action.href} className="bg-white rounded-xl p-5 gold-border shadow-sm hover:border-saffron transition-colors flex items-center gap-4 group">
              <div className="text-3xl">{action.icon}</div>
              <div>
                <div className="font-semibold text-maroon text-sm group-hover:text-saffron transition-colors">{action.label}</div>
                <div className="text-xs text-foreground/50 mt-0.5">{action.desc}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
