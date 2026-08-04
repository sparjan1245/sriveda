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
  const [tiers, sponsorTiers] = await Promise.all([
    db.donationTier.findMany({ where: { active: true }, orderBy: { order: "asc" } }).catch(() => []),
    db.sponsorTier.findMany({ where: { active: true }, orderBy: { minAmount: "asc" } }).catch(() => []),
  ]);

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
          <DonateClient tiers={tiers} sponsorTiers={sponsorTiers} />
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
