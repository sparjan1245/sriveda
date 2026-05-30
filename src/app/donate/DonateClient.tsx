"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Loader2, RefreshCw } from "lucide-react";

interface Tier {
  id: string;
  name: string;
  description: string;
  amount: number;
  recurring: boolean;
}

export default function DonateClient({ tiers }: { tiers: Tier[] }) {
  const { data: session } = useSession();
  const [selected, setSelected] = useState<string | null>(null);
  const [customAmount, setCustomAmount] = useState("");
  const [name, setName] = useState((session?.user?.name as string) || "");
  const [email, setEmail] = useState((session?.user?.email as string) || "");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const selectedTier = tiers.find((t) => t.id === selected);
  const amount = selected === "custom" ? parseFloat(customAmount) : selectedTier?.amount || 0;

  const handleDonate = async () => {
    if (!amount || amount < 1) return;
    setLoading(true);
    try {
      const res = await fetch("/api/donations/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount,
          cause: selectedTier?.name || "General Donation",
          name,
          email,
          message,
          recurring: selectedTier?.recurring || false,
        }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        <div className="grid sm:grid-cols-2 gap-4">
          {tiers.map((tier) => (
            <button
              key={tier.id}
              onClick={() => setSelected(tier.id)}
              className={`text-left p-5 rounded-2xl border-2 transition-all ${
                selected === tier.id
                  ? "border-saffron bg-white shadow-md"
                  : "border-gold/20 bg-white hover:border-gold/60"
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <span className="font-cinzel font-semibold text-maroon text-sm leading-tight">{tier.name}</span>
                {tier.recurring && (
                  <span className="flex items-center gap-1 bg-saffron/10 text-saffron text-xs px-2 py-0.5 rounded-full">
                    <RefreshCw className="w-3 h-3" /> Monthly
                  </span>
                )}
              </div>
              <div className="font-bold text-2xl text-saffron mb-1">
                ${tier.amount}{tier.recurring ? "/mo" : ""}
              </div>
              <p className="text-foreground/60 text-xs leading-relaxed">{tier.description}</p>
            </button>
          ))}

          {/* Custom */}
          <button
            onClick={() => setSelected("custom")}
            className={`text-left p-5 rounded-2xl border-2 transition-all ${
              selected === "custom"
                ? "border-saffron bg-white shadow-md"
                : "border-gold/20 bg-white hover:border-gold/60"
            }`}
          >
            <div className="font-cinzel font-semibold text-maroon text-sm mb-2">Custom Amount</div>
            <div className="font-bold text-2xl text-saffron mb-1">Any Amount</div>
            <p className="text-foreground/60 text-xs">Enter a custom donation amount of your choice.</p>
          </button>
        </div>
      </div>

      {/* Checkout */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-2xl p-6 gold-border shadow-sm sticky top-24">
          <h3 className="font-cinzel font-semibold text-maroon text-xl mb-6">Your Donation</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-maroon/80 mb-1.5">Your Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2.5 border border-gold/30 rounded-lg text-sm focus:outline-none focus:border-saffron"
                placeholder="Full name"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-maroon/80 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2.5 border border-gold/30 rounded-lg text-sm focus:outline-none focus:border-saffron"
                placeholder="your@email.com"
              />
            </div>
            {selected === "custom" && (
              <div>
                <label className="block text-xs font-medium text-maroon/80 mb-1.5">Amount (USD)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/50">$</span>
                  <input
                    type="number"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    className="w-full pl-7 pr-3 py-2.5 border border-gold/30 rounded-lg text-sm focus:outline-none focus:border-saffron"
                    placeholder="Enter amount"
                    min="1"
                  />
                </div>
              </div>
            )}
            <div>
              <label className="block text-xs font-medium text-maroon/80 mb-1.5">Message (optional)</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={2}
                className="w-full px-3 py-2.5 border border-gold/30 rounded-lg text-sm focus:outline-none focus:border-saffron"
                placeholder="Dedicate this donation..."
              />
            </div>

            {amount > 0 && (
              <div className="pt-2 border-t border-gold/20">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-foreground/60">
                    {selectedTier?.name || "Custom Donation"}
                  </span>
                  <span className="font-bold text-maroon">
                    ${amount}{selectedTier?.recurring ? "/mo" : ""}
                  </span>
                </div>
                <p className="text-xs text-foreground/50">Tax-deductible donation · 501(c)(3)</p>
              </div>
            )}

            <button
              onClick={handleDonate}
              disabled={loading || !amount || amount < 1}
              className="btn-primary w-full py-3 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
              ) : (
                `Donate ${amount > 0 ? `$${amount}` : ""}`
              )}
            </button>
            <p className="text-xs text-foreground/50 text-center">
              Secure payment via Stripe · SSL encrypted
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
