import { db } from "@/lib/db";
import { decrypt } from "@/lib/encryption";

async function getSettings() {
  const s = await db.siteSettings.findUnique({ where: { id: "main" } });
  if (!s?.squareEnabled || !s.squareAccessToken || !s.squareLocationId) {
    throw new Error("Square is not configured.");
  }
  const accessToken = decrypt(s.squareAccessToken);
  const locationId  = decrypt(s.squareLocationId);
  const appId       = s.squareAppId ? decrypt(s.squareAppId) : "";
  const baseUrl     = s.squareMode === "production"
    ? "https://connect.squareup.com"
    : "https://connect.squareupsandbox.com";
  return { accessToken, locationId, appId, baseUrl };
}

export async function createSquareCheckout(opts: {
  amount: number;
  description: string;
  referenceId: string;
  redirectUrl: string;
}): Promise<{ checkoutUrl: string; orderId: string }> {
  const cfg = await getSettings();

  const res = await fetch(`${cfg.baseUrl}/v2/online-checkout/payment-links`, {
    method: "POST",
    headers: {
      "Square-Version": "2024-01-18",
      Authorization: `Bearer ${cfg.accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      idempotency_key: `${opts.referenceId}-${Date.now()}`,
      quick_pay: {
        name: opts.description.slice(0, 255),
        price_money: {
          amount: Math.round(opts.amount * 100),
          currency: "USD",
        },
        location_id: cfg.locationId,
      },
      checkout_options: {
        redirect_url: opts.redirectUrl,
        ask_for_shipping_address: false,
      },
    }),
  });

  const data = await res.json();
  if (!res.ok || data.errors) {
    throw new Error("Square checkout failed: " + JSON.stringify(data.errors ?? data));
  }

  return {
    checkoutUrl: data.payment_link?.url ?? "",
    orderId:     data.payment_link?.order_id ?? data.payment_link?.id ?? "",
  };
}

export async function getSquarePublicConfig(): Promise<{
  appId: string;
  locationId: string;
  mode: string;
}> {
  const cfg = await getSettings();
  return { appId: cfg.appId, locationId: cfg.locationId, mode: "" };
}
