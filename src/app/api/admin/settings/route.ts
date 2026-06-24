import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { encrypt, decrypt, mask } from "@/lib/encryption";

// Admin GET — returns masked secrets for display
export async function GET() {
  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const s = await db.siteSettings.findUnique({ where: { id: "main" } });

  return NextResponse.json({
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
      mode:     s?.paypalMode     ?? "sandbox",
    },
    square: {
      enabled:     s?.squareEnabled     ?? false,
      accessToken: s?.squareAccessToken ? mask(decrypt(s.squareAccessToken)) : "",
      appId:       s?.squareAppId       ? decrypt(s.squareAppId)       : "",
      locationId:  s?.squareLocationId  ? decrypt(s.squareLocationId)  : "",
      mode:        s?.squareMode        ?? "sandbox",
    },
    gmail: {
      enabled:     s?.gmailEnabled     ?? false,
      user:        s?.gmailUser        ? decrypt(s.gmailUser)        : "",
      appPassword: s?.gmailAppPassword ? mask(decrypt(s.gmailAppPassword)) : "",
      adminEmails: s?.adminEmails      ?? "",
    },
  });
}

// Admin PUT — save/update credentials (encrypt secrets before storing)
export async function PUT(req: Request) {
  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();

  // Helper: only encrypt non-empty values; keep existing DB value if field is a mask (starts with ••)
  const existing = await db.siteSettings.findUnique({ where: { id: "main" } });

  function resolveSecret(newVal: string, existingEncrypted: string | null | undefined): string | null {
    if (!newVal) return null;
    if (newVal.startsWith("••")) return existingEncrypted ?? null;
    return encrypt(newVal);
  }

  await db.siteSettings.upsert({
    where: { id: "main" },
    create: {
      id: "main",
      stripeEnabled:       body.stripe?.enabled       ?? false,
      stripePubKey:        body.stripe?.pubKey        ? encrypt(body.stripe.pubKey)        : null,
      stripeSecretKey:     resolveSecret(body.stripe?.secretKey,     existing?.stripeSecretKey),
      stripeWebhookSecret: resolveSecret(body.stripe?.webhookSecret, existing?.stripeWebhookSecret),
      paypalEnabled:       body.paypal?.enabled       ?? false,
      paypalClientId:      body.paypal?.clientId      ? encrypt(body.paypal.clientId)      : null,
      paypalSecret:        resolveSecret(body.paypal?.secret, existing?.paypalSecret),
      paypalMode:          body.paypal?.mode          ?? "sandbox",
      squareEnabled:       body.square?.enabled       ?? false,
      squareAccessToken:   resolveSecret(body.square?.accessToken, existing?.squareAccessToken),
      squareAppId:         body.square?.appId         ? encrypt(body.square.appId)         : null,
      squareLocationId:    body.square?.locationId    ? encrypt(body.square.locationId)    : null,
      squareMode:          body.square?.mode          ?? "sandbox",
      gmailEnabled:        body.gmail?.enabled        ?? false,
      gmailUser:           body.gmail?.user           ? encrypt(body.gmail.user)           : null,
      gmailAppPassword:    resolveSecret(body.gmail?.appPassword, existing?.gmailAppPassword),
      adminEmails:         body.gmail?.adminEmails    ?? null,
    },
    update: {
      stripeEnabled:       body.stripe?.enabled       ?? false,
      stripePubKey:        body.stripe?.pubKey        ? encrypt(body.stripe.pubKey)        : existing?.stripePubKey,
      stripeSecretKey:     resolveSecret(body.stripe?.secretKey,     existing?.stripeSecretKey),
      stripeWebhookSecret: resolveSecret(body.stripe?.webhookSecret, existing?.stripeWebhookSecret),
      paypalEnabled:       body.paypal?.enabled       ?? false,
      paypalClientId:      body.paypal?.clientId      ? encrypt(body.paypal.clientId)      : existing?.paypalClientId,
      paypalSecret:        resolveSecret(body.paypal?.secret, existing?.paypalSecret),
      paypalMode:          body.paypal?.mode          ?? "sandbox",
      squareEnabled:       body.square?.enabled       ?? false,
      squareAccessToken:   resolveSecret(body.square?.accessToken, existing?.squareAccessToken),
      squareAppId:         body.square?.appId         ? encrypt(body.square.appId)         : existing?.squareAppId,
      squareLocationId:    body.square?.locationId    ? encrypt(body.square.locationId)    : existing?.squareLocationId,
      squareMode:          body.square?.mode          ?? "sandbox",
      gmailEnabled:        body.gmail?.enabled        ?? false,
      gmailUser:           body.gmail?.user           ? encrypt(body.gmail.user)           : existing?.gmailUser,
      gmailAppPassword:    resolveSecret(body.gmail?.appPassword, existing?.gmailAppPassword),
      adminEmails:         body.gmail?.adminEmails !== undefined ? body.gmail.adminEmails : existing?.adminEmails,
    },
  });

  return NextResponse.json({ ok: true });
}
