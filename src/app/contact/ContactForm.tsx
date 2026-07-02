"use client";

import { useState } from "react";
import { Loader2, CheckCircle } from "lucide-react";

export default function ContactForm() {
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", phone: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setSuccess(true);
        setForm({ firstName: "", lastName: "", email: "", phone: "", message: "" });
      } else {
        setError("Something went wrong. Please try again.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full px-3 py-2.5 border border-gold/30 rounded-lg text-sm focus:outline-none focus:border-saffron transition-colors";
  const labelClass = "block text-xs font-medium text-maroon/80 mb-1.5";

  if (success) {
    return (
      <div className="text-center py-8">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h4 className="font-cinzel font-semibold text-maroon text-xl mb-2">Message Sent!</h4>
        <p className="text-foreground/60">Thank you for reaching out. We&apos;ll respond within 24 hours.</p>
        <button onClick={() => setSuccess(false)} className="mt-6 btn-secondary px-8">
          Send Another Message
        </button>
      </div>
    );
  }

  return (
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
          <label className={labelClass}>Email *</label>
          <input name="email" type="email" value={form.email} onChange={handleChange} required className={inputClass} placeholder="your@email.com" />
        </div>
        <div>
          <label className={labelClass}>Phone</label>
          <input name="phone" value={form.phone} onChange={handleChange} className={inputClass} placeholder="+1 (xxx) xxx-xxxx" />
        </div>
      </div>
      <div>
        <label className={labelClass}>Message *</label>
        <textarea name="message" value={form.message} onChange={handleChange} required rows={12} className={inputClass} placeholder="How can we help you?" />
      </div>
      {error && (
        <p className="text-red-500 text-sm bg-red-50 border border-red-200 p-3 rounded-lg">{error}</p>
      )}
      <button type="submit" disabled={loading} className="btn-primary w-full py-3 flex items-center justify-center gap-2">
        {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</> : "Send Message"}
      </button>
    </form>
  );
}
