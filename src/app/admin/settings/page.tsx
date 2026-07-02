import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { decrypt, mask } from "@/lib/encryption";
import SettingsClient from "./SettingsClient";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== "ADMIN") {
    redirect("/dashboard");
  }

  const s = await db.siteSettings.findUnique({ where: { id: "main" } });

  const initial = {
    stripe: {
      enabled:       s?.stripeEnabled       ?? false,
      pubKey:        s?.stripePubKey        ? decrypt(s.stripePubKey)        : "",
      secretKey:     s?.stripeSecretKey     ? mask(decrypt(s.stripeSecretKey)) : "",
      webhookSecret: s?.stripeWebhookSecret ? mask(decrypt(s.stripeWebhookSecret)) : "",
    },
    paypal: {
      enabled:  s?.paypalEnabled  ?? false,
      clientId: s?.paypalClientId ? decrypt(s.paypalClientId) : "",
      secret:   s?.paypalSecret   ? mask(decrypt(s.paypalSecret)) : "",
      mode:     (s?.paypalMode ?? "sandbox") as "sandbox" | "live",
    },
    square: {
      enabled:     s?.squareEnabled     ?? false,
      accessToken: s?.squareAccessToken ? mask(decrypt(s.squareAccessToken)) : "",
      appId:       s?.squareAppId       ? decrypt(s.squareAppId)       : "",
      locationId:  s?.squareLocationId  ? decrypt(s.squareLocationId)  : "",
      mode:        (s?.squareMode ?? "sandbox") as "sandbox" | "production",
    },
    gmail: {
      enabled:     s?.gmailEnabled     ?? false,
      user:        s?.gmailUser        ? decrypt(s.gmailUser)        : "",
      appPassword: s?.gmailAppPassword ? mask(decrypt(s.gmailAppPassword)) : "",
      adminEmails: s?.adminEmails      ?? "",
    },
  };

  return (
    <div className="min-h-screen bg-cream pattern-bg">
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="mb-8">
          <p className="text-maroon font-cinzel text-base font-extrabold uppercase tracking-widest mb-1">Admin Panel</p>
          <h1 className="font-cinzel font-bold text-3xl text-maroon">Payment &amp; Email Settings</h1>
          <p className="text-foreground/60 text-sm mt-1">
            Configure payment gateways and email credentials. All secrets are encrypted before storage.
          </p>
        </div>
        <SettingsClient initial={initial} />
      </div>
    </div>
  );
}
