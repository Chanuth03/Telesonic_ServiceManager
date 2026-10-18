import React, { useState } from "react";
import {
  AlertTriangle,
  ShieldAlert,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Lock,
  Unlock,
  History,
  UserCheck,
  DollarSign,
  RefreshCw,
  FileText,
  ArrowRight,
  Filter,
  Search,
  Wrench,
  Clock,
  Sparkles,
} from "lucide-react";
import { ServiceRequestRecord, SAMPLE_SERVICE_REQUESTS } from "@/data/serviceRequestsSpecData";

interface RepeatDetectorHoldScreenProps {
  initialTicketId?: string | undefined;
  onNavigateToScreen?: ((screenId: string, contextId?: string) => void) | undefined;
}

export const RepeatDetectorHoldScreen: React.FC<RepeatDetectorHoldScreenProps> = ({
  initialTicketId,
  onNavigateToScreen,
}) => {
  const [requests, setRequests] = useState<ServiceRequestRecord[]>(SAMPLE_SERVICE_REQUESTS);
  const [activeSubView, setActiveSubView] = useState<"repeat" | "hold">("repeat");
  const [detectionWindow, setDetectionWindow] = useState<"30" | "60" | "90">("30");
  const [selectedTicketId, setSelectedTicketId] = useState<string>(
    initialTicketId ||
      SAMPLE_SERVICE_REQUESTS.find((r) => r.repeatFlag?.isRepeat)?.id ||
      SAMPLE_SERVICE_REQUESTS[0]!.id,
  );

  // Supervisor override modal state
  const [isOverrideModalOpen, setIsOverrideModalOpen] = useState(false);
  const [overrideSupervisor, setOverrideSupervisor] = useState(
    "Dammika Ranatunga (Service Director)",
  );
  const [overrideReasonCode, setOverrideReasonCode] = useState("CRITICAL_FACILITY_EXCEPTION");
  const [overrideNotes, setOverrideNotes] = useState(
    "Exception granted for production uptime. Customer promised RTGS payment slip by 4:00 PM.",
  );

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isVerifyingB1, setIsVerifyingB1] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const currentReq = requests.find((r) => r.id === selectedTicketId) ?? requests[0]!;

  const handleResolveHoldWithB1 = () => {
    setIsVerifyingB1(true);
    setTimeout(() => {
      setIsVerifyingB1(false);
      const updated = requests.map((r) => {
        if (r.id === currentReq.id) {
          return {
            ...r,
            status: "Assigned" as const,
            commercial: {
              ...r.commercial,
              billingHold: false,
              creditStatus: "Normal" as const,
            },
            holdDetails: undefined,
          };
        }
        return r;
      });
      setRequests(updated);
      showToast(
        `⇄ SAP B1 Credit Check Verified: Hold removed on ${currentReq.id}. Ticket transitioned to Assigned queue.`,
      );
    }, 1000);
  };

  const handleApplySupervisorOverride = () => {
    const updated = requests.map((r) => {
      if (r.id === currentReq.id) {
        return {
          ...r,
          status: "In Triage" as const,
          commercial: {
            ...r.commercial,
            billingHold: false,
          },
          holdDetails: r.holdDetails
            ? {
                ...r.holdDetails,
                isOnHold: false,
                overrideBy: overrideSupervisor,
                overrideJustification: `${overrideReasonCode}: ${overrideNotes}`,
              }
            : undefined,
        };
      }
      return r;
    });
    setRequests(updated);
    setIsOverrideModalOpen(false);
    showToast(
      `Supervisor Override Approved by ${overrideSupervisor}. Ticket ${currentReq.id} released for dispatch.`,
    );
  };

  const handleAcknowledgeRepeat = (isFreeRework: boolean) => {
    showToast(
      isFreeRework
        ? `Marked ${currentReq.id} as 30-Day Service Guarantee Free Rework (Zero Billing to Customer, Callback Audit Logged)`
        : `Marked ${currentReq.id} as Billable Repeat Call (Different Sub-Component / Operating Misuse)`,
    );
  };

  const repeatTickets = requests.filter((r) => r.repeatFlag?.isRepeat);
  const onHoldTickets = requests.filter((r) => r.status === "On Hold" || r.commercial.billingHold);

  return (
    <div className="space-y-4">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-emerald-700 text-white px-4 py-3 rounded-lg shadow-xl text-sm font-medium animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-200" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Screen Title & Specification Header */}
      <div className="bg-card border border-border rounded-xl p-4 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <RotateCcw className="w-5 h-5 text-amber-500" />
              <span>Repeat Service Detector and Hold Resolution Screen</span>
            </h2>
          </div>

          {/* Toggle between Repeat Detection vs Hold Resolution */}
          <div className="flex items-center gap-1.5 p-1 bg-muted rounded-xl border border-border">
            <button
              onClick={() => setActiveSubView("repeat")}
              className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                activeSubView === "repeat"
                  ? "bg-background text-foreground shadow-xs font-bold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-500" />
              <span>Repeat Detector ({repeatTickets.length})</span>
            </button>
            <button
              onClick={() => setActiveSubView("hold")}
              className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                activeSubView === "hold"
                  ? "bg-background text-foreground shadow-xs font-bold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Lock className="w-3.5 h-3.5 text-destructive" />
              <span>Hold Resolution Center ({onHoldTickets.length})</span>
            </button>
          </div>
        </div>

        {/* Global Controls & Filter Bar */}
        <div className="mt-3 pt-3 border-t border-border flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-muted-foreground">Select Incident / Request:</span>
            <select
              value={selectedTicketId}
              onChange={(e) => setSelectedTicketId(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-border bg-background text-foreground font-semibold cursor-pointer"
            >
              {requests.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.id}: {r.customer.cardName.slice(0, 20)}{" "}
                  {r.repeatFlag?.isRepeat ? "⚠️ (Repeat)" : ""}{" "}
                  {r.commercial.billingHold ? "🔒 (On Hold)" : ""}
                </option>
              ))}
            </select>
          </div>

          {activeSubView === "repeat" && (
            <div className="flex items-center gap-2">
              <span className="font-semibold text-muted-foreground">
                Detection Threshold Window:
              </span>
              {(["30", "60", "90"] as const).map((days) => (
                <button
                  key={days}
                  onClick={() => setDetectionWindow(days)}
                  className={`px-2.5 py-1 rounded-md font-bold text-xs transition-colors cursor-pointer border ${
                    detectionWindow === days
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background text-muted-foreground border-border hover:bg-muted"
                  }`}
                >
                  {days} Days
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* VIEW 1: REPEAT SERVICE DETECTOR */}
      {activeSubView === "repeat" && (
        <div className="space-y-4">
          {/* Repeat Detection Summary Card */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-8 space-y-4">
              <div className="bg-card border border-border rounded-xl p-4 shadow-xs">
                <div className="flex items-center justify-between border-b border-border pb-3 mb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <h3 className="text-sm font-bold text-foreground">
                      Automated Repeat Match Evaluation on {currentReq.id}
                    </h3>
                  </div>
                </div>

                {currentReq.repeatFlag?.isRepeat ? (
                  <div className="space-y-4 text-xs">
                    <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-amber-900 dark:text-amber-200 text-sm flex items-center gap-1.5">
                          <AlertTriangle className="w-4 h-4 text-amber-600" />
                          <span>Same Equipment Serial: {currentReq.equipment.serialNo}</span>
                        </span>
                        <span className="font-mono text-xs font-bold text-amber-900 dark:text-amber-200">
                          Prior Ticket: {currentReq.repeatFlag.previousTicketId}
                        </span>
                      </div>
                      <p className="text-amber-800 dark:text-amber-300 text-xs">
                        This unit was serviced only{" "}
                        <span className="font-bold underline">11 days ago</span> by technician{" "}
                        <span className="font-bold">{currentReq.repeatFlag.previousTechName}</span>.
                        The symptom reported then was identical:{" "}
                        <span className="font-semibold italic">
                          "{currentReq.repeatFlag.previousResolution}"
                        </span>
                        .
                      </p>
                    </div>

                    {/* Comparison Grid: Current vs Previous */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="p-3 rounded-xl border border-border bg-background space-y-2">
                        <div className="font-bold text-foreground text-xs pb-1 border-b border-border flex items-center justify-between">
                          <span>Current Service Incident</span>
                          <span className="font-mono text-primary font-bold">{currentReq.id}</span>
                        </div>
                        <div className="text-[11px] space-y-1">
                          <div>
                            <span className="text-muted-foreground">Logged:</span>{" "}
                            {currentReq.createdAt}
                          </div>
                          <div>
                            <span className="text-muted-foreground">Reported:</span>{" "}
                            {currentReq.fault.symptom}
                          </div>
                          <div>
                            <span className="text-muted-foreground">Error Code:</span>{" "}
                            {currentReq.fault.errorCode || "None"}
                          </div>
                          <div>
                            <span className="text-muted-foreground">Hypothesis:</span>{" "}
                            {currentReq.fault.preliminaryRootCause}
                          </div>
                        </div>
                      </div>

                      <div className="p-3 rounded-xl border border-border bg-muted/30 space-y-2">
                        <div className="font-bold text-foreground text-xs pb-1 border-b border-border flex items-center justify-between">
                          <span>Previous Service Incident</span>
                          <span className="font-mono text-muted-foreground font-bold">
                            {currentReq.repeatFlag.previousTicketId}
                          </span>
                        </div>
                        <div className="text-[11px] space-y-1">
                          <div>
                            <span className="text-muted-foreground">Closed Date:</span>{" "}
                            {currentReq.repeatFlag.previousTicketDate}
                          </div>
                          <div>
                            <span className="text-muted-foreground">Technician:</span>{" "}
                            {currentReq.repeatFlag.previousTechName}
                          </div>
                          <div>
                            <span className="text-muted-foreground">Action Taken:</span>{" "}
                            {currentReq.repeatFlag.previousResolution}
                          </div>
                          <div>
                            <span className="text-muted-foreground">Parts Billed:</span> None (Fin
                            Wash)
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Quality & Rework Governance Decision */}
                    <div className="p-3.5 rounded-xl border border-border bg-card space-y-3">
                      <h4 className="font-bold text-foreground text-xs uppercase tracking-wide">
                        Quality Assurance & Rework Determination (Rule BCR-08)
                      </h4>
                      <p className="text-muted-foreground text-xs">
                        Under Telesonic Lanka 30-Day Service Guarantee, a repeat breakdown on the
                        same subsystem within 30 days is categorized as a{" "}
                        <span className="font-semibold text-foreground">Technician Callback</span>{" "}
                        and must be provided at no extra labour charge.
                      </p>
                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        <button
                          onClick={() => handleAcknowledgeRepeat(true)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors cursor-pointer flex items-center gap-1.5"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Approve 30-Day Free Rework (Zero Billing)</span>
                        </button>
                        <button
                          onClick={() => handleAcknowledgeRepeat(false)}
                          className="px-3 py-1.5 rounded-lg border border-border bg-background hover:bg-muted text-foreground font-semibold text-xs transition-colors cursor-pointer"
                        >
                          Classify as New Billable Defect (Component Wear)
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-8 text-center text-xs text-muted-foreground space-y-2">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                    <p className="font-medium text-foreground">
                      No repeat incident found within the past {detectionWindow} days.
                    </p>
                    <p>
                      This equipment serial has no prior service jobs recorded within the active
                      detection window.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Repeat Service Register & Trends (Col 4) */}
            <div className="lg:col-span-4 space-y-4">
              <div className="bg-card border border-border rounded-xl p-4 shadow-xs">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2 border-b border-border pb-2.5 mb-3">
                  <History className="w-4 h-4 text-primary" />
                  <span>Repeat Service Incidents ({repeatTickets.length})</span>
                </h3>

                <div className="space-y-2.5">
                  {repeatTickets.map((t) => (
                    <div
                      key={t.id}
                      onClick={() => setSelectedTicketId(t.id)}
                      className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                        selectedTicketId === t.id
                          ? "border-primary bg-primary/5 ring-1 ring-primary"
                          : "border-border bg-background hover:bg-muted/50"
                      }`}
                    >
                      <div className="flex items-center justify-between font-bold text-foreground mb-1">
                        <span className="font-mono text-primary">{t.id}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-700 dark:text-amber-400">
                          {t.repeatFlag?.repeatScore}% Match
                        </span>
                      </div>
                      <div className="font-medium text-foreground text-[11px] truncate">
                        {t.customer.cardName}
                      </div>
                      <div className="text-muted-foreground text-[10px] mt-0.5">
                        Serial: {t.equipment.serialNo} · Prior: {t.repeatFlag?.previousTicketId}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: HOLD MANAGEMENT & RESOLUTION CENTER */}
      {activeSubView === "hold" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Left Column: Active Holds List (Col 5) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-card border border-border rounded-xl p-4 shadow-xs">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2 border-b border-border pb-2.5 mb-3">
                  <Lock className="w-4 h-4 text-destructive" />
                  <span>Active Commercial & Technical Holds</span>
                </h3>

                <div className="space-y-2.5">
                  {onHoldTickets.map((t) => (
                    <div
                      key={t.id}
                      onClick={() => setSelectedTicketId(t.id)}
                      className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                        selectedTicketId === t.id
                          ? "border-destructive bg-destructive/5 ring-1 ring-destructive"
                          : "border-border bg-background hover:bg-muted/50"
                      }`}
                    >
                      <div className="flex items-center justify-between font-bold mb-1">
                        <span className="font-mono text-destructive">{t.id}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-destructive/15 text-destructive">
                          {t.holdDetails?.holdReasonCode || "CREDIT_HOLD"}
                        </span>
                      </div>
                      <div className="font-semibold text-foreground text-xs">
                        {t.customer.cardName}
                      </div>
                      <div className="text-[11px] text-muted-foreground mt-1">
                        Overdue:{" "}
                        <span className="font-mono font-bold text-destructive">
                          LKR {t.commercial.overdueAmountLKR.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Hold Resolution Workflow (Col 7) */}
            <div className="lg:col-span-7 space-y-4">
              <div className="bg-card border border-border rounded-xl p-4 shadow-xs">
                <div className="flex items-center justify-between border-b border-border pb-2.5 mb-3">
                  <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                    <Unlock className="w-4 h-4 text-emerald-600" />
                    <span>Hold Resolution & Override for {currentReq.id}</span>
                  </h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-destructive/15 text-destructive">
                    Status: {currentReq.commercial.billingHold ? "Locked / On Hold" : "Released"}
                  </span>
                </div>

                <div className="space-y-4 text-xs">
                  {/* Hold Reason Banner */}
                  <div className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 space-y-1.5">
                    <div className="font-bold text-destructive text-sm flex items-center gap-1.5">
                      <ShieldAlert className="w-4 h-4" />
                      <span>
                        {currentReq.holdDetails?.holdReasonLabel ||
                          "SAP B1 Credit Limit Exceeded & Overdue AR Invoices"}
                      </span>
                    </div>
                    <p className="text-destructive/90 text-xs">
                      {currentReq.commercial.billingHoldReason ||
                        "Automated rule BCR-04 locked this service request because the customer has overdue invoices over 45 days."}
                    </p>
                  </div>

                  {/* Financial Breakdown */}
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="p-2.5 rounded-lg border border-border bg-muted/40">
                      <span className="text-[10px] text-muted-foreground block">Credit Limit:</span>
                      <span className="font-mono font-bold text-foreground">
                        LKR {currentReq.commercial.creditLimitLKR.toLocaleString()}
                      </span>
                    </div>
                    <div className="p-2.5 rounded-lg border border-border bg-muted/40">
                      <span className="text-[10px] text-muted-foreground block">
                        Current Outstanding:
                      </span>
                      <span className="font-mono font-bold text-foreground">
                        LKR {currentReq.commercial.currentBalanceLKR.toLocaleString()}
                      </span>
                    </div>
                    <div className="p-2.5 rounded-lg border border-destructive/30 bg-destructive/5">
                      <span className="text-[10px] text-destructive block">Overdue Invoices:</span>
                      <span className="font-mono font-bold text-destructive">
                        LKR {currentReq.commercial.overdueAmountLKR.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Actions to Clear Hold */}
                  <div className="p-3.5 rounded-xl border border-border bg-card space-y-3">
                    <h4 className="font-bold text-foreground text-xs uppercase tracking-wide">
                      Resolution Methods
                    </h4>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-2.5 rounded-lg border border-border bg-background">
                        <div>
                          <div className="font-semibold text-foreground text-xs">
                            1. Query SAP B1 for Cleared Payment
                          </div>
                          <div className="text-muted-foreground text-[11px]">
                            Check if accounts department has posted receipt in SAP B1.
                          </div>
                        </div>
                        <button
                          onClick={handleResolveHoldWithB1}
                          disabled={isVerifyingB1}
                          className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs transition-colors cursor-pointer flex items-center gap-1.5 shrink-0"
                        >
                          <RefreshCw
                            className={`w-3.5 h-3.5 ${isVerifyingB1 ? "animate-spin" : ""}`}
                          />
                          <span>{isVerifyingB1 ? "Querying..." : "Verify SAP B1"}</span>
                        </button>
                      </div>

                      <div className="flex items-center justify-between p-2.5 rounded-lg border border-border bg-background">
                        <div>
                          <div className="font-semibold text-foreground text-xs">
                            2. Authorised Supervisor Override
                          </div>
                          <div className="text-muted-foreground text-[11px]">
                            Managerial exception for mission-critical client equipment.
                          </div>
                        </div>
                        <button
                          onClick={() => setIsOverrideModalOpen(true)}
                          className="px-3 py-1.5 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs transition-colors cursor-pointer shrink-0"
                        >
                          Supervisor Override
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Supervisor Override Modal */}
      {isOverrideModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-xl max-w-md w-full p-5 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-bold text-foreground text-sm flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-primary" />
                <span>Authorised Supervisor Hold Override</span>
              </h3>
              <button
                onClick={() => setIsOverrideModalOpen(false)}
                className="text-muted-foreground hover:text-foreground cursor-pointer text-xs"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[11px] font-medium text-muted-foreground mb-1 block">
                  Authorising Manager *
                </label>
                <select
                  value={overrideSupervisor}
                  onChange={(e) => setOverrideSupervisor(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded border border-border bg-background text-foreground font-medium"
                >
                  <option value="Dammika Ranatunga (Service Director)">
                    Dammika Ranatunga (Service Director)
                  </option>
                  <option value="Kamal Jayasuriya (Commercial Operations Manager)">
                    Kamal Jayasuriya (Commercial Operations Manager)
                  </option>
                  <option value="Rohan Wickramasinghe (General Manager - Service)">
                    Rohan Wickramasinghe (General Manager - Service)
                  </option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-medium text-muted-foreground mb-1 block">
                  Override Reason Code *
                </label>
                <select
                  value={overrideReasonCode}
                  onChange={(e) => setOverrideReasonCode(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded border border-border bg-background text-foreground font-medium"
                >
                  <option value="CRITICAL_FACILITY_EXCEPTION">
                    Critical Facility Uptime (Hospital / Data Center / Cold Chain)
                  </option>
                  <option value="PROMISED_BANK_TRANSFER">
                    Promised RTGS / Bank Transfer within 24 Hours
                  </option>
                  <option value="DISPUTED_INVOICE_UNDER_REVIEW">
                    Disputed Old Invoice Under Commercial Review
                  </option>
                  <option value="DIRECTOR_VIP_APPROVAL">
                    Director Board VIP Relationship Approval
                  </option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-medium text-muted-foreground mb-1 block">
                  Justification Note & Audit Remark *
                </label>
                <textarea
                  rows={3}
                  value={overrideNotes}
                  onChange={(e) => setOverrideNotes(e.target.value)}
                  className="w-full p-2 rounded border border-border bg-background text-foreground focus:ring-1 focus:ring-primary focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-2 border-t border-border flex justify-end gap-2">
              <button
                onClick={() => setIsOverrideModalOpen(false)}
                className="px-3 py-1.5 rounded-lg border border-border bg-background text-foreground text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleApplySupervisorOverride}
                className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-colors cursor-pointer"
              >
                Sign & Authorise Release
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
