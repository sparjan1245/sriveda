"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Menu, X, User, ChevronDown, LogOut, LayoutDashboard, ShieldCheck } from "lucide-react";
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
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <>
      {/* Top bar */}
      <div className="bg-maroon text-cream text-sm py-2 hidden md:block">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
          <span>🕉 Mon–Sun: 5:00 PM – 9:00 PM &nbsp;|&nbsp; 702 W Yosemite Ave, Manteca, CA</span>
          <span>📞 +1 (669) 213-8780 &nbsp;|&nbsp; ✉ vgcc@srivedagayatritemple.org</span>
        </div>
      </div>

      {/* Main header */}
      <header
        className={cn(
          "sticky top-0 z-50 transition-all duration-300",
          scrolled
            ? "bg-white shadow-lg border-b border-gold/20"
            : "bg-cream border-b border-gold/30"
        )}
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 md:gap-4 group">
              <Image
                src="/logo.png"
                alt="Sri Veda Gayatri Temple Logo"
                width={80}
                height={80}
                className="w-16 h-16 md:w-20 md:h-20 object-contain transition-transform group-hover:scale-105"
                priority
              />
              <div className="leading-tight">
                <div className="font-cinzel font-bold text-maroon text-base md:text-xl leading-tight">
                  Sri Veda Gayatri
                </div>
                <div className="font-cinzel text-gold text-sm md:text-base leading-tight tracking-wider">
                  Temple
                </div>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-1">
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
                      "flex items-center gap-1 px-3 py-2 rounded text-sm font-medium transition-colors",
                      isActive(link.href)
                        ? "text-saffron"
                        : "text-maroon hover:text-saffron"
                    )}
                  >
                    {link.label}
                    {link.children && <ChevronDown className="w-3 h-3" />}
                  </Link>
                  {link.children && openDropdown === link.href && (
                    <div className="absolute top-full left-0 bg-white border border-gold/20 rounded-lg shadow-xl min-w-52 py-1 z-50">
                      {link.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className="block px-4 py-2.5 text-sm text-maroon hover:bg-cream hover:text-saffron transition-colors"
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </nav>

            {/* Auth buttons */}
            <div className="hidden lg:flex items-center gap-3">
              {session ? (
                <div className="relative group">
                  <button className="flex items-center gap-2 bg-cream border border-gold/40 rounded-full px-4 py-2 text-sm text-maroon hover:border-saffron transition-colors">
                    <User className="w-4 h-4" />
                    <span className="font-medium">{session.user?.name?.split(" ")[0]}</span>
                    <ChevronDown className="w-3 h-3" />
                  </button>
                  <div className="absolute right-0 top-full mt-1 bg-white border border-gold/20 rounded-lg shadow-xl min-w-44 py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                    <Link
                      href="/dashboard"
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-maroon hover:bg-cream hover:text-saffron transition-colors"
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      Dashboard
                    </Link>
                    {(session.user as { role?: string })?.role === "ADMIN" && (
                      <Link
                        href="/admin"
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-maroon hover:bg-cream hover:text-saffron transition-colors"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        Admin Panel
                      </Link>
                    )}
                    <button
                      onClick={() => signOut({ callbackUrl: "/" })}
                      className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    className="text-sm font-medium text-maroon hover:text-saffron transition-colors px-3 py-2"
                  >
                    Login
                  </Link>
                  <Link
                    href="/auth/register"
                    className="btn-primary text-sm py-2 px-4"
                  >
                    Register
                  </Link>
                </>
              )}
            </div>

            {/* Mobile menu toggle */}
            <button
              className="lg:hidden p-2 text-maroon"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="lg:hidden bg-white border-t border-gold/20 shadow-lg">
            <nav className="max-w-7xl mx-auto px-4 py-4 space-y-1">
              {navLinks.map((link) => (
                <div key={link.href}>
                  <Link
                    href={link.href}
                    className={cn(
                      "block px-3 py-2 rounded text-sm font-medium transition-colors",
                      isActive(link.href)
                        ? "text-saffron bg-cream"
                        : "text-maroon hover:text-saffron hover:bg-cream"
                    )}
                    onClick={() => setMobileOpen(false)}
                  >
                    {link.label}
                  </Link>
                  {link.children && (
                    <div className="pl-4 mt-1 space-y-1">
                      {link.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className="block px-3 py-2 text-xs text-maroon/70 hover:text-saffron hover:bg-cream rounded transition-colors"
                          onClick={() => setMobileOpen(false)}
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              <div className="pt-3 border-t border-gold/20 flex flex-col gap-2">
                {session ? (
                  <>
                    <Link
                      href="/dashboard"
                      className="btn-secondary text-center text-sm"
                      onClick={() => setMobileOpen(false)}
                    >
                      My Dashboard
                    </Link>
                    <button
                      onClick={() => { signOut({ callbackUrl: "/" }); setMobileOpen(false); }}
                      className="text-sm text-red-600 py-2"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/auth/login"
                      className="btn-secondary text-center text-sm"
                      onClick={() => setMobileOpen(false)}
                    >
                      Login
                    </Link>
                    <Link
                      href="/auth/register"
                      className="btn-primary text-center text-sm"
                      onClick={() => setMobileOpen(false)}
                    >
                      Register as Devotee
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </header>
    </>
  );
}
