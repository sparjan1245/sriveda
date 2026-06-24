"use client";

import { useState } from "react";
import { Save, Loader2, CheckCircle, Eye, EyeOff } from "lucide-react";

type StripeSettings = {
  enabled: boolean;
  pubKey: string;
  secretKey: string;
  webhookSecret: string;
};
type PayPalSettings = {
  enabled: boolean;
  clientId: string;
  secret: string;
  mode: "sandbox" | "live";
};
type SquareSettings = {
  enabled: boolean;
  accessToken: string;
  appId: string;
  locationId: string;
  mode: "sandbox" | "production";
};
type GmailSettings = {
  enabled: boolean;
  user: string;
  appPassword: string;
  adminEmails: string;
};

interface InitialSettings {
  stripe: StripeSettings;
  paypal: PayPalSettings;
  square: SquareSettings;
  gmail: GmailSettings;
}

const TABS = ["stripe", "paypal", "square", "gmail"] as const;
type Tab = (typeof TABS)[number];

function ToggleSwitch({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <label className="flex items-center gap-3 cursor-pointer select-none mb-6">
      <div
        onClick={() => onChange(!checked)}
        className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${
          checked ? "bg-saffron" : "bg-gray-300"
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
            checked ? "translate-x-6" : "translate-x-0"
          }`}
        />
      </div>
      <span className="font-medium text-maroon">{label}</span>
    </label>
  );
}

function SecretInput({
  label,
  value,
  onChange,
  placeholder,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  hint?: string;
}) {
  const [show, setShow] = useState(false);
  const masked = value.startsWith("••");
  return (
    <div>
      <label className="block text-xs font-medium text-maroon/80 mb-1.5">{label}</label>
      <div className="relative">
        <input
          type={show && !masked ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete="new-password"
          className="w-full px-3 py-2.5 pr-10 border border-gold/30 rounded-lg text-sm focus:outline-none focus:border-saffron transition-colors font-mono"
        />
        {!masked && (
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-foreground"
          >
            {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
      </div>
      {hint && <p className="text-xs text-foreground/40 mt-1">{hint}</p>}
    </div>
  );
}

function TextField({
  label,
  value,
  onChange,
  placeholder,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  hint?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-maroon/80 mb-1.5">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete="off"
        className="w-full px-3 py-2.5 border border-gold/30 rounded-lg text-sm focus:outline-none focus:border-saffron transition-colors font-mono"
      />
      {hint && <p className="text-xs text-foreground/40 mt-1">{hint}</p>}
    </div>
  );
}

export default function SettingsClient({ initial }: { initial: InitialSettings }) {
  const [tab, setTab] = useState<Tab>("stripe");
  const [stripe, setStripe]   = useState<StripeSettings>(initial.stripe);
  const [paypal, setPaypal]   = useState<PayPalSettings>(initial.paypal);
  const [square, setSquare]   = useState<SquareSettings>(initial.square);
  const [gmail, setGmail]     = useState<GmailSettings>(initial.gmail);
  const [saving, setSaving]   = useState(false);
  const [saved, setSaved]     = useState(false);
  const [error, setError]     = useState("");

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSaved(false);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stripe, paypal, square, gmail }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Save failed");
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const tabLabels: Record<Tab, string> = {
    stripe: "Stripe",
    paypal: "PayPal",
    square: "Square",
    gmail:  "Gmail",
  };

  return (
    <div className="bg-white rounded-2xl gold-border shadow-sm overflow-hidden">
      {/* Tab bar */}
      <div className="flex border-b border-gold/20">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-6 py-4 font-cinzel text-sm font-semibold transition-colors border-b-2 -mb-px ${
              tab === t
                ? "border-saffron text-maroon"
                : "border-transparent text-foreground/50 hover:text-maroon"
            }`}
          >
            {tabLabels[t]}
          </button>
        ))}
      </div>

      <div className="p-6 space-y-5">
        {/* Stripe Tab */}
        {tab === "stripe" && (
          <>
            <ToggleSwitch
              checked={stripe.enabled}
              onChange={(v) => setStripe((s) => ({ ...s, enabled: v }))}
              label="Enable Stripe"
            />
            <TextField
              label="Publishable Key"
              value={stripe.pubKey}
              onChange={(v) => setStripe((s) => ({ ...s, pubKey: v }))}
              placeholder="pk_live_..."
              hint="Starts with pk_live_ or pk_test_"
            />
            <SecretInput
              label="Secret Key"
              value={stripe.secretKey}
              onChange={(v) => setStripe((s) => ({ ...s, secretKey: v }))}
              placeholder="sk_live_..."
              hint="Leave unchanged if already saved (shown masked)"
            />
            <SecretInput
              label="Webhook Secret"
              value={stripe.webhookSecret}
              onChange={(v) => setStripe((s) => ({ ...s, webhookSecret: v }))}
              placeholder="whsec_..."
              hint="From your Stripe webhook endpoint"
            />
          </>
        )}

        {/* PayPal Tab */}
        {tab === "paypal" && (
          <>
            <ToggleSwitch
              checked={paypal.enabled}
              onChange={(v) => setPaypal((s) => ({ ...s, enabled: v }))}
              label="Enable PayPal"
            />
            <TextField
              label="Client ID"
              value={paypal.clientId}
              onChange={(v) => setPaypal((s) => ({ ...s, clientId: v }))}
              placeholder="AV..."
            />
            <SecretInput
              label="Secret"
              value={paypal.secret}
              onChange={(v) => setPaypal((s) => ({ ...s, secret: v }))}
              placeholder="EK..."
              hint="Leave unchanged if already saved (shown masked)"
            />
            <div>
              <label className="block text-xs font-medium text-maroon/80 mb-1.5">Mode</label>
              <select
                value={paypal.mode}
                onChange={(e) => setPaypal((s) => ({ ...s, mode: e.target.value as "sandbox" | "live" }))}
                className="w-full px-3 py-2.5 border border-gold/30 rounded-lg text-sm focus:outline-none focus:border-saffron"
              >
                <option value="sandbox">Sandbox (Testing)</option>
                <option value="live">Live (Production)</option>
              </select>
            </div>
          </>
        )}

        {/* Square Tab */}
        {tab === "square" && (
          <>
            <ToggleSwitch
              checked={square.enabled}
              onChange={(v) => setSquare((s) => ({ ...s, enabled: v }))}
              label="Enable Square"
            />
            <SecretInput
              label="Access Token"
              value={square.accessToken}
              onChange={(v) => setSquare((s) => ({ ...s, accessToken: v }))}
              placeholder="EAAAl..."
              hint="From Square Developer → Applications → Access token"
            />
            <TextField
              label="Application ID"
              value={square.appId}
              onChange={(v) => setSquare((s) => ({ ...s, appId: v }))}
              placeholder="sq0idp-..."
            />
            <TextField
              label="Location ID"
              value={square.locationId}
              onChange={(v) => setSquare((s) => ({ ...s, locationId: v }))}
              placeholder="L..."
              hint="From Square Dashboard → Locations"
            />
            <div>
              <label className="block text-xs font-medium text-maroon/80 mb-1.5">Mode</label>
              <select
                value={square.mode}
                onChange={(e) => setSquare((s) => ({ ...s, mode: e.target.value as "sandbox" | "production" }))}
                className="w-full px-3 py-2.5 border border-gold/30 rounded-lg text-sm focus:outline-none focus:border-saffron"
              >
                <option value="sandbox">Sandbox (Testing)</option>
                <option value="production">Production (Live)</option>
              </select>
            </div>
          </>
        )}

        {/* Gmail Tab */}
        {tab === "gmail" && (
          <>
            <ToggleSwitch
              checked={gmail.enabled}
              onChange={(v) => setGmail((s) => ({ ...s, enabled: v }))}
              label="Enable Gmail (Nodemailer)"
            />
            <TextField
              label="Gmail Sender Address"
              value={gmail.user}
              onChange={(v) => setGmail((s) => ({ ...s, user: v }))}
              placeholder="noreply@yourtemple.org"
              hint="The Gmail account used as the email sender"
            />
            <SecretInput
              label="App Password"
              value={gmail.appPassword}
              onChange={(v) => setGmail((s) => ({ ...s, appPassword: v }))}
              placeholder="xxxx xxxx xxxx xxxx"
              hint="Generate at myaccount.google.com → Security → App Passwords"
            />
            <TextField
              label="Admin Notification Emails"
              value={gmail.adminEmails}
              onChange={(v) => setGmail((s) => ({ ...s, adminEmails: v }))}
              placeholder="admin@temple.org, priest@temple.org"
              hint="Comma-separated. Booking & donation notifications are sent to these addresses."
            />
          </>
        )}

        {error && (
          <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-4 py-3">
            {error}
          </p>
        )}

        <div className="pt-2 flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary flex items-center gap-2 px-6"
          >
            {saving ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
            ) : (
              <><Save className="w-4 h-4" /> Save Settings</>
            )}
          </button>
          {saved && (
            <span className="flex items-center gap-1.5 text-green-600 text-sm font-medium">
              <CheckCircle className="w-4 h-4" /> Saved successfully
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
