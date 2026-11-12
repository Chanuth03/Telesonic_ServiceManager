import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useMemo, useEffect } from "react";
import {
  Sparkles,
  ArrowLeft,
  ArrowUpRight,
  Search,
  Filter,
  Layers,
  CheckCircle2,
  Trophy,
  History,
  FileSpreadsheet,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Toaster, toast } from "sonner";
import {
  loadLoyaltyState,
  saveLoyaltyState,
  StoredLoyaltyState,
  RedemptionRecord,
  LoyaltyManualAdjustment,
  LoyaltyLedgerEntry,
} from "@/lib/loyalty-data";
import { LOYALTY_SCREENS, LoyaltyScreenItem } from "@/lib/loyalty-screens-data";
import { LoyaltyScreenWorkspace } from "@/components/loyalty/LoyaltyScreenWorkspace";

export const Route = createFileRoute("/loyalty")({
  head: () => ({
    meta: [
      { title: "Loyalty Points Management — Servio ITSM" },
      {
        name: "description",
        content:
          "Telesonic Lanka Customer Loyalty Points Management: 12 SAP B1 Add-on screens, immutable ledger, redemptions against open invoices, and audit registers.",
      },
      { property: "og:title", content: "Loyalty Points Management — Servio ITSM" },
      {
        property: "og:description",
        content:
          "Telesonic Lanka Customer Loyalty Points Management: 12 SAP B1 Add-on screens, immutable ledger, redemptions against open invoices, and audit registers.",
      },
    ],
  }),
  component: LoyaltyModulePage,
});

