import React, { useState } from "react";
import { Globe, Award, Download, ArrowUpRight, CheckCircle2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Screen11PortalMyLoyaltyPoints() {
  const [showRequestModal, setShowRequestModal] = useState(false);

  const transactions = [
    {
      date: "12-Apr-2026",
      docNo: "INV-26-11210",
      earned: 3750,
      deducted: null,
      redeemed: null,
      balance: 8950,
    },
    {
      date: "20-Apr-2026",
      docNo: "CM-26-00812",
      earned: null,
      deducted: 450,
      redeemed: null,
      balance: 8500,
    },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.05)] p-6 space-y-6">
      {/* Dealer Portal Top Mock Nav */}
      <div className="bg-slate-900 text-white p-4 rounded-xl flex items-center justify-between text-xs">
        <div className="flex items-center gap-3">
          <Globe className="w-4 h-4 text-emerald-400" />
          <span className="font-bold tracking-wide">Telesonic Customer & Franchise Portal</span>
          <span className="text-slate-400">|</span>
          <span className="text-slate-300">Negombo Electronics (Franchise)</span>
        </div>
        <div className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          Connected to SAP B1 Service Layer
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-slate-900">
              LOY-SCR-11: Portal – My Loyalty Points
            </h3>
            <span className="text-xs bg-emerald-50 text-emerald-700 font-semibold px-2.5 py-0.5 rounded-full border border-emerald-200">
              Customer / Dealer Portal
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Dealer sees balance, minimum limit, value and ledger (read-only); may submit an online redemption request.
          </p>
        </div>

        <Button
          onClick={() => setShowRequestModal(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold"
        >
          Request Redemption
        </Button>
      </div>

      {/* Portal Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">Dealer Account</span>
          <div className="font-bold text-slate-900 text-sm">Negombo Cool Centre</div>
          <span className="text-xs font-mono text-slate-400">D-0412 ⇄ B1</span>
        </div>

        <div className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-200 space-y-1">
          <span className="text-[11px] font-semibold text-indigo-700 uppercase">Available Points</span>
          <div className="font-bold text-indigo-950 text-xl font-mono">8,500 Pts</div>
          <span className="text-xs text-indigo-600 font-medium">⇄ Live SAP Balance</span>
        </div>

        <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200 space-y-1">
          <span className="text-[11px] font-semibold text-emerald-700 uppercase">Redeemable Value</span>
          <div className="font-bold text-emerald-950 text-xl font-mono">LKR 8,500.00</div>
          <span className="text-xs text-emerald-600">Rate: LKR 1.00 / pt</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">Threshold Status</span>
          <div className="font-bold text-emerald-600 text-sm flex items-center gap-1">
            <CheckCircle2 className="w-4 h-4" /> Ready to Redeem
          </div>
          <span className="text-xs text-slate-500">Min: 5,000 points balance</span>
        </div>
      </div>

      {/* Dealer Statement Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs">
          <h4 className="font-bold text-slate-900 uppercase tracking-wider">
            My Loyalty Ledger History
          </h4>
          <Button variant="ghost" size="sm" className="text-xs text-indigo-600 hover:underline">
            <Download className="w-3.5 h-3.5 mr-1" />
            Download Official Statement (PDF)
          </Button>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200/80">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[11px]">
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Document Reference</th>
                <th className="py-2.5 px-3 text-right">Earned</th>
                <th className="py-2.5 px-3 text-right">Deducted</th>
                <th className="py-2.5 px-3 text-right">Redeemed</th>
                <th className="py-2.5 px-3 text-right">Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {transactions.map((t) => (
                <tr key={t.docNo} className="hover:bg-slate-50/60">
                  <td className="py-2.5 px-3 font-mono">{t.date}</td>
                  <td className="py-2.5 px-3 font-mono font-medium text-slate-900">{t.docNo}</td>
                  <td className="py-2.5 px-3 text-right font-mono text-emerald-600 font-bold">
                    {t.earned ? `+${t.earned.toLocaleString()}` : "—"}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-amber-600 font-bold">
                    {t.deducted ? `-${t.deducted.toLocaleString()}` : "—"}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-indigo-600 font-bold">
                    {t.redeemed ? `-${t.redeemed.toLocaleString()}` : "—"}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                    {t.balance.toLocaleString()} Pts
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showRequestModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <h4 className="text-base font-bold text-slate-900">Submit Redemption Request</h4>
            <p className="text-xs text-slate-500">
              Submit your request to apply available loyalty points as a credit memo towards your outstanding invoices.
            </p>
            <div className="p-3 rounded-xl bg-slate-50 border text-xs space-y-2">
              <div className="flex justify-between">
                <span>Available Points:</span>
                <span className="font-bold">8,500 Pts</span>
              </div>
              <div className="flex justify-between">
                <span>Claim Amount:</span>
                <span className="font-bold text-indigo-600">5,000 Pts (LKR 5,000.00)</span>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" size="sm" onClick={() => setShowRequestModal(false)} className="text-xs">
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  alert("Redemption request created in Draft for Finance approval (LOY-REQ-052)!");
                  setShowRequestModal(false);
                }}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs"
              >
                Submit Request
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
