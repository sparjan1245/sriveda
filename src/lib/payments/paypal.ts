import { db } from "@/lib/db";
import { decrypt } from "@/lib/encryption";

interface PayPalSettings {
  clientId: string;
  secret: string;
  baseUrl: string;
}

async function getSettings(): Promise<PayPalSettings> {
  const s = await db.siteSettings.findUnique({ where: { id: "main" } });
  if (!s?.paypalEnabled || !s.paypalClientId || !s.paypalSecret) {
    throw new Error("PayPal is not configured.");
  }
  const clientId = decrypt(s.paypalClientId);
  const secret   = decrypt(s.paypalSecret);
  const baseUrl  = s.paypalMode === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";
  return { clientId, secret, baseUrl };
}

async function getAccessToken(cfg: PayPalSettings): Promise<string> {
  const res = await fetch(`${cfg.baseUrl}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${cfg.clientId}:${cfg.secret}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  const data = await res.json();
  if (!data.access_token) throw new Error("PayPal auth failed: " + JSON.stringify(data));
  return data.access_token;
}

export async function createPayPalOrder(opts: {
  amount: number;
  description: string;
  returnUrl: string;
  cancelUrl: string;
}): Promise<{ orderId: string; approveUrl: string }> {
  const cfg   = await getSettings();
  const token = await getAccessToken(cfg);

  const res = await fetch(`${cfg.baseUrl}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "PayPal-Request-Id": `order-${Date.now()}`,
    },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: { currency_code: "USD", value: opts.amount.toFixed(2) },
          description: opts.description,
        },
      ],
      application_context: {
        return_url: opts.returnUrl,
        cancel_url: opts.cancelUrl,
        user_action: "PAY_NOW",
        shipping_preference: "NO_SHIPPING",
      },
    }),
  });

  const order = await res.json();
  if (!res.ok) throw new Error("PayPal create order failed: " + JSON.stringify(order));

  const approveUrl = order.links?.find((l: { rel: string; href: string }) => l.rel === "approve")?.href;
  if (!approveUrl) throw new Error("No PayPal approve URL returned.");

  return { orderId: order.id, approveUrl };
}

export async function capturePayPalOrder(orderId: string): Promise<{
  status: string;
  captureId: string;
  payerEmail: string | null;
}> {
  const cfg   = await getSettings();
  const token = await getAccessToken(cfg);

  const res = await fetch(`${cfg.baseUrl}/v2/checkout/orders/${orderId}/capture`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  const data = await res.json();
  if (!res.ok) throw new Error("PayPal capture failed: " + JSON.stringify(data));

  const capture = data.purchase_units?.[0]?.payments?.captures?.[0];
  return {
    status:     data.status,
    captureId:  capture?.id ?? "",
    payerEmail: data.payer?.email_address ?? null,
  };
}
