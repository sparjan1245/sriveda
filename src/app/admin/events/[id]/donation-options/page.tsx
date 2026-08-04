import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { ArrowLeft } from "lucide-react";
import DonationOptionsManager from "./DonationOptionsManager";

export const dynamic = "force-dynamic";

export default async function EventDonationOptionsPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if ((session?.user as { role?: string })?.role !== "ADMIN") redirect("/dashboard");

  const { id } = await params;
  const event = await db.event.findUnique({ where: { id } }).catch(() => null);
  if (!event) notFound();

  const options = await db.eventDonationOption
    .findMany({ where: { eventId: id }, orderBy: { order: "asc" } })
    .catch(() => []);

  return (
    <div className="min-h-screen bg-cream pattern-bg">
      <div className="max-w-3xl mx-auto px-4 py-10">
        <Link href="/admin/events" className="inline-flex items-center gap-2 text-maroon/60 hover:text-maroon text-sm mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Events
        </Link>
        <p className="text-maroon font-cinzel text-base font-extrabold uppercase tracking-widest mb-1">Admin</p>
        <h1 className="font-cinzel font-bold text-3xl text-maroon mb-1">Donation Options</h1>
        <p className="text-foreground/60 text-sm mb-8">
          Suggested donation amounts shown on the registration page for <strong>{event.title}</strong>.
        </p>

        <DonationOptionsManager eventId={id} initialOptions={options} />
      </div>
    </div>
  );
}
