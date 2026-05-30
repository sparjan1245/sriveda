import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { TEMPLE, IMAGES, BOARD_MEMBERS } from "@/lib/constants";

export const metadata: Metadata = {
  title: "About Us",
  description: "Learn about Sri Veda Gayatri Temple, our mission, history, and board of directors.",
};

export default function AboutPage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative h-64 md:h-80 flex items-center justify-center overflow-hidden">
        <Image src={IMAGES.temple1} alt="About Sri Veda Gayatri Temple" fill className="object-cover" />
        <div className="absolute inset-0" style={{ background: "rgba(107,15,26,0.75)" }} />
        <div className="relative z-10 text-center px-4">
          <p className="text-gold font-cinzel text-sm uppercase tracking-widest mb-2">Who We Are</p>
          <h1 className="font-cinzel font-bold text-4xl md:text-5xl text-white">About Us</h1>
        </div>
      </section>

      {/* Mission */}
      <section className="py-16 px-4 bg-cream pattern-bg">
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-gold font-cinzel text-sm uppercase tracking-widest mb-3">Our Mission</p>
          <h2 className="section-heading text-3xl font-bold mb-6">Serving the Hindu Community</h2>
          <div className="lotus-divider"><span className="text-gold text-2xl">🌸</span></div>
          <p className="text-foreground/70 text-lg leading-relaxed max-w-3xl mx-auto mb-6">
            {TEMPLE.mission}
          </p>
          <blockquote className="font-cinzel text-xl text-maroon italic max-w-2xl mx-auto border-l-4 border-gold pl-6 text-left">
            &ldquo;{TEMPLE.quote}&rdquo;
          </blockquote>
        </div>
      </section>

      {/* History & Story */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-gold font-cinzel text-sm uppercase tracking-widest mb-3">Our Story</p>
              <h2 className="section-heading text-3xl font-bold mb-6 text-left">Founded With Purpose</h2>
              <p className="text-foreground/70 leading-relaxed mb-4">
                Sri Veda Gayatri Temple (Veda Gayatri Cultural Center) was founded in 2024 with a
                singular vision: to create a spiritual home for the Hindu community in California's
                Central Valley. Located in Manteca, CA, our temple serves as a beacon of spirituality,
                culture, and community for devotees across the region.
              </p>
              <p className="text-foreground/70 leading-relaxed mb-4">
                As a <strong>California Registered 501(c)(3) Non-Profit Organization</strong> (Tax ID: {TEMPLE.taxId}),
                we are committed to transparency, service, and the highest standards of Vedic tradition.
                All donations made to our temple are fully tax-deductible under U.S. law.
              </p>
              <p className="text-foreground/70 leading-relaxed mb-6">
                Our comprehensive offerings include daily and special pujas performed by trained priests,
                sacred homams, life-cycle samskaras, Vedic astrology consultations, cultural programs
                in classical music, Kuchipudi dance, Sanskrit language, and yoga — along with regular
                community events and the cherished Annadaanam (food offering) every Sunday.
              </p>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "Founded", value: "2024" },
                  { label: "Tax ID", value: TEMPLE.taxId },
                  { label: "Location", value: "Manteca, CA" },
                  { label: "Status", value: "501(c)(3)" },
                ].map((item) => (
                  <div key={item.label} className="bg-cream rounded-lg p-4 gold-border text-center">
                    <div className="font-cinzel font-bold text-maroon">{item.value}</div>
                    <div className="text-xs text-foreground/60 mt-1">{item.label}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[IMAGES.about1, IMAGES.about2, IMAGES.about3, IMAGES.about4].map((img, i) => (
                <div key={i} className="relative aspect-square rounded-xl overflow-hidden shadow-md">
                  <Image src={img} alt={`Temple ${i + 1}`} fill className="object-cover" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Board of Directors */}
      <section className="py-16 px-4 bg-cream pattern-bg">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-gold font-cinzel text-sm uppercase tracking-widest mb-3">Our Leadership</p>
            <h2 className="section-heading text-3xl font-bold mb-4">Board of Directors</h2>
            <p className="text-foreground/60 max-w-xl mx-auto">
              Our dedicated board of directors guides the temple with wisdom, devotion, and a
              commitment to serving our community.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {BOARD_MEMBERS.map((member) => (
              <div key={member.name} className="bg-white rounded-2xl p-6 shadow-sm gold-border flex items-center gap-6 card-hover">
                <div className="relative w-20 h-20 rounded-full overflow-hidden border-4 border-gold/30 shadow-md shrink-0">
                  <Image src={member.image} alt={member.name} fill className="object-cover" />
                </div>
                <div>
                  <h3 className="font-cinzel font-semibold text-maroon text-lg">{member.name}</h3>
                  <p className="text-saffron font-medium text-sm mt-1">{member.title}</p>
                  <p className="text-foreground/60 text-sm mt-2 leading-relaxed">
                    Dedicated to serving the spiritual and cultural needs of the Hindu community.
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Programs */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-gold font-cinzel text-sm uppercase tracking-widest mb-3">What We Do</p>
            <h2 className="section-heading text-3xl font-bold mb-4">Our Programs</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: "🕉",
                title: "Spiritual Services",
                items: ["Daily Archana & Abhishekam", "Special Pujas & Homams", "Samskaras", "Astrological Consultations"],
              },
              {
                icon: "🎭",
                title: "Cultural Programs",
                items: ["Classical Music", "Kuchipudi Dance", "Sanskrit Language", "Yoga & Meditation"],
              },
              {
                icon: "🤝",
                title: "Community Service",
                items: ["Weekly Annadaanam", "Festival Celebrations", "Youth Engagement", "Volunteer Programs"],
              },
            ].map((program) => (
              <div key={program.title} className="bg-cream rounded-2xl p-6 gold-border card-hover text-center">
                <div className="text-4xl mb-4">{program.icon}</div>
                <h3 className="font-cinzel font-semibold text-maroon text-lg mb-4">{program.title}</h3>
                <ul className="space-y-2">
                  {program.items.map((item) => (
                    <li key={item} className="text-sm text-foreground/70 flex items-center gap-2 justify-center">
                      <span className="text-gold">•</span> {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 px-4" style={{ background: "linear-gradient(135deg, #6B0F1A, #4A0A12)" }}>
        <div className="max-w-3xl mx-auto text-center text-white">
          <h2 className="font-cinzel font-bold text-2xl md:text-3xl mb-4">
            Join Our Spiritual Community
          </h2>
          <p className="text-white/80 mb-8">
            Register as a devotee to access all temple services, stay updated on events, and be part of our growing community.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/register" className="btn-primary px-8 py-3">Register as Devotee</Link>
            <Link href="/contact" className="border-2 border-white text-white px-8 py-3 rounded font-semibold hover:bg-white hover:text-maroon transition-colors">
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
