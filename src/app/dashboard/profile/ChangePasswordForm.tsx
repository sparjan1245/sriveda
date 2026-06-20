"use client";

import { useState } from "react";
import { Loader2, CheckCircle, Eye, EyeOff } from "lucide-react";

export default function ChangePasswordForm() {
  const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirm: "" });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.newPassword !== form.confirm) { setError("Passwords do not match."); return; }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/user/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: form.currentPassword, newPassword: form.newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(true);
        setForm({ currentPassword: "", newPassword: "", confirm: "" });
        setTimeout(() => setSuccess(false), 4000);
      } else {
        setError(data.error || "Failed to update password.");
      }
    } catch {
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const ic = "w-full px-4 py-3 border border-gold/30 rounded-lg text-sm focus:outline-none focus:border-saffron transition-colors";
  const lc = "block text-sm font-medium text-maroon/80 mb-1.5";

  return (
    <div className="mt-8 pt-8 border-t border-gold/20">
      <p className="text-xs text-foreground/50 mb-5 font-medium uppercase tracking-wider">Change Password</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className={lc}>Current Password</label>
          <div className="relative">
            <input type={showCurrent ? "text" : "password"} value={form.currentPassword} onChange={(e) => setForm((p) => ({ ...p, currentPassword: e.target.value }))} required className={ic} placeholder="Current password" />
            <button type="button" onClick={() => setShowCurrent((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-maroon">
              {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className={lc}>New Password</label>
            <div className="relative">
              <input type={showNew ? "text" : "password"} value={form.newPassword} onChange={(e) => setForm((p) => ({ ...p, newPassword: e.target.value }))} required minLength={8} className={ic} placeholder="Min. 8 characters" />
              <button type="button" onClick={() => setShowNew((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-maroon">
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className={lc}>Confirm New Password</label>
            <input type="password" value={form.confirm} onChange={(e) => setForm((p) => ({ ...p, confirm: e.target.value }))} required className={ic} placeholder="Re-enter new password" />
          </div>
        </div>
        {error && <p className="text-red-500 text-sm bg-red-50 p-3 rounded-lg">{error}</p>}
        <button type="submit" disabled={loading} className="btn-primary px-8 py-2.5 flex items-center gap-2">
          {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Updating...</> : success ? <><CheckCircle className="w-4 h-4" /> Updated!</> : "Update Password"}
        </button>
      </form>
    </div>
  );
}
