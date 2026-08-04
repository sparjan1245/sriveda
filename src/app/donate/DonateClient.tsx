"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import { Loader2, RefreshCw, Lock, ShieldCheck, CheckCircle, XCircle, X } from "lucide-react";
import { PaymentGateway } from "@/components/payment/PaymentGateway";
import { formatAmountRange } from "@/lib/utils";

interface Tier {
  id: string;
  name: string;
  description: string | null;
  amount: number;
  maxAmount: number | null;
  recurring: boolean;
  highlighted: boolean;
}

const isRangedTier = (tier: Tier) => tier.maxAmount != null && tier.maxAmount > tier.amount;

interface SponsorTier {
  id: string;
  name: string;
  description: string | null;
  minAmount: number;
  maxAmount: number | null;
  benefits: string | null;
  highlighted: boolean;
}

const SPONSOR_STYLES = [
  { icon: "🙏", color: "#E8610A", bg: "#FFF4EE", border: "#E8610A33" },
  { icon: "🏅", color: "#B87333", bg: "#FDF5EC", border: "#B8733333" },
  { icon: "⭐", color: "#607D8B", bg: "#F0F4F6", border: "#607D8B33" },
  { icon: "✨", color: "#C5960A", bg: "#FFFBEF", border: "#D4A01740" },
  { icon: "💎", color: "#4A6FA0", bg: "#EFF3FA", border: "#4A6FA033" },
  { icon: "👑", color: "#7B1FA2", bg: "#FDF6FF", border: "#7B1FA240" },
];

const sponsorSelectionId = (id: string) => `sponsor:${id}`;

