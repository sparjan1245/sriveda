import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatCurrency } from "@/lib/utils";
import { Users, BookOpen, Heart, MessageSquare, Calendar, Image, Settings } from "lucide-react";

export default async function AdminPage() {
  const session = await auth();
  const userRole = (session?.user as { role?: string })?.role;
  if (!session?.user || userRole !== "ADMIN") redirect("/dashboard");

  const [devoteeCount, bookingCount, donationSum, messageCount, pendingBookings] = await Promise.all([
    db.user.count({ where: { role: "DEVOTEE" } }).catch(() => 0),
    db.booking.count().catch(() => 0),
    db.donation.aggregate({ _sum: { amount: true }, where: { status: "COMPLETED" } }).catch(() => ({ _sum: { amount: 0 } })),
    db.contactMessage.count({ where: { read: false } }).catch(() => 0),
    db.booking.count({ where: { status: "PENDING" } }).catch(() => 0),
  ]);

  const totalDonated = donationSum._sum.amount || 0;

  const adminLinks = [
    { label: "Devotees", href: "/admin/devotees", icon: <Users />, desc: "Manage devotee accounts" },
    { label: "Bookings", href: "/admin/bookings", icon: <BookOpen />, desc: "Service requests", badge: pendingBookings },
    { label: "Donations", href: "/admin/donations", icon: <Heart />, desc: "Donation records" },
    { label: "Events", href: "/admin/events", icon: <Calendar />, desc: "Create & manage events" },
    { label: "Gallery", href: "/admin/gallery", icon: <Image />, desc: "Upload photos" },
    { label: "Messages", href: "/admin/messages", icon: <MessageSquare />, desc: "Contact inbox", badge: messageCount },
    { label: "Services", href: "/admin/services", icon: <Settings />, desc: "Manage service offerings" },
  ];

  return (
    <div className="min-h-screen bg-cream pattern-bg">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="mb-8">
          <p className="text-gold font-cinzel text-sm uppercase tracking-widest mb-1">Admin Panel</p>
          <h1 className="font-cinzel font-bold text-3xl text-maroon">Dashboard</h1>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { label: "Total Devotees", value: devoteeCount, color: "text-blue-600" },
            { label: "Total Bookings", value: bookingCount, color: "text-saffron" },
            { label: "Total Donated", value: formatCurrency(totalDonated), color: "text-green-600" },
            { label: "Unread Messages", value: messageCount, color: "text-red-500" },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl p-5 gold-border shadow-sm text-center">
              <div className={`font-cinzel font-bold text-2xl ${stat.color}`}>{stat.value}</div>
              <div className="text-xs text-foreground/60 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Admin Navigation */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {adminLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="bg-white rounded-2xl p-6 gold-border shadow-sm hover:border-saffron transition-colors group relative"
            >
              {(link.badge ?? 0) > 0 && (
                <span className="absolute top-4 right-4 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                  {link.badge}
                </span>
              )}
              <div className="text-saffron w-8 h-8 mb-4 group-hover:scale-110 transition-transform">
                {link.icon}
              </div>
              <h3 className="font-cinzel font-semibold text-maroon text-lg mb-1">{link.label}</h3>
              <p className="text-foreground/50 text-sm">{link.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
