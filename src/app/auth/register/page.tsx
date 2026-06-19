"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Loader2, CheckCircle } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirm: "",
    phone: "",
    city: "",
    state: "CA",
    gotram: "",
    nakshatra: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        router.push("/auth/login?registered=true");
      } else {
        setError(data.error || "Registration failed. Please try again.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full px-4 py-3 border border-gold/30 rounded-lg text-sm focus:outline-none focus:border-saffron transition-colors";
  const labelClass = "block text-sm font-medium text-maroon/80 mb-1.5";

  return (
    <div className="min-h-screen bg-cream pattern-bg flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-maroon flex items-center justify-center shadow-md p-2">
              <Image
                src="/logo.png"
                alt="Sri Veda Gayatri Temple Logo"
                width={48}
                height={48}
                className="w-full h-full object-contain"
              />
            </div>
          </div>
          <h1 className="font-cinzel font-bold text-3xl text-maroon mb-2">Become a Devotee</h1>
          <p className="text-foreground/60 text-sm">Create your account to access all temple services</p>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-sm gold-border">
          {/* Benefits */}
          <div className="grid grid-cols-2 gap-3 mb-8">
            {["Book services online", "Download tax receipts", "RSVP to events", "Track donations"].map((b) => (
              <div key={b} className="flex items-center gap-2 text-sm text-foreground/70">
                <CheckCircle className="w-4 h-4 text-saffron shrink-0" />
                {b}
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
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
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Phone *</label>
                <input name="phone" value={form.phone} onChange={handleChange} required className={inputClass} placeholder="+1 (xxx) xxx-xxxx" />
              </div>
              <div>
                <label className={labelClass}>Email Address *</label>
                <input name="email" type="email" value={form.email} onChange={handleChange} required className={inputClass} placeholder="your@email.com" />
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Password *</label>
                <input name="password" type="password" value={form.password} onChange={handleChange} required className={inputClass} placeholder="Min. 8 characters" minLength={8} />
              </div>
              <div>
                <label className={labelClass}>Confirm Password *</label>
                <input name="confirm" type="password" value={form.confirm} onChange={handleChange} required className={inputClass} placeholder="Re-enter password" />
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>City</label>
                <input name="city" value={form.city} onChange={handleChange} className={inputClass} placeholder="Your city" />
              </div>
              <div>
                <label className={labelClass}>State</label>
                <input name="state" value={form.state} onChange={handleChange} className={inputClass} placeholder="CA" />
              </div>
            </div>

            <div className="border-t border-gold/20 pt-5">
              <p className="text-xs text-foreground/50 mb-4 font-medium uppercase tracking-wider">
                Optional — for service bookings
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Gotram</label>
                  <input name="gotram" value={form.gotram} onChange={handleChange} className={inputClass} placeholder="Your gotram" />
                </div>
                <div>
                  <label className={labelClass}>Nakshatra (Birth Star)</label>
                  <input name="nakshatra" value={form.nakshatra} onChange={handleChange} className={inputClass} placeholder="Your nakshatra" />
                </div>
              </div>
            </div>

            {error && <p className="text-red-500 text-sm bg-red-50 p-3 rounded-lg">{error}</p>}

            <button type="submit" disabled={loading} className="btn-primary w-full py-3 flex items-center justify-center gap-2">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating Account...</> : "Create Devotee Account"}
            </button>
          </form>

          <p className="text-center text-sm text-foreground/60 mt-6">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-saffron font-medium hover:underline">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
