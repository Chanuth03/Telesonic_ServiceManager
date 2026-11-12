import React, { useState } from "react";
import { FileText, ArrowRight, ShieldCheck, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Screen04ARInvoice() {
  const [selectedInvoice, setSelectedInvoice] = useState("INV-26-11210");

  const lines = [
    {
      item: "RLC-FS-09K",
      description: "Fixed Speed 9,000 BTU Wall-mount AC",
      qty: 10,
      price: 118500.0,
      pointsPerUnit: 225,
      linePoints: 2250,
    },
    {
      item: "RLC-IN-12K",
      description: "Inverter 12,000 BTU Wall-mount AC",
      qty: 5,
      price: 176000.0,
      pointsPerUnit: 300,
      linePoints: 1500,
    },
  ];

  const totalPoints = lines.reduce((s, l) => s + l.linePoints, 0);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.05)] p-6 space-y-6">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-slate-900">
              LOY-SCR-04: A/R Invoice – Loyalty Points
            </h3>
            <span className="text-xs bg-emerald-50 text-emerald-700 font-semibold px-2.5 py-0.5 rounded-full border border-emerald-200">
              SAP B1 Client • OINV / INV1
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Shows points earned per line and total on the invoice and the customer's balance before and after.
          </p>
        </div>
      </div>

      {/* Invoice Top Form Fields */}
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
            <span className="font-semibold text-slate-700">Posting Date:</span>
            <input
              type="text"
              readOnly
              value="12-Apr-2026"
              className="w-64 py-1.5 px-3 rounded-lg border border-slate-200 bg-white font-mono text-slate-800"
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-700">Balance Before:</span>
            <div className="w-64 py-1.5 px-3 rounded-lg border border-slate-200 bg-white font-mono font-semibold text-slate-800">
              5,200 Pts
            </div>
          </div>
          <div className="flex items-center justify-between bg-emerald-50/70 p-2 rounded-xl border border-emerald-200">
            <span className="font-bold text-emerald-900">Balance After:</span>
            <div className="font-mono font-bold text-emerald-800 text-sm">
              8,950 Pts
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-700">Doc No:</span>
            <input
              type="text"
              readOnly
              value="INV-26-11210"
              className="w-64 py-1.5 px-3 rounded-lg border border-slate-200 bg-white font-mono font-bold text-slate-900"
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-700">Loyalty Eligible:</span>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-emerald-100 text-emerald-800">
              Yes (Dealer)
            </span>
          </div>
          <div className="flex items-center justify-between bg-indigo-50/70 p-2 rounded-xl border border-indigo-200">
            <span className="font-bold text-indigo-900">Points Earned (This Invoice):</span>
            <div className="font-mono font-bold text-indigo-700 text-sm">
              +{totalPoints.toLocaleString()} Pts
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-700">Loyalty Ledger Ref:</span>
            <input
              type="text"
              readOnly
              value="LL-2026-004411"
              className="w-64 py-1.5 px-3 rounded-lg border border-slate-200 bg-white font-mono text-slate-700"
            />
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
          Contents & Loyalty Line Calculation
        </h4>

        <div className="overflow-x-auto rounded-xl border border-slate-200/80">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[11px]">
                <th className="py-2.5 px-3">Item Code</th>
                <th className="py-2.5 px-3">Description</th>
                <th className="py-2.5 px-3 text-right">Qty</th>
                <th className="py-2.5 px-3 text-right">Price (LKR)</th>
                <th className="py-2.5 px-3 text-right">Points / Unit</th>
                <th className="py-2.5 px-3 text-right">Line Points Earned</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {lines.map((l) => (
                <tr key={l.item} className="hover:bg-slate-50/60">
                  <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{l.item}</td>
                  <td className="py-2.5 px-3">{l.description}</td>
                  <td className="py-2.5 px-3 text-right font-mono font-semibold">{l.qty}</td>
                  <td className="py-2.5 px-3 text-right font-mono">
                    {l.price.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                    {l.pointsPerUnit}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-600">
                    +{l.linePoints.toLocaleString()} Pts
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-slate-100 font-bold text-slate-900 border-t border-slate-300">
                <td colSpan={5} className="py-2.5 px-3 text-right">
                  Total Points Added to Balance:
                </td>
                <td className="py-2.5 px-3 text-right font-mono text-emerald-700 text-sm">
                  +{totalPoints.toLocaleString()} Pts
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
