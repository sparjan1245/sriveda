"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  Menu, X, User, ChevronDown, LogOut,
  LayoutDashboard, ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ServiceLink { name: string; slug: string; }

function buildNavLinks(services: ServiceLink[]) {
  return [
    { label: "Home", href: "/" },
    { label: "About", href: "/about" },
    {
      label: "Services",
      href: "/services",
      children: services.map((s) => ({
        label: s.name,
        href: `/services/${s.slug}`,
      })),
    },
    { label: "Events", href: "/events" },
    { label: "Gallery", href: "/gallery" },
    { label: "Calendar", href: "/calendar" },
    { label: "Donate", href: "/donate" },
    { label: "Contact", href: "/contact" },
  ];
}

export default function Header({ services = [] }: { services?: ServiceLink[] }) {
  const navLinks = buildNavLinks(services);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const pathname = usePathname();
  const { data: session } = useSession();

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
      {/* ── Brand Banner ─────────────────────────────────── */}
      <div className="hidden md:block" style={{ backgroundColor: "#fdea9d" }}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-center gap-6">
          <Link href="/">
            <Image
              src="/logo.png"
              alt="Sri Veda Gayatri Temple"
              width={90}
              height={90}
              className="object-contain rounded-full"
              style={{ width: 90, height: 90 }}
              priority
            />
          </Link>
          <span className="text-maroon font-serif" style={{ fontSize: "2.5rem", lineHeight: 1 }}>ॐ</span>
          <div className="flex flex-col items-center gap-1">
            <Link href="/" className="font-cinzel font-bold text-maroon tracking-[0.28em] uppercase leading-none"
              style={{ fontSize: "clamp(1.6rem, 3vw, 2.4rem)" }}>
              Sri Veda Gayatri Temple
            </Link>
            <div className="flex items-center gap-3 text-maroon/100 text-[13px] tracking-wide mt-1">
               <a href="https://maps.app.goo.gl/AnLjrYixaJXit3N5A" target="_blank" className="hover:text-maroon transition-colors">
                702 W Yosemite Ave, Manteca, CA
              </a>
              <span className="text-maroon/30">|</span>
              <a href="tel:+16692138780" className="hover:text-maroon transition-colors">+1 (669) 213-8780</a>
              <span className="text-maroon/30">|</span>
              <a href="mailto:vgcc@srivedagayatritemple.org" className="hover:text-maroon transition-colors">
                vgcc@srivedagayatritemple.org
              </a>
              <span className="text-maroon/30">|</span>
              <a className="hover:text-maroon transition-colors">
                501(c)(3) Nonprofit
              </a>
            </div>
            
          </div>
          <span className="text-maroon font-serif" style={{ fontSize: "2.5rem", lineHeight: 1 }}>ॐ</span>
        </div>
      </div>

      {/* ── Sticky Nav ───────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-[#fdf5e6] border-b border-gold/25 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between h-14">

            {/* Mobile logo */}
            <Link href="/" className="md:hidden flex items-center gap-2.5">
              <Image
                src="/logo.png"
                alt="Sri Veda Gayatri Temple"
                width={40}
                height={40}
                className="object-contain rounded-full"
                style={{ width: 40, height: 40 }}
                priority
              />
              <span className="font-cinzel font-bold text-maroon text-sm tracking-wide">
                Sri Veda Gayatri Temple
              </span>
            </Link>

            {/* ── Desktop Nav ── */}
            <nav className="hidden md:flex items-center">
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
                      "relative flex items-center gap-1 px-3 py-4 font-cinzel text-[12px] font-bold tracking-widest uppercase transition-colors duration-200 group/nav",
                      isActive(link.href)
                        ? "text-maroon"
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
                    {/* Active underline */}
                    <span className={cn(
                      "absolute bottom-0 left-3 right-3 h-[2.5px] rounded-full transition-transform duration-300 origin-left",
                      isActive(link.href)
                        ? "scale-x-100 bg-saffron"
                        : "scale-x-0 group-hover/nav:scale-x-100 bg-gold"
                    )} />
                  </Link>

                  {/* Dropdown */}
                  {link.children && openDropdown === link.href && (
                    <div className="absolute top-full left-0 pt-1 z-50 min-w-[220px]">
                      <div className="bg-white rounded-xl shadow-[0_8px_30px_rgba(107,15,26,0.15)] border border-gold/20 overflow-hidden">
                        <div className="h-0.5 bg-gradient-to-r from-gold via-saffron to-gold" />
                        <div className="py-1.5">
                          {link.children.map((child) => (
                            <Link
                              key={child.href}
                              href={child.href}
                              className="flex items-center gap-2.5 px-4 py-2.5 text-[11px] font-cinzel font-medium tracking-wide text-maroon/80 hover:text-saffron hover:bg-cream transition-all duration-150 group/item"
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
            <div className="hidden md:flex items-center gap-1 shrink-0">
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
                    className="font-cinzel text-[11px] font-bold tracking-widest uppercase text-white bg-maroon hover:bg-maroon/85 px-5 py-2.5 rounded-md shadow-sm transition-all duration-200 ml-1"
                  >
                    Register
                  </Link>
                </>
              )}
            </div>

            {/* ── Mobile Toggle ── */}
            <button
              className="md:hidden p-2 text-maroon rounded-lg hover:bg-gold/10 transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* ── Mobile Menu ── */}
        {mobileOpen && (
          <div className="md:hidden bg-white border-t border-gold/20 shadow-xl">
            <div className="h-0.5 bg-gradient-to-r from-gold via-saffron to-gold" />
            <nav className="max-w-7xl mx-auto px-4 py-5 space-y-0.5">
              {navLinks.map((link) => (
                <div key={link.href}>
                  <Link
                    href={link.href}
                    className={cn(
                      "flex items-center justify-between px-4 py-3 rounded-lg font-cinzel text-xs font-semibold tracking-widest uppercase transition-all duration-150",
                      isActive(link.href)
                        ? "text-saffron bg-cream"
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
                      className="flex items-center justify-center text-white bg-maroon font-cinzel text-xs font-semibold tracking-widest uppercase py-3 rounded-lg shadow-sm"
                      onClick={() => setMobileOpen(false)}
                    >
                      Register
                    </Link>
                  </>
                )}
              </div>

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
