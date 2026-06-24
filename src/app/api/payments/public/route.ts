import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { decrypt } from "@/lib/encryption";

export const dynamic = "force-dynamic";

function isPlaceholder(v: string | undefined): boolean {
  return !v || v.includes("...");
}

export async function GET() {
  const s = await db.siteSettings.findUnique({ where: { id: "main" } });

  const gateways: string[] = [];
  const config: Record<string, unknown> = {};

  if (s?.stripeEnabled && s.stripePubKey && s.stripeSecretKey) {
    const pubKey = decrypt(s.stripePubKey);
    if (!isPlaceholder(pubKey)) {
      gateways.push("stripe");
      config.stripe = { pubKey };
    }
  }

  if (s?.paypalEnabled && s.paypalClientId && s.paypalSecret) {
    const clientId = decrypt(s.paypalClientId);
    if (!isPlaceholder(clientId)) {
      gateways.push("paypal");
      config.paypal = { clientId, mode: s.paypalMode };
    }
  }

  if (s?.squareEnabled && s.squareAppId && s.squareLocationId && s.squareAccessToken) {
    const appId = decrypt(s.squareAppId);
    if (!isPlaceholder(appId)) {
      gateways.push("square");
      config.square = {
        appId,
        locationId: decrypt(s.squareLocationId),
        mode:       s.squareMode,
      };
    }
  }

  // Env-var fallback for Stripe — only if the key looks real
  if (gateways.length === 0) {
    const envPub = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    const envSec = process.env.STRIPE_SECRET_KEY;
    if (!isPlaceholder(envPub) && !isPlaceholder(envSec)) {
      gateways.push("stripe");
      config.stripe = { pubKey: envPub };
    }
  }

  return NextResponse.json({ gateways, ...config });
}
