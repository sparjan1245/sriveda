import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ArrowLeft, Users, HandCoins, Receipt } from "lucide-react";

export const dynamic = "force-dynamic";

interface FamilyMember {
  name: string;
  birthStar?: string;
}

export default async function EventRegistrationsPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if ((session?.user as { role?: string })?.role !== "ADMIN") redirect("/dashboard");

  const { id } = await params;
  const event = await db.event.findUnique({ where: { id } }).catch(() => null);
  if (!event) notFound();

  const [rsvps, donations] = await Promise.all([
    db.eventRsvp.findMany({
      where: { eventId: id },
      include: { user: { select: { id: true, name: true, email: true, phone: true } } },
      orderBy: { createdAt: "asc" },
    }).catch(() => []),
    db.donation.findMany({
      where: { eventId: id },
      include: { user: { select: { id: true, email: true } } },
    }).catch(() => []),
  ]);

  // Match each registration to any donation(s) it made — by userId for devotees, guestEmail for guests
  const donationsByUserId = new Map<string, typeof donations>();
  const donationsByEmail = new Map<string, typeof donations>();
  for (const d of donations) {
    if (d.userId) {
      donationsByUserId.set(d.userId, [...(donationsByUserId.get(d.userId) || []), d]);
    }
    const email = d.user?.email || d.guestEmail;
    if (email) {
      donationsByEmail.set(email, [...(donationsByEmail.get(email) || []), d]);
    }
  }

  const rows = rsvps.map((r) => {
    const email = r.user?.email || r.guestEmail || null;
    const matched = r.userId
      ? donationsByUserId.get(r.userId) || []
      : email
        ? donationsByEmail.get(email) || []
        : [];
    const familyMembers = (Array.isArray(r.familyMembers) ? r.familyMembers : []) as unknown as FamilyMember[];
    return {
      id: r.id,
      name: r.user?.name || r.guestName || "—",
      email,
      phone: r.user?.phone || r.guestPhone || null,
      isGuest: !r.userId,
      familyMembers,
      createdAt: r.createdAt,
      donations: matched,
      totalDonated: matched.filter((d) => d.status === "COMPLETED").reduce((sum, d) => sum + d.amount, 0),
    };
  });

  const totalFamilyMembers = rows.reduce((sum, r) => sum + r.familyMembers.length, 0);
  const totalDonated = rows.reduce((sum, r) => sum + r.totalDonated, 0);

  return (
    <div className="min-h-screen bg-cream pattern-bg">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <Link href="/admin/events" className="inline-flex items-center gap-2 text-maroon/60 hover:text-maroon text-sm mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Events
        </Link>

        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <p className="text-maroon font-cinzel text-base font-extrabold uppercase tracking-widest mb-1">Admin</p>
            <h1 className="font-cinzel font-bold text-3xl text-maroon">Registrations</h1>
            <p className="text-foreground/60 text-sm mt-1">{event.title}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-white rounded-xl px-4 py-2 gold-border text-center">
              <div className="font-cinzel font-bold text-xl text-maroon">{rows.length}</div>
              <div className="text-xs text-foreground/50">Registered</div>
            </div>
            <div className="bg-white rounded-xl px-4 py-2 gold-border text-center">
              <div className="font-cinzel font-bold text-xl text-maroon">{totalFamilyMembers}</div>
              <div className="text-xs text-foreground/50">Family Members</div>
            </div>
            <div className="bg-white rounded-xl px-4 py-2 gold-border text-center">
              <div className="font-cinzel font-bold text-xl text-green-600">{formatCurrency(totalDonated)}</div>
              <div className="text-xs text-foreground/50">Donated</div>
            </div>
          </div>
        </div>

        {rows.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl gold-border">
            <Users className="w-12 h-12 text-gold/40 mx-auto mb-4" />
            <p className="text-foreground/50 font-cinzel">No one has registered for this event yet.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl gold-border shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gold/20 bg-cream/50">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-maroon/60 uppercase tracking-wider">Name</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-maroon/60 uppercase tracking-wider">Contact</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-maroon/60 uppercase tracking-wider">Family Members</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-maroon/60 uppercase tracking-wider">Registered</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-maroon/60 uppercase tracking-wider">Payment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gold/10">
                  {rows.map((r) => (
                    <tr key={r.id} className="hover:bg-cream/30 transition-colors align-top">
                      <td className="px-4 py-3">
                        <p className="font-cinzel font-semibold text-maroon text-sm flex items-center gap-1.5">
                          {r.name}
                          {r.isGuest && (
                            <span className="text-[10px] bg-gold/15 text-maroon/60 px-1.5 py-0.5 rounded-full font-medium shrink-0">Guest</span>
                          )}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-foreground/70 text-xs">
                        <p>{r.email || "—"}</p>
                        {r.phone && <p className="text-foreground/50">{r.phone}</p>}
                      </td>
                      <td className="px-4 py-3 text-xs">
                        {r.familyMembers.length > 0 ? (
                          <ul className="space-y-0.5">
                            {r.familyMembers.map((m, i) => (
                              <li key={i} className="text-foreground/70">
                                {m.name}{m.birthStar ? ` (${m.birthStar})` : ""}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <span className="text-foreground/30">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-foreground/50 text-xs whitespace-nowrap">
                        {formatDate(r.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        {r.donations.length > 0 ? (
                          <div className="space-y-1.5">
                            {r.donations.map((d) => (
                              <div key={d.id} className="flex items-center gap-2 whitespace-nowrap">
                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${d.status === "COMPLETED" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                                  {formatCurrency(d.amount)} · {d.status}
                                </span>
                                {d.receiptNumber && (
                                  <Link href={`/receipts/donation/${d.id}`} className="flex items-center gap-1 text-xs text-saffron hover:underline">
                                    <Receipt className="w-3 h-3" />
                                  </Link>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-foreground/30 text-xs flex items-center gap-1">
                            <HandCoins className="w-3 h-3" /> None
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
