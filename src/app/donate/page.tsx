import Image from "next/image";
import type { Metadata } from "next";
import { TEMPLE, IMAGES, DONATION_TIERS } from "@/lib/constants";
import DonateClient from "./DonateClient";

export const metadata: Metadata = {
  title: "Donate",
  description: "Support Sri Veda Gayatri Temple — a 501(c)(3) nonprofit. All donations are tax-deductible.",
};

export default function DonatePage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative h-64 md:h-80 flex items-center justify-center overflow-hidden">
        <Image src={IMAGES.temple1} alt="Donate" fill className="object-cover" />
        <div className="absolute inset-0" style={{ background: "rgba(107,15,26,0.8)" }} />
        <div className="relative z-10 text-center px-4">
          <div className="text-4xl mb-3">🙏</div>
          <p className="text-gold font-cinzel text-sm uppercase tracking-widest mb-2">Support Our Mission</p>
          <h1 className="font-cinzel font-bold text-4xl md:text-5xl text-white">Donate</h1>
          <p className="text-white/80 mt-3 text-sm">
            501(c)(3) Nonprofit · All donations tax-deductible · Tax ID: {TEMPLE.taxId}
          </p>
        </div>
      </section>

      {/* Tax info banner */}
      <div className="bg-gradient-to-r from-saffron to-gold text-white py-4 text-center px-4">
        <p className="text-sm font-medium">
          🏛 We are a registered 501(c)(3) nonprofit organization. All donations are fully tax-deductible in the U.S.
        </p>
      </div>

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
          <DonateClient tiers={DONATION_TIERS} />
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
