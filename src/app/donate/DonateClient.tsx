"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Loader2, RefreshCw, Lock, ShieldCheck } from "lucide-react";
import { PaymentGateway } from "@/components/payment/PaymentGateway";

interface Tier {
  id: string;
  name: string;
  description: string | null;
  amount: number;
  recurring: boolean;
}

export default function DonateClient({ tiers }: { tiers: Tier[] }) {
  const { data: session } = useSession();
  const [selected, setSelected]           = useState<string | null>(null);
  const [customAmount, setCustomAmount]   = useState("");
  const [firstName, setFirstName]         = useState("");
  const [lastName, setLastName]           = useState("");
  const [email, setEmail]                 = useState("");
  const [phone, setPhone]                 = useState("");
  const [message, setMessage]             = useState("");
  const [gateway, setGateway]             = useState("stripe");
  const [loading, setLoading]             = useState(false);
  const [error, setError]                 = useState("");
  const [squareWaiting, setSquareWaiting] = useState(false);

  useEffect(() => {
    if (session?.user) {
      const parts = (session.user?.name || "").split(" ");
      setFirstName((prev) => prev || parts[0] || "");
      setLastName((prev)  => prev || parts.slice(1).join(" ") || "");
      setEmail((prev)     => prev || session.user?.email || "");
    }
  }, [session]);

  const selectedTier = tiers.find((t) => t.id === selected);
  const amount = selected === "custom" ? parseFloat(customAmount) || 0 : selectedTier?.amount || 0;

  const handleGatewayChange = useCallback((gw: string) => setGateway(gw), []);

  const handleDonate = async () => {
    if (!amount || amount < 1) return;
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
          cause:     selectedTier?.name || "General Donation",
          firstName,
          lastName,
          email,
          phone,
          message,
          recurring: selectedTier?.recurring || false,
          gateway,
        }),
      });
      const data = await res.json();
      if (!data.url) { setError(data.error || "Something went wrong."); return; }
      if (gateway === "square") {
        const popup = window.open(data.url, "square-donation", "width=620,height=720,scrollbars=yes,resizable=yes");
        if (!popup) { window.location.href = data.url; return; }
        setSquareWaiting(true);
        const interval = setInterval(() => {
          try {
            if (popup.closed) { clearInterval(interval); setSquareWaiting(false); return; }
            const href = popup.location.href;
            if (href && href.includes("/donation-success")) {
              clearInterval(interval);
              popup.close();
              window.location.href = href;
            }
          } catch { /* cross-origin — Square's domain */ }
        }, 600);
      } else {
        window.location.href = data.url;
      }
    } catch {
      setError("Unable to process. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full px-3 py-2.5 border border-gold/30 rounded-lg text-sm focus:outline-none focus:border-saffron transition-colors";

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      {/* Tier cards */}
      <div className="lg:col-span-2">
        <div className="grid sm:grid-cols-2 gap-4">
          {tiers.map((tier) => (
            <button
              key={tier.id}
              onClick={() => setSelected(tier.id)}
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
                ${tier.amount}
                {tier.recurring ? <span className="text-base font-normal">/mo</span> : ""}
              </div>
              <p className="text-foreground/60 text-xs leading-relaxed">{tier.description}</p>
              {selected === tier.id && (
                <div className="mt-3 pt-2 border-t border-gold/20 text-xs text-saffron font-medium">
                  ✓ Selected
                </div>
              )}
            </button>
          ))}

          {/* Custom amount card */}
          <button
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
            <p className="text-foreground/60 text-xs">Enter any amount of your choosing.</p>
            {selected === "custom" && (
              <div className="mt-3 pt-2 border-t border-gold/20 text-xs text-saffron font-medium">
                ✓ Selected
              </div>
            )}
          </button>
        </div>
      </div>

      {/* Checkout panel */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-2xl p-6 gold-border shadow-sm lg:sticky lg:top-24">
          <h3 className="font-cinzel font-semibold text-maroon text-xl mb-1">Your Donation</h3>
          <p className="text-foreground/50 text-xs mb-5">
            All donations are 100% tax-deductible.
          </p>

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

            {selected === "custom" && (
              <div>
                <label className="block text-xs font-medium text-maroon/80 mb-1.5">
                  Amount (USD)
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
                    min="1"
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

            {amount > 0 && (
              <div className="bg-cream rounded-xl p-4 space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span className="text-foreground/60">
                    {selectedTier?.name || "Custom Donation"}
                  </span>
                  <span className="font-bold text-maroon">
                    ${amount}
                    {selectedTier?.recurring ? (
                      <span className="text-xs font-normal">/mo</span>
                    ) : ""}
                  </span>
                </div>
                <p className="text-xs text-foreground/50">
                  Tax-deductible · 501(c)(3) · Tax ID: 99-4945072
                </p>
              </div>
            )}

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

      {/* Square waiting overlay */}
      {squareWaiting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center">
            <ShieldCheck className="w-10 h-10 text-saffron mx-auto mb-4" />
            <p className="font-cinzel font-semibold text-maroon text-lg mb-2">Complete Payment</p>
            <p className="text-foreground/60 text-sm mb-6">
              Finish your donation in the Square window. This page will update automatically once payment is confirmed.
            </p>
            <Loader2 className="w-6 h-6 animate-spin text-saffron mx-auto mb-4" />
            <button
              onClick={() => setSquareWaiting(false)}
              className="text-xs text-foreground/40 hover:text-maroon transition-colors mt-2"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
