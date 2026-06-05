import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";

export default async function AdminDevoteesPage() {
  const session = await auth();
  if ((session?.user as { role?: string })?.role !== "ADMIN") redirect("/dashboard");

  const devotees = await db.user.findMany({
    where: { role: "DEVOTEE" },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { bookings: true, donations: true } } },
  }).catch(() => []);

  return (
    <div className="min-h-screen bg-cream pattern-bg">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <Link href="/admin" className="inline-flex items-center gap-2 text-maroon/60 hover:text-maroon text-sm mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Admin Dashboard
        </Link>
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-cinzel font-bold text-3xl text-maroon">Devotees</h1>
          <span className="bg-blue-100 text-blue-700 text-sm px-3 py-1 rounded-full font-medium">
            {devotees.length} Total
          </span>
        </div>

        <div className="bg-white rounded-2xl gold-border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-cream border-b border-gold/20">
                <tr>
                  {["Name", "Email", "Phone", "City", "Bookings", "Donations", "Joined"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left font-cinzel font-medium text-maroon text-xs">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gold/10">
                {devotees.map((d: { id: string; name?: string | null; email: string; phone?: string | null; city?: string | null; createdAt: Date; _count: { bookings: number; donations: number } }) => (
                  <tr key={d.id} className="hover:bg-cream/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-maroon">{d.name || "—"}</td>
                    <td className="px-4 py-3 text-foreground/70">{d.email}</td>
                    <td className="px-4 py-3 text-foreground/70">{d.phone || "—"}</td>
                    <td className="px-4 py-3 text-foreground/70">{d.city || "—"}</td>
                    <td className="px-4 py-3 text-center">{d._count.bookings}</td>
                    <td className="px-4 py-3 text-center">{d._count.donations}</td>
                    <td className="px-4 py-3 text-foreground/50 text-xs">{formatDate(d.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {devotees.length === 0 && (
            <p className="text-center text-foreground/50 py-12">No devotees registered yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
