"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Loader2, CheckCircle, ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) setSent(true);
      else setError(data.error || "Something went wrong. Please try again.");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream pattern-bg flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-maroon flex items-center justify-center shadow-md p-2">
              <Image src="/logo.png" alt="Temple Logo" width={48} height={48} className="w-full h-full object-contain" />
            </div>
          </div>
          <h1 className="font-cinzel font-bold text-3xl text-maroon mb-2">Reset Password</h1>
          <p className="text-foreground/60 text-sm">Enter your email and we&apos;ll send you a reset link</p>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-sm gold-border">
          {sent ? (
            <div className="text-center py-4">
              <CheckCircle className="w-14 h-14 text-green-500 mx-auto mb-4" />
              <h3 className="font-cinzel font-semibold text-maroon text-xl mb-2">Check Your Email</h3>
              <p className="text-foreground/60 text-sm mb-6">
                A password reset link has been sent to <strong>{email}</strong>.
              </p>
              <Link href="/auth/login" className="btn-primary px-8">Back to Sign In</Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-maroon/80 mb-1.5">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gold/30 rounded-lg text-sm focus:outline-none focus:border-saffron transition-colors"
                  placeholder="your@email.com"
                />
              </div>
              {error && <p className="text-red-500 text-sm bg-red-50 p-3 rounded-lg">{error}</p>}
              <button type="submit" disabled={loading} className="btn-primary w-full py-3 flex items-center justify-center gap-2">
                {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</> : "Send Reset Link"}
              </button>
              <Link href="/auth/login" className="flex items-center justify-center gap-1 text-sm text-foreground/60 hover:text-maroon transition-colors">
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
              </Link>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
