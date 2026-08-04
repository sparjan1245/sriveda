import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft, Calendar, MapPin } from "lucide-react";
import { IMAGES } from "@/lib/constants";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { formatDateTime } from "@/lib/utils";
import RegisterForm from "./RegisterForm";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const event = await db.event.findUnique({ where: { id } }).catch(() => null);
  if (!event) return {};
  return { title: `Register — ${event.title}` };
}

export default async function EventRegisterPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const event = await db.event.findUnique({ where: { id } }).catch(() => null);
  if (!event) notFound();

  const session = await auth();
  const userId = (session?.user as { id?: string })?.id ?? null;
  const userName = session?.user?.name ?? null;
  const userEmail = session?.user?.email ?? null;

  const donationOptions = await db.eventDonationOption
    .findMany({ where: { eventId: id, active: true }, orderBy: { order: "asc" } })
    .catch(() => []);

  return (
    <div>
      {/* ── Inner Page Banner ── */}
      <section className="relative h-20 md:h-22 flex items-center justify-center overflow-hidden">
        <Image src={IMAGES.puja} alt={event.title} fill className="object-cover object-center" priority />
        <div className="absolute inset-0 bg-black/55" />
        <div className="absolute inset-0 bg-maroon/60" />
        <div className="absolute bottom-0 inset-x-0 h-px bg-linear-to-r from-transparent via-gold/60 to-transparent" />
        <div className="relative z-10 text-center px-4">
          <div className="flex items-center justify-center gap-2 text-white/70 text-[11px] tracking-widest uppercase mb-3">
            <span>Home</span>
            <span className="text-gold/60">›</span>
            <Link href="/events" className="hover:text-gold/80">Events</Link>
            <span className="text-gold/60">›</span>
            <span className="text-gold/80">Register</span>
          </div>
        </div>
      </section>

      <section className="py-8 md:py-10 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <Link href="/events" className="inline-flex items-center gap-2 text-maroon/60 hover:text-maroon text-sm mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Events
          </Link>

          <div className="grid lg:grid-cols-5 gap-8">
            {/* ── Left: event info ── */}
            <div className="lg:col-span-2 space-y-4">
              {event.flyerImage ? (
                <div className="relative w-full rounded-2xl overflow-hidden gold-border shadow-lg bg-cream">
                  <Image src={event.flyerImage} alt={`${event.title} flyer`} width={800} height={1100} className="w-full h-auto object-contain" />
                </div>
              ) : (
                <div className="relative w-full aspect-video rounded-2xl overflow-hidden gold-border shadow-lg">
                  <Image src={event.image || IMAGES.puja} alt={event.title} fill className="object-cover" />
                </div>
              )}
              <div className="bg-cream rounded-2xl gold-border p-5">
                <h1 className="font-cinzel font-bold text-maroon text-xl leading-tight mb-3">{event.title}</h1>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-foreground/70 text-sm">
                    <Calendar className="w-4 h-4 text-saffron shrink-0" />
                    {formatDateTime(event.date)}
                  </div>
                  {event.location && (
                    <div className="flex items-center gap-2 text-foreground/70 text-sm">
                      <MapPin className="w-4 h-4 text-saffron shrink-0" />
                      {event.location}
                    </div>
                  )}
                </div>
                {event.description && (
                  <p className="text-foreground/70 text-sm leading-relaxed mt-4 pt-4 border-t border-gold/15">
                    {event.description}
                  </p>
                )}
              </div>
            </div>

            {/* ── Right: registration form ── */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-2xl gold-border shadow-md overflow-hidden">
                <div className="h-1 bg-linear-to-r from-saffron via-gold to-saffron" />
                <div className="p-6">
                  <span className="badge-gold mb-3 inline-flex text-xs px-3 py-1">Complete Your Registration</span>
                  <h2 className="font-cinzel font-bold text-maroon text-lg mb-1 leading-tight">Join Us for This Event</h2>
                  <p className="text-foreground/60 text-sm mb-5">
                    Register below and optionally support this event with a donation.
                  </p>
                  <RegisterForm
                    eventId={event.id}
                    eventTitle={event.title}
                    userId={userId}
                    userName={userName}
                    userEmail={userEmail}
                    donationOptions={donationOptions.map((o) => ({
                      id: o.id, name: o.name, description: o.description, amount: o.amount, recurring: o.recurring,
                    }))}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
