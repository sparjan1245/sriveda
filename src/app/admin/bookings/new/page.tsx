import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { ArrowLeft } from "lucide-react";
import AdminBookingForm from "./AdminBookingForm";

export default async function NewBookingPage() {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  if (role !== "ADMIN") redirect("/dashboard");

  const services = await db.service.findMany({
    where: { active: true },
    orderBy: { name: "asc" },
    select: { id: true, name: true, price: true, category: true },
  }).catch(() => []);

  return (
    <div className="min-h-screen bg-cream pattern-bg">
      <div className="max-w-3xl mx-auto px-4 py-10">
        <Link href="/admin/bookings" className="inline-flex items-center gap-2 text-maroon/60 hover:text-maroon text-sm mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Bookings
        </Link>
        <div className="mb-8">
          <p className="text-gold font-cinzel text-sm uppercase tracking-widest mb-1">Walk-in Entry</p>
          <h1 className="font-cinzel font-bold text-3xl text-maroon">New Booking</h1>
          <p className="text-foreground/60 mt-1 text-sm">Record a service booking for a devotee at the temple. A receipt will be generated immediately.</p>
        </div>
        <AdminBookingForm services={services} />
      </div>
    </div>
  );
}
