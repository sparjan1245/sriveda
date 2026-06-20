"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, CheckCircle, Eye, EyeOff } from "lucide-react";

function ResetForm() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token") || "";

  const [form, setForm] = useState({ password: "", confirm: "" });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirm) { setError("Passwords do not match."); return; }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password: form.password }),
      });
      const data = await res.json();
      if (res.ok) setSuccess(true);
      else setError(data.error || "Invalid or expired link.");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const ic = "w-full px-4 py-3 border border-gold/30 rounded-lg text-sm focus:outline-none focus:border-saffron transition-colors";

  if (!token) return (
    <div className="text-center py-4">
      <p className="text-red-500 mb-4">Invalid reset link.</p>
      <Link href="/auth/forgot-password" className="btn-primary px-8">Request New Link</Link>
    </div>
  );

  if (success) return (
    <div className="text-center py-4">
      <CheckCircle className="w-14 h-14 text-green-500 mx-auto mb-4" />
      <h3 className="font-cinzel font-semibold text-maroon text-xl mb-2">Password Reset!</h3>
      <p className="text-foreground/60 text-sm mb-6">Your password has been updated. You can now sign in.</p>
      <button onClick={() => router.push("/auth/login")} className="btn-primary px-8">Sign In</button>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-maroon/80 mb-1.5">New Password</label>
        <div className="relative">
          <input type={showPw ? "text" : "password"} value={form.password} onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))} required minLength={8} className={ic} placeholder="Min. 8 characters" />
          <button type="button" onClick={() => setShowPw((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-maroon">
            {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-maroon/80 mb-1.5">Confirm Password</label>
        <input type="password" value={form.confirm} onChange={(e) => setForm((p) => ({ ...p, confirm: e.target.value }))} required className={ic} placeholder="Re-enter password" />
      </div>
      {error && <p className="text-red-500 text-sm bg-red-50 p-3 rounded-lg">{error}</p>}
      <button type="submit" disabled={loading} className="btn-primary w-full py-3 flex items-center justify-center gap-2">
        {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Resetting...</> : "Reset Password"}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-cream pattern-bg flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-maroon flex items-center justify-center shadow-md p-2">
              <Image src="/logo.png" alt="Temple Logo" width={48} height={48} className="w-full h-full object-contain" />
            </div>
          </div>
          <h1 className="font-cinzel font-bold text-3xl text-maroon mb-2">New Password</h1>
          <p className="text-foreground/60 text-sm">Enter and confirm your new password</p>
        </div>
        <div className="bg-white rounded-2xl p-8 shadow-sm gold-border">
          <Suspense fallback={<div className="text-center py-4 text-foreground/60">Loading…</div>}>
            <ResetForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
