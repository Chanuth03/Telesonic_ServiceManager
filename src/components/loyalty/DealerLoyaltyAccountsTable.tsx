import React, { useState } from "react";
import {
  Users,
  Search,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  CreditCard,
  FileText,
  Building,
  Calendar,
  Lock,
} from "lucide-react";
import { DealerLoyaltyMaster } from "@/lib/loyalty-data";
import { Button } from "@/components/ui/button";

interface DealerAccountsProps {
  dealers: DealerLoyaltyMaster[];
  onSelectCustomer: (customerCode: string) => void;
  onRequestRedeem: (customerCode: string) => void;
  onToggleStatus?: (customerCode: string) => void;
}

export function DealerLoyaltyAccountsTable({
  dealers,
  onSelectCustomer,
  onRequestRedeem,
  onToggleStatus,
}: DealerAccountsProps) {
  const [search, setSearch] = useState("");
  const [divisionFilter, setDivisionFilter] = useState("ALL");
  const [eligibilityFilter, setEligibilityFilter] = useState("ALL");

  const filteredDealers = dealers.filter((d) => {
    if (divisionFilter !== "ALL" && d.division !== divisionFilter) return false;
    if (eligibilityFilter === "ELIGIBLE" && !d.loyaltyEligible) return false;
    if (eligibilityFilter === "CAN_REDEEM" && (!d.loyaltyEligible || d.loyaltyBalance < d.minimumPointsForRedemption)) return false;
    if (eligibilityFilter === "SUSPENDED" && d.loyaltyStatus !== "Suspended") return false;

    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        d.customerCode.toLowerCase().includes(q) ||
        d.customerName.toLowerCase().includes(q) ||
        d.division.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.05)] p-5 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900">
              Dealer Loyalty Accounts & Master Balances
            </h3>
            <span className="text-xs bg-slate-100 text-slate-700 font-medium px-2 py-0.5 rounded">
              LOY-SCR-01
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Customer eligibility, live ledger balance, and minimum redemption thresholds (Option 01).
          </p>
        </div>
      </div>

      {/* Filter toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[280px]">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter by dealer code, name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </div>

          <select
            value={divisionFilter}
            onChange={(e) => setDivisionFilter(e.target.value)}
            className="text-xs py-2 px-3 rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="ALL">All Divisions</option>
            <option value="RLC">RLC Division</option>
            <option value="MHA">MHA Division</option>
            <option value="CAC">CAC Commercial</option>
          </select>

          <select
            value={eligibilityFilter}
            onChange={(e) => setEligibilityFilter(e.target.value)}
            className="text-xs py-2 px-3 rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="ALL">All Statuses</option>
            <option value="ELIGIBLE">Eligible Only</option>
            <option value="CAN_REDEEM">Ready to Redeem (≥ 5,000 pts)</option>
            <option value="SUSPENDED">Suspended Only</option>
          </select>
        </div>

        <div className="text-xs text-slate-500">
          Showing <strong>{filteredDealers.length}</strong> dealers
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200/80">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50/75 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
              <th className="py-3 px-3">Dealer</th>
              <th className="py-3 px-3">Division & Group</th>
              <th className="py-3 px-3">Account Balance</th>
              <th className="py-3 px-3 text-right">Points Balance</th>
              <th className="py-3 px-3 text-right">Loyalty Value (LKR)</th>
              <th className="py-3 px-3 text-center">Eligibility / Status</th>
              <th className="py-3 px-3">Redemption Status</th>
              <th className="py-3 px-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {filteredDealers.map((d) => {
              const canRedeem = d.loyaltyEligible && d.loyaltyBalance >= d.minimumPointsForRedemption;
              const isSuspended = d.loyaltyStatus === "Suspended";

              return (
                <tr
                  key={d.customerCode}
                  className="hover:bg-indigo-50/20 transition-colors"
                >
                  <td className="py-3 px-3">
                    <button
                      onClick={() => onSelectCustomer(d.customerCode)}
                      className="text-left group"
                    >
                      <div className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                        {d.customerName}
                      </div>
                      <div className="text-[11px] font-mono text-slate-500">
                        {d.customerCode}
                      </div>
                    </button>
                  </td>

                  <td className="py-3 px-3">
                    <span className="font-medium text-slate-800">{d.division}</span>
                    <div className="text-[10px] text-slate-400">{d.customerGroup}</div>
                  </td>

                  <td className="py-3 px-3 font-mono">
                    LKR {d.accountBalanceLKR.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </td>

                  <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                    {d.loyaltyBalance.toLocaleString()} Pts
                  </td>

                  <td className="py-3 px-3 text-right font-mono font-bold text-indigo-700">
                    LKR {d.loyaltyValueLKR.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </td>

                  <td className="py-3 px-3 text-center">
                    {isSuspended ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-100 text-rose-800">
                        Suspended
                      </span>
                    ) : d.loyaltyEligible ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                        Eligible
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-600">
                        Not Eligible
                      </span>
                    )}
                  </td>

                  <td className="py-3 px-3">
                    {canRedeem ? (
                      <div className="flex items-center gap-1.5 text-emerald-600 font-medium">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Eligible (≥{d.minimumPointsForRedemption.toLocaleString()})</span>
                      </div>
                    ) : (
                      <div className="text-slate-400 text-[11px]">
                        Below threshold ({d.loyaltyBalance}/{d.minimumPointsForRedemption})
                      </div>
                    )}
                  </td>

                  <td className="py-3 px-3 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onSelectCustomer(d.customerCode)}
                        className="text-xs h-8 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50"
                      >
                        Ledger
                      </Button>

                      <Button
                        size="sm"
                        disabled={!canRedeem}
                        onClick={() => onRequestRedeem(d.customerCode)}
                        className={`text-xs h-8 font-semibold ${
                          canRedeem
                            ? "bg-indigo-600 hover:bg-indigo-700 text-white"
                            : "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed"
                        }`}
                      >
                        Redeem
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
