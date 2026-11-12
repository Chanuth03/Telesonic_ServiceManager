import React, { useState } from "react";
import { MonitorCheck, RefreshCw, CheckCircle2, ShieldCheck, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Screen12ServiceManagerLoyaltyPanel() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState("30-Apr-2026 10:12:44");

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      setLastRefreshed(new Date().toLocaleTimeString());
    }, 600);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.05)] p-6 space-y-6">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-slate-900">
              LOY-SCR-12: Service Manager – Customer Loyalty Panel (Option 01)
            </h3>
            <span className="text-xs bg-indigo-50 text-indigo-700 font-semibold px-2.5 py-0.5 rounded-full border border-indigo-200">
              SM Browser • Integration Layer
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Read-only live loyalty panel embedded in Service Manager customer view and commercial panels.
          </p>
        </div>

        <Button
          size="sm"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold"
        >
          <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isRefreshing ? "animate-spin" : ""}`} />
          Refresh SAP Data
        </Button>
      </div>

      {/* Embedded Panel View exactly matching Section 10 Screenshot */}
      <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-200/80">
          <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
            <MonitorCheck className="w-4 h-4 text-indigo-600" />
            Service Manager Customer Overview ⇄ SAP B1 Commercial Integration
          </div>
          <span className="text-[11px] text-slate-400">Last Refreshed: {lastRefreshed}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-slate-500 block mb-1">Customer:</span>
            <div className="font-bold text-slate-900 bg-white p-2 rounded-lg border border-slate-200">
              D-0412 — Negombo Cool Centre <span className="text-[10px] text-indigo-600 font-mono">⇄B1</span>
            </div>
          </div>

          <div>
            <span className="text-slate-500 block mb-1">Loyalty Eligible:</span>
            <div className="bg-emerald-50 text-emerald-800 font-bold p-2 rounded-lg border border-emerald-200 flex items-center justify-between">
              <span>Yes (Active)</span>
              <span className="text-[10px] text-emerald-600 font-mono">⇄B1</span>
            </div>
          </div>

          <div>
            <span className="text-slate-500 block mb-1">Points Balance:</span>
            <div className="bg-indigo-50 text-indigo-900 font-bold font-mono p-2 rounded-lg border border-indigo-200 flex items-center justify-between">
              <span>8,500 Pts</span>
              <span className="text-[10px] text-indigo-600 font-mono">⇄B1</span>
            </div>
          </div>

          <div>
            <span className="text-slate-500 block mb-1">Loyalty Value (LKR):</span>
            <div className="bg-white text-slate-900 font-bold font-mono p-2 rounded-lg border border-slate-200 flex items-center justify-between">
              <span>LKR 8,500.00</span>
              <span className="text-[10px] text-slate-400 font-mono">⇄B1</span>
            </div>
          </div>
        </div>

        {/* Recent mini grid */}
        <div className="pt-2">
          <div className="text-xs font-bold text-slate-800 mb-2">Recent Loyalty Transactions</div>
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b text-[11px] text-slate-600 font-semibold uppercase">
                <tr>
                  <th className="py-2 px-3">Date</th>
                  <th className="py-2 px-3">Document</th>
                  <th className="py-2 px-3 text-right">Points Movement</th>
                  <th className="py-2 px-3 text-right">Running Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y text-slate-700">
                <tr>
                  <td className="py-2 px-3 font-mono">20-Apr-2026</td>
                  <td className="py-2 px-3 font-mono">CM-26-00812 (Credit Memo)</td>
                  <td className="py-2 px-3 text-right font-mono font-bold text-rose-600">-450</td>
                  <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">8,500 Pts</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-mono">12-Apr-2026</td>
                  <td className="py-2 px-3 font-mono">INV-26-11210 (A/R Invoice)</td>
                  <td className="py-2 px-3 text-right font-mono font-bold text-emerald-600">+3,750</td>
                  <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">8,950 Pts</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
