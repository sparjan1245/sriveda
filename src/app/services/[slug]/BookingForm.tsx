"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Loader2, Lock } from "lucide-react";

interface Service {
  slug: string;
  name: string;
  price: number;
}

export default function BookingForm({ service }: { service: Service }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    date: "",
    occasion: "",
    notes: "",
  });

  // Pre-fill when session loads (async)
  useEffect(() => {
    if (session?.user) {
      setForm((prev) => ({
        ...prev,
        name: prev.name || session.user?.name || "",
        email: prev.email || session.user?.email || "",
      }));
    }
  }, [session]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) {
      router.push("/auth/login?redirect=/services/" + service.slug);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/bookings/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, serviceSlug: service.slug }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else setError(data.error || "Something went wrong.");
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
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid sm:grid-cols-2 lg:grid-cols-1 gap-4">
        <div>
          <label className={labelClass}>Full Name *</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            className={inputClass}
            placeholder="Your full name"
          />
        </div>
        <div>
          <label className={labelClass}>Email *</label>
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            required
            className={inputClass}
            placeholder="your@email.com"
          />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-1 gap-4">
        <div>
          <label className={labelClass}>Phone *</label>
          <input
            name="phone"
            value={form.phone}
            onChange={handleChange}
            required
            className={inputClass}
            placeholder="+1 (xxx) xxx-xxxx"
          />
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
        <input
          name="occasion"
          value={form.occasion}
          onChange={handleChange}
          className={inputClass}
          placeholder="Birthday, anniversary, etc."
        />
      </div>
      <div>
        <label className={labelClass}>Special Notes (optional)</label>
        <textarea
          name="notes"
          value={form.notes}
          onChange={handleChange}
          className={inputClass}
          rows={3}
          placeholder="Any specific requirements..."
        />
      </div>

      {error && (
        <p className="text-red-500 text-xs bg-red-50 border border-red-200 p-3 rounded-lg">
          {error}
        </p>
      )}

      <div className="pt-3 border-t border-gold/20">
        <div className="flex justify-between text-sm mb-4">
          <span className="text-foreground/60">Service Fee</span>
          <span className="font-bold text-maroon text-lg">${service.price}</span>
        </div>
        <button
          type="submit"
          disabled={loading || status === "loading"}
          className="btn-primary w-full py-3 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Processing…</>
          ) : session ? (
            <><Lock className="w-3.5 h-3.5" /> Proceed to Payment</>
          ) : (
            "Login to Book"
          )}
        </button>
        <p className="text-xs text-foreground/40 text-center mt-2 flex items-center justify-center gap-1">
          <Lock className="w-3 h-3" /> Secure payment via Stripe · SSL encrypted
        </p>
      </div>
    </form>
  );
}
