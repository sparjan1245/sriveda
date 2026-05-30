import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { Clock, ArrowRight } from "lucide-react";
import { IMAGES, SERVICES } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Our Services",
  description: "Explore our sacred services including Archana, Abhishekam, Homams, Samskaras, and Astrological Consultations.",
};

export default function ServicesPage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative h-64 md:h-80 flex items-center justify-center overflow-hidden">
        <Image src={IMAGES.altar} alt="Temple Services" fill className="object-cover" />
        <div className="absolute inset-0" style={{ background: "rgba(107,15,26,0.75)" }} />
        <div className="relative z-10 text-center px-4">
          <p className="text-gold font-cinzel text-sm uppercase tracking-widest mb-2">Divine Offerings</p>
          <h1 className="font-cinzel font-bold text-4xl md:text-5xl text-white">Our Services</h1>
        </div>
      </section>

      {/* Intro */}
      <section className="py-12 px-4 bg-cream">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-foreground/70 text-lg leading-relaxed">
            Our trained and experienced priests perform all Vedic rituals with authenticity and devotion.
            Each service is a sacred opportunity to connect with the Divine and seek blessings for
            you and your loved ones.
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-12 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            {SERVICES.map((service) => (
              <div key={service.slug} className="bg-cream rounded-2xl overflow-hidden shadow-sm gold-border card-hover group">
                <div className="relative h-56 overflow-hidden">
                  <Image
                    src={service.image}
                    alt={service.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-maroon/70 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <span className="bg-gold/90 text-white text-xs px-3 py-1 rounded-full font-medium">
                      {service.category}
                    </span>
                    <h2 className="font-cinzel font-bold text-white text-xl mt-2">{service.name}</h2>
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-foreground/70 leading-relaxed mb-4">{service.description}</p>
                  <div className="flex items-center justify-between pt-4 border-t border-gold/20">
                    <div className="flex items-center gap-4">
                      <div>
                        <span className="font-bold text-saffron text-2xl">From ${service.price}</span>
                      </div>
                      {service.duration && (
                        <div className="flex items-center gap-1 text-foreground/50 text-sm">
                          <Clock className="w-4 h-4" />
                          {service.duration}
                        </div>
                      )}
                    </div>
                    <Link href={`/services/${service.slug}`} className="btn-primary text-sm px-6 py-2.5 flex items-center gap-2">
                      Book Now <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Note */}
      <section className="py-12 px-4 bg-cream pattern-bg">
        <div className="max-w-3xl mx-auto text-center">
          <div className="bg-white rounded-2xl p-8 gold-border shadow-sm">
            <div className="text-3xl mb-4">🙏</div>
            <h3 className="font-cinzel font-semibold text-maroon text-xl mb-3">
              Need a Custom Service?
            </h3>
            <p className="text-foreground/70 mb-6">
              Our priests can also perform home visits for special ceremonies and rituals.
              Contact us to discuss your specific spiritual needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/contact" className="btn-primary px-8">Contact Us</Link>
              <Link href="/auth/register" className="btn-secondary px-8">Register as Devotee</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
