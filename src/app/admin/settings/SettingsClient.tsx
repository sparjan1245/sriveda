"use client";

import { useState } from "react";
import { Save, Loader2, CheckCircle, Eye, EyeOff, Plus, Trash2 } from "lucide-react";

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
type GmailConfig = {
  enabled: boolean;
  user: string;
  appPassword: string;
};
type HostingerConfig = {
  enabled: boolean;
  host: string;
  port: number;
  secure: boolean;
  user: string;
  password: string;
};
type EmailSettings = {
  provider: "gmail" | "hostinger";
  gmail: GmailConfig;
  hostinger: HostingerConfig;
  adminEmails: string;
};
type ContactSettings = {
  address: string;
  mailingAddress: string;
  phones: string[];
  emails: string[];
  hours: string;
};
type SocialSettings = {
  facebook: string;
  instagram: string;
  youtube: string;
  twitter: string;
  whatsapp: string;
};

interface InitialSettings {
  stripe: StripeSettings;
  paypal: PayPalSettings;
  square: SquareSettings;
  email: EmailSettings;
  contact: ContactSettings;
  social: SocialSettings;
}

const TABS = ["stripe", "paypal", "square", "email", "contact"] as const;
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
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  hint?: string;
  type?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-maroon/80 mb-1.5">{label}</label>
      <input
        type={type}
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

