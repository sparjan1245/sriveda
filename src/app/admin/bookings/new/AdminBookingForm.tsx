"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Printer } from "lucide-react";

interface Service { id: string; name: string; price: number; category: string | null; }

const PAYMENT_MODES = ["CASH", "CHECK", "CARD", "ONLINE", "UPI", "OTHER"];

export default function AdminBookingForm({ services }: { services: Service[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", phone: "",
    serviceId: services[0]?.id || "", date: "", occasion: "",
    gotra: "", nakshatra: "", sankalpam: "",
    paymentMode: "CASH", amount: "", notes: "",
  });

  const selected = services.find((s) => s.id === form.serviceId);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((p) => ({
      ...p,
      [name]: value,
      ...(name === "serviceId" ? { amount: String(services.find((s) => s.id === value)?.price || "") } : {}),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed."); return; }
      router.push(`/receipts/booking/${data.id}`);
    } catch {
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const ic = "w-full px-3 py-2.5 border border-gold/30 rounded-lg text-sm focus:outline-none focus:border-saffron transition-colors";
  const lc = "block text-xs font-medium text-maroon/80 mb-1.5";

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Devotee */}
      <div className="bg-white rounded-2xl p-6 gold-border shadow-sm">
        <h2 className="font-cinzel font-semibold text-maroon text-lg mb-5">Devotee Information</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div><label className={lc}>First Name *</label><input name="firstName" value={form.firstName} onChange={handleChange} required className={ic} placeholder="First name" /></div>
          <div><label className={lc}>Last Name *</label><input name="lastName" value={form.lastName} onChange={handleChange} required className={ic} placeholder="Last name" /></div>
          <div><label className={lc}>Phone</label><input name="phone" value={form.phone} onChange={handleChange} className={ic} placeholder="+1 (xxx) xxx-xxxx" /></div>
          <div><label className={lc}>Email</label><input name="email" type="email" value={form.email} onChange={handleChange} className={ic} placeholder="devotee@email.com" /></div>
          <div><label className={lc}>Gotra</label><input name="gotra" value={form.gotra} onChange={handleChange} className={ic} placeholder="Gotra" /></div>
          <div><label className={lc}>Nakshatra</label><input name="nakshatra" value={form.nakshatra} onChange={handleChange} className={ic} placeholder="Birth star" /></div>
          <div className="sm:col-span-2">
            <label className={lc}>Sankalpam Details</label>
            <textarea name="sankalpam" value={form.sankalpam} onChange={handleChange} rows={2} className={ic} placeholder="Devotee names, gotra, and purpose for the puja…" />
          </div>
        </div>
      </div>

      {/* Service */}
      <div className="bg-white rounded-2xl p-6 gold-border shadow-sm">
        <h2 className="font-cinzel font-semibold text-maroon text-lg mb-5">Service Details</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className={lc}>Service *</label>
            <select name="serviceId" value={form.serviceId} onChange={handleChange} required className={ic}>
              {services.map((s) => (
                <option key={s.id} value={s.id}>{s.name} — ${s.price}{s.category ? ` (${s.category})` : ""}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={lc}>Service Date *</label>
            <input name="date" type="date" value={form.date} onChange={handleChange} required className={ic} min={new Date().toISOString().split("T")[0]} />
          </div>
          <div>
            <label className={lc}>Occasion</label>
            <input name="occasion" value={form.occasion} onChange={handleChange} className={ic} placeholder="Birthday, anniversary…" />
          </div>
          <div>
            <label className={lc}>Payment Mode *</label>
            <select name="paymentMode" value={form.paymentMode} onChange={handleChange} className={ic}>
              {PAYMENT_MODES.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className={lc}>Amount (USD)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/50">$</span>
              <input name="amount" type="number" value={form.amount || selected?.price || ""} onChange={handleChange} min="0" step="0.01" className="w-full pl-7 pr-3 py-2.5 border border-gold/30 rounded-lg text-sm focus:outline-none focus:border-saffron" placeholder="0.00" />
            </div>
          </div>
          <div className="sm:col-span-2">
            <label className={lc}>Notes</label>
            <textarea name="notes" value={form.notes} onChange={handleChange} rows={2} className={ic} placeholder="Any special requirements or notes…" />
          </div>
        </div>
      </div>

      {error && <p className="text-red-500 text-sm bg-red-50 border border-red-200 p-3 rounded-lg">{error}</p>}

      <div className="flex gap-3">
        <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2 px-8 py-3 disabled:opacity-60">
          {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating...</> : <><Printer className="w-4 h-4" /> Save &amp; Print Receipt</>}
        </button>
        <a href="/admin/bookings" className="btn-secondary px-8 py-3">Cancel</a>
      </div>
    </form>
  );
}
