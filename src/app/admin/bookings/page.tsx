import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatDate, formatCurrency } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";
import BookingActions from "./BookingActions";

export default async function AdminBookingsPage() {
  const session = await auth();
  if ((session?.user as { role?: string })?.role !== "ADMIN") redirect("/dashboard");

  const bookings = await db.booking.findMany({
    include: { service: true, user: true },
    orderBy: { createdAt: "desc" },
  }).catch(() => []);

  const statusColors: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-700",
    CONFIRMED: "bg-blue-100 text-blue-700",
    COMPLETED: "bg-green-100 text-green-700",
    CANCELLED: "bg-red-100 text-red-700",
  };

  return (
    <div className="min-h-screen bg-cream pattern-bg">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <Link href="/admin" className="inline-flex items-center gap-2 text-maroon/60 hover:text-maroon text-sm mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Admin Dashboard
        </Link>
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-cinzel font-bold text-3xl text-maroon">Bookings</h1>
          <span className="bg-yellow-100 text-yellow-700 text-sm px-3 py-1 rounded-full font-medium">
            {bookings.filter((b: { status: string }) => b.status === "PENDING").length} Pending
          </span>
        </div>

        <div className="bg-white rounded-2xl gold-border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-cream border-b border-gold/20">
                <tr>
                  {["Devotee", "Service", "Date", "Amount", "Status", "Actions"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left font-cinzel font-medium text-maroon text-xs">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gold/10">
                {bookings.map((b: { id: string; status: string; guestName?: string | null; guestEmail?: string | null; date: Date; amount: number; user?: { name?: string | null; email?: string | null } | null; service: { name: string } }) => (
                  <tr key={b.id} className="hover:bg-cream/50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-maroon">{b.user?.name || b.guestName || "Guest"}</p>
                      <p className="text-xs text-foreground/50">{b.user?.email || b.guestEmail}</p>
                    </td>
                    <td className="px-4 py-3 text-foreground/70">{b.service.name}</td>
                    <td className="px-4 py-3 text-foreground/70">{formatDate(b.date)}</td>
                    <td className="px-4 py-3 font-semibold text-saffron">{formatCurrency(b.amount)}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[b.status]}`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <BookingActions bookingId={b.id} status={b.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {bookings.length === 0 && (
            <p className="text-center text-foreground/50 py-12">No bookings yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
