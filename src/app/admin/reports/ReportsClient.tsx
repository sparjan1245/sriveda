"use client";

import { useState, useEffect, useCallback } from "react";
import { Download, RefreshCw } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface Summary {
  totalDonations: number;
  totalDonated: number;
  totalBookings: number;
  totalBookingRevenue: number;
  walkInDonations: number;
  walkInBookings: number;
}

interface PeriodEntry { count: number; total: number; }

interface ReportData {
  summary: Summary;
  donationsByPeriod: Record<string, PeriodEntry>;
  bookingsByPeriod: Record<string, PeriodEntry>;
  causeBreakdown: Record<string, number>;
  paymentModeBreakdown: Record<string, number>;
}

const MODE_COLORS: Record<string, string> = {
  CASH: "bg-green-100 text-green-700",
  CHECK: "bg-blue-100 text-blue-700",
  CARD: "bg-purple-100 text-purple-700",
  ONLINE: "bg-saffron/10 text-saffron",
  UPI: "bg-orange-100 text-orange-700",
  OTHER: "bg-gray-100 text-gray-600",
};

export default function ReportsClient() {
  const [period, setPeriod] = useState<"daily" | "monthly">("monthly");
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/reports?period=${period}`);
      const json = await res.json();
      setData(json);
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const downloadCSV = (type: "donations" | "bookings") => {
    window.open(`/api/admin/reports?format=csv-${type}`, "_blank");
  };

  const statCard = (label: string, value: string | number, sub?: string) => (
    <div className="bg-white rounded-xl p-5 gold-border shadow-sm text-center">
      <div className="font-cinzel font-bold text-2xl text-maroon">{value}</div>
      <div className="text-xs text-foreground/60 mt-1">{label}</div>
      {sub && <div className="text-xs text-foreground/40 mt-0.5">{sub}</div>}
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Controls */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex bg-white rounded-lg gold-border overflow-hidden">
          {(["monthly", "daily"] as const).map((p) => (
            <button key={p} onClick={() => setPeriod(p)} className={`px-4 py-2 text-sm font-medium transition-colors ${period === p ? "bg-maroon text-white" : "text-foreground/60 hover:text-maroon"}`}>
              {p === "monthly" ? "Monthly" : "Daily"}
            </button>
          ))}
        </div>
        <button onClick={fetchData} disabled={loading} className="p-2 rounded-lg bg-white gold-border text-maroon hover:bg-cream transition-colors disabled:opacity-50">
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </button>
        <div className="ml-auto flex gap-2">
          <button onClick={() => downloadCSV("donations")} className="flex items-center gap-1.5 text-sm bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors">
            <Download className="w-3.5 h-3.5" /> Donations CSV
          </button>
          <button onClick={() => downloadCSV("bookings")} className="flex items-center gap-1.5 text-sm bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            <Download className="w-3.5 h-3.5" /> Bookings CSV
          </button>
        </div>
      </div>

      {!data ? (
        <div className="text-center py-20 text-foreground/40">{loading ? "Loading reports…" : "No data."}</div>
      ) : (
        <>
          {/* Summary */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {statCard("Total Donations", data.summary.totalDonations)}
            {statCard("Total Donated", formatCurrency(data.summary.totalDonated))}
            {statCard("Total Bookings", data.summary.totalBookings)}
            {statCard("Booking Revenue", formatCurrency(data.summary.totalBookingRevenue))}
            {statCard("Walk-in Donations", data.summary.walkInDonations, "cash/check/card")}
            {statCard("Walk-in Bookings", data.summary.walkInBookings, "in-person")}
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Donations by Period */}
            <div className="bg-white rounded-2xl p-6 gold-border shadow-sm">
              <h2 className="font-cinzel font-semibold text-maroon mb-4">Donations — {period === "monthly" ? "Monthly" : "Daily"}</h2>
              {Object.keys(data.donationsByPeriod).length === 0 ? (
                <p className="text-foreground/40 text-sm text-center py-8">No data</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="border-b border-gold/20 text-left"><th className="pb-2 text-xs text-foreground/50 font-medium">Period</th><th className="pb-2 text-xs text-foreground/50 font-medium text-right">Count</th><th className="pb-2 text-xs text-foreground/50 font-medium text-right">Total</th></tr></thead>
                    <tbody className="divide-y divide-gold/10">
                      {Object.entries(data.donationsByPeriod).slice(0, 12).map(([k, v]) => (
                        <tr key={k}><td className="py-2 text-foreground/80">{k}</td><td className="py-2 text-right text-foreground/60">{v.count}</td><td className="py-2 text-right font-semibold text-saffron">{formatCurrency(v.total)}</td></tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Bookings by Period */}
            <div className="bg-white rounded-2xl p-6 gold-border shadow-sm">
              <h2 className="font-cinzel font-semibold text-maroon mb-4">Bookings — {period === "monthly" ? "Monthly" : "Daily"}</h2>
              {Object.keys(data.bookingsByPeriod).length === 0 ? (
                <p className="text-foreground/40 text-sm text-center py-8">No data</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="border-b border-gold/20 text-left"><th className="pb-2 text-xs text-foreground/50 font-medium">Period</th><th className="pb-2 text-xs text-foreground/50 font-medium text-right">Count</th><th className="pb-2 text-xs text-foreground/50 font-medium text-right">Revenue</th></tr></thead>
                    <tbody className="divide-y divide-gold/10">
                      {Object.entries(data.bookingsByPeriod).slice(0, 12).map(([k, v]) => (
                        <tr key={k}><td className="py-2 text-foreground/80">{k}</td><td className="py-2 text-right text-foreground/60">{v.count}</td><td className="py-2 text-right font-semibold text-saffron">{formatCurrency(v.total)}</td></tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Cause Breakdown */}
            <div className="bg-white rounded-2xl p-6 gold-border shadow-sm">
              <h2 className="font-cinzel font-semibold text-maroon mb-4">Donations by Cause</h2>
              {Object.keys(data.causeBreakdown).length === 0 ? <p className="text-foreground/40 text-sm text-center py-8">No data</p> : (
                <div className="space-y-3">
                  {Object.entries(data.causeBreakdown).sort((a, b) => b[1] - a[1]).map(([cause, total]) => {
                    const max = Math.max(...Object.values(data.causeBreakdown));
                    return (
                      <div key={cause}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-foreground/80">{cause}</span>
                          <span className="font-semibold text-saffron">{formatCurrency(total)}</span>
                        </div>
                        <div className="h-2 bg-cream rounded-full overflow-hidden">
                          <div className="h-full bg-saffron rounded-full transition-all" style={{ width: `${(total / max) * 100}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Payment Mode Breakdown */}
            <div className="bg-white rounded-2xl p-6 gold-border shadow-sm">
              <h2 className="font-cinzel font-semibold text-maroon mb-4">Payment Modes</h2>
              {Object.keys(data.paymentModeBreakdown).length === 0 ? <p className="text-foreground/40 text-sm text-center py-8">No data</p> : (
                <div className="space-y-3">
                  {Object.entries(data.paymentModeBreakdown).sort((a, b) => b[1] - a[1]).map(([mode, total]) => (
                    <div key={mode} className="flex items-center justify-between">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${MODE_COLORS[mode] || "bg-gray-100 text-gray-600"}`}>{mode}</span>
                      <span className="font-semibold text-sm text-foreground/80">{formatCurrency(total)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
