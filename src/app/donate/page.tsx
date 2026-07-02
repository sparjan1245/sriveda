import Image from "next/image";
import type { Metadata } from "next";
import { TEMPLE, IMAGES } from "@/lib/constants";
import { db } from "@/lib/db";
import DonateClient from "./DonateClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Donate",
  description: "Support Sri Veda Gayatri Temple — a 501(c)(3) nonprofit. All donations are tax-deductible.",
};

export default async function DonatePage() {
  const tiers = await db.donationTier
    .findMany({ where: { active: true }, orderBy: { order: "asc" } })
    .catch(() => []);

  return (
    <div>
      {/* ── Inner Page Banner ── */}
      <section className="relative h-20 md:h-22 flex items-center justify-center overflow-hidden">
        <Image src={IMAGES.temple1} alt="Donate" fill className="object-cover object-center" priority />
        <div className="absolute inset-0 bg-black/55" />
        <div className="absolute inset-0 bg-maroon/60" />
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 70% 80% at 50% 50%, rgba(212,160,23,0.15) 0%, transparent 70%)" }} />
        <div className="absolute bottom-0 inset-x-0 h-px bg-linear-to-r from-transparent via-gold/60 to-transparent" />
        <div className="relative z-10 text-center px-4">
          <div className="flex items-center justify-center gap-2 text-white/70 text-[11px] tracking-widest uppercase mb-3">
            <span>Home</span>
            <span className="text-gold/60">›</span>
            <span className="text-gold/80">Donate</span>
          </div>
          
        </div>
      </section>

     

      {/* Donation tiers */}
      <section className="py-16 px-4 bg-cream pattern-bg">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-maroon font-cinzel text-base font-bold uppercase tracking-widest mb-3">Ways to Give</p>
            <h2 className="section-heading text-3xl font-bold mb-4">Choose Your Offering</h2>
            <p className="text-foreground font-bold max-w-xl mx-auto">
              Every contribution, large or small, helps us serve the community and preserve our sacred traditions.
            </p>
          </div>
          <DonateClient tiers={tiers} />
        </div>
      </section>

      {/* Sponsorship Tiers */}
      <section className="py-16 px-4 bg-white" id="sponsorship">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <span className="badge-gold mb-4 inline-flex text-xs md:text-sm px-4 py-1.5">Sacred Giving</span>
            <h2 className="font-cinzel font-bold text-2xl md:text-3xl text-maroon mb-3">Seva Sponsorship Tiers</h2>
            <div className="flex items-center justify-center gap-4 mb-3">
              <span className="block h-px w-20 bg-linear-to-r from-transparent to-gold/60" />
              <span className="text-gold text-xl">🪷</span>
              <span className="block h-px w-20 bg-linear-to-l from-transparent to-gold/60" />
            </div>
            <p className="text-foreground text-sm max-w-xl mx-auto">Every contribution, large or small, is a sacred act of devotion that sustains our temple and community.</p>
          </div>

          {/* Row 1 — lower tiers */}
          <div className="grid md:grid-cols-3 gap-5 mb-5">
            {[
              {
                icon: "🙏", name: "Devotee Seva", range: "$51 – $999",
                color: "#E8610A", bg: "#FFF4EE", border: "#E8610A33",
                benefits: ["Support daily poojas and temple maintenance", "Name listed in weekly announcements", "Special blessing at events"],
              },
              {
                icon: "🏅", name: "Bronze Seva", range: "$1,000 – $2,499",
                color: "#B87333", bg: "#FDF5EC", border: "#B8733333",
                benefits: ["All Devotee benefits", "Dedicated pooja on a monthly festival", "Annual recognition in temple newsletter"],
              },
              {
                icon: "⭐", name: "Silver Seva", range: "$2,500 – $4,999",
                color: "#607D8B", bg: "#F0F4F6", border: "#607D8B33",
                benefits: ["Sponsor festivals, pooja materials, or lighting", "Certificate of appreciation", "Priority event seating", "Family name on temple board"],
              },
            ].map((tier) => (
              <div
                key={tier.name}
                className="rounded-2xl p-6 card-hover flex flex-col"
                style={{ background: tier.bg, border: `1.5px solid ${tier.border}` }}
              >
                <div className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center text-2xl shadow-sm" style={{ background: tier.color + "18", border: `1.5px solid ${tier.color}40` }}>
                  {tier.icon}
                </div>
                <h3 className="font-cinzel font-bold text-maroon text-base text-center mb-1">{tier.name}</h3>
                <p className="text-center font-bold text-sm mb-4" style={{ color: tier.color }}>{tier.range}</p>
                <ul className="space-y-2 flex-1">
                  {tier.benefits.map((b) => (
                    <li key={b} className="text-foreground text-xs flex items-start gap-2">
                      <span className="mt-0.5 shrink-0" style={{ color: tier.color }}>⮚</span> {b}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Row 2 — higher tiers */}
          <div className="grid md:grid-cols-3 gap-5">
            {[
              {
                icon: "✨", name: "Gold Seva", range: "$5,000 – $9,999",
                color: "#C5960A", bg: "#FFFBEF", border: "#D4A01740",
                benefits: ["Sponsor homams, sanctum preparation, or mandapam upgrades", "Naming rights for a temple event", "Personal meeting with board"],
              },
              {
                icon: "💎", name: "Platinum Seva", range: "$10,000 – $24,999",
                color: "#4A6FA0", bg: "#EFF3FA", border: "#4A6FA033",
                benefits: ["Sponsor deity installation or Maha Kumbhabhishekam rituals", "Family participation in key ceremonies", "Lifetime recognition plaque", "Featured in all publications"],
              },
              {
                icon: "👑", name: "Diamond Seva", range: "$25,000+",
                color: "#7B1FA2", bg: "linear-gradient(135deg,#FDF6FF 0%,#F3E8FF 100%)", border: "#7B1FA240",
                benefits: ["Sponsor major renovation phase or Prana Pratishta", "Donor recognition as per temple guidelines", "Highest honour from the board", "Permanent dedication plaque"],
                highlight: true,
              },
            ].map((tier) => (
              <div
                key={tier.name}
                className={`rounded-2xl p-6 flex flex-col card-hover relative ${tier.highlight ? "shadow-xl" : ""}`}
                style={{ background: tier.bg, border: `1.5px solid ${tier.border}` }}
              >
                {tier.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-purple-700 text-white text-[10px] font-cinzel font-bold px-3 py-1 rounded-full uppercase tracking-widest shadow">
                      Highest Honour
                    </span>
                  </div>
                )}
                <div className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center text-2xl shadow-sm" style={{ background: tier.color + "18", border: `1.5px solid ${tier.color}40` }}>
                  {tier.icon}
                </div>
                <h3 className="font-cinzel font-bold text-maroon text-base text-center mb-1">{tier.name}</h3>
                <p className="text-center font-bold text-sm mb-4" style={{ color: tier.color }}>{tier.range}</p>
                <ul className="space-y-2 flex-1">
                  {tier.benefits.map((b) => (
                    <li key={b} className="text-foreground text-xs flex items-start gap-2">
                      <span className="mt-0.5 shrink-0" style={{ color: tier.color }}>⮚</span> {b}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Other ways to give */}
      <section className="py-16 px-4 bg-cream pattern-bg">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="section-heading text-2xl font-bold mb-4">Other Ways to Contribute</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl p-6 gold-border">
              <h4 className="font-cinzel font-semibold text-maroon text-lg mb-3">📬 Check / Mail</h4>
              <p className="text-foreground/70 text-sm leading-relaxed">
                Make checks payable to <strong>VGCC</strong> and mail to:<br />
                16045 Mavericks Lane<br />
                Lathrop, CA 95330
              </p>
            </div>
            <div className="bg-white rounded-2xl p-6 gold-border">
              <h4 className="font-cinzel font-semibold text-maroon text-lg mb-3">🏦 Bank Transfer</h4>
              <p className="text-foreground/70 text-sm leading-relaxed">
                Contact us at <strong>vgcc@srivedagayatritemple.org</strong> or call
                <strong> +1 (669) 213-8780</strong> for bank transfer details.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
