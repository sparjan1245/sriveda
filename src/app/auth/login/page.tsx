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
      setError("Invalid email or password. Please try again.");
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

          <div className="mt-6 pt-6 border-t border-gold/20 text-center">
            <button
              onClick={() => signIn("google", { callbackUrl: redirect })}
              className="w-full border-2 border-gold/30 text-maroon rounded-lg py-3 text-sm font-medium hover:bg-cream transition-colors flex items-center justify-center gap-3"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>
          </div>

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
