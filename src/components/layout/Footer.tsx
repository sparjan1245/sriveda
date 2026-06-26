import Link from "next/link";
import Image from "next/image";
import { MapPin, Phone, Mail, Clock, ExternalLink } from "lucide-react";
import { TEMPLE } from "@/lib/constants";

interface ServiceLink { name: string; slug: string; }

export default function Footer({ services = [] }: { services?: ServiceLink[] }) {
  return (
    <footer className="relative text-cream overflow-hidden" style={{ backgroundColor: "#1A0408" }}>
      {/* Gold top border */}
      <div className="h-1 bg-linear-to-r from-saffron via-gold to-saffron" />

      {/* Background decorations */}
      <div className="absolute inset-0 pattern-bg opacity-[0.04] pointer-events-none" />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 70% 45% at 50% 0%, rgba(212,160,23,0.07), transparent 70%)" }}
      />

     

      {/* ── Main grid ── */}
      <div className="relative max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">

          {/* Brand column */}
          <div>
            <div className="flex flex-col items-center text-center mb-5">
              <div className="w-16 h-16 rounded-full overflow-hidden shrink-0 border-2 border-gold/40 shadow-lg ring-4 ring-white/5 mb-3">
                <Image
                  src="/logo.png"
                  alt="Sri Veda Gayatri Temple"
                  width={64}
                  height={64}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="font-cinzel font-bold text-gold text-sm leading-tight mb-0.5">Sri Veda Gayatri</div>
              <div className="font-cinzel font-semibold text-white/90 text-[11px] leading-tight mb-1">Cultural Center</div>
              <div className="flex items-center gap-2">
                <span className="block h-px w-8 bg-gold/30" />
                <span className="font-cinzel text-gold/60 text-[9px] tracking-[0.25em] uppercase">Est. 2024</span>
                <span className="block h-px w-8 bg-gold/30" />
              </div>
            </div>

            <p className="text-white/100 text-xs leading-relaxed mb-4">
              {TEMPLE.mission}
            </p>

            <blockquote className="border-l-2 border-gold/30 pl-3 mb-5">
              <p className="text-white/100 text-[11px] italic leading-relaxed">
                &ldquo;{TEMPLE.quote}&rdquo;
              </p>
            </blockquote>

            {/* 501(c)(3) badge */}
            <div className="inline-flex items-center gap-2 bg-gold/10 border border-gold/25 rounded-lg px-3 py-1.5 mb-5">
              <span className="text-gold text-[10px] font-semibold tracking-wide">501(c)(3) Nonprofit</span>
              <span className="text-white/20">·</span>
              <span className="text-white/100 text-[10px]">Tax ID: {TEMPLE.taxId}</span>
            </div>

            {/* Social links */}
            <p className="text-white/100 text-[10px] uppercase tracking-widest mb-2.5">Follow Us</p>
            <div className="flex gap-2">
              {[
                {
                  href: "https://www.youtube.com/@srivedagayatritemple",
                  label: "YouTube",
                  icon: <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>,
                },
                {
                  href: "https://facebook.com/srivedagayatritemple",
                  label: "Facebook",
                  icon: <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>,
                },
                {
                  href: "https://instagram.com/srivedagayatritemple",
                  label: "Instagram",
                  icon: <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg>,
                },
              ].map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="w-8 h-8 rounded-full bg-white/8 hover:bg-gold/20 border border-white/10 hover:border-gold/50 text-cream/55 hover:text-gold flex items-center justify-center transition-all duration-200"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-cinzel font-semibold text-gold text-xs uppercase tracking-widest mb-1">
              Quick Links
            </h4>
            <div className="h-px bg-linear-to-r from-gold/40 to-transparent mb-4" />
            <ul className="space-y-2.5">
              {[
                { label: "Home",           href: "/" },
                { label: "About Us",       href: "/about" },
                { label: "Our Services",   href: "/services" },
                { label: "Temple Events",  href: "/events" },
                { label: "Photo Gallery",  href: "/gallery" },
                { label: "Donate",         href: "/donate" },
                { label: "Become a Devotee", href: "/auth/register" },
                { label: "Contact Us",     href: "/contact" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-white/100 hover:text-gold text-xs transition-colors duration-150 flex items-center gap-2 group"
                  >
                    <span className="text-gold/30 group-hover:text-gold/80 transition-colors">›</span>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-cinzel font-semibold text-gold text-xs uppercase tracking-widest mb-1">
              Our Services
            </h4>
            <div className="h-px bg-linear-to-r from-gold/40 to-transparent mb-4" />
            <ul className="space-y-2.5">
              {services.map((s) => (
                <li key={s.slug}>
                  <Link
                    href={`/services/${s.slug}`}
                    className="text-white hover:text-gold text-xs transition-colors duration-150 flex items-center gap-2 group"
                  >
                    <span className="text-gold/30 group-hover:text-gold/80 transition-colors">›</span>
                    {s.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/services" className="text-white hover:text-gold text-xs transition-colors duration-150 flex items-center gap-2 group">
                  <span className="text-gold/30 group-hover:text-gold/80 transition-colors">›</span>
                  Book a Service
                </Link>
              </li>
              <li>
                <Link href="/donate#sponsorship" className="text-white hover:text-gold text-xs transition-colors duration-150 flex items-center gap-2 group">
                  <span className="text-gold/30 group-hover:text-gold/80 transition-colors">›</span>
                  Sponsorship Sevas
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-cinzel font-semibold text-gold text-xs uppercase tracking-widest mb-1">
              Contact Us
            </h4>
            <div className="h-px bg-linear-to-r from-gold/40 to-transparent mb-4" />
            <ul className="space-y-3.5">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-3.5 h-3.5 text-gold mt-0.5 shrink-0" />
                <div>
                  <p className="text-white/100  text-[10px] uppercase tracking-wide mb-0.5">Temple Address</p>
                  <span className="text-white/100 text-xs leading-relaxed">{TEMPLE.address}</span>
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="w-3.5 h-3.5 text-gold/50 mt-0.5 shrink-0" />
                <div>
                  <p className="text-white/100 text-[10px] uppercase tracking-wide mb-0.5">Mailing Address</p>
                  <span className="text-white/100 text-xs leading-relaxed">{TEMPLE.mailingAddress}</span>
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <Clock className="w-3.5 h-3.5 text-gold mt-0.5 shrink-0" />
                <div>
                  <p className="text-white/100 text-[10px] uppercase tracking-wide mb-0.5">Temple Hours</p>
                  <span className="text-white/100 text-xs">{TEMPLE.hours}</span>
                </div>
              </li>

              <li><div className="h-px bg-white/[0.07]" /></li>

              {TEMPLE.phones.map((phone) => (
                <li key={phone} className="flex items-center gap-2.5">
                  <Phone className="w-3.5 h-3.5 text-gold shrink-0" />
                  <a
                    href={`tel:${phone.replace(/\D/g, "")}`}
                    className="text-white/100 hover:text-gold text-xs transition-colors"
                  >
                    {phone}
                  </a>
                </li>
              ))}
              {TEMPLE.emails.map((email) => (
                <li key={email} className="flex items-center gap-2.5">
                  <Mail className="w-3.5 h-3.5 text-gold shrink-0" />
                  <a
                    href={`mailto:${email}`}
                    className="text-white/100 hover:text-gold text-xs transition-colors break-all"
                  >
                    {email}
                  </a>
                </li>
              ))}

              <li>
                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(TEMPLE.address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-[11px] text-gold/65 hover:text-gold border border-gold/25 hover:border-gold/55 rounded-lg px-3 py-1.5 transition-all duration-200 mt-1"
                >
                  <ExternalLink className="w-3 h-3" />
                  Get Directions
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div className="relative border-t border-white/[0.07]">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col md:flex-row justify-between items-center gap-2">
          <p className="text-[11px] text-white/100" suppressHydrationWarning>
            © {new Date().getFullYear()} {TEMPLE.fullName}. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[11px] text-cream/35">
            <Link href="/privacy" className="hover:text-cream/60 transition-colors">Privacy Policy</Link>
            <span className="text-white/15">|</span>
            <Link href="/terms" className="hover:text-cream/60 transition-colors">Terms of Use</Link>
            <span className="text-white/15">|</span>
            <span>{TEMPLE.taxStatus}</span>
            <span className="text-white/15">|</span>
            <span>{TEMPLE.ein} Nonprofit</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