function ListField({
  label,
  values,
  onChange,
  placeholder,
  hint,
  addLabel,
  inputType = "text",
}: {
  label: string;
  values: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
  hint?: string;
  addLabel: string;
  inputType?: string;
}) {
  const rows = values.length ? values : [""];

  const setAt = (i: number, v: string) => {
    const next = [...rows];
    next[i] = v;
    onChange(next);
  };
  const removeAt = (i: number) => {
    const next = rows.filter((_, idx) => idx !== i);
    onChange(next.length ? next : [""]);
  };

  return (
    <div>
      <label className="block text-xs font-medium text-maroon/80 mb-1.5">{label}</label>
      <div className="space-y-2">
        {rows.map((v, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              type={inputType}
              value={v}
              onChange={(e) => setAt(i, e.target.value)}
              placeholder={placeholder}
              className="flex-1 px-3 py-2.5 border border-gold/30 rounded-lg text-sm focus:outline-none focus:border-saffron transition-colors"
            />
            <button
              type="button"
              onClick={() => removeAt(i)}
              disabled={rows.length === 1 && !v}
              className="p-2 rounded-lg text-foreground/40 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-30"
              aria-label="Remove"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => onChange([...rows, ""])}
        className="mt-2 inline-flex items-center gap-1.5 text-xs text-saffron hover:text-maroon font-medium transition-colors"
      >
        <Plus className="w-3.5 h-3.5" /> {addLabel}
      </button>
      {hint && <p className="text-xs text-foreground/40 mt-1">{hint}</p>}
    </div>
  );
}

export default function SettingsClient({ initial }: { initial: InitialSettings }) {
  const [tab, setTab] = useState<Tab>("stripe");
  const [stripe, setStripe]   = useState<StripeSettings>(initial.stripe);
  const [paypal, setPaypal]   = useState<PayPalSettings>(initial.paypal);
  const [square, setSquare]   = useState<SquareSettings>(initial.square);
  const [email, setEmail]     = useState<EmailSettings>(initial.email);
  const [contact, setContact] = useState<ContactSettings>(initial.contact);
  const [social, setSocial]   = useState<SocialSettings>(initial.social);
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
        body: JSON.stringify({ stripe, paypal, square, email, contact, social }),
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
    email:  "Email",
    contact: "Contact & Social",
  };

  return (
    <div className="bg-white rounded-2xl gold-border shadow-sm overflow-hidden">
      {/* Tab bar */}
      <div className="flex border-b border-gold/20 overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-6 py-4 font-cinzel text-sm font-semibold transition-colors border-b-2 -mb-px whitespace-nowrap ${
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

        {/* Email Tab */}
        {tab === "email" && (
          <>
            <div>
              <label className="block text-xs font-medium text-maroon/80 mb-1.5">Active Provider</label>
              <select
                value={email.provider}
                onChange={(e) => setEmail((s) => ({ ...s, provider: e.target.value as "gmail" | "hostinger" }))}
                className="w-full px-3 py-2.5 border border-gold/30 rounded-lg text-sm focus:outline-none focus:border-saffron"
              >
                <option value="gmail">Gmail</option>
                <option value="hostinger">Hostinger</option>
              </select>
              <p className="text-xs text-foreground/40 mt-1">
                All transactional emails (booking &amp; donation receipts, contact replies, password resets) are sent through whichever provider is selected here.
              </p>
            </div>

            <div className="h-px bg-gold/15" />

            {email.provider === "gmail" ? (
              <>
                <ToggleSwitch
                  checked={email.gmail.enabled}
                  onChange={(v) => setEmail((s) => ({ ...s, gmail: { ...s.gmail, enabled: v } }))}
                  label="Enable Gmail (Nodemailer)"
                />
                <TextField
                  label="Gmail Sender Address"
                  value={email.gmail.user}
                  onChange={(v) => setEmail((s) => ({ ...s, gmail: { ...s.gmail, user: v } }))}
                  placeholder="noreply@yourtemple.org"
                  hint="The Gmail account used as the email sender"
                />
                <SecretInput
                  label="App Password"
                  value={email.gmail.appPassword}
                  onChange={(v) => setEmail((s) => ({ ...s, gmail: { ...s.gmail, appPassword: v } }))}
                  placeholder="xxxx xxxx xxxx xxxx"
                  hint="Generate at myaccount.google.com → Security → App Passwords"
                />
              </>
            ) : (
              <>
                <ToggleSwitch
                  checked={email.hostinger.enabled}
                  onChange={(v) => setEmail((s) => ({ ...s, hostinger: { ...s.hostinger, enabled: v } }))}
                  label="Enable Hostinger Email"
                />
                <TextField
                  label="Hostinger Email Address"
                  value={email.hostinger.user}
                  onChange={(v) => setEmail((s) => ({ ...s, hostinger: { ...s.hostinger, user: v } }))}
                  placeholder="noreply@yourtemple.org"
                  hint="A mailbox created in Hostinger → Emails"
                />
                <SecretInput
                  label="Email Password"
                  value={email.hostinger.password}
                  onChange={(v) => setEmail((s) => ({ ...s, hostinger: { ...s.hostinger, password: v } }))}
                  placeholder="••••••••"
                  hint="The mailbox password set in Hostinger's email panel"
                />
                <div className="grid grid-cols-2 gap-4">
                  <TextField
                    label="SMTP Host"
                    value={email.hostinger.host}
                    onChange={(v) => setEmail((s) => ({ ...s, hostinger: { ...s.hostinger, host: v } }))}
                    placeholder="smtp.hostinger.com"
                  />
                  <TextField
                    label="SMTP Port"
                    type="number"
                    value={String(email.hostinger.port)}
                    onChange={(v) => setEmail((s) => ({ ...s, hostinger: { ...s.hostinger, port: parseInt(v) || 465 } }))}
                    placeholder="465"
                  />
                </div>
                <ToggleSwitch
                  checked={email.hostinger.secure}
                  onChange={(v) => setEmail((s) => ({ ...s, hostinger: { ...s.hostinger, secure: v } }))}
                  label="Use SSL (port 465). Turn off for STARTTLS on port 587"
                />
              </>
            )}

            <div className="h-px bg-gold/15" />

            <TextField
              label="Admin Notification Emails"
              value={email.adminEmails}
              onChange={(v) => setEmail((s) => ({ ...s, adminEmails: v }))}
              placeholder="admin@temple.org, priest@temple.org"
              hint="Comma-separated. Booking & donation notifications are sent to these addresses."
            />
          </>
        )}

        {/* Contact & Social Tab */}
        {tab === "contact" && (
          <>
            <TextField
              label="Temple Address"
              value={contact.address}
              onChange={(v) => setContact((s) => ({ ...s, address: v }))}
              placeholder="702 W Yosemite Ave, Manteca, CA 95337"
            />
            <TextField
              label="Mailing Address"
              value={contact.mailingAddress}
              onChange={(v) => setContact((s) => ({ ...s, mailingAddress: v }))}
              placeholder="16045 Mavericks Lane, Lathrop, CA 95330"
            />
            <TextField
              label="Temple Hours"
              value={contact.hours}
              onChange={(v) => setContact((s) => ({ ...s, hours: v }))}
              placeholder="Monday – Sunday: 5:00 PM – 9:00 PM"
            />
            <ListField
              label="Phone Numbers"
              values={contact.phones}
              onChange={(v) => setContact((s) => ({ ...s, phones: v }))}
              placeholder="+1 (669) 213-8780"
              addLabel="Add phone number"
              inputType="tel"
            />
            <ListField
              label="Email Addresses"
              values={contact.emails}
              onChange={(v) => setContact((s) => ({ ...s, emails: v }))}
              placeholder="vgcc@srivedagayatritemple.org"
              addLabel="Add email address"
              inputType="email"
            />

            <div className="h-px bg-gold/15" />
            <h3 className="font-cinzel font-semibold text-maroon text-sm">Social Media Links</h3>
            <p className="text-xs text-foreground/40 -mt-3">Leave a field blank to hide that icon on the site.</p>

            <TextField
              label="Facebook URL"
              value={social.facebook}
              onChange={(v) => setSocial((s) => ({ ...s, facebook: v }))}
              placeholder="https://facebook.com/yourtemple"
            />
            <TextField
              label="Instagram URL"
              value={social.instagram}
              onChange={(v) => setSocial((s) => ({ ...s, instagram: v }))}
              placeholder="https://instagram.com/yourtemple"
            />
            <TextField
              label="YouTube URL"
              value={social.youtube}
              onChange={(v) => setSocial((s) => ({ ...s, youtube: v }))}
              placeholder="https://www.youtube.com/@yourtemple"
            />
            <TextField
              label="Twitter / X URL"
              value={social.twitter}
              onChange={(v) => setSocial((s) => ({ ...s, twitter: v }))}
              placeholder="https://x.com/yourtemple"
            />
            <TextField
              label="WhatsApp Number"
              value={social.whatsapp}
              onChange={(v) => setSocial((s) => ({ ...s, whatsapp: v }))}
              placeholder="+16692138780"
              hint="Used for the WhatsApp quick-contact button"
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
