import React, { useState } from "react";
import {
  TrendingUp,
  Award,
  Wallet,
  Users,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Layers,
  ChevronRight,
  ShieldCheck,
  AlertCircle,
  FileSpreadsheet,
  Download,
  Calendar,
  Filter,
} from "lucide-react";
import { DealerLoyaltyMaster, LoyaltyLedgerEntry, RedemptionRecord } from "@/lib/loyalty-data";
import { Button } from "@/components/ui/button";

interface LoyaltyAnalyticsProps {
  dealers: DealerLoyaltyMaster[];
  ledger: LoyaltyLedgerEntry[];
  redemptions: RedemptionRecord[];
  onSelectCustomer: (customerCode: string) => void;
  onNavigateTab: (tabId: string) => void;
}

export function LoyaltyDashboardAnalytics({
  dealers,
  ledger,
  redemptions,
  onSelectCustomer,
  onNavigateTab,
}: LoyaltyAnalyticsProps) {
  const [timeRange, setTimeRange] = useState<"30D" | "90D" | "YTD">("30D");

  // Key KPI metrics
  const totalPointsIssued = ledger
    .filter((e) => e.entryType === "Earn" || e.entryType === "Opening")
    .reduce((sum, e) => sum + Math.max(0, e.points), 0);

  const totalPointsRedeemed = Math.abs(
    ledger
      .filter((e) => e.entryType === "Redeem")
      .reduce((sum, e) => sum + e.points, 0)
  );

  const currentOutstandingLiability = dealers.reduce(
    (sum, d) => sum + d.loyaltyValueLKR,
    0
  );

  const eligibleToRedeemCount = dealers.filter(
    (d) => d.loyaltyEligible && d.loyaltyBalance >= d.minimumPointsForRedemption
  ).length;

  const pendingRedemptionsCount = redemptions.filter(
    (r) => r.status === "Submitted" || r.status === "Approved"
  ).length;

  // Monthly trend mock series for points earned vs redeemed
  const monthlyTrends = [
    { month: "Jan", earned: 3200, redeemed: 1200, liability: 18500 },
    { month: "Feb", earned: 4100, redeemed: 2000, liability: 20600 },
    { month: "Mar", earned: 5400, redeemed: 3500, liability: 22500 },
    { month: "Apr", earned: 5100, redeemed: 5000, liability: 24700 },
    { month: "May", earned: 4600, redeemed: 2400, liability: 26900 },
  ];

  const maxTrend = Math.max(...monthlyTrends.map((t) => Math.max(t.earned, t.redeemed)));

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome & Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 rounded-2xl text-white shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
              SAP Business One Add-on • Option 01
            </span>
            <span className="text-xs text-slate-400">• SLFRS 15 Compliant</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">
            Customer Loyalty & Points Management
          </h2>
          <p className="text-sm text-slate-300 max-w-2xl">
            Real-time ledger audit, customer redemption workflows, and points liability valuation. 
            All dealer point adjustments are traceable to original A/R invoices.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start md:self-auto">
          <div className="flex bg-white/10 p-1 rounded-xl border border-white/10 text-xs">
            {(["30D", "90D", "YTD"] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  timeRange === range
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                {range}
              </button>
            ))}
          </div>

          <Button
            onClick={() => onNavigateTab("redemptions")}
            className="bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 text-xs font-semibold"
          >
            New Redemption Request
          </Button>
        </div>
      </div>

      {/* KPI Cards (Clean SaaS / ERP Luxury Style) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Points Liability */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.05)] hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Total Points Liability
            </span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-bold text-slate-900 tracking-tight">
              LKR {currentOutstandingLiability.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <span className="font-semibold text-emerald-600 flex items-center">
                <ArrowUpRight className="w-3.5 h-3.5" />
                24,700 Pts
              </span>
              <span>across 6 dealer accounts</span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Rate: LKR 1.00 / point</span>
            <span className="text-indigo-600 font-medium">SLFRS 15 Accrual</span>
          </div>
        </div>

        {/* Total Points Issued */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.05)] hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Points Issued (YTD)
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-bold text-slate-900 tracking-tight">
              {totalPointsIssued.toLocaleString()} Pts
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <span className="font-semibold text-emerald-600 flex items-center">
                <ArrowUpRight className="w-3.5 h-3.5" />
                +14.2%
              </span>
              <span>vs previous month</span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Capacity × 2.5 basis</span>
            <span className="text-slate-400">RLC & MHA Lines</span>
          </div>
        </div>

        {/* Eligible for Redemption */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.05)] hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Eligible to Redeem
            </span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-bold text-slate-900 tracking-tight">
              {eligibleToRedeemCount}{" "}
              <span className="text-sm font-normal text-slate-500">
                / {dealers.length} Dealers
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>Threshold: ≥ 5,000 points balance</span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Qualifying Value</span>
            <span className="font-semibold text-blue-600">LKR 39,950.00</span>
          </div>
        </div>

        {/* Pending Approval / Requests */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.05)] hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Pending Redemptions
            </span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-bold text-slate-900 tracking-tight">
              {pendingRedemptionsCount}{" "}
              <span className="text-sm font-normal text-slate-500">Requests</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <span className="text-amber-600 font-medium">Awaiting Finance</span>
              <span>• Zero cash payout</span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Redeem Credit Memo</span>
            <button
              onClick={() => onNavigateTab("redemptions")}
              className="text-indigo-600 font-semibold hover:underline flex items-center gap-0.5"
            >
              Review queue <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Analytics Grid: Left Charts + Right Top Dealer Snapshot */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Monthly Movements & Visual Trend Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.05)] space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Loyalty Points Velocity & Movements
              </h3>
              <p className="text-xs text-slate-500">
                Monthly points earned through sales invoices vs. points redeemed via Value Credit Memos
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-indigo-600 inline-block"></span>
                <span className="text-slate-600 font-medium">Points Earned</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-amber-400 inline-block"></span>
                <span className="text-slate-600 font-medium">Points Redeemed</span>
              </div>
            </div>
          </div>

          {/* Bar Chart Visualization (ERP / Modern Fintech Aesthetic) */}
          <div className="h-56 flex items-end justify-between gap-4 pt-6 px-2">
            {monthlyTrends.map((item) => {
              const earnedHeight = Math.max(15, (item.earned / maxTrend) * 160);
              const redeemedHeight = Math.max(10, (item.redeemed / maxTrend) * 160);
              return (
                <div key={item.month} className="flex-1 flex flex-col items-center gap-2 group">
                  <div className="w-full flex items-end justify-center gap-1.5 h-44">
                    {/* Earned Bar */}
                    <div
                      style={{ height: `${earnedHeight}px` }}
                      className="w-5 sm:w-8 bg-indigo-600 rounded-t-md transition-all group-hover:bg-indigo-700 relative"
                    >
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-bold py-0.5 px-1.5 rounded shadow whitespace-nowrap pointer-events-none z-10">
                        +{item.earned} pts
                      </div>
                    </div>
                    {/* Redeemed Bar */}
                    <div
                      style={{ height: `${redeemedHeight}px` }}
                      className="w-5 sm:w-8 bg-amber-400 rounded-t-md transition-all group-hover:bg-amber-500 relative"
                    >
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-bold py-0.5 px-1.5 rounded shadow whitespace-nowrap pointer-events-none z-10">
                        -{item.redeemed} pts
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-slate-600 group-hover:text-indigo-600 transition-colors">
                    {item.month}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Summary Footer Badges */}
          <div className="grid grid-cols-3 gap-3 pt-3 border-t border-slate-100 text-center">
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[11px] text-slate-500 block">Avg Earning / Mo</span>
              <span className="text-sm font-bold text-slate-800">4,480 Pts</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[11px] text-slate-500 block">Redemption Ratio</span>
              <span className="text-sm font-bold text-slate-800">63.2%</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[11px] text-slate-500 block">Net Liability Growth</span>
              <span className="text-sm font-bold text-emerald-600">+8.6%</span>
            </div>
          </div>
        </div>

        {/* Right Col: Top Dealer Accounts & Threshold Ranking */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.05)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Top Dealer Balances</h3>
                <p className="text-xs text-slate-500">Ranked by accumulated points</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onNavigateTab("dealers")}
                className="text-xs text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 p-1"
              >
                View All
              </Button>
            </div>

            <div className="space-y-3.5">
              {dealers
                .slice()
                .sort((a, b) => b.loyaltyBalance - a.loyaltyBalance)
                .slice(0, 4)
                .map((dealer, idx) => {
                  const isEligibleToRedeem = dealer.loyaltyBalance >= dealer.minimumPointsForRedemption;
                  return (
                    <div
                      key={dealer.customerCode}
                      onClick={() => onSelectCustomer(dealer.customerCode)}
                      className="p-3 rounded-xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all cursor-pointer group"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 font-bold text-[10px] flex items-center justify-center">
                            #{idx + 1}
                          </span>
                          <span className="text-xs font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
                            {dealer.customerName}
                          </span>
                        </div>
                        <span className="text-xs font-bold text-slate-900">
                          {dealer.loyaltyBalance.toLocaleString()} Pts
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <span>{dealer.customerCode} • {dealer.division}</span>
                        <div className="flex items-center gap-1.5">
                          {isEligibleToRedeem ? (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-100 text-emerald-800">
                              Ready (≥5k)
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600">
                              Needs {(dealer.minimumPointsForRedemption - dealer.loyaltyBalance).toLocaleString()}
                            </span>
                          )}
                          <span className="font-semibold text-slate-700">
                            LKR {dealer.loyaltyValueLKR.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Ledger Balanced & Locked
              </span>
              <span className="text-slate-400">Option 01 Live</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
