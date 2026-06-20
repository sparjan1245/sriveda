import Image from "next/image";
import type { Metadata } from "next";
import { TEMPLE, IMAGES } from "@/lib/constants";
import { db } from "@/lib/db";
import { unstable_cache } from "next/cache";
import DonateClient from "./DonateClient";

const getActiveDonationTiers = unstable_cache(
  () => db.donationTier.findMany({ where: { active: true }, orderBy: { order: "asc" } }).catch(() => []),
  ["donation-tiers"],
  { tags: ["donation-tiers"] }
);

export const metadata: Metadata = {
  title: "Donate",
  description: "Support Sri Veda Gayatri Temple — a 501(c)(3) nonprofit. All donations are tax-deductible.",
};

export default async function DonatePage() {
  const dbTiers = await getActiveDonationTiers();
  const tiers = dbTiers;

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
            <p className="text-gold font-cinzel text-sm uppercase tracking-widest mb-3">Ways to Give</p>
            <h2 className="section-heading text-3xl font-bold mb-4">Choose Your Offering</h2>
            <p className="text-foreground/60 max-w-xl mx-auto">
              Every contribution, large or small, helps us serve the community and preserve our sacred traditions.
            </p>
          </div>
          <DonateClient tiers={tiers} />
        </div>
      </section>

      {/* Sponsorship Tiers */}
      <section className="py-16 px-4 bg-white" id="sponsorship">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-gold font-cinzel text-sm uppercase tracking-widest mb-3">Major Giving</p>
            <h2 className="section-heading text-3xl font-bold mb-4">Sponsorship Tiers</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: "Bronze Sponsor", range: "$51 – $999", color: "#CD7F32", benefits: ["Name listed in temple announcements", "Special blessing at events", "Annual recognition"] },
              { name: "Silver Sponsor", range: "$2,500 – $4,999", color: "#C0C0C0", benefits: ["All Bronze benefits", "Dedicated puja on a festival day", "Certificate of appreciation", "Priority event seating"] },
              { name: "Gold Sponsor", range: "$5,000 – $9,999", color: "#D4A017", benefits: ["All Silver benefits", "Naming rights for a temple event", "Personal meeting with board", "Lifetime recognition plaque", "Featured in all publications"] },
            ].map((tier) => (
              <div key={tier.name} className="bg-cream rounded-2xl p-6 shadow-sm card-hover border" style={{ borderColor: tier.color + "40" }}>
                <div className="w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-xl font-bold" style={{ background: tier.color }}>
                  ★
                </div>
                <h3 className="font-cinzel font-bold text-maroon text-xl text-center mb-1">{tier.name}</h3>
                <p className="text-center font-semibold mb-4" style={{ color: tier.color }}>{tier.range}</p>
                <ul className="space-y-2">
                  {tier.benefits.map((b) => (
                    <li key={b} className="text-sm text-foreground/70 flex items-start gap-2">
                      <span style={{ color: tier.color }}>✓</span> {b}
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
