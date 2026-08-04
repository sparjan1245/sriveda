"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Loader2, LogIn, User, CheckCircle, ShieldCheck, XCircle, X, Heart, Users, Plus, Trash2, RefreshCw,
} from "lucide-react";
import { PaymentGateway } from "@/components/payment/PaymentGateway";

interface DonationOption {
  id: string;
  name: string;
  description: string | null;
  amount: number;
  recurring: boolean;
}

interface FamilyMember {
  name: string;
  birthStar: string;
}

interface Props {
  eventId: string;
  eventTitle: string;
  userId: string | null;
  userName: string | null;
  userEmail: string | null;
  donationOptions: DonationOption[];
}

const tokenKeyFor = (eventId: string) => `eventRsvpToken:${eventId}`;

export default function RegisterForm({ eventId, eventTitle, userId, userName, userEmail, donationOptions }: Props) {
  const router = useRouter();
  const [rsvped, setRsvped] = useState(false);
  const [fetched, setFetched] = useState(false);
  const [mode, setMode] = useState<"login" | "guest">("guest");

  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");

  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);

  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [donationAmount, setDonationAmount] = useState("");
  const [gateway, setGateway] = useState("stripe");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [paymentNote, setPaymentNote] = useState<string | null>(null);

  const [paymentWaiting, setPaymentWaiting] = useState(false);
  const [paymentResult, setPaymentResult] = useState<null | "success" | "cancelled">(null);
  const [paymentSuccessUrl, setPaymentSuccessUrl] = useState<string | null>(null);

  const gatewayLabel: Record<string, string> = { stripe: "Stripe", paypal: "PayPal", square: "Square" };

  useEffect(() => {
    const token = userId ? null : localStorage.getItem(tokenKeyFor(eventId));
    const qs = token ? `?token=${token}` : "";
    fetch(`/api/events/${eventId}/rsvp${qs}`)
      .then((r) => r.json())
      .then((d) => {
        setRsvped(d.rsvped);
        if (Array.isArray(d.familyMembers) && d.familyMembers.length > 0) {
          setFamilyMembers(d.familyMembers.map((m: { name?: string; birthStar?: string }) => ({
            name: m.name || "", birthStar: m.birthStar || "",
          })));
        }
        setFetched(true);
      });
  }, [eventId, userId]);

  const selectedOption = donationOptions.find((o) => o.id === selectedOptionId) || null;

  const addFamilyMember = () => setFamilyMembers((prev) => [...prev, { name: "", birthStar: "" }]);
  const updateFamilyMember = (i: number, field: keyof FamilyMember, value: string) =>
    setFamilyMembers((prev) => prev.map((m, idx) => (idx === i ? { ...m, [field]: value } : m)));
  const removeFamilyMember = (i: number) => setFamilyMembers((prev) => prev.filter((_, idx) => idx !== i));

  const handleSubmit = async () => {
    if (mode === "login" && !userId) {
      router.push(`/auth/login?redirect=/events/${eventId}/register`);
      return;
    }
    if (!userId && !rsvped && (!guestName.trim() || !guestEmail.trim())) {
      setError("Name and email are required.");
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      const cleanFamilyMembers = familyMembers
        .map((m) => ({ name: m.name.trim(), birthStar: m.birthStar.trim() || undefined }))
        .filter((m) => m.name.length > 0);

      const amount = parseFloat(donationAmount) || 0;
      const wantsDonation = amount >= 1;
      const isNewRegistration = !rsvped;

      // Register — for a brand-new sign-up, only when a donation isn't part of this submission.
      // Editing an already-confirmed registration always saves, independent of any donation outcome below.
      const registerNow = async (): Promise<{ ok: boolean; error?: string }> => {
        if (!isNewRegistration) {
          const token = userId ? null : localStorage.getItem(tokenKeyFor(eventId));
          await fetch(`/api/events/${eventId}/rsvp`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(userId ? { familyMembers: cleanFamilyMembers } : { familyMembers: cleanFamilyMembers, token }),
          }).catch(() => {});
          return { ok: true };
        }
        const res = await fetch(`/api/events/${eventId}/rsvp`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(
            userId
              ? { familyMembers: cleanFamilyMembers }
              : { guestName, guestEmail, guestPhone, familyMembers: cleanFamilyMembers }
          ),
        });
        const data = await res.json();
        if (!res.ok) return { ok: false, error: data.error || "Registration failed." };
        if (data.guestToken) localStorage.setItem(tokenKeyFor(eventId), data.guestToken);
        setRsvped(true);
        return { ok: true };
      };

      if (!wantsDonation) {
        const result = await registerNow();
        if (!result.ok) { setError(result.error!); return; }
        setSuccess(true);
        return;
      }

      // A donation is part of this submission — an existing registration's edits are saved now;
      // a brand-new registration is deferred until the payment actually succeeds below.
      if (!isNewRegistration) await registerNow();

      const name = userId ? (userName || "") : guestName;
      const email = userId ? (userEmail || "") : guestEmail;
      const phone = userId ? "" : guestPhone;
      const nameParts = name.trim().split(" ");

      const donateRes = await fetch("/api/donations/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount,
          cause: `Event: ${eventTitle}${selectedOption ? ` — ${selectedOption.name}` : ""}`,
          firstName: nameParts[0] || "",
          lastName: nameParts.slice(1).join(" "),
          email,
          phone,
          eventId,
          recurring: selectedOption?.recurring || false,
          gateway,
        }),
      });
      const donateData = await donateRes.json();
      if (!donateData.url) {
        if (isNewRegistration) {
          setError(donateData.error || "The donation payment could not be started, so registration was not completed. Please try again.");
        } else {
          setPaymentNote(donateData.error || "Your registration is confirmed, but the donation payment could not be started. You can donate separately anytime from the Donate page.");
          setSuccess(true);
        }
        return;
      }

      const popup = window.open(donateData.url, "event-donation-payment", "width=620,height=720,scrollbars=yes,resizable=yes");
      if (!popup) {
        // No way to observe completion in this tab once we navigate away, so a brand-new
        // registration can't be safely deferred here — send the user to the gateway directly.
        window.location.href = donateData.url;
        return;
      }
      setPaymentWaiting(true);
      setPaymentResult(null);
      setPaymentSuccessUrl(donateData.successUrl || donateData.squareSuccessUrl || null);
      const interval = setInterval(async () => {
        try {
          if (popup.closed) {
            clearInterval(interval);
            setPaymentWaiting(false);
            setPaymentResult(null);
            if (isNewRegistration) {
              setError("Registration was not completed because the donation payment wasn't finished. Please try again.");
            } else {
              setPaymentNote("Your registration is confirmed, but the donation payment was not completed. You can donate separately anytime from the Donate page.");
              setSuccess(true);
            }
            return;
          }
          const href = popup.location.href;
          if (href && href.includes("/donation-success")) {
            clearInterval(interval);
            popup.close();
            setPaymentResult("success");
            const result = await registerNow();
            if (!result.ok) {
              setPaymentWaiting(false);
              setError(`Your donation succeeded, but we couldn't complete your event registration: ${result.error} Please contact us so we can register you manually.`);
              return;
            }
            setTimeout(() => { window.location.href = href; }, 1800);
          }
        } catch { /* cross-origin — the payment provider's domain */ }
      }, 600);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!fetched) {
    return (
      <div className="flex items-center gap-2 text-foreground/40 text-sm py-6">
        <Loader2 className="w-4 h-4 animate-spin" /> Loading…
      </div>
    );
  }

  if (success) {
    return paymentNote ? (
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-green-600 bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-sm">
          <CheckCircle className="w-5 h-5 shrink-0" /> You&apos;re registered for {eventTitle}. See you there!
        </div>
        <div className="flex items-center gap-2 text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-sm">
          <XCircle className="w-5 h-5 shrink-0" /> {paymentNote}
        </div>
      </div>
    ) : (
      <div className="flex items-center gap-2 text-green-600 bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-sm">
        <CheckCircle className="w-5 h-5 shrink-0" /> You&apos;re registered for {eventTitle}. See you there!
      </div>
    );
  }

  const inputClass =
    "w-full px-3 py-2.5 border border-gold/30 rounded-lg text-sm focus:outline-none focus:border-saffron transition-colors";

  return (
    <>
      <div className="space-y-5">
        {rsvped && (
          <div className="flex items-center gap-2 text-green-600 bg-green-50 border border-green-200 rounded-lg px-3 py-2.5 text-sm">
            <CheckCircle className="w-4 h-4 shrink-0" /> You&apos;re already registered for this event.
          </div>
        )}

        {!userId && !rsvped && (
          <>
            {/* Login / Guest tabs */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-cream rounded-xl">
              <button
                type="button"
                onClick={() => setMode("login")}
                className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  mode === "login" ? "bg-white text-maroon shadow-sm" : "text-foreground/50"
                }`}
              >
                <LogIn className="w-3.5 h-3.5" /> Login
              </button>
              <button
                type="button"
                onClick={() => setMode("guest")}
                className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  mode === "guest" ? "bg-white text-maroon shadow-sm" : "text-foreground/50"
                }`}
              >
                <User className="w-3.5 h-3.5" /> Guest
              </button>
            </div>

            {mode === "login" ? (
              <p className="text-foreground/60 text-sm">
                Sign in to register with your devotee account, then come right back to finish here.
              </p>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-maroon/80 mb-1.5">Full Name *</label>
                  <input value={guestName} onChange={(e) => setGuestName(e.target.value)} className={inputClass} placeholder="Your full name" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-maroon/80 mb-1.5">Email *</label>
                  <input type="email" value={guestEmail} onChange={(e) => setGuestEmail(e.target.value)} className={inputClass} placeholder="your@email.com" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-maroon/80 mb-1.5">
                    Mobile Number <span className="text-foreground/40 font-normal">(optional)</span>
                  </label>
                  <input value={guestPhone} onChange={(e) => setGuestPhone(e.target.value)} className={inputClass} placeholder="+1 (555) 000-0000" />
                </div>
              </div>
            )}
          </>
        )}

        {(userId || rsvped || mode === "guest") && (
          <div className="pt-4 border-t border-gold/15">
            <div className="flex items-center justify-between mb-1">
              <p className="font-cinzel font-semibold text-maroon text-sm flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-saffron/15 text-saffron text-[11px] font-bold flex items-center justify-center shrink-0">2</span>
                <Users className="w-3.5 h-3.5 text-saffron" /> Family Members
              </p>
              <button
                type="button"
                onClick={addFamilyMember}
                className="flex items-center gap-1 text-xs font-medium text-saffron hover:text-maroon border border-saffron/30 hover:border-maroon/30 rounded-full px-3 py-1.5 transition-colors"
              >
                <Plus className="w-3 h-3" /> Add Member
              </button>
            </div>
            <p className="text-foreground/50 text-xs mb-3">Add family members to the registration (optional).</p>
            {familyMembers.length > 0 && (
              <div className="space-y-2">
                {familyMembers.map((m, i) => (
                  <div key={i} className="flex items-center gap-2 bg-cream rounded-xl p-3">
                    <input
                      value={m.name}
                      onChange={(e) => updateFamilyMember(i, "name", e.target.value)}
                      className={`${inputClass} bg-white flex-1`}
                      placeholder="Family member name"
                    />
                    <input
                      value={m.birthStar}
                      onChange={(e) => updateFamilyMember(i, "birthStar", e.target.value)}
                      className={`${inputClass} bg-white flex-1`}
                      placeholder="Birth star (optional)"
                    />
                    <button
                      type="button"
                      onClick={() => removeFamilyMember(i)}
                      className="p-2 text-foreground/40 hover:text-red-600 transition-colors shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {(userId || rsvped || mode === "guest") && (
          <div className="pt-4 border-t border-gold/15">
            <p className="font-cinzel font-semibold text-maroon text-sm mb-1 flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5 text-saffron" /> Make an Impact
            </p>
            <p className="text-foreground/50 text-xs mb-3">Your generous donation directly supports this event and our temple community.</p>

            {donationOptions.length > 0 && (
              <div className="grid sm:grid-cols-2 gap-3 mb-3">
                {donationOptions.map((o) => (
                  <button
                    key={o.id}
                    type="button"
                    onClick={() => { setSelectedOptionId(o.id); setDonationAmount(String(o.amount)); }}
                    className={`text-left p-4 rounded-xl border-2 transition-all duration-200 relative ${
                      selectedOptionId === o.id
                        ? "border-saffron bg-white shadow-md ring-1 ring-saffron/20"
                        : "border-gold/20 bg-white hover:border-gold/50"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3 gap-2">
                      <span className="font-cinzel font-semibold text-maroon text-sm leading-tight">{o.name}</span>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${selectedOptionId === o.id ? "bg-saffron" : "bg-saffron/10"}`}>
                        <Heart className={`w-3.5 h-3.5 ${selectedOptionId === o.id ? "text-white fill-white" : "text-saffron"}`} />
                      </div>
                    </div>
                    <p className="text-foreground/50 text-xs mb-2">{o.description || "Support our community"}</p>
                    <div className="font-bold text-saffron text-xl">
                      ${o.amount}
                      {o.recurring && <span className="text-sm font-normal">/mo</span>}
                    </div>
                    {o.recurring && (
                      <span className="inline-flex items-center gap-1 mt-1.5 bg-blue-50 text-blue-600 text-[10px] px-2 py-0.5 rounded-full">
                        <RefreshCw className="w-2.5 h-2.5" /> Monthly
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}

            <label className="block text-xs font-medium text-maroon/80 mb-1.5">
              {donationOptions.length > 0 ? "Other Amount" : "Donation Amount"}
            </label>
            <div className="relative mb-3">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/50 font-medium">$</span>
              <input
                type="number"
                min="1"
                value={donationAmount}
                onChange={(e) => { setDonationAmount(e.target.value); setSelectedOptionId(null); }}
                className="w-full pl-7 pr-3 py-2.5 border border-gold/30 rounded-lg text-sm focus:outline-none focus:border-saffron transition-colors"
                placeholder="Enter your donation amount (optional)"
              />
            </div>
            {parseFloat(donationAmount) >= 1 && <PaymentGateway onGatewayChange={setGateway} />}
          </div>
        )}

        {error && (
          <p className="text-red-500 text-xs bg-red-50 border border-red-200 p-3 rounded-lg">{error}</p>
        )}

        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="btn-primary w-full py-3 flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {submitting ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Processing…</>
          ) : mode === "login" && !userId ? (
            <><LogIn className="w-4 h-4" /> Sign In to Continue</>
          ) : rsvped ? (
            parseFloat(donationAmount) >= 1 ? "Save & Continue to Payment" : "Save Details"
          ) : (
            "Complete Registration"
          )}
        </button>
      </div>

      {/* Payment window overlay — same UX for Stripe, PayPal, and Square */}
      {paymentWaiting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center">
            {paymentResult === "success" ? (
              <>
                <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
                  <CheckCircle className="w-7 h-7 text-green-600" />
                </div>
                <p className="font-cinzel font-bold text-maroon text-lg mb-2">Thank You!</p>
                <p className="text-foreground/60 text-sm mb-6 leading-relaxed">Your contribution was received. Redirecting you now…</p>
                <div className="flex items-center justify-center gap-2 text-green-600">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm font-medium">Redirecting…</span>
                </div>
              </>
            ) : paymentResult === "cancelled" ? (
              <>
                <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-5">
                  <XCircle className="w-7 h-7 text-red-500" />
                </div>
                <p className="font-cinzel font-bold text-maroon text-lg mb-2">Payment Cancelled</p>
                <p className="text-foreground/60 text-sm leading-relaxed">You closed the payment window. Your registration is still confirmed.</p>
              </>
            ) : (
              <>
                <div className="w-14 h-14 bg-saffron/10 rounded-full flex items-center justify-center mx-auto mb-5">
                  <ShieldCheck className="w-7 h-7 text-saffron" />
                </div>
                <p className="font-cinzel font-semibold text-maroon text-lg mb-2">Complete Payment</p>
                <p className="text-foreground/60 text-sm mb-6 leading-relaxed">
                  Finish your contribution in the {gatewayLabel[gateway] || "payment"} window. This page will update automatically once payment is confirmed.
                </p>
                <div className="flex items-center justify-center gap-2 text-saffron mb-4">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm font-medium">Waiting for payment…</span>
                </div>
                {paymentSuccessUrl && (
                  <button
                    onClick={() => { window.location.href = paymentSuccessUrl; }}
                    className="w-full mb-3 py-2 px-4 rounded-lg bg-saffron/10 hover:bg-saffron/20 text-saffron text-sm font-medium transition-colors"
                  >
                    I completed my payment ↗
                  </button>
                )}
                <button
                  onClick={() => setPaymentWaiting(false)}
                  className="flex items-center gap-2 mx-auto text-xs text-foreground/40 hover:text-maroon transition-colors"
                >
                  <X className="w-3.5 h-3.5" /> Cancel
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
