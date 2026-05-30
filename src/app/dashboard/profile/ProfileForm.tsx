"use client";

import { useState } from "react";
import { Loader2, CheckCircle } from "lucide-react";

interface User {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  gotram: string | null;
  nakshatra: string | null;
}

export default function ProfileForm({ user }: { user: User | null }) {
  const [form, setForm] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    address: user?.address || "",
    city: user?.city || "",
    state: user?.state || "",
    zip: user?.zip || "",
    gotram: user?.gotram || "",
    nakshatra: user?.nakshatra || "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      // handle error
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full px-4 py-3 border border-gold/30 rounded-lg text-sm focus:outline-none focus:border-saffron transition-colors";
  const labelClass = "block text-sm font-medium text-maroon/80 mb-1.5";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="mb-4 p-3 bg-cream rounded-lg text-sm text-foreground/60">
        Email: <strong className="text-maroon">{user?.email}</strong>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Full Name</label>
          <input name="name" value={form.name} onChange={handleChange} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Phone</label>
          <input name="phone" value={form.phone} onChange={handleChange} className={inputClass} />
        </div>
      </div>
      <div>
        <label className={labelClass}>Street Address</label>
        <input name="address" value={form.address} onChange={handleChange} className={inputClass} />
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-1">
          <label className={labelClass}>City</label>
          <input name="city" value={form.city} onChange={handleChange} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>State</label>
          <input name="state" value={form.state} onChange={handleChange} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>ZIP</label>
          <input name="zip" value={form.zip} onChange={handleChange} className={inputClass} />
        </div>
      </div>
      <div className="border-t border-gold/20 pt-5">
        <p className="text-xs text-foreground/50 mb-4 font-medium uppercase tracking-wider">Vedic Details</p>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Gotram</label>
            <input name="gotram" value={form.gotram} onChange={handleChange} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Nakshatra (Birth Star)</label>
            <input name="nakshatra" value={form.nakshatra} onChange={handleChange} className={inputClass} />
          </div>
        </div>
      </div>
      <button type="submit" disabled={loading} className="btn-primary w-full py-3 flex items-center justify-center gap-2">
        {loading ? (
          <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
        ) : success ? (
          <><CheckCircle className="w-4 h-4" /> Saved!</>
        ) : (
          "Save Changes"
        )}
      </button>
    </form>
  );
}
