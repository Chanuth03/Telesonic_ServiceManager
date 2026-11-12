import React from "react";
import { type LoyaltyScreenItem, LOYALTY_SCREENS } from "@/lib/loyalty-screens-data";
import { StoredLoyaltyState, RedemptionRecord, LoyaltyManualAdjustment } from "@/lib/loyalty-data";
import { Screen01CustomerMaster } from "@/components/loyalty/screens/Screen01CustomerMaster";
import { Screen04ARInvoice } from "@/components/loyalty/screens/Screen04ARInvoice";
import { Screen05ARCreditMemo } from "@/components/loyalty/screens/Screen05ARCreditMemo";
import { Screen09OpeningBalanceImport } from "@/components/loyalty/screens/Screen09OpeningBalanceImport";
import { Screen11PortalMyLoyaltyPoints } from "@/components/loyalty/screens/Screen11PortalMyLoyaltyPoints";
import { Screen12ServiceManagerLoyaltyPanel } from "@/components/loyalty/screens/Screen12ServiceManagerLoyaltyPanel";
import { LoyaltySetupRulesView } from "@/components/loyalty/LoyaltySetupRulesView";
import { LoyaltyRedemptionsView } from "@/components/loyalty/LoyaltyRedemptionsView";
import { LoyaltyLedgerTable } from "@/components/loyalty/LoyaltyLedgerTable";
import { LoyaltyDashboardAnalytics } from "@/components/loyalty/LoyaltyDashboardAnalytics";
import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight, Layers, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ScreenWorkspaceProps {
  screen: LoyaltyScreenItem;
  state: StoredLoyaltyState;
  onBack: () => void;
  onNavigateScreen: (screenId: string) => void;
  onApproveRedemption: (redemptionNo: string) => void;
  onPostCreditMemo: (redemptionNo: string) => void;
  onCancelRedemption: (redemptionNo: string) => void;
  onCreateNewRedemption: (newRec: RedemptionRecord) => void;
  onSaveSettings: (settings: any) => void;
  onApproveAdjustment: (adjNo: string) => void;
  onCreateAdjustment: (adj: LoyaltyManualAdjustment) => void;
}

export function LoyaltyScreenWorkspace({
  screen,
  state,
  onBack,
  onNavigateScreen,
  onApproveRedemption,
  onPostCreditMemo,
  onCancelRedemption,
  onCreateNewRedemption,
  onSaveSettings,
  onApproveAdjustment,
  onCreateAdjustment,
}: ScreenWorkspaceProps) {
  const currentIndex = LOYALTY_SCREENS.findIndex((s) => s.id === screen.id);
  const prevScreen = currentIndex > 0 ? LOYALTY_SCREENS[currentIndex - 1] : null;
  const nextScreen = currentIndex < LOYALTY_SCREENS.length - 1 ? LOYALTY_SCREENS[currentIndex + 1] : null;

  const renderActiveScreenContent = () => {
    switch (screen.id) {
      case "LOY-SCR-01":
        return (
          <Screen01CustomerMaster
            dealers={state.dealers}
            ledger={state.ledger}
            onOpenLedger={() => onNavigateScreen("LOY-SCR-07")}
            onOpenRedeem={() => onNavigateScreen("LOY-SCR-06")}
          />
        );

      case "LOY-SCR-02":
      case "LOY-SCR-03":
      case "LOY-SCR-08":
        return (
          <LoyaltySetupRulesView
            priceList={state.priceList}
            settings={state.settings}
            adjustments={state.adjustments}
            dealers={state.dealers}
            onSaveSettings={onSaveSettings}
            onApproveAdjustment={onApproveAdjustment}
            onCreateAdjustment={onCreateAdjustment}
          />
        );

      case "LOY-SCR-04":
        return <Screen04ARInvoice />;

      case "LOY-SCR-05":
        return <Screen05ARCreditMemo />;

      case "LOY-SCR-06":
        return (
          <LoyaltyRedemptionsView
            redemptions={state.redemptions}
            dealers={state.dealers}
            onApproveRedemption={onApproveRedemption}
            onPostCreditMemo={onPostCreditMemo}
            onCancelRedemption={onCancelRedemption}
            onCreateNewRedemption={onCreateNewRedemption}
          />
        );

      case "LOY-SCR-07":
        return <LoyaltyLedgerTable ledger={state.ledger} />;

      case "LOY-SCR-09":
        return <Screen09OpeningBalanceImport />;

      case "LOY-SCR-10":
        return (
          <LoyaltyDashboardAnalytics
            dealers={state.dealers}
            ledger={state.ledger}
            redemptions={state.redemptions}
            onSelectCustomer={() => onNavigateScreen("LOY-SCR-07")}
            onNavigateTab={(tab) => {
              if (tab === "redemptions") onNavigateScreen("LOY-SCR-06");
              else if (tab === "dealers") onNavigateScreen("LOY-SCR-01");
            }}
          />
        );

      case "LOY-SCR-11":
        return <Screen11PortalMyLoyaltyPoints />;

      case "LOY-SCR-12":
        return <Screen12ServiceManagerLoyaltyPanel />;

      default:
        return (
          <div className="bg-white rounded-2xl p-8 text-center text-slate-500">
            Screen View {screen.id}
          </div>
        );
    }
  };

  return (
    <div className="space-y-5">
      {/* Top Breadcrumb & Next/Prev Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 h-8"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            All 12 Screens
          </Button>

          <span className="text-slate-300">/</span>

          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
              {screen.screenCode}
            </span>
            <span className="text-xs font-bold text-slate-800">{screen.title}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {prevScreen && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigateScreen(prevScreen.id)}
              className="text-xs h-8 border-slate-200"
            >
              <ChevronLeft className="w-3.5 h-3.5 mr-1" />
              Prev ({prevScreen.screenCode})
            </Button>
          )}

          {nextScreen && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigateScreen(nextScreen.id)}
              className="text-xs h-8 border-slate-200"
            >
              Next ({nextScreen.screenCode})
              <ChevronRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          )}
        </div>
      </div>

      {/* Render the Active Screen Component */}
      <div>{renderActiveScreenContent()}</div>
    </div>
  );
}
