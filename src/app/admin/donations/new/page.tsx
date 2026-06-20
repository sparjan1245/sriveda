import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { ArrowLeft } from "lucide-react";
import AdminDonationForm from "./AdminDonationForm";

export default async function NewDonationPage() {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  if (role !== "ADMIN") redirect("/dashboard");

  return (
    <div className="min-h-screen bg-cream pattern-bg">
      <div className="max-w-3xl mx-auto px-4 py-10">
        <Link href="/admin/donations" className="inline-flex items-center gap-2 text-maroon/60 hover:text-maroon text-sm mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Donations
        </Link>
        <div className="mb-8">
          <p className="text-gold font-cinzel text-sm uppercase tracking-widest mb-1">Walk-in Entry</p>
          <h1 className="font-cinzel font-bold text-3xl text-maroon">New Donation</h1>
          <p className="text-foreground/60 mt-1 text-sm">Record a donation from a devotee visiting the temple. A receipt will be generated immediately.</p>
        </div>
        <AdminDonationForm />
      </div>
    </div>
  );
}
