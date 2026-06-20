"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Printer } from "lucide-react";

const CAUSES = [
  "General Donation",
  "Annadanam",
  "Temple Development",
  "Special Event",
  "Priest Support",
  "Festival Sponsorship",
  "Other",
];

const PAYMENT_MODES = ["CASH", "CHECK", "CARD", "ONLINE", "UPI", "OTHER"];

export default function AdminDonationForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", phone: "", address: "",
    cause: "General Donation", amount: "", paymentMode: "CASH",
    checkRef: "", message: "", date: new Date().toISOString().split("T")[0],
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/donations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed."); return; }
      router.push(`/receipts/donation/${data.id}`);
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
      {/* Donor */}
      <div className="bg-white rounded-2xl p-6 gold-border shadow-sm">
        <h2 className="font-cinzel font-semibold text-maroon text-lg mb-5">Donor Information</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div><label className={lc}>First Name *</label><input name="firstName" value={form.firstName} onChange={handleChange} required className={ic} placeholder="First name" /></div>
          <div><label className={lc}>Last Name *</label><input name="lastName" value={form.lastName} onChange={handleChange} required className={ic} placeholder="Last name" /></div>
          <div><label className={lc}>Phone</label><input name="phone" value={form.phone} onChange={handleChange} className={ic} placeholder="+1 (xxx) xxx-xxxx" /></div>
          <div><label className={lc}>Email</label><input name="email" type="email" value={form.email} onChange={handleChange} className={ic} placeholder="donor@email.com" /></div>
          <div className="sm:col-span-2"><label className={lc}>Address</label><input name="address" value={form.address} onChange={handleChange} className={ic} placeholder="Street, City, State, ZIP" /></div>
        </div>
      </div>

      {/* Donation */}
      <div className="bg-white rounded-2xl p-6 gold-border shadow-sm">
        <h2 className="font-cinzel font-semibold text-maroon text-lg mb-5">Donation Details</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className={lc}>Cause / Purpose *</label>
            <select name="cause" value={form.cause} onChange={handleChange} className={ic}>
              {CAUSES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className={lc}>Amount (USD) *</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/50">$</span>
              <input name="amount" type="number" value={form.amount} onChange={handleChange} required min="1" step="0.01" className="w-full pl-7 pr-3 py-2.5 border border-gold/30 rounded-lg text-sm focus:outline-none focus:border-saffron transition-colors" placeholder="0.00" />
            </div>
          </div>
          <div>
            <label className={lc}>Payment Mode *</label>
            <select name="paymentMode" value={form.paymentMode} onChange={handleChange} className={ic}>
              {PAYMENT_MODES.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className={lc}>Check / Reference No.</label>
            <input name="checkRef" value={form.checkRef} onChange={handleChange} className={ic} placeholder="Check number or ref" />
          </div>
          <div>
            <label className={lc}>Date *</label>
            <input name="date" type="date" value={form.date} onChange={handleChange} required className={ic} />
          </div>
          <div className="sm:col-span-2">
            <label className={lc}>Dedication / Message</label>
            <textarea name="message" value={form.message} onChange={handleChange} rows={2} className={ic} placeholder="In honor of, in memory of…" />
          </div>
        </div>
      </div>

      {error && <p className="text-red-500 text-sm bg-red-50 border border-red-200 p-3 rounded-lg">{error}</p>}

      <div className="flex gap-3">
        <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2 px-8 py-3 disabled:opacity-60">
          {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating...</> : <><Printer className="w-4 h-4" /> Save &amp; Print Receipt</>}
        </button>
        <a href="/admin/donations" className="btn-secondary px-8 py-3">Cancel</a>
      </div>
    </form>
  );
}
