import React, { useState } from "react";
import { UploadCloud, CheckCircle2, AlertTriangle, FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Screen09OpeningBalanceImport() {
  const [activeTab, setActiveTab] = useState<"lines" | "errors">("lines");

  const importLines = [
    {
      customer: "D-0412",
      name: "Negombo Cool Centre",
      eligible: "Yes",
      openingPoints: 5200,
      minimum: 5000,
      validation: "OK",
    },
    {
      customer: "D-0301",
      name: "Kandy Air Solutions",
      eligible: "Yes",
      openingPoints: 12450,
      minimum: 5000,
      validation: "OK",
    },
    {
      customer: "D-0620",
      name: "Matara Cooling Systems",
      eligible: "Yes",
      openingPoints: 2400,
      minimum: 5000,
      validation: "OK",
    },
  ];

  const errorLines = [
    {
      customer: "D-0555",
      name: "Jaffna Home Electronics",
      eligible: "No",
      openingPoints: 900,
      minimum: "—",
      validation: "Error: Customer not marked Loyalty Eligible",
    },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.05)] p-6 space-y-6">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-slate-900">
              LOY-SCR-09: Opening Balance Import
            </h3>
            <span className="text-xs bg-indigo-50 text-indigo-700 font-semibold px-2.5 py-0.5 rounded-full border border-indigo-200">
              B1 Add-on Form • UDO Batch
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Load opening balances at go-live from legacy spreadsheets with validation, eligibility gate, and Finance approval.
          </p>
        </div>
      </div>

      {/* Batch Form Header */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50/60 p-5 rounded-2xl border border-slate-200/60 text-xs">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-700">Batch No:</span>
            <input
              type="text"
              readOnly
              value="OB-2026-01"
              className="w-56 py-1.5 px-3 rounded-lg border border-slate-200 bg-white font-mono font-bold text-slate-900"
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-700">Source:</span>
            <input
              type="text"
              readOnly
              value="Excel (current register as of 31-Mar-2026)"
              className="w-56 py-1.5 px-3 rounded-lg border border-slate-200 bg-white text-slate-800"
            />
          </div>
          <div className="flex items-center justify-between bg-indigo-50/70 p-2 rounded-xl border border-indigo-200">
            <span className="font-bold text-indigo-900">Total Migrated Points:</span>
            <div className="font-mono font-bold text-indigo-700 text-sm">
              20,050 Pts
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-700">Cut-over Date:</span>
            <input
              type="text"
              readOnly
              value="31-Mar-2026"
              className="w-56 py-1.5 px-3 rounded-lg border border-slate-200 bg-white font-mono text-slate-800"
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-700">Status:</span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-bold bg-emerald-100 text-emerald-800">
              Validated & Approved
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-700">Sign-off Approver:</span>
            <span className="text-slate-800 font-medium">Head of Finance (K. Jayasinghe)</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 border-b border-slate-200 text-xs">
          <button
            onClick={() => setActiveTab("lines")}
            className={`pb-2.5 px-3 font-bold border-b-2 transition-all ${
              activeTab === "lines"
                ? "border-indigo-600 text-indigo-700"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            Validated Lines ({importLines.length})
          </button>
          <button
            onClick={() => setActiveTab("errors")}
            className={`pb-2.5 px-3 font-bold border-b-2 transition-all ${
              activeTab === "errors"
                ? "border-rose-600 text-rose-700"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            Exception / Error Log ({errorLines.length})
          </button>
        </div>

        {activeTab === "lines" && (
          <div className="overflow-x-auto rounded-xl border border-slate-200/80">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[11px]">
                  <th className="py-2.5 px-3">Customer Code</th>
                  <th className="py-2.5 px-3">Customer Name</th>
                  <th className="py-2.5 px-3">Eligible</th>
                  <th className="py-2.5 px-3 text-right">Opening Points</th>
                  <th className="py-2.5 px-3 text-right">Min Threshold</th>
                  <th className="py-2.5 px-3">Validation Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {importLines.map((row) => (
                  <tr key={row.customer} className="hover:bg-slate-50/60">
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{row.customer}</td>
                    <td className="py-2.5 px-3 font-medium text-slate-900">{row.name}</td>
                    <td className="py-2.5 px-3 text-emerald-600 font-semibold">{row.eligible}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                      +{row.openingPoints.toLocaleString()} Pts
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-600">
                      {row.minimum.toLocaleString()} Pts
                    </td>
                    <td className="py-2.5 px-3 text-emerald-600 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> OK
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "errors" && (
          <div className="overflow-x-auto rounded-xl border border-slate-200/80">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-rose-50/50 border-b border-rose-200 text-rose-800 font-semibold uppercase text-[11px]">
                  <th className="py-2.5 px-3">Customer Code</th>
                  <th className="py-2.5 px-3">Customer Name</th>
                  <th className="py-2.5 px-3">Eligible</th>
                  <th className="py-2.5 px-3 text-right">Attempted Points</th>
                  <th className="py-2.5 px-3">Validation Error Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {errorLines.map((row) => (
                  <tr key={row.customer} className="hover:bg-rose-50/30">
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{row.customer}</td>
                    <td className="py-2.5 px-3">{row.name}</td>
                    <td className="py-2.5 px-3 text-rose-600 font-semibold">{row.eligible}</td>
                    <td className="py-2.5 px-3 text-right font-mono">{row.openingPoints}</td>
                    <td className="py-2.5 px-3 text-rose-600 font-medium">{row.validation}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="flex items-center justify-end gap-2 pt-2">
        <Button variant="outline" size="sm" className="text-xs">
          <FileSpreadsheet className="w-3.5 h-3.5 mr-1 text-emerald-600" />
          Export Batch Validation Report
        </Button>
      </div>
    </div>
  );
}
