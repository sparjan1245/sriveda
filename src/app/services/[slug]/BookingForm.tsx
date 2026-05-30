"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

interface Service {
  slug: string;
  name: string;
  price: number;
}

export default function BookingForm({ service }: { service: Service }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: (session?.user?.name as string) || "",
    email: (session?.user?.email as string) || "",
    phone: "",
    date: "",
    occasion: "",
    notes: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) {
      router.push("/auth/login?redirect=/services/" + service.slug);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/bookings/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, serviceSlug: service.slug }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full px-3 py-2.5 border border-gold/30 rounded-lg text-sm focus:outline-none focus:border-saffron bg-white";
  const labelClass = "block text-xs font-medium text-maroon/80 mb-1.5";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className={labelClass}>Full Name *</label>
        <input name="name" value={form.name} onChange={handleChange} required className={inputClass} placeholder="Your full name" />
      </div>
      <div>
        <label className={labelClass}>Email *</label>
        <input name="email" type="email" value={form.email} onChange={handleChange} required className={inputClass} placeholder="your@email.com" />
      </div>
      <div>
        <label className={labelClass}>Phone *</label>
        <input name="phone" value={form.phone} onChange={handleChange} required className={inputClass} placeholder="+1 (xxx) xxx-xxxx" />
      </div>
      <div>
        <label className={labelClass}>Preferred Date *</label>
        <input name="date" type="date" value={form.date} onChange={handleChange} required className={inputClass} min={new Date().toISOString().split("T")[0]} />
      </div>
      <div>
        <label className={labelClass}>Occasion (optional)</label>
        <input name="occasion" value={form.occasion} onChange={handleChange} className={inputClass} placeholder="Birthday, anniversary, etc." />
      </div>
      <div>
        <label className={labelClass}>Special Notes (optional)</label>
        <textarea name="notes" value={form.notes} onChange={handleChange} className={inputClass} rows={3} placeholder="Any specific requirements..." />
      </div>

      <div className="pt-2 border-t border-gold/20">
        <div className="flex justify-between text-sm mb-4">
          <span className="text-foreground/60">Service Fee</span>
          <span className="font-bold text-maroon">${service.price}</span>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full py-3 flex items-center justify-center gap-2"
        >
          {loading ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
          ) : (
            session ? "Proceed to Payment" : "Login to Book"
          )}
        </button>
        <p className="text-xs text-foreground/50 text-center mt-2">
          Secure payment via Stripe · SSL encrypted
        </p>
      </div>
    </form>
  );
}
