"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Suspense } from "react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/dashboard";
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const result = await signIn("credentials", {
      email: form.email,
      password: form.password,
      redirect: false,
    });
    if (result?.ok) {
      router.push(redirect);
    } else {
      if (result?.code === "no-account") {
        setError("No account exists with this email. Please register first.");
      } else if (result?.code === "wrong-password") {
        setError("Incorrect password. Please try again.");
      } else {
        setError("Invalid email or password. Please try again.");
      }
      setLoading(false);
    }
  };

  const inputClass = "w-full px-4 py-3 border border-gold/30 rounded-lg text-sm focus:outline-none focus:border-saffron transition-colors";
  const labelClass = "block text-sm font-medium text-maroon/80 mb-1.5";

  return (
    <div className="min-h-screen bg-cream pattern-bg flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
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
          <h1 className="font-cinzel font-bold text-3xl text-maroon mb-2">Welcome Back</h1>
          <p className="text-foreground/60 text-sm">Sign in to your devotee account</p>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-sm gold-border">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className={labelClass}>Email Address</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                required
                autoComplete="email"
                className={inputClass}
                placeholder="your@email.com"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className={labelClass} style={{marginBottom: 0}}>Password</label>
                <Link href="/auth/forgot-password" className="text-xs text-saffron hover:underline">Forgot Password?</Link>
              </div>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                required
                autoComplete="current-password"
                className={inputClass}
                placeholder="••••••••"
              />
            </div>
            {error && <p className="text-red-500 text-sm bg-red-50 p-3 rounded-lg">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 flex items-center justify-center gap-2"
            >
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Signing in...</> : "Sign In"}
            </button>
          </form>

          

          <p className="text-center text-sm text-foreground/60 mt-6">
            Don&apos;t have an account?{" "}
            <Link href="/auth/register" className="text-saffron font-medium hover:underline">
              Register as Devotee
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-cream flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-saffron" /></div>}>
      <LoginForm />
    </Suspense>
  );
}
