"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  Menu, X, User, ChevronDown, LogOut,
  LayoutDashboard, ShieldCheck, Phone, Mail, Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  {
    label: "Services",
    href: "/services",
    children: [
      { label: "Archana & Abhishekam", href: "/services/archana-abhishekam" },
      { label: "Special Pujas & Homams", href: "/services/special-pujas-homams" },
      { label: "Samskaras", href: "/services/samskaras" },
      { label: "Astrology Consultations", href: "/services/astrology-consultations" },
    ],
  },
  { label: "Events", href: "/events" },
  { label: "Gallery", href: "/gallery" },
  { label: "Donate", href: "/donate" },
  { label: "Contact", href: "/contact" },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const pathname = usePathname();
  const { data: session } = useSession();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  // Close mobile menu on route change
  const prevPathname = useRef(pathname);
  useEffect(() => {
    if (prevPathname.current !== pathname) {
      prevPathname.current = pathname;
      setMobileOpen(false);
    }
  }, [pathname]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <>
      {/* ── Top utility bar ─────────────────────────────── */}
      <div className="bg-maroon hidden md:block">
        {/* Temple name strip */}
        <div className="text-center py-1 border-b border-white/10" style={{ backgroundColor: "#fdea9d" }}>
          <span className="font-cinzel font-bold tracking-[0.25em] uppercase text-[14px] text-maroon">
            🕉&nbsp; Sri Veda Gayatri Temple &nbsp;🕉
          </span>
        </div>
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between py-1.5">
            <div className="flex items-center gap-5 text-white/70 text-[11px] tracking-wide">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3 h-3 text-gold/80" />
                Mon–Sun &nbsp;5:00 PM – 9:00 PM
              </span>
              <span className="text-white/20">|</span>
              <span className="flex items-center gap-1.5">
                <span className="text-gold text-xs">📍</span>
                702 W Yosemite Ave, Manteca, CA
              </span>
            </div>
            <div className="flex items-center gap-5 text-white/70 text-[11px] tracking-wide">
              <a href="tel:+16692138780" className="flex items-center gap-1.5 hover:text-gold transition-colors">
                <Phone className="w-3 h-3 text-gold/80" />
                +1 (669) 213-8780
              </a>
              <span className="text-white/20">|</span>
              <a href="mailto:vgcc@srivedagayatritemple.org" className="flex items-center gap-1.5 hover:text-gold transition-colors">
                <Mail className="w-3 h-3 text-gold/80" />
                vgcc@srivedagayatritemple.org
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Header ─────────────────────────────────── */}
      <header
        className={cn(
          "sticky top-0 z-50 transition-all duration-500",
          scrolled
            ? "bg-white/95 backdrop-blur-md shadow-[0_2px_20px_rgba(107,15,26,0.12)] border-b border-gold/20"
            : "bg-cream border-b border-gold/25"
        )}
      >
        {/* Gold accent line at very top */}
        <div className="h-px bg-gradient-to-r from-transparent via-gold/60 to-transparent" />

        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between h-18 md:h-28 py-2">

            {/* ── Logo ── */}
            <Link href="/" className="flex items-center gap-3 group shrink-0">
              <Image
                src="/logo.png"
                alt="Sri Veda Gayatri Temple"
                width={80}
                height={80}
                className="w-16 h-16 md:w-22 md:h-22 lg:w-22 lg:h-22 object-contain shrink-0"
                priority
              />
              {/* Name beside logo */}
              <div className="hidden sm:block">
                <div className="font-cinzel font-bold text-maroon text-sm md:text-base lg:text-lg leading-tight tracking-wide">
                  Sri Veda Gayatri
                </div>
                <div className="font-cinzel text-gold text-[11px] md:text-xs lg:text-sm leading-tight tracking-[0.2em] uppercase">
                  Temple
                </div>
                <div className="h-px bg-gradient-to-r from-gold/60 via-saffron/40 to-transparent mt-0.5 w-full" />
              </div>
            </Link>

            {/* ── Desktop Nav ── */}
            <nav className="hidden lg:flex items-center">
              {navLinks.map((link) => (
                <div
                  key={link.href}
                  className="relative"
                  onMouseEnter={() => link.children && setOpenDropdown(link.href)}
                  onMouseLeave={() => setOpenDropdown(null)}
                >
                  <Link
                    href={link.href}
                    className={cn(
                      "relative flex items-center gap-1 px-3.5 py-2 font-cinzel text-[12.5px] font-medium tracking-wide uppercase transition-colors duration-200 group/nav",
                      isActive(link.href)
                        ? "text-saffron"
                        : "text-maroon/80 hover:text-maroon"
                    )}
                  >
                    {link.label}
                    {link.children && (
                      <ChevronDown className={cn(
                        "w-3 h-3 transition-transform duration-200",
                        openDropdown === link.href ? "rotate-180" : ""
                      )} />
                    )}
                    {/* Active / hover underline */}
                    <span className={cn(
                      "absolute bottom-0 left-3.5 right-3.5 h-px bg-gradient-to-r from-gold to-saffron transition-transform duration-300 origin-left",
                      isActive(link.href) ? "scale-x-100" : "scale-x-0 group-hover/nav:scale-x-100"
                    )} />
                  </Link>

                  {/* Dropdown */}
                  {link.children && openDropdown === link.href && (
                    <div className="absolute top-full left-0 pt-1 z-50 min-w-[220px]">
                      <div className="bg-white rounded-xl shadow-[0_8px_30px_rgba(107,15,26,0.15)] border border-gold/20 overflow-hidden">
                        {/* Gold top accent */}
                        <div className="h-0.5 bg-gradient-to-r from-gold via-saffron to-gold" />
                        <div className="py-1.5">
                          {link.children.map((child) => (
                            <Link
                              key={child.href}
                              href={child.href}
                              className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-cinzel font-medium tracking-wide text-maroon/80 hover:text-saffron hover:bg-gradient-to-r hover:from-cream hover:to-transparent transition-all duration-150 group/item"
                            >
                              <span className="w-1 h-1 rounded-full bg-gold/50 group-hover/item:bg-saffron transition-colors shrink-0" />
                              {child.label}
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </nav>

            {/* ── Auth / CTA ── */}
            <div className="hidden lg:flex items-center gap-2 shrink-0">
              {session ? (
                <div className="relative group/user">
                  <button className="flex items-center gap-2 border border-gold/40 hover:border-gold rounded-full px-3.5 py-1.5 text-maroon hover:text-maroon transition-all duration-200 bg-white/60 hover:bg-cream/80 shadow-sm">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-saffron to-gold flex items-center justify-center">
                      <User className="w-3.5 h-3.5 text-white" />
                    </div>
                    <span className="font-cinzel text-xs font-semibold tracking-wide">
                      {session.user?.name?.split(" ")[0]}
                    </span>
                    <ChevronDown className="w-3 h-3 text-gold transition-transform duration-200 group-hover/user:rotate-180" />
                  </button>

                  <div className="absolute right-0 top-full mt-2 w-48 opacity-0 invisible group-hover/user:opacity-100 group-hover/user:visible transition-all duration-200 z-50">
                    <div className="bg-white rounded-xl shadow-[0_8px_30px_rgba(107,15,26,0.15)] border border-gold/20 overflow-hidden">
                      <div className="h-0.5 bg-gradient-to-r from-gold via-saffron to-gold" />
                      <div className="p-1.5">
                        <Link
                          href="/dashboard"
                          className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-cinzel font-medium text-maroon hover:text-saffron hover:bg-cream transition-all"
                        >
                          <LayoutDashboard className="w-3.5 h-3.5" />
                          My Dashboard
                        </Link>
                        {(session.user as { role?: string })?.role === "ADMIN" && (
                          <Link
                            href="/admin"
                            className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-cinzel font-medium text-maroon hover:text-saffron hover:bg-cream transition-all"
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                            Admin Panel
                          </Link>
                        )}
                        <div className="my-1 border-t border-gold/15" />
                        <button
                          onClick={() => signOut({ callbackUrl: "/" })}
                          className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-lg text-xs font-cinzel font-medium text-red-600 hover:bg-red-50 transition-all"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    className="font-cinzel text-[11px] font-semibold tracking-widest uppercase text-maroon/70 hover:text-maroon px-3 py-2 transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    href="/auth/register"
                    className="font-cinzel text-[11px] font-semibold tracking-widest uppercase text-white bg-gradient-to-r from-maroon to-[#4A0A12] hover:from-saffron hover:to-gold px-4 py-2 rounded-lg shadow-sm transition-all duration-300"
                  >
                    Register
                  </Link>
                </>
              )}
            </div>

            {/* ── Mobile Toggle ── */}
            <button
              className="lg:hidden p-2 text-maroon rounded-lg hover:bg-gold/10 transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen
                ? <X className="w-5 h-5" />
                : <Menu className="w-5 h-5" />
              }
            </button>
          </div>
        </div>

        {/* Bottom gold line */}
        <div className="h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />

        {/* ── Mobile Menu ── */}
        {mobileOpen && (
          <div className="lg:hidden bg-white border-t border-gold/20 shadow-xl">
            {/* Gold top accent */}
            <div className="h-0.5 bg-gradient-to-r from-gold via-saffron to-gold" />

            <nav className="max-w-7xl mx-auto px-4 py-5 space-y-0.5">
              {navLinks.map((link) => (
                <div key={link.href}>
                  <Link
                    href={link.href}
                    className={cn(
                      "flex items-center justify-between px-4 py-3 rounded-lg font-cinzel text-xs font-semibold tracking-widest uppercase transition-all duration-150",
                      isActive(link.href)
                        ? "text-saffron bg-gradient-to-r from-cream to-transparent"
                        : "text-maroon/80 hover:text-maroon hover:bg-cream"
                    )}
                    onClick={() => !link.children && setMobileOpen(false)}
                  >
                    {link.label}
                    {isActive(link.href) && (
                      <span className="w-1.5 h-1.5 rounded-full bg-saffron" />
                    )}
                  </Link>
                  {link.children && (
                    <div className="ml-4 pl-3 border-l border-gold/25 mt-0.5 mb-1 space-y-0.5">
                      {link.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className="flex items-center gap-2 px-3 py-2 text-[11px] font-cinzel tracking-wide text-maroon/60 hover:text-saffron hover:bg-cream rounded-lg transition-all"
                          onClick={() => setMobileOpen(false)}
                        >
                          <span className="w-1 h-1 rounded-full bg-gold/50 shrink-0" />
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {/* Divider */}
              <div className="pt-3 pb-1">
                <div className="h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
              </div>

              <div className="pt-2 flex flex-col gap-2">
                {session ? (
                  <>
                    <Link
                      href="/dashboard"
                      className="flex items-center justify-center gap-2 border border-gold/40 text-maroon font-cinzel text-xs font-semibold tracking-widest uppercase py-3 rounded-lg hover:bg-cream transition-colors"
                      onClick={() => setMobileOpen(false)}
                    >
                      <LayoutDashboard className="w-3.5 h-3.5" />
                      My Dashboard
                    </Link>
                    <button
                      onClick={() => { signOut({ callbackUrl: "/" }); setMobileOpen(false); }}
                      className="font-cinzel text-xs font-semibold tracking-widest uppercase text-red-600 py-2.5"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/auth/login"
                      className="flex items-center justify-center border border-gold/40 text-maroon font-cinzel text-xs font-semibold tracking-widest uppercase py-3 rounded-lg hover:bg-cream transition-colors"
                      onClick={() => setMobileOpen(false)}
                    >
                      Login
                    </Link>
                    <Link
                      href="/auth/register"
                      className="flex items-center justify-center text-white bg-gradient-to-r from-maroon to-[#4A0A12] font-cinzel text-xs font-semibold tracking-widest uppercase py-3 rounded-lg shadow-sm"
                      onClick={() => setMobileOpen(false)}
                    >
                      Register as Devotee
                    </Link>
                  </>
                )}
              </div>

              {/* Temple contact strip */}
              <div className="mt-4 pt-4 border-t border-gold/20 flex justify-center gap-6 text-[10px] text-maroon/50 font-cinzel tracking-wide">
                <a href="tel:+16692138780" className="hover:text-saffron transition-colors">
                  📞 (669) 213-8780
                </a>
                <span>|</span>
                <span>🕉 Mon–Sun 5–9 PM</span>
              </div>
            </nav>
          </div>
        )}
      </header>
    </>
  );
}