export default function DonateClient({ tiers, sponsorTiers = [] }: { tiers: Tier[]; sponsorTiers?: SponsorTier[] }) {
  const { data: session } = useSession();
  const [selected, setSelected]           = useState<string | null>(null);
  const [customAmount, setCustomAmount]   = useState("");
  const checkoutPanelRef = useRef<HTMLDivElement>(null);
  const [firstName, setFirstName]         = useState("");
  const [lastName, setLastName]           = useState("");
  const [email, setEmail]                 = useState("");
  const [phone, setPhone]                 = useState("");
  const [message, setMessage]             = useState("");
  const [gateway, setGateway]             = useState("stripe");
  const [loading, setLoading]             = useState(false);
  const [error, setError]                 = useState("");
  const [paymentWaiting, setPaymentWaiting]       = useState(false);
  const [paymentResult, setPaymentResult]         = useState<null | "success" | "cancelled">(null);
  const [paymentSuccessUrl, setPaymentSuccessUrl] = useState<string | null>(null);

  const gatewayLabel: Record<string, string> = { stripe: "Stripe", paypal: "PayPal", square: "Square" };

  const prefilledRef = useRef(false);
  useEffect(() => {
    if (!session?.user || prefilledRef.current) return;
    prefilledRef.current = true;
    const parts = (session.user?.name || "").split(" ");
    setFirstName((prev) => prev || parts[0] || "");
    setLastName((prev)  => prev || parts.slice(1).join(" ") || "");
    setEmail((prev)     => prev || session.user?.email || "");
  }, [session]);

  const highlightedTiers = tiers.filter((t) => t.highlighted);
  const regularTiers = tiers.filter((t) => !t.highlighted);

  const selectedTier = tiers.find((t) => t.id === selected);
  const selectedSponsor = sponsorTiers.find((s) => sponsorSelectionId(s.id) === selected);
  const selectedTierRanged = !!selectedTier && isRangedTier(selectedTier);

  // The active min/max constraint for whichever selection is live, or null when the
  // selection is a plain fixed-amount tier (amount comes straight from the tier itself).
  const activeRange = selectedSponsor
    ? { min: selectedSponsor.minAmount, max: selectedSponsor.maxAmount, label: selectedSponsor.name }
    : selectedTierRanged
      ? { min: selectedTier!.amount, max: selectedTier!.maxAmount, label: selectedTier!.name }
      : selected === "custom"
        ? { min: 1, max: null, label: "Custom Amount" }
        : null;

  const isRangedSelection = !!activeRange;
  const amount = isRangedSelection ? parseFloat(customAmount) || 0 : selectedTier?.amount || 0;

  const selectTier = (tier: Tier) => {
    setSelected(tier.id);
    if (isRangedTier(tier)) setCustomAmount(String(tier.amount));
    setError("");
  };

  const selectSponsor = (tier: SponsorTier) => {
    setSelected(sponsorSelectionId(tier.id));
    setCustomAmount(String(tier.minAmount));
    setError("");
    checkoutPanelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleGatewayChange = useCallback((gw: string) => setGateway(gw), []);

  const handleDonate = async () => {
    if (!amount || amount < 1) return;
    if (activeRange) {
      const tooLow  = amount < activeRange.min;
      const tooHigh = activeRange.max != null && amount > activeRange.max;
      if (tooLow || tooHigh) {
        setError(`Amount for "${activeRange.label}" must be ${formatAmountRange(activeRange.min, activeRange.max)}.`);
        return;
      }
    }
    const digits = phone.replace(/\D/g, "");
    if (phone && (digits.length < 10 || digits.length > 15)) {
      setError("Enter a valid phone number (10–15 digits).");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/donations/checkout", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount,
          cause:     selectedSponsor?.name || selectedTier?.name || "General Donation",
          firstName,
          lastName,
          email,
          phone,
          message,
          recurring: selectedTier?.recurring || false,
          tierId: selectedTier?.id,
          sponsorTierId: selectedSponsor?.id,
          gateway,
        }),
      });
      const data = await res.json();
      if (!data.url) { setError(data.error || "Something went wrong."); return; }

      const popup = window.open(data.url, "donation-payment", "width=620,height=720,scrollbars=yes,resizable=yes");
      if (!popup) { window.location.href = data.url; return; }
      setPaymentWaiting(true);
      setPaymentResult(null);
      setPaymentSuccessUrl(data.successUrl || data.squareSuccessUrl || null);
      const interval = setInterval(() => {
        try {
          if (popup.closed) {
            clearInterval(interval);
            setPaymentResult("cancelled");
            setTimeout(() => { setPaymentWaiting(false); setPaymentResult(null); }, 2500);
            return;
          }
          const href = popup.location.href;
          if (href && href.includes("/donation-success")) {
            clearInterval(interval);
            popup.close();
            setPaymentResult("success");
            setTimeout(() => { window.location.href = href; }, 1800);
          }
        } catch { /* cross-origin — the payment provider's domain */ }
      }, 600);
    } catch {
      setError("Unable to process. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full px-3 py-2.5 border border-gold/30 rounded-lg text-sm focus:outline-none focus:border-saffron transition-colors";

  const customAmountCard = (
    <button
      key="custom"
      onClick={() => setSelected("custom")}
      className={`text-left p-5 rounded-2xl border-2 transition-all duration-200 ${
        selected === "custom"
          ? "border-saffron bg-white shadow-lg ring-1 ring-saffron/20"
          : "border-gold/20 bg-white hover:border-gold/50 hover:shadow-sm"
      }`}
    >
      <div className="font-cinzel font-semibold text-maroon text-sm mb-2">
        Custom Amount
      </div>
      <div className="font-bold text-2xl text-saffron mb-1">Any Amount</div>
      <p className="text-foreground font-semibold text-xs">Enter any amount of your choosing.</p>
      {selected === "custom" && (
        <div className="mt-3 pt-2 border-t border-gold/20 text-xs text-saffron font-medium">
          ✓ Selected
        </div>
      )}
    </button>
  );

  return (
    <>
    <div className="grid lg:grid-cols-3 gap-8">
      {/* Tier cards */}
      <div className="lg:col-span-2">
        {highlightedTiers.length > 0 && (
          <div
            className="rounded-3xl border-2 border-gold/60 p-5 mb-4"
            style={{ background: "linear-gradient(135deg,#FFFDF8 0%,#FFF8E8 100%)" }}
          >
            <div className="grid sm:grid-cols-2 gap-4">
              {highlightedTiers.map((tier) => (
                <button
                  key={tier.id}
                  onClick={() => selectTier(tier)}
                  className={`relative text-left p-5 rounded-2xl border-2 transition-all duration-200 overflow-hidden bg-white ${
                    selected === tier.id
                      ? "border-saffron shadow-xl ring-2 ring-saffron/30"
                      : "border-gold/40 shadow-sm hover:shadow-md hover:border-saffron/60"
                  }`}
                >
                  <div className="flex items-start justify-between mb-2 gap-2 pr-2">
                    <span className="font-cinzel font-semibold text-maroon text-sm leading-tight">
                      {tier.name}
                    </span>
                    {tier.recurring && (
                      <span className="flex items-center gap-1 bg-saffron/10 text-saffron text-xs px-2 py-0.5 rounded-full shrink-0">
                        <RefreshCw className="w-3 h-3" /> Monthly
                      </span>
                    )}
                  </div>
                  <div className="font-bold text-2xl text-saffron mb-1">
                    {isRangedTier(tier) ? formatAmountRange(tier.amount, tier.maxAmount) : `$${tier.amount}`}
                    {tier.recurring ? <span className="text-base font-normal">/mo</span> : ""}
                  </div>
                  <p className="text-foreground font-semibold text-xs leading-relaxed">{tier.description}</p>
                  {selected === tier.id && (
                    <div className="mt-3 pt-2 border-t border-gold/30 text-xs text-saffron font-medium">
                      ✓ Selected{isRangedTier(tier) ? " — enter your amount below" : ""}
                    </div>
                  )}
                </button>
              ))}
              {customAmountCard}
            </div>
          </div>
        )}
        <div className="grid sm:grid-cols-2 gap-4">
          {regularTiers.map((tier) => (
            <button
              key={tier.id}
              onClick={() => selectTier(tier)}
              className={`text-left p-5 rounded-2xl border-2 transition-all duration-200 ${
                selected === tier.id
                  ? "border-saffron bg-white shadow-lg ring-1 ring-saffron/20"
                  : "border-gold/20 bg-white hover:border-gold/50 hover:shadow-sm"
              }`}
            >
              <div className="flex items-start justify-between mb-2 gap-2">
                <span className="font-cinzel font-semibold text-maroon text-sm leading-tight">
                  {tier.name}
                </span>
                {tier.recurring && (
                  <span className="flex items-center gap-1 bg-saffron/10 text-saffron text-xs px-2 py-0.5 rounded-full shrink-0">
                    <RefreshCw className="w-3 h-3" /> Monthly
                  </span>
                )}
              </div>
              <div className="font-bold text-2xl text-saffron mb-1">
                {isRangedTier(tier) ? formatAmountRange(tier.amount, tier.maxAmount) : `$${tier.amount}`}
                {tier.recurring ? <span className="text-base font-normal">/mo</span> : ""}
              </div>
              <p className="text-foreground font-semibold text-xs leading-relaxed">{tier.description}</p>
              {selected === tier.id && (
                <div className="mt-3 pt-2 border-t border-gold/20 text-xs text-saffron font-medium">
                  ✓ Selected{isRangedTier(tier) ? " — enter your amount below" : ""}
                </div>
              )}
            </button>
          ))}

          {highlightedTiers.length === 0 && customAmountCard}
        </div>
      </div>

      {/* Checkout panel */}
      <div className="lg:col-span-1" ref={checkoutPanelRef}>
        <div className="bg-white rounded-2xl p-6 gold-border shadow-sm lg:sticky lg:top-24">
          <h3 className="font-cinzel font-semibold text-maroon text-xl mb-1">Your Donation</h3>
          <p className="text-foreground/50 text-xs mb-3">
            All donations are 100% tax-deductible.
          </p>

          {amount > 0 && (
            <div className="bg-linear-to-r from-saffron/10 to-gold/10 border border-saffron/30 rounded-xl px-4 py-2.5 mb-4 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="font-cinzel font-semibold text-maroon text-sm truncate">
                  {selectedSponsor?.name || selectedTier?.name || "Custom Donation"}
                </p>
                <p className="text-[10px] text-foreground/45">Tax ID: 99-4945072</p>
              </div>
              <div className="font-bold text-saffron text-xl shrink-0">
                ${amount}
                {selectedTier?.recurring ? <span className="text-xs font-normal">/mo</span> : ""}
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-maroon/80 mb-1.5">First Name</label>
                <input
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className={inputClass}
                  placeholder="First name"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-maroon/80 mb-1.5">Last Name</label>
                <input
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className={inputClass}
                  placeholder="Last name"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-maroon/80 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-maroon/80 mb-1.5">
                Mobile Number{" "}
                <span className="text-foreground/40 font-normal">(optional)</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/45 text-sm select-none">
                  📞
                </span>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-8 pr-3 py-2.5 border border-gold/30 rounded-lg text-sm focus:outline-none focus:border-saffron transition-colors"
                  placeholder="+1 (555) 000-0000"
                />
              </div>
            </div>

            {activeRange && (
              <div>
                <label className="block text-xs font-medium text-maroon/80 mb-1.5">
                  {selected === "custom"
                    ? "Amount (USD)"
                    : `Amount (USD) — ${formatAmountRange(activeRange.min, activeRange.max)}`}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/50 font-medium">
                    $
                  </span>
                  <input
                    type="number"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    className="w-full pl-7 pr-3 py-2.5 border border-gold/30 rounded-lg text-sm focus:outline-none focus:border-saffron transition-colors"
                    placeholder="Enter amount"
                    min={activeRange.min}
                    max={activeRange.max ?? undefined}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-maroon/80 mb-1.5">
                Dedication / Message{" "}
                <span className="text-foreground/40 font-normal">(optional)</span>
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={2}
                className={inputClass}
                placeholder="In honour of, in memory of…"
              />
            </div>

            {/* Payment gateway selector */}
            <PaymentGateway onGatewayChange={handleGatewayChange} />

            {error && (
              <p className="text-red-500 text-xs bg-red-50 border border-red-200 p-3 rounded-lg">
                {error}
              </p>
            )}

            <button
              onClick={handleDonate}
              disabled={loading || !amount || amount < 1}
              className="btn-primary w-full py-3 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Processing…</>
              ) : (
                <><Lock className="w-3.5 h-3.5" /> Donate {amount > 0 ? `$${amount}` : ""}</>
              )}
            </button>

            <p className="text-xs text-foreground/40 text-center flex items-center justify-center gap-1">
              <Lock className="w-3 h-3" /> Secure encrypted payment
            </p>
          </div>
        </div>
      </div>
    </div>

    {/* Seva Sponsorship Tiers — named ranged tiers, admin-managed */}
    {sponsorTiers.length > 0 && (
      <div className="pt-16 mt-8 border-t border-gold/20" id="sponsorship">
        <div>
          <div className="text-center mb-10">
            <span className="badge-gold mb-4 inline-flex text-xs md:text-sm px-4 py-1.5">Sacred Giving</span>
            <h2 className="font-cinzel font-bold text-2xl md:text-3xl text-maroon mb-3">Seva Sponsorship Tiers</h2>
            <div className="flex items-center justify-center gap-4 mb-3">
              <span className="block h-px w-20 bg-linear-to-r from-transparent to-gold/60" />
              <span className="text-gold text-xl">🪷</span>
              <span className="block h-px w-20 bg-linear-to-l from-transparent to-gold/60" />
            </div>
            <p className="text-foreground text-sm max-w-xl mx-auto">
              Choose a sponsorship tier and enter an amount within its range — every contribution is a sacred act of devotion that sustains our temple and community.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {sponsorTiers.map((tier, i) => {
              const style = SPONSOR_STYLES[i % SPONSOR_STYLES.length];
              const benefits = (tier.benefits || "").split("\n").map((b) => b.trim()).filter(Boolean);
              const isSelected = selected === sponsorSelectionId(tier.id);
              return (
                <button
                  key={tier.id}
                  onClick={() => selectSponsor(tier)}
                  className={`text-left rounded-2xl p-6 card-hover flex flex-col relative transition-all duration-200 ${
                    isSelected ? "ring-2 ring-saffron shadow-xl" : tier.highlighted ? "shadow-xl" : ""
                  }`}
                  style={{ background: style.bg, border: `1.5px solid ${style.border}` }}
                >
                  {tier.highlighted && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="bg-purple-700 text-white text-[10px] font-cinzel font-bold px-3 py-1 rounded-full uppercase tracking-widest shadow">
                        Highest Honour
                      </span>
                    </div>
                  )}
                  <div className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center text-2xl shadow-sm" style={{ background: style.color + "18", border: `1.5px solid ${style.color}40` }}>
                    {style.icon}
                  </div>
                  <h3 className="font-cinzel font-bold text-maroon text-base text-center mb-1">{tier.name}</h3>
                  <p className="text-center font-bold text-sm mb-4" style={{ color: style.color }}>
                    {formatAmountRange(tier.minAmount, tier.maxAmount)}
                  </p>
                  {tier.description && (
                    <p className="text-foreground/70 text-xs text-center mb-3">{tier.description}</p>
                  )}
                  {benefits.length > 0 && (
                    <ul className="space-y-2 flex-1">
                      {benefits.map((b) => (
                        <li key={b} className="text-foreground text-xs flex items-start gap-2">
                          <span className="mt-0.5 shrink-0" style={{ color: style.color }}>⮚</span> {b}
                        </li>
                      ))}
                    </ul>
                  )}
                  <div className={`mt-4 pt-3 border-t text-xs font-semibold text-center ${isSelected ? "text-saffron" : "text-foreground/40"}`} style={{ borderColor: style.border }}>
                    {isSelected ? "✓ Selected — enter your amount above" : "Tap to select this tier"}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    )}

      {/* Payment window overlay — same UX for Stripe, PayPal, and Square */}
      {paymentWaiting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center">

            {paymentResult === "success" ? (
              <>
                <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
                  <CheckCircle className="w-7 h-7 text-green-600" />
                </div>
                <p className="font-cinzel font-bold text-maroon text-lg mb-2">Donation Received!</p>
                <p className="text-foreground/60 text-sm mb-6 leading-relaxed">
                  Thank you for your generous contribution. Redirecting you now…
                </p>
                <div className="flex items-center justify-center gap-2 text-green-600">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm font-medium">Redirecting…</span>
                </div>
              </>
            ) : paymentResult === "cancelled" ? (
              <>
                <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-5">
                  <XCircle className="w-7 h-7 text-red-500" />
                </div>
                <p className="font-cinzel font-bold text-maroon text-lg mb-2">Payment Cancelled</p>
                <p className="text-foreground/60 text-sm leading-relaxed">
                  You closed the payment window. You can try again when ready.
                </p>
              </>
            ) : (
              <>
                <div className="w-14 h-14 bg-saffron/10 rounded-full flex items-center justify-center mx-auto mb-5">
                  <ShieldCheck className="w-7 h-7 text-saffron" />
                </div>
                <p className="font-cinzel font-semibold text-maroon text-lg mb-2">Complete Payment</p>
                <p className="text-foreground/60 text-sm mb-6 leading-relaxed">
                  Finish your donation in the {gatewayLabel[gateway] || "payment"} window. This page will update automatically once payment is confirmed.
                </p>
                <div className="flex items-center justify-center gap-2 text-saffron mb-4">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm font-medium">Waiting for payment…</span>
                </div>
                {paymentSuccessUrl && (
                  <button
                    onClick={() => { window.location.href = paymentSuccessUrl; }}
                    className="w-full mb-3 py-2 px-4 rounded-lg bg-saffron/10 hover:bg-saffron/20 text-saffron text-sm font-medium transition-colors"
                  >
                    I completed my payment ↗
                  </button>
                )}
                <button
                  onClick={() => setPaymentWaiting(false)}
                  className="flex items-center gap-2 mx-auto text-xs text-foreground/40 hover:text-maroon transition-colors"
                >
                  <X className="w-3.5 h-3.5" /> Cancel
                </button>
              </>
            )}

          </div>
        </div>
      )}
    </>
  );
}
