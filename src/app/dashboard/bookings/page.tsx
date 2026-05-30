import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatDate, formatCurrency } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-700",
  CONFIRMED: "bg-blue-100 text-blue-700",
  COMPLETED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
};

export default async function BookingsPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");

  const userId = (session.user as { id: string }).id;
  const bookings = await db.booking.findMany({
    where: { userId },
    include: { service: true },
    orderBy: { createdAt: "desc" },
  }).catch(() => []);

  return (
    <div className="min-h-screen bg-cream pattern-bg">
      <div className="max-w-4xl mx-auto px-4 py-10">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-maroon/60 hover:text-maroon text-sm mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
        <h1 className="font-cinzel font-bold text-3xl text-maroon mb-8">My Bookings</h1>

        {bookings.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl gold-border">
            <div className="text-4xl mb-4">📅</div>
            <p className="text-foreground/60 mb-6">You have no bookings yet.</p>
            <Link href="/services" className="btn-primary px-8">Book a Service</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((b: { id: string; status: string; amount: number; date: Date; occasion?: string | null; notes?: string | null; createdAt: Date; service: { name: string } }) => (
              <div key={b.id} className="bg-white rounded-2xl p-6 gold-border shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-cinzel font-semibold text-maroon text-lg">{b.service.name}</h3>
                    <p className="text-foreground/60 text-sm mt-1">
                      Date: {formatDate(b.date)}
                    </p>
                    {b.occasion && <p className="text-foreground/50 text-sm">Occasion: {b.occasion}</p>}
                    {b.notes && <p className="text-foreground/50 text-xs mt-1 italic">{b.notes}</p>}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`text-xs px-3 py-1 rounded-full font-medium ${statusColors[b.status]}`}>
                      {b.status}
                    </span>
                    <span className="font-bold text-saffron text-lg">{formatCurrency(b.amount)}</span>
                    <p className="text-xs text-foreground/40">Booked {formatDate(b.createdAt)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
