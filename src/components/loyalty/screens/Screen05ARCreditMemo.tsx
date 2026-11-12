import React from "react";
import { FileCheck2, AlertCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Screen05ARCreditMemo() {
  const line = {
    item: "RLC-FS-09K",
    description: "Fixed Speed 9,000 BTU Wall-mount AC (Returned)",
    qtyCredited: 2,
    originalPointsPerUnit: 225,
    pointsDeducted: 450,
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.05)] p-6 space-y-6">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-slate-900">
              LOY-SCR-05: A/R Credit Memo – Loyalty Deduction
            </h3>
            <span className="text-xs bg-amber-50 text-amber-700 font-semibold px-2.5 py-0.5 rounded-full border border-amber-200">
              SAP B1 Client • ORIN / RIN1
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Deducts points for credited items at the points originally earned on the base invoice line.
          </p>
        </div>
      </div>

      {/* Credit Memo Form Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50/60 p-5 rounded-2xl border border-slate-200/60 text-xs">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-700">Customer:</span>
            <input
              type="text"
              readOnly
              value="D-0412 — Negombo Cool Centre"
              className="w-64 py-1.5 px-3 rounded-lg border border-slate-200 bg-white font-medium text-slate-900"
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-700">Base Invoice:</span>
            <div className="w-64 py-1.5 px-3 rounded-lg border border-indigo-200 bg-indigo-50/50 font-mono font-bold text-indigo-700">
              INV-26-11210
            </div>
          </div>
          <div className="flex items-center justify-between bg-amber-50/70 p-2 rounded-xl border border-amber-200">
            <span className="font-bold text-amber-900">Points Deducted:</span>
            <div className="font-mono font-bold text-rose-600 text-sm">
              -450 Pts
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-700">Credit Memo Doc No:</span>
            <input
              type="text"
              readOnly
              value="CM-26-00812"
              className="w-64 py-1.5 px-3 rounded-lg border border-slate-200 bg-white font-mono font-bold text-slate-900"
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-700">Posting Date:</span>
            <input
              type="text"
              readOnly
              value="20-Apr-2026"
              className="w-64 py-1.5 px-3 rounded-lg border border-slate-200 bg-white font-mono text-slate-800"
            />
          </div>
          <div className="flex items-center justify-between bg-slate-100 p-2 rounded-xl border border-slate-200">
            <span className="font-bold text-slate-900">Balance After Deduction:</span>
            <div className="font-mono font-bold text-slate-900 text-sm">
              8,500 Pts
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-700">Loyalty Ledger Ref:</span>
            <input
              type="text"
              readOnly
              value="LL-2026-004502"
              className="w-64 py-1.5 px-3 rounded-lg border border-slate-200 bg-white font-mono text-slate-700"
            />
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
          Credited Items & Rate Traceability
        </h4>

        <div className="overflow-x-auto rounded-xl border border-slate-200/80">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[11px]">
                <th className="py-2.5 px-3">Item Code</th>
                <th className="py-2.5 px-3">Description</th>
                <th className="py-2.5 px-3 text-right">Qty Credited</th>
                <th className="py-2.5 px-3 text-right">Points / Unit (Original Base)</th>
                <th className="py-2.5 px-3 text-right">Line Points Deducted</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              <tr className="hover:bg-slate-50/60">
                <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{line.item}</td>
                <td className="py-2.5 px-3">{line.description}</td>
                <td className="py-2.5 px-3 text-right font-mono font-semibold">{line.qtyCredited}</td>
                <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                  {line.originalPointsPerUnit} Pts
                </td>
                <td className="py-2.5 px-3 text-right font-mono font-bold text-rose-600">
                  -{line.pointsDeducted} Pts
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr className="bg-slate-100 font-bold text-slate-900 border-t border-slate-300">
                <td colSpan={4} className="py-2.5 px-3 text-right">
                  Total Points Deducted from Balance:
                </td>
                <td className="py-2.5 px-3 text-right font-mono text-rose-600 text-sm">
                  -450 Pts
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
