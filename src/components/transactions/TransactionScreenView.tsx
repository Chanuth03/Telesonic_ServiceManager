import React, { useState, useMemo } from "react";
import {
  ArrowLeft,
  Download,
  History,
  Info,
  Check,
  RefreshCw,
  FileText,
  Calendar,
  Clock,
  Video,
  UserCheck,
  CheckCircle2,
  AlertCircle,
  Building2,
  ExternalLink,
  PauseCircle,
  PlayCircle,
  Printer,
  Sliders,
  DollarSign,
  Layers,
  Send,
  FileSpreadsheet,
  Plus,
  Trash2,
  Save,
  RotateCcw,
  Sparkles,
  Package,
} from "lucide-react";
import { TransactionScreenMeta } from "@/data/transactionsSpecData";
import { TransactionField } from "./TransactionField";
import { TransactionAuditModal } from "./TransactionAuditModal";
import { TransactionExportModal } from "./TransactionExportModal";
import { AddPartModal } from "@/components/common/AddPartModal";
import {
  loadSavedFormData,
  saveFormData,
  loadSavedTabData,
  saveTabData,
} from "@/data/sparePartsCatalog";

interface TransactionScreenViewProps {
  meta: TransactionScreenMeta;
  onBack: () => void;
  onNavigateToScreen?: (screenId: string) => void;
}

