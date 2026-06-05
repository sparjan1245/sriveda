import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Clock, ArrowLeft, ArrowRight, Tag, Star } from "lucide-react";
import { IMAGES } from "@/lib/constants";
import { db } from "@/lib/db";
import BookingForm from "./BookingForm";

interface ServiceRow {
  id: string;
  slug: string;
  name: string;
  shortDesc: string | null;
  description: string;
  price: number;
  duration: string | null;
  image: string | null;
  category: string | null;
  active: boolean;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const service = await (db.service as any)
    .findFirst({ where: { slug } })
    .catch(() => null) as ServiceRow | null;
  if (!service) return {};
  return {
    title: service.name,
    description: service.shortDesc || service.description || undefined,
  };
}

export default async function ServiceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const svc = db.service as any;

  const service = await svc
    .findFirst({ where: { slug, active: true } })
    .catch(() => null) as ServiceRow | null;

  if (!service) notFound();

  const related = await svc
    .findMany({
      where: {
        active: true,
        slug: { not: slug },
        ...(service.category ? { category: service.category } : {}),
      },
      orderBy: { order: "asc" },
      take: 3,
    })
    .catch(() => []) as ServiceRow[];

  const includes = [
    { icon: "🛕", text: "Service performed by our trained and experienced priests" },
    { icon: "📿", text: "Full Vedic procedures followed with authentic mantras" },
    { icon: "🌺", text: "All puja materials and offerings provided by the temple" },
    { icon: "🍱", text: "Prasadam (blessed food) distributed after the ceremony" },
    { icon: "📧", text: "Digital receipt emailed to you immediately after booking" },
  ];

  const serviceImage = service.image || IMAGES.puja;

  return (
    <div>

      {/* ── Full Service Hero ── */}
       <section className="relative h-40 md:h-52 flex items-center justify-center overflow-hidden">
              <Image src={IMAGES.temple1} alt="Temple Services" fill className="object-cover object-center" priority />
              <div className="absolute inset-0 bg-black/55" />
              <div className="absolute inset-0 bg-maroon/60" />
              <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 70% 80% at 50% 50%, rgba(212,160,23,0.15) 0%, transparent 70%)" }} />
              <div className="absolute bottom-0 inset-x-0 h-px bg-linear-to-r from-transparent via-gold/60 to-transparent" />
      
              <div className="relative z-10 text-center px-4">
                <div className="flex items-center justify-center gap-2 text-white/70 text-[11px] tracking-widest uppercase mb-3">
                  <span>Home</span>
                  <span className="text-gold/60">›</span>
                  <span className="text-gold/80">Services</span>
                </div>
                <h1 className="font-cinzel font-bold text-2xl md:text-3xl text-white drop-shadow-md leading-tight">
                  Our Sacred Services
                </h1>
                <div className="flex items-center justify-center gap-3 my-2">
                  <span className="block h-px w-10 md:w-16 bg-linear-to-r from-transparent to-gold/60" />
                  <span className="text-gold text-base drop-shadow-sm">🪷</span>
                  <span className="block h-px w-10 md:w-16 bg-linear-to-l from-transparent to-gold/60" />
                </div>
                <p className="text-white/80 text-xs max-w-md mx-auto drop-shadow-sm">
                  Performed by trained and experienced priests with authentic Vedic procedures
                </p>
              </div>
            </section>

      {/* ── Main content ── */}
      <section className="py-8 md:py-10 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8">

            {/* ── Left column: full details ── */}
            <div className="lg:col-span-2 space-y-6">

              {/* Full service image — large showcase */}
              <div className="relative w-full rounded-2xl overflow-hidden gold-border shadow-lg aspect-video">
                <Image
                  src={serviceImage}
                  alt={service.name}
                  fill
                  className="object-cover"
                />
                {/* Subtle bottom label */}
                <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-maroon/70 to-transparent px-5 py-4">
                  <div className="flex items-center justify-between">
                    <span className="font-cinzel font-semibold text-white text-sm drop-shadow-md">{service.name}</span>
                    {service.category && (
                      <span className="bg-gold/90 text-white text-[10px] font-cinzel font-bold px-2.5 py-1 rounded-full uppercase tracking-widest">
                        {service.category}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Stats bar */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-cream rounded-xl p-4 gold-border text-center">
                  <Tag className="w-4 h-4 text-saffron mx-auto mb-1.5" />
                  <div className="font-cinzel font-bold text-saffron text-xl leading-none">${service.price}</div>
                  <div className="text-[11px] text-foreground/50 mt-1 uppercase tracking-wide font-light">Price</div>
                </div>
                <div className="bg-cream rounded-xl p-4 gold-border text-center">
                  <Clock className="w-4 h-4 text-saffron mx-auto mb-1.5" />
                  <div className="font-cinzel font-bold text-maroon text-sm leading-tight">
                    {service.duration || "Flexible"}
                  </div>
                  <div className="text-[11px] text-foreground/50 mt-1 uppercase tracking-wide font-light">Duration</div>
                </div>
                <div className="bg-cream rounded-xl p-4 gold-border text-center">
                  <Star className="w-4 h-4 text-saffron mx-auto mb-1.5" />
                  <div className="font-cinzel font-bold text-maroon text-xs leading-tight line-clamp-1">
                    {service.category || "Sacred Service"}
                  </div>
                  <div className="text-[11px] text-foreground/50 mt-1 uppercase tracking-wide font-light">Category</div>
                </div>
              </div>

              {/* Full description */}
              <div className="bg-white rounded-2xl gold-border p-6">
                <span className="badge-gold mb-3 inline-flex text-xs px-3 py-1">About This Service</span>
                <h2 className="font-cinzel font-bold text-lg md:text-xl text-maroon mb-3 leading-tight drop-shadow-sm">
                  {service.name}
                </h2>
                <div className="flex items-center gap-3 mb-4">
                  <span className="block h-px w-10 bg-linear-to-r from-transparent to-gold/60" />
                  <span className="text-gold">🪷</span>
                </div>
                {service.shortDesc && (
                  <p className="text-foreground/80 text-sm font-medium leading-relaxed mb-3 pb-3 border-b border-gold/15">
                    {service.shortDesc}
                  </p>
                )}
                <p className="text-foreground/65 text-sm font-light leading-relaxed">
                  {service.description || service.shortDesc || ""}
                </p>
              </div>

              {/* What's included */}
              <div className="bg-cream pattern-bg rounded-2xl p-6 gold-border">
                <span className="badge-gold mb-3 inline-flex text-xs px-3 py-1">What&apos;s Included</span>
                <h2 className="font-cinzel font-bold text-lg md:text-xl text-maroon mb-4 leading-tight drop-shadow-sm">
                  What to Expect
                </h2>
                <div className="grid sm:grid-cols-2 gap-3">
                  {includes.map((item) => (
                    <div key={item.text} className="flex items-start gap-3 bg-white/70 rounded-xl p-3">
                      <span className="text-base shrink-0">{item.icon}</span>
                      <span className="text-foreground/70 text-xs font-light leading-relaxed">{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mobile booking form */}
              <div className="lg:hidden bg-white rounded-2xl gold-border shadow-sm overflow-hidden">
                <div className="h-1 bg-linear-to-r from-saffron via-gold to-saffron" />
                <div className="p-5">
                  <span className="badge-gold mb-3 inline-flex text-xs px-3 py-1">Reserve Your Spot</span>
                  <h3 className="font-cinzel font-bold text-maroon text-lg mb-1 leading-tight">Book This Service</h3>
                  <p className="text-foreground/55 text-xs font-light mb-4">Fill in the details and proceed to payment.</p>
                  <div className="flex items-center justify-between bg-cream rounded-xl px-4 py-3 mb-4 gold-border">
                    <span className="text-xs text-foreground/50 uppercase tracking-wide">Service Fee</span>
                    <span className="font-cinzel font-bold text-saffron text-xl">${service.price}</span>
                  </div>
                  <BookingForm service={{ slug: service.slug, name: service.name, price: service.price }} />
                </div>
              </div>

            </div>

            {/* ── Right: Sticky booking sidebar ── */}
            <div className="hidden lg:block lg:col-span-1">
              <div className="bg-white rounded-2xl gold-border shadow-md sticky top-24 overflow-hidden">
                <div className="h-1 bg-linear-to-r from-saffron via-gold to-saffron" />

                {/* Service image thumbnail in sidebar */}
                <div className="relative h-40 overflow-hidden">
                  <Image src={serviceImage} alt={service.name} fill className="object-cover" />
                  <div className="absolute inset-0 bg-linear-to-t from-maroon/70 to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3">
                    <p className="font-cinzel font-bold text-white text-sm leading-snug drop-shadow-md line-clamp-2">
                      {service.name}
                    </p>
                    {service.category && (
                      <span className="text-[10px] text-gold/80 uppercase tracking-widest font-medium">
                        {service.category}
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-5">
                  <span className="badge-gold mb-3 inline-flex text-xs px-3 py-1">Reserve Your Spot</span>
                  <h3 className="font-cinzel font-bold text-maroon text-lg mb-1 leading-tight drop-shadow-sm">
                    Book This Service
                  </h3>
                  <p className="text-foreground/55 text-xs font-light mb-4">
                    Fill in the details below and proceed to secure payment.
                  </p>

                  {/* Price + duration summary */}
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <div className="bg-cream rounded-xl px-3 py-2.5 gold-border text-center">
                      <p className="text-[10px] text-foreground/40 uppercase tracking-wide leading-none mb-1">From</p>
                      <p className="font-cinzel font-bold text-saffron text-lg leading-none">${service.price}</p>
                    </div>
                    {service.duration && (
                      <div className="bg-cream rounded-xl px-3 py-2.5 gold-border text-center">
                        <p className="text-[10px] text-foreground/40 uppercase tracking-wide leading-none mb-1">Duration</p>
                        <p className="font-cinzel font-bold text-maroon text-xs leading-tight">{service.duration}</p>
                      </div>
                    )}
                  </div>

                  <BookingForm service={{ slug: service.slug, name: service.name, price: service.price }} />
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── Related Services ── */}
      {related.length > 0 && (
        <section className="py-8 md:py-6 px-4 bg-cream pattern-bg">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-end justify-between mb-8">
              <div>
                <span className="badge-gold mb-3 inline-flex text-xs px-3 py-1">More Like This</span>
                <h2 className="font-cinzel font-bold text-lg md:text-xl text-maroon leading-tight drop-shadow-sm">
                  {service.category ? `More ${service.category}` : "Other Services"}
                </h2>
              </div>
              <Link href="/services" className="text-xs text-saffron hover:text-maroon transition-colors font-medium flex items-center gap-1">
                All Services <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {related.map((r) => (
                <Link
                  key={r.slug}
                  href={`/services/${r.slug}`}
                  className="group bg-white rounded-2xl overflow-hidden gold-border shadow-sm card-hover flex flex-col"
                >
                  <div className="h-0.5 w-full bg-linear-to-r from-saffron to-gold opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="relative h-40 overflow-hidden bg-cream">
                    <Image
                      src={r.image || IMAGES.puja}
                      alt={r.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-black/5 transition-colors" />
                    {r.category && (
                      <div className="absolute top-2 left-2">
                        <span className="bg-white/95 text-maroon text-[9px] font-cinzel font-bold px-2 py-1 rounded-full uppercase tracking-widest shadow-sm">
                          {r.category}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="p-4 flex flex-col flex-1">
                    <h3 className="font-cinzel font-semibold text-maroon text-xs md:text-sm leading-snug mb-2 line-clamp-2">
                      {r.name}
                    </h3>
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-cinzel font-bold text-saffron text-base">${r.price}</span>
                      {r.duration && (
                        <span className="flex items-center gap-1 text-foreground/45 text-[11px]">
                          <Clock className="w-3 h-3" /> {r.duration}
                        </span>
                      )}
                    </div>
                    <p className="text-foreground/55 text-xs font-light leading-relaxed line-clamp-2 flex-1 mb-3">
                      {r.shortDesc || r.description}
                    </p>
                    <div className="text-xs text-saffron font-medium group-hover:text-maroon transition-colors flex items-center gap-1">
                      Book Now <ArrowRight className="w-3 h-3" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

    </div>
  );
}
