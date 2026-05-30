import Image from "next/image";
import Link from "next/link";
import { Calendar, Heart, Star, Users, Phone, MapPin, Clock, ArrowRight, CheckCircle } from "lucide-react";
import { TEMPLE, IMAGES, SERVICES, BOARD_MEMBERS } from "@/lib/constants";

import HeroSlider from "@/components/home/HeroSlider";

export default function HomePage() {
  return (
    <div className="overflow-x-hidden">
      {/* Hero Section */}
      <HeroSlider />

      {/* Info strip */}
      <div className="bg-gradient-to-r from-saffron to-gold text-white py-4">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center text-sm font-medium">
            <div className="flex items-center justify-center gap-2">
              <Clock className="w-4 h-4" />
              <span>Mon–Sun: 5:00 PM – 9:00 PM</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <MapPin className="w-4 h-4" />
              <span>702 W Yosemite Ave, Manteca, CA</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Phone className="w-4 h-4" />
              <span>+1 (669) 213-8780</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <section className="py-16 px-4 bg-cream pattern-bg">
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-gold font-cinzel text-sm uppercase tracking-widest mb-3">Our Purpose</p>
          <h2 className="section-heading text-3xl md:text-4xl font-bold mb-6">
            A Sanctuary for the Soul
          </h2>
          <div className="lotus-divider">
            <span className="text-gold text-2xl">🌸</span>
          </div>
          <p className="text-foreground/70 text-lg leading-relaxed max-w-3xl mx-auto mb-10">
            {TEMPLE.mission} As a <strong>California Registered 501(c)(3) Non-Profit</strong>, every
            contribution goes directly toward serving the spiritual needs of our community.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: <Star className="w-8 h-8" />, label: "Spiritual Services", value: "4+" },
              { icon: <Calendar className="w-8 h-8" />, label: "Events Per Year", value: "50+" },
              { icon: <Users className="w-8 h-8" />, label: "Community Members", value: "500+" },
              { icon: <Heart className="w-8 h-8" />, label: "Founded", value: "2024" },
            ].map((stat) => (
              <div key={stat.label} className="bg-white rounded-xl p-5 shadow-sm gold-border text-center card-hover">
                <div className="text-saffron flex justify-center mb-2">{stat.icon}</div>
                <div className="font-cinzel font-bold text-2xl text-maroon">{stat.value}</div>
                <div className="text-xs text-foreground/60 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-gold font-cinzel text-sm uppercase tracking-widest mb-3">What We Offer</p>
            <h2 className="section-heading text-3xl md:text-4xl font-bold mb-4">
              Our Sacred Services
            </h2>
            <p className="text-foreground/60 max-w-xl mx-auto">
              Experience the divine through authentic Vedic rituals performed by trained and experienced priests.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {SERVICES.map((service) => (
              <div key={service.slug} className="group bg-cream rounded-2xl overflow-hidden shadow-sm border border-gold/20 card-hover">
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={service.image}
                    alt={service.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-maroon/60 to-transparent" />
                  <div className="absolute bottom-3 left-3">
                    <span className="bg-gold/90 text-white text-xs px-2 py-0.5 rounded font-medium">
                      {service.category}
                    </span>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-cinzel font-semibold text-maroon text-base mb-2 leading-tight">
                    {service.name}
                  </h3>
                  <p className="text-foreground/60 text-sm leading-relaxed mb-4 line-clamp-3">
                    {service.shortDesc}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-saffron text-lg">From ${service.price}</span>
                    <Link
                      href={`/services/${service.slug}`}
                      className="text-sm text-maroon hover:text-saffron font-medium flex items-center gap-1 transition-colors"
                    >
                      Book <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link href="/services" className="btn-primary px-10 py-3">
              View All Services
            </Link>
          </div>
        </div>
      </section>

      {/* About / Gallery Section */}
      <section className="py-16 px-4 bg-cream pattern-bg">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-gold font-cinzel text-sm uppercase tracking-widest mb-3">Who We Are</p>
              <h2 className="section-heading text-3xl md:text-4xl font-bold mb-6 text-left">
                About Our Temple
              </h2>
              <p className="text-foreground/70 leading-relaxed mb-4">
                Founded in 2024, Sri Veda Gayatri Temple is a spiritual and charitable non-profit
                organization dedicated to serving the Hindu community in and around Manteca, California.
              </p>
              <p className="text-foreground/70 leading-relaxed mb-6">
                Our temple offers daily and special pujas performed by trained priests, cultural programs
                in music, dance, language, and yoga, community events, and Annadaanam (food offering).
              </p>
              <blockquote className="border-l-4 border-gold pl-5 py-2 mb-6 italic text-maroon font-cinzel">
                &ldquo;{TEMPLE.quote}&rdquo;
              </blockquote>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/about" className="btn-primary">Learn More About Us</Link>
                <Link href="/auth/register" className="btn-secondary">Become a Devotee</Link>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[IMAGES.about1, IMAGES.about2, IMAGES.about3, IMAGES.about4].map((img, i) => (
                <div key={i} className="relative aspect-square rounded-xl overflow-hidden shadow-md">
                  <Image
                    src={img}
                    alt={`Temple ${i + 1}`}
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Donation Banner */}
      <section className="py-16 px-4" style={{ background: "linear-gradient(135deg, #6B0F1A, #4A0A12)" }}>
        <div className="max-w-5xl mx-auto text-center text-white">
          <div className="text-4xl mb-4">🙏</div>
          <h2 className="font-cinzel font-bold text-3xl md:text-4xl mb-4">
            Support Our Sacred Mission
          </h2>
          <p className="text-white/80 text-lg mb-2">
            We are a registered 501(c)(3) nonprofit organization.
          </p>
          <p className="text-gold text-sm mb-8 font-medium">
            All donations are fully tax-deductible · Tax ID: {TEMPLE.taxId}
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            {[
              { amount: "$51", label: "Anna Prasadam" },
              { amount: "$75", label: "Pushpa Alankara" },
              { amount: "$116", label: "Abhishekam Seva" },
              { amount: "Custom", label: "Your Amount" },
            ].map((tier) => (
              <Link
                key={tier.label}
                href="/donate"
                className="bg-white/10 border border-white/20 rounded-xl p-4 hover:bg-white/20 transition-colors block text-center"
              >
                <div className="font-cinzel font-bold text-2xl text-gold">{tier.amount}</div>
                <div className="text-white/80 text-sm mt-1">{tier.label}</div>
              </Link>
            ))}
          </div>
          <Link href="/donate" className="btn-primary text-base px-12 py-4">
            Donate Now
          </Link>
        </div>
      </section>

      {/* Leadership */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-gold font-cinzel text-sm uppercase tracking-widest mb-3">Leadership</p>
            <h2 className="section-heading text-3xl md:text-4xl font-bold mb-4">
              Our Board of Directors
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {BOARD_MEMBERS.map((member) => (
              <div key={member.name} className="text-center card-hover">
                <div className="relative w-24 h-24 rounded-full overflow-hidden mx-auto mb-4 border-4 border-gold/30 shadow-md">
                  <Image src={member.image} alt={member.name} fill className="object-cover" />
                </div>
                <h4 className="font-cinzel font-semibold text-maroon text-sm">{member.name}</h4>
                <p className="text-foreground/60 text-xs mt-1">{member.title}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link href="/about" className="btn-secondary px-8">Meet Our Team</Link>
          </div>
        </div>
      </section>

      {/* Become a Devotee */}
      <section className="py-16 px-4 bg-cream pattern-bg">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-gold font-cinzel text-sm uppercase tracking-widest mb-3">Join Us</p>
            <h2 className="section-heading text-3xl md:text-4xl font-bold mb-4">
              Become a Devotee
            </h2>
            <p className="text-foreground/60 max-w-xl mx-auto">
              Register to book services, track donations, receive tax receipts, and stay connected with temple events.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              "Book puja and homam services online",
              "Receive instant digital receipts for tax deductions",
              "Get early access to festival registrations",
              "Track your donation history and download PDFs",
              "Add family members for collective blessings",
              "Receive reminders for upcoming temple events",
            ].map((benefit) => (
              <div key={benefit} className="flex items-center gap-3 bg-white rounded-lg p-4 shadow-sm gold-border">
                <CheckCircle className="w-5 h-5 text-saffron shrink-0" />
                <span className="text-sm text-foreground/80">{benefit}</span>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link href="/auth/register" className="btn-primary px-12 py-4 text-base">
              Register as a Devotee — It&apos;s Free
            </Link>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-10 px-4 bg-gradient-to-r from-saffron to-gold text-white">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="font-cinzel font-bold text-xl mb-1">Have Questions?</h3>
            <p className="text-white/80 text-sm">Our team is here to help with any inquiries about services or events.</p>
          </div>
          <div className="flex gap-4">
            <a href="tel:+16692138780" className="bg-white text-saffron font-semibold px-6 py-3 rounded text-sm hover:bg-cream transition-colors">
              Call Us
            </a>
            <Link href="/contact" className="border-2 border-white text-white font-semibold px-6 py-3 rounded text-sm hover:bg-white hover:text-saffron transition-colors">
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