export const TransactionScreenView: React.FC<TransactionScreenViewProps> = ({
  meta,
  onBack,
  onNavigateToScreen,
}) => {
  const storageKey = `telesonic_trx_${meta.code}`;

  // Persisted form data state
  const [formData, setFormData] = useState<Record<string, unknown>>(() =>
    loadSavedFormData(storageKey, meta.sampleRecord),
  );

  const [activeTabId, setActiveTabId] = useState<string>(meta.tabs[0]?.id || "");
  const [isAuditOpen, setIsAuditOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isAddPartModalOpen, setIsAddPartModalOpen] = useState(false);
  const [showSpecDetails, setShowSpecDetails] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [b1Syncing, setB1Syncing] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(() => {
    try {
      return localStorage.getItem(`${storageKey}_last_saved`) || null;
    } catch {
      return null;
    }
  });

  // Tab datasets with persistent state
  const [tabDatasets, setTabDatasets] = useState<Record<string, Array<Record<string, unknown>>>>(
    () => {
      const initial: Record<string, Array<Record<string, unknown>>> = {};
      meta.tabs.forEach((tab) => {
        initial[tab.id] = loadSavedTabData(
          storageKey,
          tab.id,
          tab.data as Array<Record<string, unknown>>,
        );
      });
      return initial;
    },
  );

  // Specialized interactive states
  const [blindCountActive, setBlindCountActive] = useState(
    meta.code === "TRX-30" ? Boolean(formData["blindCount"] === "Yes") : false,
  );
  const [evalScore, setEvalScore] = useState(
    meta.code === "TRX-23" ? Number(formData["totalScore"] || 94) : 94,
  );
  const [evalNotRequired, setEvalNotRequired] = useState(false);
  const [meetLinkGenerated, setMeetLinkGenerated] = useState(
    meta.code === "TRX-04" && formData["googleMeetLinkRequired"] === "Yes",
  );

  const activeTab = meta.tabs.find((t) => t.id === activeTabId) || meta.tabs[0];
  const currentTabData = useMemo(() => {
    return (activeTab ? tabDatasets[activeTab.id] : []) || [];
  }, [activeTab, tabDatasets]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleFieldChange = (key: string, val: unknown) => {
    setFormData((prev) => {
      const next = { ...prev, [key]: val };
      saveFormData(storageKey, next);
      return next;
    });
  };

  // Add Part / Row Line
  const handleSavePart = (row: Record<string, unknown>) => {
    if (!activeTab) return;
    const tabId = activeTab.id;
    const updated = [row, ...(tabDatasets[tabId] || [])];
    setTabDatasets((prev) => ({ ...prev, [tabId]: updated }));
    saveTabData(storageKey, tabId, updated);

    // Save timestamp
    const now = new Date().toLocaleTimeString();
    setLastSavedTime(now);
    try {
      localStorage.setItem(`${storageKey}_last_saved`, now);
    } catch {
      // localStorage may be unavailable in private browsing
    }

    const partName = String(row.item || row.itemCode || row.description || "Part");
    showToast(`Spare Part "${partName}" saved and added to ${activeTab.label}!`);
  };

  // Delete line item
  const handleDeleteRow = (index: number) => {
    if (!activeTab) return;
    const tabId = activeTab.id;
    const updated = (tabDatasets[tabId] || []).filter((_, i) => i !== index);
    setTabDatasets((prev) => ({ ...prev, [tabId]: updated }));
    saveTabData(storageKey, tabId, updated);
    showToast("Line item removed from register.");
  };

  // Reset tab to default spec data
  const handleResetTab = () => {
    if (!activeTab) return;
    const original = activeTab.data as Array<Record<string, unknown>>;
    setTabDatasets((prev) => ({ ...prev, [activeTab.id]: original }));
    saveTabData(storageKey, activeTab.id, original);
    showToast(`Reset ${activeTab.label} to original specification dataset.`);
  };

  // Save full transaction
  const handleSaveTransaction = () => {
    saveFormData(storageKey, formData);
    meta.tabs.forEach((tab) => {
      if (tabDatasets[tab.id]) {
        saveTabData(storageKey, tab.id, tabDatasets[tab.id]);
      }
    });
    const now = new Date().toLocaleTimeString();
    setLastSavedTime(now);
    try {
      localStorage.setItem(`${storageKey}_last_saved`, now);
    } catch {
      // localStorage may be unavailable in private browsing
    }
    showToast(
      `Transaction ${currentRecordRef} saved successfully with ${currentTabData.length} line items.`,
    );
  };

  // Create new blank record for demo
  const handleCreateNewBlank = () => {
    const blank: Record<string, unknown> = {};
    meta.fields.forEach((f) => {
      if (f.key === meta.fields[0]?.key) {
        blank[f.key] = `${meta.code}-NEW-${Math.floor(1000 + Math.random() * 9000)}`;
      } else if (f.key === "status") {
        blank[f.key] = "Draft / Pending";
      } else {
        blank[f.key] = "";
      }
    });
    setFormData(blank);
    saveFormData(storageKey, blank);

    // Clear active tab data
    if (activeTab) {
      setTabDatasets((prev) => ({ ...prev, [activeTab.id]: [] }));
      saveTabData(storageKey, activeTab.id, []);
    }
    showToast(
      `Initialized fresh blank record for ${meta.code}. You can now enter details and add parts!`,
    );
  };

  const handleAction = (action: string) => {
    if (action.includes("History") || action.includes("Audit")) {
      setIsAuditOpen(true);
      return;
    }
    if (action.includes("Export")) {
      setIsExportOpen(true);
      return;
    }
    if (
      action.includes("SAP") ||
      action.includes("Post to SAP") ||
      action.includes("Refresh SAP")
    ) {
      setB1Syncing(true);
      setTimeout(() => {
        setB1Syncing(false);
        showToast("⇄ SAP Business One DI Server API: Real-time synchronization completed.");
      }, 750);
      return;
    }
    if (action.includes("Print")) {
      window.print();
      return;
    }
    if (action.includes("Save") || action.includes("Update")) {
      handleSaveTransaction();
      return;
    }
    if (action.includes("Hold")) {
      handleFieldChange("status", "On Hold");
      showToast(`Call placed On Hold. SLA timer suspended pending customer confirmation.`);
      return;
    }
    if (action.includes("Resume")) {
      handleFieldChange("status", "In Progress");
      showToast(`Call resumed into active triage. SLA clock reactivated.`);
      return;
    }
    if (action.includes("Approve")) {
      handleFieldChange("status", "Approved");
      showToast(`Transaction approved under compliance authority matrix.`);
      return;
    }
    if (action.includes("Submit")) {
      handleFieldChange("status", "Submitted");
      showToast(`Transaction ${meta.code} submitted successfully with parts register.`);
      return;
    }
    if (action.includes("Generate Meet Link")) {
      setMeetLinkGenerated(true);
      handleFieldChange("meetLink", "https://meet.google.com/xyz-servio-tel");
      showToast("Google Meet video diagnostic session link generated & sent to participants.");
      return;
    }

    // Default action notification
    showToast(`Action "${action}" processed successfully.`);
  };

  const firstFieldKey = meta.fields[0]?.key;
  const currentRecordRef = firstFieldKey ? String(formData[firstFieldKey] ?? meta.code) : meta.code;

  // Calculate live tab metrics
  const tabMetrics = useMemo(() => {
    let totalQty = 0;
    let totalLkr = 0;

    currentTabData.forEach((row) => {
      // Qty calculation
      const q = parseFloat(String(row.qty || row.quantity || row.reqQty || 0));
      if (!isNaN(q)) totalQty += q;

      // Price calculation
      const amtStr = String(
        row.total || row.amount || row.totalAmount || row.cost || row.price || "0",
      ).replace(/[^0-9.]/g, "");
      const amt = parseFloat(amtStr);
      if (!isNaN(amt)) totalLkr += amt;
    });

    return {
      count: currentTabData.length,
      totalQty,
      totalLkr,
    };
  }, [currentTabData]);

  return (
    <div className="space-y-4">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-2.5 rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-xl text-xs font-medium border border-border animate-in fade-in slide-in-from-top-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Screen Top Header Bar */}
      <div className="bg-card border border-border p-4 rounded-xl shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <button
              onClick={onBack}
              className="p-1.5 rounded-lg border border-border bg-muted/60 hover:bg-muted text-foreground cursor-pointer transition-colors"
              title="Return to Transaction Screens Directory"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                  {meta.id}
                </span>
                <span className="text-xs text-muted-foreground">·</span>
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  {meta.module}
                </span>
                <span className="text-xs text-muted-foreground">·</span>
                <span className="text-xs px-2 py-0.5 rounded font-medium bg-muted text-foreground">
                  {meta.type}
                </span>
                {lastSavedTime && (
                  <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-300 dark:border-emerald-800">
                    Saved at {lastSavedTime}
                  </span>
                )}
              </div>
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-foreground mt-0.5">
                {meta.name}
              </h1>
            </div>
          </div>

          {/* Action Buttons Toolbar */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleSaveTransaction}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-md bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs cursor-pointer transition-colors"
              title="Save all changes and parts into local register"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Record</span>
            </button>

            <button
              onClick={handleCreateNewBlank}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md border border-border bg-card text-foreground hover:bg-muted cursor-pointer transition-colors"
              title="Create a new blank transaction to demonstrate saving from scratch"
            >
              <Plus className="w-3.5 h-3.5 text-primary" />
              <span className="hidden sm:inline">New Transaction</span>
            </button>

            <button
              onClick={() => setShowSpecDetails(!showSpecDetails)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border transition-colors cursor-pointer ${
                showSpecDetails
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card text-foreground border-border hover:bg-muted"
              }`}
            >
              <Info className="w-3.5 h-3.5" />
              <span>Specification Details</span>
            </button>

            <button
              onClick={() => setIsExportOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border border-border bg-card text-foreground hover:bg-muted cursor-pointer transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export</span>
            </button>

            <button
              onClick={() => setIsAuditOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border border-border bg-card text-foreground hover:bg-muted cursor-pointer transition-colors"
            >
              <History className="w-3.5 h-3.5" />
              <span>Audit</span>
            </button>

            {b1Syncing && (
              <span className="flex items-center gap-1.5 text-xs text-sky-600 font-medium px-2 py-1 bg-sky-50 dark:bg-sky-950/60 rounded">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Syncing SAP B1...</span>
              </span>
            )}
          </div>
        </div>

        {/* Workflow & Status Breadcrumb Strip */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-border/60 text-xs">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <span className="font-semibold text-foreground">Status Progression:</span>
            <span className="font-mono text-primary font-medium">{meta.statusFlow}</span>
          </div>

          {/* Primary Action Buttons from Specification */}
          <div className="flex flex-wrap items-center gap-1.5">
            {meta.actions
              .filter(
                (a) => !a.includes("Export") && !a.includes("History") && !a.includes("Audit"),
              )
              .map((action) => {
                const isPrimary =
                  action.includes("Save") ||
                  action.includes("Submit") ||
                  action.includes("Approve") ||
                  action.includes("Assign");
                return (
                  <button
                    key={action}
                    onClick={() => handleAction(action)}
                    className={`px-3 py-1.5 rounded-md text-xs font-semibold cursor-pointer transition-colors shadow-xs ${
                      isPrimary
                        ? "bg-primary text-primary-foreground hover:bg-primary/90"
                        : "border border-border bg-card text-foreground hover:bg-muted"
                    }`}
                  >
                    {action}
                  </button>
                );
              })}
          </div>
        </div>
      </div>

      {/* Expandable Specification Details Panel */}
      {showSpecDetails && (
        <div className="bg-card border border-primary/30 p-5 rounded-xl shadow-xs space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b pb-3 border-border">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Info className="w-4 h-4 text-primary" />
              <span>Telesonic Option 01 Specification Register · {meta.id}</span>
            </h3>
            <span className="text-xs px-2 py-0.5 rounded font-mono bg-primary/10 text-primary font-semibold">
              Effort: {meta.effort}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div className="space-y-1">
              <span className="text-muted-foreground font-medium block">Purpose:</span>
              <p className="text-foreground leading-relaxed">{meta.purpose}</p>
            </div>
            <div className="space-y-1">
              <span className="text-muted-foreground font-medium block">Authorized Roles:</span>
              <p className="text-foreground font-semibold">{meta.roles}</p>
            </div>
            <div className="space-y-1">
              <span className="text-muted-foreground font-medium block">Related Requirements:</span>
              <p className="font-mono text-[11px] text-muted-foreground leading-snug">
                {meta.requirements}
              </p>
            </div>
            <div className="space-y-1">
              <span className="text-muted-foreground font-medium block">
                Related Reports & Scope:
              </span>
              <p className="font-mono text-[11px] text-muted-foreground leading-snug">
                Reports: {meta.reports}
                <br />
                Scope: {meta.scopePoints}
              </p>
            </div>
          </div>

          <div className="pt-2 border-t border-border flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
            <div>
              <span>Linked Navigation: </span>
              {meta.linkedNavigation.map((nav, i) => (
                <span
                  key={nav}
                  className="inline-flex items-center gap-0.5 font-medium text-primary"
                >
                  {i > 0 && " · "}
                  {nav}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Interactive Form Card */}
      <div className="bg-card border border-border p-5 sm:p-6 rounded-xl shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b pb-3 border-border">
          <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
            <span>Transaction Header Information</span>
            <span className="text-xs font-mono font-normal text-muted-foreground">
              (Live Interactive Spec Inputs)
            </span>
          </h2>
          <span className="text-xs text-muted-foreground font-mono">
            Active: <strong className="text-foreground">{currentRecordRef}</strong>
          </span>
        </div>

        {/* Dynamic Form Header Fields Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {meta.fields.map((field) => (
            <TransactionField
              key={field.key}
              field={field}
              value={formData[field.key]}
              onChange={(val) => handleFieldChange(field.key, val)}
              onLinkClick={(key, val) => {
                showToast(`Navigating to related master reference: ${val}`);
              }}
            />
          ))}
        </div>

        {/* Specialized Interactive Widgets per Screen Type */}

        {/* 1. Dispatch Board (TRX-03) Interactive Timeline */}
        {meta.code === "TRX-03" && (
          <div className="mt-4 p-4 rounded-xl border border-primary/20 bg-primary/5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" />
                <span className="font-bold text-xs text-foreground">
                  Interactive Drag & Dispatch Schedule Matrix
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    showToast(
                      "BCR-20 Auto-suggest: Matched Lead Tech K. Silva based on VRV Skill rating (Grade A).",
                    )
                  }
                  className="px-2.5 py-1 text-xs rounded bg-card border border-border hover:bg-muted font-medium text-foreground cursor-pointer"
                >
                  Auto-suggest (BCR-20)
                </button>
                <button
                  onClick={() => showToast("Appointments locked & confirmed via SMS.")}
                  className="px-2.5 py-1 text-xs rounded bg-primary text-primary-foreground font-medium cursor-pointer"
                >
                  Confirm Appointments
                </button>
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Click any schedule slot to assign unassigned calls or adjust technician roster.
            </p>
          </div>
        )}

        {/* 2. Appointment / Reschedule Dialog (TRX-04) Google Meet Toggle */}
        {meta.code === "TRX-04" && (
          <div className="mt-4 p-4 rounded-xl border border-sky-200 dark:border-sky-900 bg-sky-50/60 dark:bg-sky-950/30 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Video className="w-4 h-4 text-sky-600" />
                <span className="font-bold text-xs text-foreground">
                  Google Meet Virtual Diagnostic Consultation
                </span>
              </div>
              <button
                onClick={() => handleAction("Generate Meet Link")}
                className="px-3 py-1.5 text-xs rounded-md bg-sky-600 text-white font-medium hover:bg-sky-700 cursor-pointer flex items-center gap-1.5 shadow-xs"
              >
                <Video className="w-3.5 h-3.5" />
                <span>
                  {meetLinkGenerated ? "Regenerate Google Meet" : "Create Google Meet Link"}
                </span>
              </button>
            </div>
            {meetLinkGenerated && (
              <div className="p-2.5 rounded bg-white dark:bg-neutral-900 border border-sky-300 dark:border-sky-800 flex items-center justify-between text-xs">
                <span className="font-mono text-sky-700 dark:text-sky-300">
                  https://meet.google.com/xyz-servio-tel
                </span>
                <span className="text-[10px] text-emerald-600 font-medium">
                  Link Active · Invites Queued
                </span>
              </div>
            )}
          </div>
        )}

        {/* 3. Hold / Resume Dialog (TRX-06) Controls */}
        {meta.code === "TRX-06" && (
          <div className="mt-4 p-4 rounded-xl border border-amber-200 dark:border-amber-900 bg-amber-50/60 dark:bg-amber-950/30 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <PauseCircle className="w-5 h-5 text-amber-600 shrink-0" />
              <div className="text-xs">
                <span className="font-bold text-foreground block">SLA Clock Governance</span>
                <span className="text-muted-foreground">
                  Putting this ticket on hold freezes customer response and resolution countdowns.
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => handleAction("Hold")}
                className="px-3 py-1.5 text-xs rounded-md bg-amber-600 text-white font-medium hover:bg-amber-700 cursor-pointer shadow-xs"
              >
                Place On Hold
              </button>
              <button
                onClick={() => handleAction("Resume")}
                className="px-3 py-1.5 text-xs rounded-md bg-emerald-600 text-white font-medium hover:bg-emerald-700 cursor-pointer shadow-xs"
              >
                Resume Call
              </button>
            </div>
          </div>
        )}

        {/* 4. Technician Evaluation (TRX-23) Scoring Controls */}
        {meta.code === "TRX-23" && (
          <div className="mt-4 p-4 rounded-xl border border-border bg-muted/30 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-foreground">Score Evaluation:</span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setEvalScore(Math.max(50, evalScore - 5))}
                  className="px-2 py-1 text-xs border rounded bg-card hover:bg-muted"
                >
                  -5
                </button>
                <span className="font-mono font-bold text-sm px-2 text-primary">
                  {evalNotRequired ? "Not Required" : `${evalScore} / 100`}
                </span>
                <button
                  onClick={() => setEvalScore(Math.min(100, evalScore + 5))}
                  className="px-2 py-1 text-xs border rounded bg-card hover:bg-muted"
                >
                  +5
                </button>
              </div>
            </div>
            <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
              <input
                type="checkbox"
                checked={evalNotRequired}
                onChange={(e) => setEvalNotRequired(e.target.checked)}
                className="rounded border-border text-primary focus:ring-primary"
              />
              <span>Mark Evaluation Not Required (Override)</span>
            </label>
          </div>
        )}

        {/* 5. Stock Count Initiation (TRX-30) Blind Count Toggle */}
        {meta.code === "TRX-30" && (
          <div className="mt-4 p-4 rounded-xl border border-border bg-muted/30 flex items-center justify-between gap-4">
            <div className="text-xs">
              <span className="font-bold text-foreground block">Blind Stock Count Mode</span>
              <span className="text-muted-foreground">
                Hiding theoretical system quantities forces physical counting without bias.
              </span>
            </div>
            <button
              onClick={() => {
                const next = !blindCountActive;
                setBlindCountActive(next);
                handleFieldChange("blindCount", next ? "Yes" : "No");
                showToast(`Blind count mode ${next ? "Activated" : "Disabled"}.`);
              }}
              className={`px-3 py-1.5 text-xs rounded-md font-medium cursor-pointer transition-colors ${
                blindCountActive
                  ? "bg-primary text-primary-foreground font-semibold"
                  : "bg-card border border-border text-foreground hover:bg-muted"
              }`}
            >
              {blindCountActive ? "Blind Mode: ACTIVE" : "Blind Mode: OFF"}
            </button>
          </div>
        )}
      </div>

      {/* Interactive Context Tabs View */}
      {meta.tabs.length > 0 && (
        <div className="bg-card border border-border rounded-xl shadow-xs overflow-hidden">
          {/* Tab Navigation Buttons */}
          <div className="flex border-b border-border bg-muted/40 overflow-x-auto">
            {meta.tabs.map((tab) => {
              const isActive = (activeTab?.id || meta.tabs[0]?.id) === tab.id;
              const count = (tabDatasets[tab.id] || []).length;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTabId(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold whitespace-nowrap border-b-2 transition-colors cursor-pointer ${
                    isActive
                      ? "border-primary text-primary bg-background"
                      : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/60"
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-muted text-muted-foreground">
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Active Tab Dataset Table */}
          {activeTab && (
            <div className="p-4 sm:p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs font-bold text-foreground">
                      {activeTab.label} Register
                    </h3>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold">
                      {tabMetrics.count} recorded
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Live line items table. Add spare parts, inspect saved records, or export data.
                  </p>
                </div>

                {/* Primary Action to Add Parts / Line Items */}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => setIsAddPartModalOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-xs cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Spare Part / Line Item</span>
                  </button>

                  <button
                    onClick={handleResetTab}
                    className="flex items-center gap-1 px-2.5 py-1.5 text-xs rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer transition-colors"
                    title="Reset to default sample data"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span className="hidden sm:inline">Reset</span>
                  </button>

                  <button
                    onClick={() => setIsExportOpen(true)}
                    className="flex items-center gap-1 px-2.5 py-1.5 text-xs rounded-lg border border-border bg-card text-foreground hover:bg-muted cursor-pointer transition-colors"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Export</span>
                  </button>
                </div>
              </div>

              {/* Dynamic Summary Strip if parts/amounts are present */}
              {tabMetrics.totalLkr > 0 && (
                <div className="px-4 py-2.5 rounded-lg bg-muted/40 border border-border/80 flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
                  <div className="flex items-center gap-4">
                    <span className="text-muted-foreground">
                      Total Line Items:{" "}
                      <strong className="text-foreground">{tabMetrics.count}</strong>
                    </span>
                    {tabMetrics.totalQty > 0 && (
                      <span className="text-muted-foreground">
                        Total Quantity:{" "}
                        <strong className="text-foreground">{tabMetrics.totalQty} Units</strong>
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Calculated Subtotal:</span>
                    <span className="text-sm font-extrabold text-primary">
                      LKR {tabMetrics.totalLkr.toLocaleString("en-US")}
                    </span>
                  </div>
                </div>
              )}

              {/* Responsive Table */}
              <div className="overflow-x-auto border border-border rounded-lg">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-muted/60 border-b border-border">
                      {activeTab.columns.map((col) => (
                        <th
                          key={col.key}
                          className={`p-3 font-semibold text-foreground whitespace-nowrap ${
                            col.align === "right" ? "text-right" : "text-left"
                          }`}
                        >
                          <div
                            className={`flex items-center gap-1.5 ${
                              col.align === "right" ? "justify-end" : "justify-start"
                            }`}
                          >
                            <span>{col.label}</span>
                            {col.isB1 && (
                              <span className="text-[10px] font-mono text-sky-700 dark:text-sky-300">
                                ⇄B1
                              </span>
                            )}
                          </div>
                        </th>
                      ))}
                      <th className="p-3 text-right font-semibold text-foreground w-16">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {currentTabData.length === 0 ? (
                      <tr>
                        <td
                          colSpan={activeTab.columns.length + 1}
                          className="p-8 text-center text-muted-foreground"
                        >
                          <Package className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
                          <p className="font-semibold text-foreground">
                            No parts or line items in this register yet.
                          </p>
                          <p className="text-[11px] text-muted-foreground mt-0.5">
                            Click{" "}
                            <strong className="text-primary font-bold">
                              "Add Spare Part / Line Item"
                            </strong>{" "}
                            above to register parts from the Telesonic Spares catalog.
                          </p>
                        </td>
                      </tr>
                    ) : (
                      currentTabData.map((row, idx) => (
                        <tr
                          key={String(row._id || idx)}
                          className={`hover:bg-muted/40 transition-colors group ${
                            row._isNew ? "bg-emerald-50/50 dark:bg-emerald-950/20" : ""
                          }`}
                        >
                          {activeTab.columns.map((col, cIdx) => (
                            <td
                              key={col.key}
                              className={`p-3 text-foreground whitespace-nowrap ${
                                col.align === "right" ? "text-right font-mono tabular-nums" : ""
                              }`}
                            >
                              <div className="flex items-center gap-1.5">
                                {cIdx === 0 && row._isNew && (
                                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 shrink-0">
                                    Saved
                                  </span>
                                )}
                                <span>{row[col.key] != null ? String(row[col.key]) : "—"}</span>
                              </div>
                            </td>
                          ))}
                          <td className="p-3 text-right whitespace-nowrap">
                            <button
                              onClick={() => handleDeleteRow(idx)}
                              className="p-1 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                              title="Delete line item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add Part / Line Item Modal */}
      {activeTab && (
        <AddPartModal
          isOpen={isAddPartModalOpen}
          onClose={() => setIsAddPartModalOpen(false)}
          onSavePart={handleSavePart}
          tabColumns={activeTab.columns}
          tabLabel={activeTab.label}
          screenCode={meta.code}
        />
      )}

      {/* Export Modal */}
      {activeTab && (
        <TransactionExportModal
          isOpen={isExportOpen}
          onClose={() => setIsExportOpen(false)}
          meta={meta}
          activeTab={{ ...activeTab, data: currentTabData }}
          formData={formData}
        />
      )}

      {/* Audit Modal */}
      <TransactionAuditModal
        isOpen={isAuditOpen}
        onClose={() => setIsAuditOpen(false)}
        recordId={currentRecordRef}
        screenTitle={meta.name}
        screenCode={meta.code}
      />
    </div>
  );
};
