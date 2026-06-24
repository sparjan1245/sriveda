"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import { Loader2, Lock, X, ShieldCheck } from "lucide-react";
import { PaymentGateway } from "@/components/payment/PaymentGateway";

interface Service {
  id: string;
  slug: string;
  name: string;
  price: number;
}

export default function BookingForm({ service }: { service: Service }) {
  const { data: session } = useSession();
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState("");
  const [gateway, setGateway]         = useState("stripe");
  const [squareWaiting, setSquareWaiting] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    lastName:  "",
    email:     "",
    phone:     "",
    date:      "",
    occasion:  "",
    notes:     "",
  });

  // Pre-fill from session once it loads — ref avoids a second state update
  const prefilledRef = useRef(false);
  useEffect(() => {
    if (!session?.user || prefilledRef.current) return;
    prefilledRef.current = true;
    const parts     = (session.user?.name || "").split(" ");
    const userPhone = (session.user as { phone?: string }).phone;
    const u         = session.user;
    setForm((prev) => ({
      ...prev,
      firstName: prev.firstName || parts[0]                 || "",
      lastName:  prev.lastName  || parts.slice(1).join(" ") || "",
      email:     prev.email     || u.email                  || "",
      phone:     prev.phone     || userPhone                || "",
    }));
  }, [session]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleGatewayChange = useCallback((gw: string) => setGateway(gw), []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.firstName || !form.email || !form.phone || !form.date) {
      setError("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/bookings/checkout", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ ...form, serviceId: service.id, serviceSlug: service.slug, gateway }),
      });
      const data = await res.json();
      if (!data.url) {
        setError(data.error || "Something went wrong.");
        return;
      }

      if (gateway === "square") {
        // Open Square in a popup — Square blocks iframes
        const popup = window.open(
          data.url,
          "square-payment",
          "width=620,height=720,scrollbars=yes,resizable=yes"
        );
        if (!popup) {
          // Popup blocked — fall back to redirect
          window.location.href = data.url;
          return;
        }
        setSquareWaiting(true);

        // Poll popup until Square redirects back to our success URL (same-origin)
        const interval = setInterval(() => {
          try {
            if (popup.closed) {
              clearInterval(interval);
              setSquareWaiting(false);
              return;
            }
            const href = popup.location.href;
            if (href && href.includes("/booking-success")) {
              clearInterval(interval);
              popup.close();
              window.location.href = href;
            }
          } catch {
            // Still on Square's domain — cross-origin read throws, that's fine
          }
        }, 600);
      } else {
        window.location.href = data.url; // Stripe / PayPal — full redirect
      }
    } catch {
      setError("Unable to process. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full px-3 py-2.5 border border-gold/30 rounded-lg text-sm focus:outline-none focus:border-saffron bg-white transition-colors";
  const labelClass = "block text-xs font-medium text-maroon/80 mb-1.5";

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>First Name *</label>
            <input name="firstName" value={form.firstName} onChange={handleChange} required className={inputClass} placeholder="First name" />
          </div>
          <div>
            <label className={labelClass}>Last Name *</label>
            <input name="lastName" value={form.lastName} onChange={handleChange} required className={inputClass} placeholder="Last name" />
          </div>
        </div>

        <div>
          <label className={labelClass}>Email *</label>
          <input name="email" type="email" value={form.email} onChange={handleChange} required className={inputClass} placeholder="your@email.com" />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Phone *</label>
            <input name="phone" value={form.phone} onChange={handleChange} required className={inputClass} placeholder="+1 (xxx) xxx-xxxx" />
          </div>
          <div>
            <label className={labelClass}>Preferred Date *</label>
            <input
              name="date"
              type="date"
              value={form.date}
              onChange={handleChange}
              required
              className={inputClass}
              min={new Date().toISOString().split("T")[0]}
            />
          </div>
        </div>

        <div>
          <label className={labelClass}>Occasion (optional)</label>
          <input name="occasion" value={form.occasion} onChange={handleChange} className={inputClass} placeholder="Birthday, anniversary, etc." />
        </div>

        <div>
          <label className={labelClass}>Special Notes (optional)</label>
          <textarea name="notes" value={form.notes} onChange={handleChange} className={inputClass} rows={2} placeholder="Any specific requirements..." />
        </div>

        <PaymentGateway onGatewayChange={handleGatewayChange} />

        {error && (
          <p className="text-red-500 text-xs bg-red-50 border border-red-200 p-3 rounded-lg">{error}</p>
        )}

        <div className="pt-3 border-t border-gold/20">
          <div className="flex justify-between text-sm mb-4">
            <span className="text-foreground/60">Service Fee</span>
            <span className="font-bold text-maroon text-lg">${service.price}</span>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-3 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Processing…</>
            ) : (
              <><Lock className="w-3.5 h-3.5" /> Proceed to Payment</>
            )}
          </button>
          <p className="text-xs text-foreground/40 text-center mt-2 flex items-center justify-center gap-1">
            <Lock className="w-3 h-3" /> Secure encrypted payment · No account required
          </p>
        </div>
      </form>

      {/* Square "waiting" overlay — shows while popup is open */}
      {squareWaiting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8 text-center">
            <div className="w-14 h-14 bg-saffron/10 rounded-full flex items-center justify-center mx-auto mb-5">
              <ShieldCheck className="w-7 h-7 text-saffron" />
            </div>
            <h3 className="font-cinzel font-bold text-maroon text-lg mb-2">
              Complete Your Payment
            </h3>
            <p className="text-foreground/60 text-sm mb-6 leading-relaxed">
              A Square payment window has opened. Complete your payment there — this page will update automatically once done.
            </p>
            <div className="flex items-center justify-center gap-2 text-saffron mb-6">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm font-medium">Waiting for payment…</span>
            </div>
            <button
              onClick={() => setSquareWaiting(false)}
              className="flex items-center gap-2 mx-auto text-xs text-foreground/40 hover:text-maroon transition-colors"
            >
              <X className="w-3.5 h-3.5" /> Cancel payment
            </button>
          </div>
        </div>
      )}
    </>
  );
}
