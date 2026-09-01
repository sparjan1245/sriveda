"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ShieldCheck } from "lucide-react";
import SortableHeader from "@/components/admin/SortableHeader";

interface StaffUser { id: string; name: string | null; email: string; role: string; phone: string | null; createdAt: string; }

const ROLES = ["ADMIN", "STAFF", "PRIEST", "DEVOTEE"];
const ROLE_COLORS: Record<string, string> = {
  ADMIN: "bg-maroon/10 text-maroon",
  STAFF: "bg-blue-100 text-blue-700",
  PRIEST: "bg-purple-100 text-purple-700",
  DEVOTEE: "bg-green-100 text-green-700",
};

function RoleSelect({ user, currentUserId }: { user: StaffUser; currentUserId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleChange = async (newRole: string) => {
    if (user.id === currentUserId && newRole !== "ADMIN") {
      alert("You cannot demote yourself.");
      return;
    }
    if (!confirm(`Change ${user.name || user.email}'s role to ${newRole}?`)) return;
    setLoading(true);
    await fetch("/api/admin/staff", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId: user.id, role: newRole }) });
    router.refresh();
    setLoading(false);
  };

  return (
    <div className="flex items-center gap-2">
      {loading && <Loader2 className="w-3.5 h-3.5 animate-spin text-saffron" />}
      <select value={user.role} onChange={(e) => handleChange(e.target.value)} disabled={loading} className="text-xs px-2 py-1 border border-gold/30 rounded-lg bg-white focus:outline-none focus:border-saffron disabled:opacity-50">
        {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
      </select>
    </div>
  );
}

export default function StaffClient({ staff, currentUserId, total, hasFilters }: { staff: StaffUser[]; currentUserId: string; total: number; hasFilters: boolean }) {
  return (
    <div className="bg-white rounded-2xl gold-border shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-cream border-b border-gold/20">
            <tr>
              <SortableHeader field="name" label="Staff Member" />
              <SortableHeader field="email" label="Email" />
              <th className="text-left px-4 py-3 text-xs font-semibold text-maroon/60 uppercase tracking-wider">Phone</th>
              <SortableHeader field="role" label="Current Role" />
              <th className="text-left px-4 py-3 text-xs font-semibold text-maroon/60 uppercase tracking-wider">Change Role</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gold/10">
            {staff.map((u) => (
              <tr key={u.id} className="hover:bg-cream/50 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-maroon/10 flex items-center justify-center text-maroon font-cinzel font-bold text-xs shrink-0">
                      {(u.name || u.email)[0].toUpperCase()}
                    </div>
                    <span className="font-medium text-maroon">{u.name || "—"}</span>
                    {u.id === currentUserId && <ShieldCheck className="w-3.5 h-3.5 text-saffron" aria-label="You" />}
                  </div>
                </td>
                <td className="px-4 py-3 text-foreground/60 text-xs">{u.email}</td>
                <td className="px-4 py-3 text-foreground/60 text-xs">{u.phone || "—"}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ROLE_COLORS[u.role] || "bg-gray-100 text-gray-600"}`}>{u.role}</span>
                </td>
                <td className="px-4 py-3">
                  <RoleSelect user={u} currentUserId={currentUserId} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {total === 0 && (
        <p className="text-center text-foreground/40 py-10">
          {hasFilters ? "No staff members match your filters." : "No staff members found."}
        </p>
      )}
    </div>
  );
}
