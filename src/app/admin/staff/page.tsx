import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { ArrowLeft } from "lucide-react";
import StaffClient from "./StaffClient";

export default async function StaffPage() {
  const session = await auth();
  if ((session?.user as { role?: string })?.role !== "ADMIN") redirect("/dashboard");

  const currentUserId = (session!.user as { id: string }).id;

  const staff = await db.user.findMany({
    where: { role: { in: ["ADMIN", "STAFF", "PRIEST"] } },
    orderBy: { createdAt: "asc" },
    select: { id: true, name: true, email: true, role: true, phone: true, createdAt: true },
  }).catch(() => []);

  return (
    <div className="min-h-screen bg-cream pattern-bg">
      <div className="max-w-5xl mx-auto px-4 py-10">
        <Link href="/admin" className="inline-flex items-center gap-2 text-maroon/60 hover:text-maroon text-sm mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Admin Dashboard
        </Link>
        <div className="mb-8">
          <p className="text-maroon font-cinzel text-base font-extrabold uppercase tracking-widest mb-1">Admin</p>
          <h1 className="font-cinzel font-bold text-3xl text-maroon">Staff Management</h1>
          <p className="text-foreground/50 text-sm mt-2">Manage roles for Admins, Staff, and Priests. To add a new staff member, first ask them to register as a devotee, then promote their role here.</p>
        </div>
        <StaffClient staff={staff.map((u) => ({ ...u, createdAt: u.createdAt.toISOString() }))} currentUserId={currentUserId} />
      </div>
    </div>
  );
}
