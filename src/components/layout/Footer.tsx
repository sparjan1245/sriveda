import Link from "next/link";
import Image from "next/image";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { TEMPLE } from "@/lib/constants";

export default function Footer() {
  return (
    <footer className="bg-maroon-dark text-cream" style={{ backgroundColor: "#2D0208" }}>
      {/* Gold top border */}
      <div className="h-1 bg-gradient-to-r from-saffron via-gold to-saffron" />

      <div className="max-w-7xl mx-auto px-4 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-full bg-maroon flex items-center justify-center shadow-lg p-1.5 border border-white/10">
                <Image
                  src="/logo.png"
                  alt="Sri Veda Gayatri Temple Logo"
                  width={40}
                  height={40}
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <div className="font-cinzel font-bold text-gold text-base leading-tight">
                  Sri Veda Gayatri
                </div>
                <div className="font-cinzel text-cream/70 text-sm">Temple</div>
              </div>
            </div>
            <p className="text-cream/70 text-sm leading-relaxed mb-4">
              {TEMPLE.mission}
            </p>
            <p className="text-xs text-cream/50 italic">
              "{TEMPLE.quote}"
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-cinzel font-semibold text-gold mb-5 text-sm uppercase tracking-wider">
              Quick Links
            </h4>
            <ul className="space-y-2.5">
              {[
                { label: "Home", href: "/" },
                { label: "About Us", href: "/about" },
                { label: "Our Services", href: "/services" },
                { label: "Temple Events", href: "/events" },
                { label: "Photo Gallery", href: "/gallery" },
                { label: "Donate", href: "/donate" },
                { label: "Contact Us", href: "/contact" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-cream/70 hover:text-gold text-sm transition-colors flex items-center gap-2"
                  >
                    <span className="text-gold/50">›</span>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-cinzel font-semibold text-gold mb-5 text-sm uppercase tracking-wider">
              Services
            </h4>
            <ul className="space-y-2.5">
              {[
                { label: "Archana & Abhishekam", href: "/services/archana-abhishekam" },
                { label: "Special Pujas & Homams", href: "/services/special-pujas-homams" },
                { label: "Samskaras", href: "/services/samskaras" },
                { label: "Astrology Consultations", href: "/services/astrology-consultations" },
                { label: "Book a Service", href: "/services" },
                { label: "Sponsorship", href: "/donate#sponsorship" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-cream/70 hover:text-gold text-sm transition-colors flex items-center gap-2"
                  >
                    <span className="text-gold/50">›</span>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-cinzel font-semibold text-gold mb-5 text-sm uppercase tracking-wider">
              Contact Us
            </h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-sm text-cream/70">
                <MapPin className="w-4 h-4 text-gold mt-0.5 shrink-0" />
                <span>{TEMPLE.address}</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-cream/70">
                <Clock className="w-4 h-4 text-gold mt-0.5 shrink-0" />
                <span>{TEMPLE.hours}</span>
              </li>
              {TEMPLE.phones.map((phone) => (
                <li key={phone} className="flex items-center gap-3 text-sm text-cream/70">
                  <Phone className="w-4 h-4 text-gold shrink-0" />
                  <a href={`tel:${phone.replace(/\D/g, "")}`} className="hover:text-gold transition-colors">
                    {phone}
                  </a>
                </li>
              ))}
              {TEMPLE.emails.map((email) => (
                <li key={email} className="flex items-center gap-3 text-sm text-cream/70">
                  <Mail className="w-4 h-4 text-gold shrink-0" />
                  <a href={`mailto:${email}`} className="hover:text-gold transition-colors break-all">
                    {email}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-5 flex flex-col md:flex-row justify-between items-center gap-3 text-xs text-cream/50">
          <p>
            © {new Date().getFullYear()} {TEMPLE.fullName}. All rights reserved.
          </p>
          <p>
            {TEMPLE.taxStatus} &nbsp;|&nbsp; Tax ID: {TEMPLE.taxId} &nbsp;|&nbsp; {TEMPLE.ein} Nonprofit
          </p>
        </div>
      </div>
    </footer>
  );
}
