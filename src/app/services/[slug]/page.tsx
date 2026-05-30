import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Clock, ArrowLeft, CheckCircle } from "lucide-react";
import { SERVICES } from "@/lib/constants";
import BookingForm from "./BookingForm";

export async function generateStaticParams() {
  return SERVICES.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const service = SERVICES.find((s) => s.slug === slug);
  if (!service) return {};
  return { title: service.name, description: service.shortDesc };
}

export default async function ServiceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const service = SERVICES.find((s) => s.slug === slug);
  if (!service) notFound();

  return (
    <div>
      {/* Hero */}
      <section className="relative h-72 md:h-96 flex items-center justify-center overflow-hidden">
        <Image src={service.image} alt={service.name} fill className="object-cover" />
        <div className="absolute inset-0" style={{ background: "rgba(107,15,26,0.75)" }} />
        <div className="relative z-10 text-center px-4">
          <Link href="/services" className="inline-flex items-center gap-2 text-gold/80 hover:text-gold text-sm mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4" /> All Services
          </Link>
          <span className="block bg-gold/90 text-white text-xs px-3 py-1 rounded-full font-medium mb-3 inline-block">
            {service.category}
          </span>
          <h1 className="font-cinzel font-bold text-3xl md:text-5xl text-white">{service.name}</h1>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-3 gap-10">
          {/* Details */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-6 mb-8 p-5 bg-cream rounded-xl gold-border">
              <div>
                <div className="text-xs text-foreground/50 mb-1">Starting From</div>
                <div className="font-cinzel font-bold text-3xl text-saffron">${service.price}</div>
              </div>
              {service.duration && (
                <div className="border-l border-gold/30 pl-6">
                  <div className="text-xs text-foreground/50 mb-1">Duration</div>
                  <div className="flex items-center gap-1 text-maroon font-medium">
                    <Clock className="w-4 h-4" />
                    {service.duration}
                  </div>
                </div>
              )}
            </div>

            <h2 className="font-cinzel font-semibold text-maroon text-xl mb-4">About This Service</h2>
            <p className="text-foreground/70 leading-relaxed text-lg mb-8">{service.description}</p>

            <h2 className="font-cinzel font-semibold text-maroon text-xl mb-4">What to Expect</h2>
            <div className="space-y-3 mb-8">
              {[
                "Service performed by our trained and experienced priests",
                "Full Vedic procedures followed with authentic mantras",
                "All puja materials and offerings provided by the temple",
                "Prasadam (blessed food) distributed after the ceremony",
                "Digital receipt emailed to you immediately after booking",
              ].map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-saffron shrink-0 mt-0.5" />
                  <span className="text-foreground/70">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Booking Form */}
          <div className="lg:col-span-1">
            <div className="bg-cream rounded-2xl p-6 gold-border shadow-sm sticky top-24">
              <h3 className="font-cinzel font-semibold text-maroon text-xl mb-2">Book This Service</h3>
              <p className="text-foreground/60 text-sm mb-6">
                Fill in the details below and proceed to secure payment.
              </p>
              <BookingForm service={service} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
