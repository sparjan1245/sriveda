import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { ArrowLeft } from "lucide-react";
import ProfileForm from "./ProfileForm";
import ChangePasswordForm from "./ChangePasswordForm";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");

  const userId = (session.user as { id: string }).id;
  const user = await db.user.findUnique({ where: { id: userId }, select: { id: true, name: true, email: true, phone: true, address: true, city: true, state: true, zip: true, gotram: true, nakshatra: true, password: true } }).catch(() => null);

  return (
    <div className="min-h-screen bg-cream pattern-bg">
      <div className="max-w-2xl mx-auto px-4 py-10">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-maroon/60 hover:text-maroon text-sm mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
        <h1 className="font-cinzel font-bold text-3xl text-maroon mb-8">My Profile</h1>
        <div className="bg-white rounded-2xl p-8 gold-border shadow-sm">
          <ProfileForm user={user} />
          {user?.password && <ChangePasswordForm />}
        </div>
      </div>
    </div>
  );
}
