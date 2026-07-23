import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { ArrowLeft, ImageIcon, Info } from "lucide-react";
import { TEMPLE } from "@/lib/constants";
import BannerForm from "./BannerForm";
import BannersTable from "./BannersTable";

export default async function AdminBannersPage() {
  const session = await auth();
  if ((session?.user as { role?: string })?.role !== "ADMIN") redirect("/dashboard");

  const banners = await db.banner
    .findMany({ orderBy: { order: "asc" } })
    .catch(() => []);


  return (
    <div className="min-h-screen bg-cream pattern-bg">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 text-maroon/60 hover:text-maroon text-sm mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Admin Dashboard
        </Link>

        <div className="flex items-center justify-between mb-2">
          <div>
            <p className="text-maroon font-cinzel text-base font-extrabold uppercase tracking-widest mb-1">Admin</p>
            <h1 className="font-cinzel font-bold text-3xl text-maroon">Hero Banners</h1>
          </div>
          <BannerForm />
        </div>

        <div className="flex items-start gap-2 bg-blue-50 border border-blue-200 rounded-xl p-4 mb-8 text-sm text-blue-800">
          <Info className="w-4 h-4 mt-0.5 shrink-0" />
          <span>
            When you add banners here, they replace the default slides on the homepage hero.
            If no active banners exist, the 4 default temple images are shown automatically.
            Per-slide titles, subtitles, and button links are optional — if left blank, the
            global temple name and &ldquo;{TEMPLE.tagline}&rdquo; are used.
          </span>
        </div>

        {/* Custom Banners Table */}
        <div className="mb-10">
          <h2 className="font-cinzel font-semibold text-maroon text-lg mb-4">
            Custom Banners{" "}
            <span className="text-foreground/40 text-sm font-normal">({banners.length})</span>
          </h2>

          {banners.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl gold-border">
              <ImageIcon className="w-12 h-12 text-gold/40 mx-auto mb-4" />
              <p className="text-foreground/50 mb-1">No custom banners yet.</p>
              <p className="text-foreground/40 text-sm">
                The 4 default temple images are being used. Add banners above to override them.
              </p>
            </div>
          ) : (
            <BannersTable banners={banners} />
          )}
        </div>
      </div>
    </div>
  );
}
