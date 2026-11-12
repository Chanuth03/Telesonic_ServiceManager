import React, { useState } from "react";
import { DealerLoyaltyMaster, LoyaltyLedgerEntry } from "@/lib/loyalty-data";
import { Users, FileSpreadsheet, Download, ExternalLink, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Screen01Props {
  dealers: DealerLoyaltyMaster[];
  ledger: LoyaltyLedgerEntry[];
  onOpenLedger: (customerCode: string) => void;
  onOpenRedeem: (customerCode: string) => void;
}

export function Screen01CustomerMaster({
  dealers,
  ledger,
  onOpenLedger,
  onOpenRedeem,
}: Screen01Props) {
  const [selectedDealerCode, setSelectedDealerCode] = useState<string>("D-0412");
  const [activeTab, setActiveTab] = useState<"loyalty" | "general" | "accounting">("loyalty");

  const currentDealer = dealers.find((d) => d.customerCode === selectedDealerCode) || dealers[0];
  const dealerLedger = ledger.filter((l) => l.customerCode === currentDealer?.customerCode);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.05)] p-6 space-y-6">
      {/* Header Info Banner matching SAP B1 Style */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-slate-900">
              LOY-SCR-01: Customer Master – Loyalty Fields and Tab
            </h3>
            <span className="text-xs bg-indigo-50 text-indigo-700 font-semibold px-2.5 py-0.5 rounded-full border border-indigo-200">
              SAP B1 Client • OCRD
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Loyalty eligibility indicator, minimum redemption limit, and live balance shown next to the account balance.
          </p>
        </div>

        {/* Customer Select dropdown */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-600">Select BP:</label>
          <select
            value={selectedDealerCode}
            onChange={(e) => setSelectedDealerCode(e.target.value)}
            className="text-xs py-1.5 px-3 rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            {dealers.map((d) => (
              <option key={d.customerCode} value={d.customerCode}>
                {d.customerCode} — {d.customerName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* SAP Business One Form Top Header Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50/60 p-5 rounded-2xl border border-slate-200/60 text-xs">
        {/* Left Column */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-700">Customer Code:</span>
            <input
              type="text"
              readOnly
              value={currentDealer.customerCode}
              className="w-48 py-1.5 px-3 rounded-lg border border-slate-200 bg-white font-mono font-bold text-slate-900"
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-700">Customer Group:</span>
            <input
              type="text"
              readOnly
              value={currentDealer.customerGroup}
              className="w-48 py-1.5 px-3 rounded-lg border border-slate-200 bg-white font-medium text-slate-800"
            />
          </div>
          <div className="flex items-center justify-between bg-amber-50/60 p-2 rounded-xl border border-amber-200/60">
            <span className="font-bold text-amber-900">Loyalty Points Balance:</span>
            <div className="font-mono font-bold text-amber-900 text-sm">
              {currentDealer.loyaltyBalance.toLocaleString()} Pts
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-700">Loyalty Eligible:</span>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-emerald-100 text-emerald-800">
              {currentDealer.loyaltyEligible ? "Yes" : "No"}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-700">Min. Points for Redemption:</span>
            <input
              type="text"
              readOnly
              value={`${currentDealer.minimumPointsForRedemption.toLocaleString()} Pts`}
              className="w-48 py-1.5 px-3 rounded-lg border border-slate-200 bg-white font-mono font-semibold text-slate-800"
            />
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-700">Customer Name:</span>
            <input
              type="text"
              readOnly
              value={currentDealer.customerName}
              className="w-56 py-1.5 px-3 rounded-lg border border-slate-200 bg-white font-medium text-slate-900"
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-700">Account Balance (LKR):</span>
            <div className="w-56 py-1.5 px-3 rounded-lg border border-slate-200 bg-white font-mono font-bold text-slate-900 text-right">
              {currentDealer.accountBalanceLKR.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </div>
          </div>
          <div className="flex items-center justify-between bg-indigo-50/60 p-2 rounded-xl border border-indigo-200/60">
            <span className="font-bold text-indigo-900">Loyalty Value (LKR):</span>
            <div className="font-mono font-bold text-indigo-900 text-sm">
              LKR {currentDealer.loyaltyValueLKR.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-700">Eligible From:</span>
            <input
              type="text"
              readOnly
              value={currentDealer.eligibleFrom}
              className="w-56 py-1.5 px-3 rounded-lg border border-slate-200 bg-white font-mono text-slate-800"
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-700">Loyalty Status:</span>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-emerald-100 text-emerald-800">
              {currentDealer.loyaltyStatus}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs Layout */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 border-b border-slate-200 text-xs">
          <button
            onClick={() => setActiveTab("loyalty")}
            className={`pb-2.5 px-3 font-bold border-b-2 transition-all ${
              activeTab === "loyalty"
                ? "border-indigo-600 text-indigo-700"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            Loyalty Tab (Add-on Grid)
          </button>
          <button
            onClick={() => setActiveTab("general")}
            className={`pb-2.5 px-3 font-semibold border-b-2 transition-all ${
              activeTab === "general"
                ? "border-indigo-600 text-indigo-700"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            General
          </button>
          <button
            onClick={() => setActiveTab("accounting")}
            className={`pb-2.5 px-3 font-semibold border-b-2 transition-all ${
              activeTab === "accounting"
                ? "border-indigo-600 text-indigo-700"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            Accounting
          </button>
        </div>

        {activeTab === "loyalty" && (
          <div className="overflow-x-auto rounded-xl border border-slate-200/80">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[11px]">
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Document</th>
                  <th className="py-2.5 px-3">Doc No</th>
                  <th className="py-2.5 px-3 text-right">Earned</th>
                  <th className="py-2.5 px-3 text-right">Deducted</th>
                  <th className="py-2.5 px-3 text-right">Redeemed</th>
                  <th className="py-2.5 px-3 text-right">Reversed</th>
                  <th className="py-2.5 px-3 text-right">Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {dealerLedger.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-6 text-center text-slate-400">
                      No loyalty transactions for this customer.
                    </td>
                  </tr>
                ) : (
                  dealerLedger.map((row) => (
                    <tr key={row.entryNo} className="hover:bg-slate-50/60">
                      <td className="py-2.5 px-3 font-mono">{row.date}</td>
                      <td className="py-2.5 px-3">{row.docType}</td>
                      <td className="py-2.5 px-3 font-mono font-medium text-slate-900">{row.docNo}</td>
                      <td className="py-2.5 px-3 text-right font-mono text-emerald-600 font-bold">
                        {row.entryType === "Earn" || row.entryType === "Opening" ? `+${row.points}` : "—"}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-amber-600 font-bold">
                        {row.entryType === "Deduct" ? row.points : "—"}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-indigo-600 font-bold">
                        {row.entryType === "Redeem" ? row.points : "—"}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-purple-600 font-bold">
                        {row.entryType === "Reverse" ? `+${row.points}` : "—"}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                        {row.runningBalance.toLocaleString()} Pts
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {activeTab !== "loyalty" && (
          <div className="p-8 text-center text-slate-400 text-xs border border-dashed rounded-xl">
            Standard SAP Business One Business Partner Master Tab ({activeTab.toUpperCase()})
          </div>
        )}
      </div>

      {/* Action Footer Buttons matching SAP B1 screen */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100">
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => onOpenLedger(currentDealer.customerCode)}
            className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
          >
            Loyalty Ledger
          </Button>

          <Button
            size="sm"
            disabled={!currentDealer.loyaltyEligible || currentDealer.loyaltyBalance < currentDealer.minimumPointsForRedemption}
            onClick={() => onOpenRedeem(currentDealer.customerCode)}
            className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold disabled:bg-slate-100 disabled:text-slate-400"
          >
            Redeem Points
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => alert("Exporting LOY-SCR-01 Customer Master Loyalty statement to Excel")}
            className="text-xs border-slate-200 text-slate-600"
          >
            Export Excel
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => alert("Exporting LOY-SCR-01 Customer Master Loyalty statement to PDF")}
            className="text-xs border-slate-200 text-slate-600"
          >
            Export PDF
          </Button>
        </div>
      </div>
    </div>
  );
}
