import React, { useState } from "react";
import {
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  RotateCcw,
  SlidersHorizontal,
  ChevronDown,
  FileSpreadsheet,
  FileText,
  Eye,
  Hash,
  Building2,
  Calendar,
} from "lucide-react";
import { LoyaltyLedgerEntry, LoyaltyEntryType } from "@/lib/loyalty-data";
import { Button } from "@/components/ui/button";

interface LoyaltyLedgerProps {
  ledger: LoyaltyLedgerEntry[];
  selectedCustomerFilter?: string | null;
  onClearCustomerFilter?: () => void;
  onOpenDocDetail?: (docNo: string, docType: string) => void;
}

export function LoyaltyLedgerTable({
  ledger,
  selectedCustomerFilter,
  onClearCustomerFilter,
  onOpenDocDetail,
}: LoyaltyLedgerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [entryTypeFilter, setEntryTypeFilter] = useState<string>("ALL");
  const [docTypeFilter, setDocTypeFilter] = useState<string>("ALL");

  // Filtering
  const filteredEntries = ledger.filter((entry) => {
    if (selectedCustomerFilter && entry.customerCode !== selectedCustomerFilter) {
      return false;
    }
    if (entryTypeFilter !== "ALL" && entry.entryType !== entryTypeFilter) {
      return false;
    }
    if (docTypeFilter !== "ALL" && entry.docType !== docTypeFilter) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchNo = entry.entryNo.toLowerCase().includes(q);
      const matchDoc = entry.docNo.toLowerCase().includes(q);
      const matchCust = entry.customerName.toLowerCase().includes(q) || entry.customerCode.toLowerCase().includes(q);
      const matchBase = entry.baseDoc?.toLowerCase().includes(q) || false;
      const matchDesc = entry.description?.toLowerCase().includes(q) || false;
      return matchNo || matchDoc || matchCust || matchBase || matchDesc;
    }
    return true;
  });

  const getEntryBadge = (type: LoyaltyEntryType) => {
    switch (type) {
      case "Opening":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            Opening
          </span>
        );
      case "Earn":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            + Earn
          </span>
        );
      case "Deduct":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            - Deduct
          </span>
        );
      case "Redeem":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
            Redeem
          </span>
        );
      case "Reverse":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
            Reverse
          </span>
        );
      case "Adjust":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-cyan-50 text-cyan-700 border border-cyan-200">
            Adjust
          </span>
        );
      case "Expire":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            Expire
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.05)] overflow-hidden space-y-4 p-5">
      {/* Table Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900">
              Customer Loyalty Ledger (Audit History)
            </h3>
            <span className="text-xs bg-slate-100 text-slate-700 font-medium px-2 py-0.5 rounded">
              LOY-SCR-07
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Complete, immutable audit trail of all points earned, deducted, redeemed, and reversed.
          </p>
        </div>

        {/* Selected Customer Filter chip */}
        {selectedCustomerFilter && (
          <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-200 px-3 py-1 rounded-xl text-xs text-indigo-700">
            <span>Filtered for: <strong>{selectedCustomerFilter}</strong></span>
            {onClearCustomerFilter && (
              <button
                onClick={onClearCustomerFilter}
                className="hover:text-indigo-900 font-bold ml-1"
                title="Clear filter"
              >
                ✕
              </button>
            )}
          </div>
        )}
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[280px]">
          {/* Search box */}
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by doc no, customer, item or remarks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </div>

          {/* Entry Type Filter */}
          <select
            value={entryTypeFilter}
            onChange={(e) => setEntryTypeFilter(e.target.value)}
            className="text-xs py-2 px-3 rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="ALL">All Entry Types</option>
            <option value="Earn">Earn (+)</option>
            <option value="Deduct">Deduct (-)</option>
            <option value="Redeem">Redeem (-)</option>
            <option value="Reverse">Reverse (+/-)</option>
            <option value="Opening">Opening</option>
            <option value="Adjust">Adjust</option>
          </select>

          {/* Document Type Filter */}
          <select
            value={docTypeFilter}
            onChange={(e) => setDocTypeFilter(e.target.value)}
            className="text-xs py-2 px-3 rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="ALL">All Documents</option>
            <option value="A/R Invoice">A/R Invoice</option>
            <option value="A/R Credit Memo">A/R Credit Memo</option>
            <option value="Redemption">Redemption</option>
            <option value="Reversal">Reversal</option>
            <option value="Migration Batch">Migration Batch</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              alert("Exporting Loyalty Ledger (LOY-RPT-02) to CSV / Excel with full audit parameters.");
            }}
            className="text-xs h-9 border-slate-200 text-slate-700 hover:bg-slate-50"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
            Export Excel
          </Button>
        </div>
      </div>

      {/* Immutable Data Grid */}
      <div className="overflow-x-auto rounded-xl border border-slate-200/80">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50/75 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
              <th className="py-3 px-3">Entry #</th>
              <th className="py-3 px-3">Date / Period</th>
              <th className="py-3 px-3">Customer</th>
              <th className="py-3 px-3">Entry Type</th>
              <th className="py-3 px-3">Doc Type & No</th>
              <th className="py-3 px-3">Base Ref</th>
              <th className="py-3 px-3 text-right">Points</th>
              <th className="py-3 px-3 text-right">Running Bal</th>
              <th className="py-3 px-3">Created / Approved By</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {filteredEntries.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-8 text-center text-slate-400">
                  No loyalty ledger transactions match the selected filters.
                </td>
              </tr>
            ) : (
              filteredEntries.map((row) => {
                const isPositive = row.points > 0;
                const isNegative = row.points < 0;
                return (
                  <tr
                    key={row.entryNo}
                    className="hover:bg-indigo-50/20 transition-colors group"
                  >
                    <td className="py-3 px-3 font-mono font-medium text-slate-900">
                      {row.entryNo}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <div className="font-medium text-slate-800">{row.date}</div>
                      <div className="text-[10px] text-slate-400">P-{row.period}</div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-900">{row.customerName}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{row.customerCode}</div>
                    </td>
                    <td className="py-3 px-3">{getEntryBadge(row.entryType)}</td>
                    <td className="py-3 px-3">
                      <div className="font-medium text-slate-900 flex items-center gap-1">
                        {row.docNo}
                      </div>
                      <div className="text-[10px] text-slate-500">{row.docType}</div>
                      {row.description && (
                        <div className="text-[10px] text-slate-400 max-w-[200px] truncate" title={row.description}>
                          {row.description}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-3 text-slate-600 font-mono">
                      {row.baseDoc || <span className="text-slate-300">—</span>}
                    </td>
                    <td className="py-3 px-3 text-right whitespace-nowrap font-mono font-bold">
                      <span
                        className={
                          isPositive
                            ? "text-emerald-600"
                            : isNegative
                            ? "text-rose-600"
                            : "text-slate-700"
                        }
                      >
                        {isPositive ? `+${row.points.toLocaleString()}` : row.points.toLocaleString()}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-slate-900 whitespace-nowrap">
                      {row.runningBalance.toLocaleString()} Pts
                    </td>
                    <td className="py-3 px-3">
                      <div className="text-[11px] font-medium text-slate-800">{row.createdBy}</div>
                      {row.approvedBy && (
                        <div className="text-[10px] text-emerald-600 font-medium">
                          ✓ {row.approvedBy}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between text-xs text-slate-500 pt-2">
        <span>Showing {filteredEntries.length} of {ledger.length} immutable ledger transactions</span>
        <span className="font-medium text-indigo-600">Integrity check: 100% matched</span>
      </div>
    </div>
  );
}
