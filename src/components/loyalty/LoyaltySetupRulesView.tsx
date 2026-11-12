import React, { useState } from "react";
import {
  FileText,
  Sliders,
  DollarSign,
  Layers,
  CheckCircle2,
  AlertCircle,
  Plus,
  Save,
  Tag,
  Clock,
  Settings,
} from "lucide-react";
import {
  LoyaltyPriceListItem,
  LoyaltySettingsConfig,
  LoyaltyManualAdjustment,
  DealerLoyaltyMaster,
} from "@/lib/loyalty-data";
import { Button } from "@/components/ui/button";

interface SetupProps {
  priceList: LoyaltyPriceListItem[];
  settings: LoyaltySettingsConfig;
  adjustments: LoyaltyManualAdjustment[];
  dealers: DealerLoyaltyMaster[];
  onSaveSettings: (settings: LoyaltySettingsConfig) => void;
  onApproveAdjustment: (adjNo: string) => void;
  onCreateAdjustment: (adj: LoyaltyManualAdjustment) => void;
}

export function LoyaltySetupRulesView({
  priceList,
  settings,
  adjustments,
  dealers,
  onSaveSettings,
  onApproveAdjustment,
  onCreateAdjustment,
}: SetupProps) {
  const [subTab, setSubTab] = useState<"pricelist" | "settings" | "adjustments">("pricelist");

  // Adjustment form state
  const [showAdjModal, setShowAdjModal] = useState(false);
  const [adjCustomer, setAdjCustomer] = useState(dealers[0]?.customerCode || "");
  const [adjType, setAdjType] = useState<"Addition" | "Deduction">("Addition");
  const [adjPoints, setAdjPoints] = useState("300");
  const [adjReason, setAdjReason] = useState("");
  const [adjRef, setAdjRef] = useState("");
  const [adjRemarks, setAdjRemarks] = useState("");

  const handleCreateAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    const dealer = dealers.find((d) => d.customerCode === adjCustomer);
    if (!dealer) return;

    const pointsNum = parseInt(adjPoints, 10) || 0;
    const newAdj: LoyaltyManualAdjustment = {
      adjustmentNo: `LA-2026-00${Math.floor(10 + Math.random() * 90)}`,
      customerCode: dealer.customerCode,
      customerName: dealer.customerName,
      date: new Date().toISOString().split("T")[0],
      type: adjType,
      points: pointsNum,
      reason: adjReason || "Audit manual adjustment",
      referenceDoc: adjRef || "N/A",
      remarks: adjRemarks || "Approved by supervisor",
      status: "Submitted",
      approvers: [
        { step: 1, role: "HOD Sales", approver: "Pending", decision: "Pending" },
        { step: 2, role: "Finance", approver: "Pending", decision: "Pending" },
      ],
    };

    onCreateAdjustment(newAdj);
    setShowAdjModal(false);
    setAdjReason("");
    setAdjRemarks("");
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.05)] p-5 space-y-5">
      {/* Subtab selection */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900">
              Loyalty Setup, Price List & Master Governance
            </h3>
            <span className="text-xs bg-slate-100 text-slate-700 font-medium px-2 py-0.5 rounded">
              LOY-SCR-02 / 03 / 08
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Configure unit-point calculations (capacity × 2.5), conversion rates, and audit manual adjustments.
          </p>
        </div>

        <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs">
          <button
            onClick={() => setSubTab("pricelist")}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              subTab === "pricelist"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Price List (LOY-SCR-02)
          </button>
          <button
            onClick={() => setSubTab("settings")}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              subTab === "settings"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Settings (LOY-SCR-03)
          </button>
          <button
            onClick={() => setSubTab("adjustments")}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              subTab === "adjustments"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Adjustments (LOY-SCR-08)
          </button>
        </div>
      </div>

      {/* Subtab 1: Price List */}
      {subTab === "pricelist" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-xs text-slate-500">
              Dedicated SAP B1 Price List: <strong>LP-01 Loyalty Points</strong> • Version: <strong>v2.0 (Active)</strong>
            </div>
            <div className="text-xs font-semibold text-indigo-600">
              Basis: Capacity × 2.5 (9,000 BTU × 2.5 = 225 LKR / pts)
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200/80">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[11px]">
                  <th className="py-2.5 px-3">Item Code</th>
                  <th className="py-2.5 px-3">Description</th>
                  <th className="py-2.5 px-3">Division</th>
                  <th className="py-2.5 px-3">Capacity / Spec</th>
                  <th className="py-2.5 px-3">Calculation Formula</th>
                  <th className="py-2.5 px-3 text-right">Points per Unit</th>
                  <th className="py-2.5 px-3">Status / Version</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {priceList.map((item) => (
                  <tr key={item.itemCode} className="hover:bg-slate-50/60">
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                      {item.itemCode}
                    </td>
                    <td className="py-2.5 px-3 font-medium text-slate-800">
                      {item.description}
                    </td>
                    <td className="py-2.5 px-3">{item.division}</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-600">
                      {item.capacityAttribute}
                    </td>
                    <td className="py-2.5 px-3 text-slate-500 font-mono">
                      {item.rateFormula}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-indigo-700">
                      {item.pointsPerUnit} Pts
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {item.status} ({item.version})
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Subtab 2: Settings */}
      {subTab === "settings" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/40 space-y-3">
              <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-indigo-600" />
                Valuation & Settlement Rules
              </h4>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Conversion Rate (LKR per point)
                </label>
                <input
                  type="number"
                  step="0.01"
                  readOnly
                  value={settings.conversionRateLKR}
                  className="w-full py-1.5 px-3 rounded-lg border border-slate-200 bg-white font-mono font-bold text-slate-900"
                />
                <span className="text-[10px] text-slate-400">
                  Fixed as LKR 1.00 per point per DS-08 specification (approved by Finance).
                </span>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Liability Accounting Method (SLFRS 15)
                </label>
                <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 font-medium">
                  {settings.liabilityAccountingMethod}
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/40 space-y-3">
              <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                <Settings className="w-4 h-4 text-indigo-600" />
                Redemption Document & Thresholds
              </h4>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Redemption Target Document
                </label>
                <div className="p-2 rounded-lg bg-white border border-slate-200 text-slate-800 font-mono font-medium">
                  {settings.redemptionDocumentType}
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Default Customer Groups Eligible
                </label>
                <div className="flex gap-2">
                  {settings.defaultEligibleGroups.map((g) => (
                    <span
                      key={g}
                      className="px-2.5 py-1 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-md font-semibold"
                    >
                      {g}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Points Expiry Policy
                </label>
                <div className="text-slate-600">
                  {settings.pointsExpiryPolicy} (Loyalty points do not expire currently)
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Subtab 3: Manual Adjustments */}
      {subTab === "adjustments" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-xs text-slate-500">
              Manual Adjustments Log (Strict audit trail with attachments and dual sign-off).
            </div>
            <Button
              size="sm"
              onClick={() => setShowAdjModal(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs"
            >
              <Plus className="w-4 h-4 mr-1" />
              New Manual Adjustment
            </Button>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200/80">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[11px]">
                  <th className="py-2.5 px-3">Adjustment #</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Customer</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3 text-right">Points</th>
                  <th className="py-2.5 px-3">Reason / Ref</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {adjustments.map((adj) => (
                  <tr key={adj.adjustmentNo} className="hover:bg-slate-50/60">
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                      {adj.adjustmentNo}
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap text-slate-500">
                      {adj.date}
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="font-semibold text-slate-900">{adj.customerName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{adj.customerCode}</div>
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold ${
                          adj.type === "Addition"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-rose-50 text-rose-700 border border-rose-200"
                        }`}
                      >
                        {adj.type}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                      {adj.type === "Addition" ? `+${adj.points}` : `-${adj.points}`} Pts
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="font-medium text-slate-800">{adj.reason}</div>
                      <div className="text-[10px] text-slate-400 font-mono">Ref: {adj.referenceDoc}</div>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                        {adj.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      {adj.status === "Submitted" ? (
                        <Button
                          size="sm"
                          onClick={() => onApproveAdjustment(adj.adjustmentNo)}
                          className="text-xs h-7 bg-indigo-600 hover:bg-indigo-700 text-white"
                        >
                          Approve
                        </Button>
                      ) : (
                        <span className="text-slate-400 text-[11px]">Completed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* New adjustment modal */}
          {showAdjModal && (
            <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h4 className="text-base font-bold text-slate-900">
                    Create Loyalty Adjustment (LOY-SCR-08)
                  </h4>
                  <button onClick={() => setShowAdjModal(false)} className="text-slate-400 text-sm">
                    ✕
                  </button>
                </div>

                <form onSubmit={handleCreateAdjustment} className="space-y-3 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Dealer</label>
                    <select
                      value={adjCustomer}
                      onChange={(e) => setAdjCustomer(e.target.value)}
                      className="w-full py-1.5 px-3 rounded-lg border border-slate-200"
                    >
                      {dealers.map((d) => (
                        <option key={d.customerCode} value={d.customerCode}>
                          {d.customerName} ({d.customerCode})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Type</label>
                      <select
                        value={adjType}
                        onChange={(e) => setAdjType(e.target.value as any)}
                        className="w-full py-1.5 px-3 rounded-lg border border-slate-200"
                      >
                        <option value="Addition">Addition (+)</option>
                        <option value="Deduction">Deduction (-)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Points</label>
                      <input
                        type="number"
                        value={adjPoints}
                        onChange={(e) => setAdjPoints(e.target.value)}
                        className="w-full py-1.5 px-3 rounded-lg border border-slate-200 font-mono font-bold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Reason</label>
                    <input
                      type="text"
                      placeholder="e.g. Retroactive invoice credit"
                      value={adjReason}
                      onChange={(e) => setAdjReason(e.target.value)}
                      className="w-full py-1.5 px-3 rounded-lg border border-slate-200"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Reference Doc</label>
                    <input
                      type="text"
                      placeholder="e.g. INV-26-10977"
                      value={adjRef}
                      onChange={(e) => setAdjRef(e.target.value)}
                      className="w-full py-1.5 px-3 rounded-lg border border-slate-200 font-mono"
                    />
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setShowAdjModal(false)}
                      className="text-xs"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs"
                    >
                      Submit Adjustment
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
