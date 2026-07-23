import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { encrypt, decrypt, mask } from "@/lib/encryption";
import { getContactInfo } from "@/lib/contact";

// Admin GET — returns masked secrets for display
export async function GET() {
  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const s = await db.siteSettings.findUnique({ where: { id: "main" } });
  const contact = await getContactInfo();

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
    email: {
      provider: s?.emailProvider === "hostinger" ? "hostinger" : "gmail",
      gmail: {
        enabled:     s?.gmailEnabled     ?? false,
        user:        s?.gmailUser        ? decrypt(s.gmailUser)        : "",
        appPassword: s?.gmailAppPassword ? mask(decrypt(s.gmailAppPassword)) : "",
      },
      hostinger: {
        enabled:  s?.hostingerEnabled  ?? false,
        host:     s?.hostingerHost     ?? "smtp.hostinger.com",
        port:     s?.hostingerPort     ?? 465,
        secure:   s?.hostingerSecure   ?? true,
        user:     s?.hostingerUser     ? decrypt(s.hostingerUser)     : "",
        password: s?.hostingerPassword ? mask(decrypt(s.hostingerPassword)) : "",
      },
      adminEmails: s?.adminEmails ?? "",
    },
    contact: {
      address:        contact.address,
      mailingAddress: contact.mailingAddress,
      phones:         contact.phones,
      emails:         contact.emails,
      hours:          contact.hours,
    },
    social: {
      facebook:  contact.social.facebook  ?? "",
      instagram: contact.social.instagram ?? "",
      youtube:   contact.social.youtube   ?? "",
      twitter:   contact.social.twitter   ?? "",
      whatsapp:  contact.social.whatsapp  ?? "",
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

  const cleanList = (arr: unknown): string[] =>
    Array.isArray(arr) ? arr.map((v) => String(v).trim()).filter(Boolean) : [];

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
      emailProvider:       body.email?.provider === "hostinger" ? "hostinger" : "gmail",
      gmailEnabled:        body.email?.gmail?.enabled        ?? false,
      gmailUser:           body.email?.gmail?.user           ? encrypt(body.email.gmail.user) : null,
      gmailAppPassword:    resolveSecret(body.email?.gmail?.appPassword, existing?.gmailAppPassword),
      hostingerEnabled:    body.email?.hostinger?.enabled    ?? false,
      hostingerHost:       body.email?.hostinger?.host       || "smtp.hostinger.com",
      hostingerPort:       body.email?.hostinger?.port       || 465,
      hostingerSecure:     body.email?.hostinger?.secure     ?? true,
      hostingerUser:       body.email?.hostinger?.user       ? encrypt(body.email.hostinger.user) : null,
      hostingerPassword:   resolveSecret(body.email?.hostinger?.password, existing?.hostingerPassword),
      adminEmails:         body.email?.adminEmails    ?? null,
      contactAddress:        body.contact?.address        || null,
      contactMailingAddress: body.contact?.mailingAddress || null,
      contactPhones:         cleanList(body.contact?.phones),
      contactEmails:         cleanList(body.contact?.emails),
      contactHours:          body.contact?.hours          || null,
      facebookUrl:  body.social?.facebook  || null,
      instagramUrl: body.social?.instagram || null,
      youtubeUrl:   body.social?.youtube   || null,
      twitterUrl:   body.social?.twitter   || null,
      whatsappNumber: body.social?.whatsapp || null,
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
      emailProvider:       body.email?.provider === "hostinger" ? "hostinger" : "gmail",
      gmailEnabled:        body.email?.gmail?.enabled        ?? false,
      gmailUser:           body.email?.gmail?.user           ? encrypt(body.email.gmail.user) : existing?.gmailUser,
      gmailAppPassword:    resolveSecret(body.email?.gmail?.appPassword, existing?.gmailAppPassword),
      hostingerEnabled:    body.email?.hostinger?.enabled    ?? false,
      hostingerHost:       body.email?.hostinger?.host       || existing?.hostingerHost || "smtp.hostinger.com",
      hostingerPort:       body.email?.hostinger?.port       || existing?.hostingerPort || 465,
      hostingerSecure:     body.email?.hostinger?.secure     ?? true,
      hostingerUser:       body.email?.hostinger?.user       ? encrypt(body.email.hostinger.user) : existing?.hostingerUser,
      hostingerPassword:   resolveSecret(body.email?.hostinger?.password, existing?.hostingerPassword),
      adminEmails:         body.email?.adminEmails !== undefined ? body.email.adminEmails : existing?.adminEmails,
      contactAddress:        body.contact?.address        || null,
      contactMailingAddress: body.contact?.mailingAddress || null,
      contactPhones:         cleanList(body.contact?.phones),
      contactEmails:         cleanList(body.contact?.emails),
      contactHours:          body.contact?.hours          || null,
      facebookUrl:  body.social?.facebook  || null,
      instagramUrl: body.social?.instagram || null,
      youtubeUrl:   body.social?.youtube   || null,
      twitterUrl:   body.social?.twitter   || null,
      whatsappNumber: body.social?.whatsapp || null,
    },
  });

  return NextResponse.json({ ok: true });
}