function LoyaltyModulePage() {
  const [state, setState] = useState<StoredLoyaltyState>(() => loadLoyaltyState());
  const [selectedScreenId, setSelectedScreenId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  // Sync state to local storage
  useEffect(() => {
    saveLoyaltyState(state);
  }, [state]);

  // Sync with URL query parameter
  useEffect(() => {
    if (typeof window === "undefined") return;
    const syncFromUrl = () => {
      const params = new URLSearchParams(window.location.search);
      const screenParam = params.get("screen");
      setSelectedScreenId(screenParam);
    };

    syncFromUrl();
    window.addEventListener("popstate", syncFromUrl);
    return () => window.removeEventListener("popstate", syncFromUrl);
  }, []);

  const handleOpenScreen = (screenId: string) => {
    setSelectedScreenId(screenId);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("screen", screenId);
      window.history.pushState({}, "", url.toString());
    }
  };

  const handleBackToCatalog = () => {
    setSelectedScreenId(null);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.delete("screen");
      window.history.pushState({}, "", url.toString());
    }
  };

  // Filtered screens
  const filteredScreens = useMemo(() => {
    return LOYALTY_SCREENS.filter((screen) => {
      if (selectedCategory !== "All" && screen.category !== selectedCategory) {
        return false;
      }
      const q = searchQuery.toLowerCase().trim();
      return (
        !q ||
        screen.title.toLowerCase().includes(q) ||
        screen.description.toLowerCase().includes(q) ||
        screen.screenCode.toLowerCase().includes(q) ||
        screen.category.toLowerCase().includes(q)
      );
    });
  }, [searchQuery, selectedCategory]);

  const activeScreen = useMemo(() => {
    if (!selectedScreenId) return null;
    return LOYALTY_SCREENS.find((s) => s.id === selectedScreenId) || null;
  }, [selectedScreenId]);

  // Actions for Redemptions
  const handleApproveRedemption = (redemptionNo: string) => {
    setState((prev) => {
      const updatedRedemptions = prev.redemptions.map((r) => {
        if (r.redemptionNo === redemptionNo) {
          return {
            ...r,
            status: "Approved" as const,
            approvals: [
              ...r.approvals,
              {
                role: "Finance Officer",
                approver: "Finance Manager",
                decision: "Approved" as const,
                date: new Date().toISOString().split("T")[0],
              },
            ],
          };
        }
        return r;
      });
      return { ...prev, redemptions: updatedRedemptions };
    });
    toast.success(`Redemption request ${redemptionNo} approved! Ready to post A/R Credit Memo.`);
  };

  const handlePostCreditMemo = (redemptionNo: string) => {
    const target = state.redemptions.find((r) => r.redemptionNo === redemptionNo);
    if (!target) return;

    const creditMemoDocNo = `CM-26-00${Math.floor(100 + Math.random() * 900)}`;
    const ledgerEntryNo = `LL-2026-00${Math.floor(1000 + Math.random() * 9000)}`;

    const newLedgerEntry: LoyaltyLedgerEntry = {
      entryNo: ledgerEntryNo,
      customerCode: target.customerCode,
      customerName: target.customerName,
      date: new Date().toISOString().split("T")[0],
      period: "2026-05",
      entryType: "Redeem",
      docType: "Redemption",
      docNo: target.redemptionNo,
      baseDoc: creditMemoDocNo,
      points: -target.pointsToRedeem,
      runningBalance: target.balanceAfter,
      conversionRate: 1.0,
      valueLKR: target.redemptionValueLKR,
      reason: `Settled open invoice ${target.invoicesToSettle[0]?.invoiceNo || "N/A"}`,
      createdBy: "Finance (System Add-on)",
      approvedBy: "Head of Finance",
    };

    setState((prev) => {
      const updatedDealers = prev.dealers.map((d) => {
        if (d.customerCode === target.customerCode) {
          const newBal = d.loyaltyBalance - target.pointsToRedeem;
          return {
            ...d,
            loyaltyBalance: newBal,
            loyaltyValueLKR: newBal * 1.0,
            lastRedeemedDate: new Date().toISOString().split("T")[0],
          };
        }
        return d;
      });

      const updatedRedemptions = prev.redemptions.map((r) => {
        if (r.redemptionNo === redemptionNo) {
          return {
            ...r,
            status: "Posted" as const,
            creditMemoDocNo,
            loyaltyLedgerRef: ledgerEntryNo,
          };
        }
        return r;
      });

      return {
        ...prev,
        dealers: updatedDealers,
        redemptions: updatedRedemptions,
        ledger: [newLedgerEntry, ...prev.ledger],
      };
    });

    toast.success(
      `SAP A/R Credit Memo ${creditMemoDocNo} generated! Points deducted from ${target.customerName}. Excluded from sales commission.`
    );
  };

  const handleCancelRedemption = (redemptionNo: string) => {
    const target = state.redemptions.find((r) => r.redemptionNo === redemptionNo);
    if (!target) return;

    const reversalLedgerNo = `LL-2026-00${Math.floor(1000 + Math.random() * 9000)}`;

    const reversalEntry: LoyaltyLedgerEntry = {
      entryNo: reversalLedgerNo,
      customerCode: target.customerCode,
      customerName: target.customerName,
      date: new Date().toISOString().split("T")[0],
      period: "2026-05",
      entryType: "Reverse",
      docType: "Reversal",
      docNo: `${target.creditMemoDocNo || target.redemptionNo}-REV`,
      baseDoc: target.redemptionNo,
      points: target.pointsToRedeem,
      runningBalance: target.balanceAvailableBefore,
      reason: `Redemption cancellation reversal; restored ${target.pointsToRedeem} points.`,
      createdBy: "Finance (Audit Reversal)",
      reversedByEntry: target.loyaltyLedgerRef,
    };

    setState((prev) => {
      const updatedDealers = prev.dealers.map((d) => {
        if (d.customerCode === target.customerCode) {
          const restoredBal = d.loyaltyBalance + target.pointsToRedeem;
          return {
            ...d,
            loyaltyBalance: restoredBal,
            loyaltyValueLKR: restoredBal * 1.0,
          };
        }
        return d;
      });

      const updatedRedemptions = prev.redemptions.map((r) => {
        if (r.redemptionNo === redemptionNo) {
          return {
            ...r,
            status: "Cancelled" as const,
          };
        }
        return r;
      });

      return {
        ...prev,
        dealers: updatedDealers,
        redemptions: updatedRedemptions,
        ledger: [reversalEntry, ...prev.ledger],
      };
    });

    toast.info(`Redemption ${redemptionNo} cancelled. Points restored to customer account balance.`);
  };

  const handleCreateNewRedemption = (newRec: RedemptionRecord) => {
    setState((prev) => ({
      ...prev,
      redemptions: [newRec, ...prev.redemptions],
    }));
    toast.success(`Redemption request ${newRec.redemptionNo} created and submitted for Finance approval!`);
  };

  const handleCreateAdjustment = (newAdj: LoyaltyManualAdjustment) => {
    setState((prev) => ({
      ...prev,
      adjustments: [newAdj, ...prev.adjustments],
    }));
    toast.success(`Manual adjustment ${newAdj.adjustmentNo} submitted for dual sign-off!`);
  };

  const handleApproveAdjustment = (adjNo: string) => {
    const adj = state.adjustments.find((a) => a.adjustmentNo === adjNo);
    if (!adj) return;

    const deltaPoints = adj.type === "Addition" ? adj.points : -adj.points;
    const ledgerEntryNo = `LL-2026-00${Math.floor(1000 + Math.random() * 9000)}`;

    const dealer = state.dealers.find((d) => d.customerCode === adj.customerCode);
    const newBal = (dealer?.loyaltyBalance || 0) + deltaPoints;

    const newLedgerEntry: LoyaltyLedgerEntry = {
      entryNo: ledgerEntryNo,
      customerCode: adj.customerCode,
      customerName: adj.customerName,
      date: new Date().toISOString().split("T")[0],
      period: "2026-05",
      entryType: "Adjust",
      docType: "Manual Adjustment",
      docNo: adj.adjustmentNo,
      baseDoc: adj.referenceDoc,
      points: deltaPoints,
      runningBalance: newBal,
      reason: adj.reason,
      createdBy: "Finance (Adjustment Workflow)",
      approvedBy: "HOD Sales & Finance",
    };

    setState((prev) => {
      const updatedDealers = prev.dealers.map((d) => {
        if (d.customerCode === adj.customerCode) {
          return {
            ...d,
            loyaltyBalance: newBal,
            loyaltyValueLKR: newBal * 1.0,
          };
        }
        return d;
      });

      const updatedAdjs = prev.adjustments.map((a) => {
        if (a.adjustmentNo === adjNo) {
          return { ...a, status: "Posted" as const };
        }
        return a;
      });

      return {
        ...prev,
        dealers: updatedDealers,
        adjustments: updatedAdjs,
        ledger: [newLedgerEntry, ...prev.ledger],
      };
    });

    toast.success(`Adjustment ${adjNo} approved and posted to ledger.`);
  };

  // If a screen is selected, render the dedicated screen workspace view
  if (activeScreen) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col font-sans">
        <Toaster position="top-right" richColors />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full flex-1">
          <LoyaltyScreenWorkspace
            screen={activeScreen}
            state={state}
            onBack={handleBackToCatalog}
            onNavigateScreen={handleOpenScreen}
            onApproveRedemption={handleApproveRedemption}
            onPostCreditMemo={handlePostCreditMemo}
            onCancelRedemption={handleCancelRedemption}
            onCreateNewRedemption={handleCreateNewRedemption}
            onSaveSettings={(newSettings) => {
              setState((prev) => ({ ...prev, settings: newSettings }));
              toast.success("Settings updated successfully.");
            }}
            onApproveAdjustment={handleApproveAdjustment}
            onCreateAdjustment={handleCreateAdjustment}
          />
        </div>
      </div>
    );
  }

  // Otherwise, render the exact 12-tile screen catalog directory (matching the Incentive catalog style)
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col font-sans">
      <Toaster position="top-right" richColors />

      {/* Top Breadcrumb Nav */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-2 w-full">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Module Launcher</span>
        </Link>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 w-full flex-1 space-y-6">
        {/* Module Title Banner Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.05)] p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700 shadow-xs">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                  Customer Loyalty Points Management
                </h1>
                <p className="text-xs text-slate-500">
                  SAP Business One Add-on • Document Reference: TSL-LOY-DRS
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                onClick={() => handleOpenScreen("LOY-SCR-10")}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold"
              >
                Open Executive Dashboard
              </Button>
            </div>
          </div>

          {/* Search box & filter bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search screen modules by name, description or number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
            </div>

            <div className="text-xs text-slate-500">
              Showing {filteredScreens.length} of {LOYALTY_SCREENS.length} Screens
            </div>
          </div>

          {/* Categories pills */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-100">
            {[
              "All",
              "Master Data & Setup",
              "Sales & Point Earning",
              "Redemption & Adjustments",
              "Audit & Historical",
              "Portals & Service Integration",
            ].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  selectedCategory === cat
                    ? "bg-slate-900 text-white shadow-xs"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* 12-Screen Grid matching Incentive catalog aesthetic */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredScreens.map((screen) => {
            const Icon = screen.icon;
            return (
              <div
                key={screen.id}
                onClick={() => handleOpenScreen(screen.id)}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.05)] hover:shadow-md hover:border-indigo-300 transition-all flex flex-col justify-between group cursor-pointer"
              >
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center justify-center text-slate-700 group-hover:text-indigo-600 group-hover:bg-indigo-50/60 group-hover:border-indigo-200 transition-all">
                      <Icon className="w-5 h-5" />
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-600 transition-colors" />
                  </div>

                  <div className="space-y-1 mb-3">
                    <div className="text-[10px] font-mono font-bold text-indigo-700 uppercase tracking-wider">
                      {screen.screenCode}
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                      {screen.title}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {screen.description}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400 font-medium">{screen.category}</span>
                  <span className="font-semibold text-indigo-600 group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                    Open →
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
