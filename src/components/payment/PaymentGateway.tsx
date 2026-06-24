"use client";

import { useEffect, useState } from "react";
import { CreditCard, Loader2, AlertCircle } from "lucide-react";

interface GatewayConfig {
  gateways: string[];
  stripe?: { pubKey: string };
  paypal?: { clientId: string; mode: string };
  square?: { appId: string; locationId: string; mode: string };
}

const GATEWAY_META: Record<string, { label: string; desc: string; icon: string }> = {
  stripe: {
    label: "Credit / Debit Card",
    desc:  "Visa, Mastercard, Amex — secured by Stripe",
    icon:  "💳",
  },
  paypal: {
    label: "PayPal",
    desc:  "Pay with your PayPal account or card",
    icon:  "🅿️",
  },
  square: {
    label: "Square",
    desc:  "Secure payment via Square",
    icon:  "⬛",
  },
};

export function PaymentGateway({
  onGatewayChange,
}: {
  onGatewayChange: (gateway: string) => void;
}) {
  const [config, setConfig]     = useState<GatewayConfig | null>(null);
  const [selected, setSelected] = useState<string>("");
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    fetch("/api/payments/public")
      .then((r) => r.json())
      .then((data: GatewayConfig) => {
        setConfig(data);
        if (data.gateways.length > 0) {
          const saved = localStorage.getItem("preferredGateway");
          const initial = saved && data.gateways.includes(saved) ? saved : data.gateways[0];
          setSelected(initial);
          onGatewayChange(initial);
        }
      })
      .catch(() => setConfig({ gateways: [] }))
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const select = (gw: string) => {
    setSelected(gw);
    onGatewayChange(gw);
    localStorage.setItem("preferredGateway", gw);
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-foreground/40 text-sm py-2">
        <Loader2 className="w-4 h-4 animate-spin" /> Loading payment options…
      </div>
    );
  }

  if (!config || config.gateways.length === 0) {
    return (
      <div className="flex items-start gap-2.5 text-amber-700 text-xs bg-amber-50 border border-amber-200 rounded-lg px-3 py-2.5">
        <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
        <span>No payment gateway is configured yet. Please contact the temple to complete your booking.</span>
      </div>
    );
  }

  return (
    <div>
      <label className="block text-xs font-medium text-maroon/80 mb-2">Pay With</label>
      <div className="grid gap-2">
        {config.gateways.map((gw) => {
          const meta = GATEWAY_META[gw] ?? { label: gw, desc: "", icon: "💰" };
          const isSelected = selected === gw;
          return (
            <button
              key={gw}
              type="button"
              onClick={() => select(gw)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-left transition-all duration-150 ${
                isSelected
                  ? "border-saffron bg-white shadow-sm ring-1 ring-saffron/20"
                  : "border-gold/20 bg-white hover:border-gold/50"
              }`}
            >
              <span className="text-xl leading-none w-7 text-center">{meta.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-maroon leading-tight">{meta.label}</div>
                {meta.desc && (
                  <div className="text-xs text-foreground/50 truncate mt-0.5">{meta.desc}</div>
                )}
              </div>
              <div
                className={`w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center ${
                  isSelected ? "border-saffron bg-saffron" : "border-gold/40"
                }`}
              >
                {isSelected && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
              </div>
              {isSelected && (
                <CreditCard className="w-3.5 h-3.5 text-saffron shrink-0" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
