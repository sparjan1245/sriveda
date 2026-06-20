import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { ArrowLeft } from "lucide-react";
import ReportsClient from "./ReportsClient";

export default async function ReportsPage() {
  const session = await auth();
  if ((session?.user as { role?: string })?.role !== "ADMIN") redirect("/dashboard");

  return (
    <div className="min-h-screen bg-cream pattern-bg">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <Link href="/admin" className="inline-flex items-center gap-2 text-maroon/60 hover:text-maroon text-sm mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Admin Dashboard
        </Link>
        <div className="mb-8">
          <p className="text-gold font-cinzel text-sm uppercase tracking-widest mb-1">Admin</p>
          <h1 className="font-cinzel font-bold text-3xl text-maroon">Reports & Analytics</h1>
        </div>
        <ReportsClient />
      </div>
    </div>
  );
}
