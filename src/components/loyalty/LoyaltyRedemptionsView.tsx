import React, { useState } from "react";
import {
  CreditCard,
  Plus,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  FileCheck,
  FileText,
  DollarSign,
  ShieldAlert,
  ArrowRight,
} from "lucide-react";
import {
  RedemptionRecord,
  DealerLoyaltyMaster,
  LoyaltyLedgerEntry,
} from "@/lib/loyalty-data";
import { Button } from "@/components/ui/button";

interface RedemptionsProps {
  redemptions: RedemptionRecord[];
  dealers: DealerLoyaltyMaster[];
  onApproveRedemption: (redemptionNo: string) => void;
  onPostCreditMemo: (redemptionNo: string) => void;
  onCancelRedemption: (redemptionNo: string) => void;
  onCreateNewRedemption: (newRec: RedemptionRecord) => void;
  defaultCustomerCode?: string | null;
}

export function LoyaltyRedemptionsView({
  redemptions,
  dealers,
  onApproveRedemption,
  onPostCreditMemo,
  onCancelRedemption,
  onCreateNewRedemption,
  defaultCustomerCode,
}: RedemptionsProps) {
  const [showModal, setShowModal] = useState(false);
  const [selectedDealerCode, setSelectedDealerCode] = useState(
    defaultCustomerCode || (dealers.find((d) => d.loyaltyBalance >= 5000)?.customerCode ?? dealers[0]?.customerCode ?? "")
  );
  const [pointsToRedeemInput, setPointsToRedeemInput] = useState("5000");
  const [selectedInvoiceNo, setSelectedInvoiceNo] = useState("INV-26-11488");

  const selectedDealer = dealers.find((d) => d.customerCode === selectedDealerCode);
  const pointsVal = parseInt(pointsToRedeemInput, 10) || 0;
  const redeemValueLKR = pointsVal * 1.0; // 1.00 conversion rate

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDealer) return;

    if (pointsVal > selectedDealer.loyaltyBalance) {
      alert("Validation Error: Cannot redeem more points than customer available balance!");
      return;
    }

    if (selectedDealer.loyaltyBalance < selectedDealer.minimumPointsForRedemption) {
      alert(`Customer balance must be ≥ minimum redemption threshold (${selectedDealer.minimumPointsForRedemption.toLocaleString()})!`);
      return;
    }

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const newRedemption: RedemptionRecord = {
      redemptionNo: `LR-2026-${randomSuffix}`,
      customerCode: selectedDealer.customerCode,
      customerName: selectedDealer.customerName,
      requestDate: new Date().toISOString().split("T")[0],
      pointsToRedeem: pointsVal,
      conversionRate: 1.0,
      redemptionValueLKR: redeemValueLKR,
      balanceAvailableBefore: selectedDealer.loyaltyBalance,
      balanceAfter: selectedDealer.loyaltyBalance - pointsVal,
      status: "Submitted",
      invoicesToSettle: [
        {
          invoiceNo: selectedInvoiceNo || "INV-26-11880",
          invoiceDate: "2026-05-10",
          openBalanceLKR: 350000.0,
          appliedLKR: redeemValueLKR,
        },
      ],
      approvals: [
        { role: "Finance Officer", approver: "Pending Assignment", decision: "Pending" },
      ],
      excludeFromIncentive: true,
    };

    onCreateNewRedemption(newRedemption);
    setShowModal(false);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.05)] p-5 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900">
              Loyalty Redemptions & Value Credit Memos
            </h3>
            <span className="text-xs bg-slate-100 text-slate-700 font-medium px-2 py-0.5 rounded">
              LOY-SCR-06
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Redeem points into SAP A/R Credit Memos reconciled strictly against open invoices. Zero cash payout.
          </p>
        </div>

        <Button
          onClick={() => setShowModal(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Create Redemption Request
        </Button>
      </div>

      {/* Rules callout per LOY-REQ-034 - LOY-REQ-041 */}
      <div className="bg-amber-50/60 border border-amber-200/80 rounded-xl p-3.5 flex items-start gap-3 text-xs text-amber-900">
        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">ERP Compliance Notice:</span> Redemptions generate non-stock value Credit Memos (Conversion: LKR 1.00 / pt) applied only against customer open invoices. Points are deducted immediately upon posting. Under <code>TSL-INC-DRS</code>, redemption credit memos are automatically flagged <strong>Exclude from Sales Incentive</strong>.
        </div>
      </div>

      {/* Redemptions Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200/80">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50/75 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
              <th className="py-3 px-3">Redemption #</th>
              <th className="py-3 px-3">Date</th>
              <th className="py-3 px-3">Customer</th>
              <th className="py-3 px-3 text-right">Points</th>
              <th className="py-3 px-3 text-right">Value (LKR)</th>
              <th className="py-3 px-3">Invoices Settled</th>
              <th className="py-3 px-3">A/R Credit Memo</th>
              <th className="py-3 px-3">Status</th>
              <th className="py-3 px-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {redemptions.map((r) => {
              return (
                <tr key={r.redemptionNo} className="hover:bg-indigo-50/20 transition-colors">
                  <td className="py-3 px-3 font-mono font-bold text-slate-900">
                    {r.redemptionNo}
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap text-slate-600">
                    {r.requestDate}
                  </td>
                  <td className="py-3 px-3">
                    <div className="font-semibold text-slate-900">{r.customerName}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{r.customerCode}</div>
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                    {r.pointsToRedeem.toLocaleString()} Pts
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-indigo-700">
                    LKR {r.redemptionValueLKR.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 px-3">
                    {r.invoicesToSettle.map((inv) => (
                      <div key={inv.invoiceNo} className="text-[11px]">
                        <span className="font-semibold text-slate-800">{inv.invoiceNo}</span>
                        <span className="text-slate-400 ml-1">
                          (LKR {inv.appliedLKR.toLocaleString()})
                        </span>
                      </div>
                    ))}
                  </td>
                  <td className="py-3 px-3 font-mono">
                    {r.creditMemoDocNo ? (
                      <span className="text-emerald-700 font-semibold">{r.creditMemoDocNo}</span>
                    ) : (
                      <span className="text-slate-400">Awaiting Post</span>
                    )}
                  </td>
                  <td className="py-3 px-3">
                    {r.status === "Posted" && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Posted (B1)
                      </span>
                    )}
                    {r.status === "Approved" && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                        Approved
                      </span>
                    )}
                    {r.status === "Submitted" && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                        Submitted
                      </span>
                    )}
                    {r.status === "Cancelled" && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-500 border border-slate-200">
                        Cancelled (Reversed)
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      {r.status === "Submitted" && (
                        <Button
                          size="sm"
                          onClick={() => onApproveRedemption(r.redemptionNo)}
                          className="text-xs h-7 bg-blue-600 hover:bg-blue-700 text-white font-medium"
                        >
                          Approve
                        </Button>
                      )}

                      {r.status === "Approved" && (
                        <Button
                          size="sm"
                          onClick={() => onPostCreditMemo(r.redemptionNo)}
                          className="text-xs h-7 bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
                        >
                          Post A/R CM
                        </Button>
                      )}

                      {r.status === "Posted" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onCancelRedemption(r.redemptionNo)}
                          className="text-xs h-7 border-rose-200 text-rose-600 hover:bg-rose-50"
                        >
                          Cancel / Reverse
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modal Dialog for New Redemption */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h4 className="text-base font-bold text-slate-900">
                New Loyalty Redemption (UDO Document)
              </h4>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Eligible Customer (Dealer) *
                </label>
                <select
                  value={selectedDealerCode}
                  onChange={(e) => setSelectedDealerCode(e.target.value)}
                  className="w-full py-2 px-3 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  {dealers
                    .filter((d) => d.loyaltyEligible)
                    .map((d) => (
                      <option key={d.customerCode} value={d.customerCode}>
                        {d.customerName} ({d.customerCode}) — Bal: {d.loyaltyBalance.toLocaleString()} Pts
                      </option>
                    ))}
                </select>
                {selectedDealer && (
                  <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500">
                    <span>Available: <strong>{selectedDealer.loyaltyBalance.toLocaleString()} Pts</strong></span>
                    <span>Min Threshold: <strong>{selectedDealer.minimumPointsForRedemption.toLocaleString()} Pts</strong></span>
                  </div>
                )}
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Points to Redeem *
                </label>
                <input
                  type="number"
                  step="100"
                  min="100"
                  max={selectedDealer?.loyaltyBalance}
                  value={pointsToRedeemInput}
                  onChange={(e) => setPointsToRedeemInput(e.target.value)}
                  className="w-full py-2 px-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-slate-900 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
                <div className="mt-1 text-[11px] text-indigo-600 font-medium">
                  Redemption Credit Memo Value: <strong>LKR {redeemValueLKR.toLocaleString("en-US", { minimumFractionDigits: 2 })}</strong> (1 pt = LKR 1.00)
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Apply Against Open A/R Invoice *
                </label>
                <select
                  value={selectedInvoiceNo}
                  onChange={(e) => setSelectedInvoiceNo(e.target.value)}
                  className="w-full py-2 px-3 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="INV-26-11488">INV-26-11488 (Open Bal: LKR 412,300.00)</option>
                  <option value="INV-26-11520">INV-26-11520 (Open Bal: LKR 320,000.00)</option>
                  <option value="INV-26-11802">INV-26-11802 (Open Bal: LKR 580,000.00)</option>
                  <option value="INV-26-11910">INV-26-11910 (Open Bal: LKR 145,000.00)</option>
                </select>
                <p className="text-[10px] text-slate-400 mt-1">
                  Per DS-08: Settlement against open invoices only. Cash refund or outgoing payment refund is strictly blocked.
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setShowModal(false)}
                  className="text-xs text-slate-600"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold"
                >
                  Submit for Approval
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
