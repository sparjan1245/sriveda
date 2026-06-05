import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatDate, formatCurrency } from "@/lib/utils";
import { Calendar, Heart, BookOpen, User, ArrowRight } from "lucide-react";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/login?redirect=/dashboard");

  const userId = (session.user as { id: string }).id;

  const [bookings, donations] = await Promise.all([
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
  ]);

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
            { icon: <Calendar className="w-6 h-6" />, label: "Upcoming Events", value: "–" },
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
