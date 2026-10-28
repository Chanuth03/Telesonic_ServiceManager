import React, { useState, useMemo, useEffect } from "react";
import { apiFetch } from "@/lib/api-client";
import { isOfflineForTransactions, saveOfflineTransaction } from "@/lib/offline-db";
import {
  ArrowLeft,
  Download,
  History,
  Check,
  RefreshCw,
  FileText,
  Calendar,
  Clock,
  Video,
  UserCheck,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCcw,
  Sparkles,
  ChevronRight,
  Plus,
  Save,
  Trash2,
  Layers,
  Package,
  Wrench,
  Search,
  Edit3,
  X,
  Database,
} from "lucide-react";
import {
  TransactionScreenMeta,
  TransactionFieldDef,
} from "@/data/transactionsSpecData";
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

  const [activeTabId, setActiveTabId] = useState<string>("saved-requests");
  const [isAuditOpen, setIsAuditOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isAddPartModalOpen, setIsAddPartModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(() => {
    try {
      return localStorage.getItem(`${storageKey}_last_saved`) || null;
    } catch {
      return null;
    }
  });

  // Saved records directory from PostgreSQL for CRUD listing
  const [savedRecords, setSavedRecords] = useState<Record<string, unknown>[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Master dropdown options from PostgreSQL (MST-01, MST-02, MST-03, MST-06, etc.)
  const [masterOptions, setMasterOptions] = useState<{
    customers: string[];
    contacts: string[];
    sites: string[];
    technicians: string[];
    equipment: string[];
    serviceTypes: string[];
  }>({
    customers: [],
    contacts: [],
    sites: [],
    technicians: [],
    equipment: [],
    serviceTypes: [],
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

  // Fetch Saved Service Requests from PostgreSQL (Full List View)
  const fetchSavedServiceRequests = async () => {
    if (meta.code === "TRX-01") {
      try {
        const res = await apiFetch("/api/service-requests");
        if (res.ok) {
          const json = await res.json();
          if (json.requests && Array.isArray(json.requests)) {
            setSavedRecords(json.requests);
          }
        }
      } catch (err) {
        console.warn("[PostgreSQL] Error fetching service requests:", err);
      }
    }
  };

  // Fetch Master Dropdown Options from PostgreSQL
  const fetchMasterOptions = async () => {
    try {
      const res = await apiFetch("/api/service-requests/master-options");
      if (res.ok) {
        const json = await res.json();
        if (json.options) {
          setMasterOptions(json.options);
        }
      }
    } catch (err) {
      console.warn("[PostgreSQL] Error fetching master options:", err);
    }
  };

  useEffect(() => {
    if (meta.code === "TRX-01") {
      fetchSavedServiceRequests();
      fetchMasterOptions();
    }
  }, [meta.code]);

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

  // Clear fields / Reset form
  const handleClearForm = () => {
    const freshRecord: Record<string, unknown> = {};
    meta.fields.forEach((f) => {
      if (f.key === "requestNo") {
        freshRecord[f.key] = `SR-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
      } else if (f.key === "requestDate") {
        freshRecord[f.key] = new Date().toISOString().split("T")[0];
      } else if (f.key === "status") {
        freshRecord[f.key] = "Draft";
      } else {
        freshRecord[f.key] = "";
      }
    });
    setFormData(freshRecord);
    saveFormData(storageKey, freshRecord);
    showToast("Form fields cleared. Ready for new Service Request entry.");
  };

  // Load a record from saved list into the form for editing
  const handleLoadRecord = (rec: Record<string, unknown>) => {
    const rawData = (rec['data'] as Record<string, unknown>) || {};
    const merged = {
      ...formData,
      ...rec,
      ...(rawData['formData'] ? (rawData['formData'] as Record<string, unknown>) : {}),
      requestNo: rec['requestNo'] || rec['id'],
    };
    setFormData(merged);
    saveFormData(storageKey, merged);

    if (rawData['tabDatasets']) {
      setTabDatasets(rawData['tabDatasets'] as Record<string, Array<Record<string, unknown>>>);
    }

    if (rec['updatedAt']) {
      setLastSavedTime(new Date(String(rec['updatedAt'])).toLocaleTimeString());
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
    showToast(`Loaded Service Request ${rec['requestNo'] || rec['id']} into editor.`);
  };

  // Delete a saved record from PostgreSQL database
  const handleDeleteRecord = async (rec: Record<string, unknown>) => {
    const recId = String(rec['requestNo'] || rec['id']);
    if (!window.confirm(`Are you sure you want to delete Service Request "${recId}" from the database?`)) {
      return;
    }

    try {
      const res = await apiFetch(`/api/service-requests/${encodeURIComponent(recId)}`, {
        method: "DELETE",
      });
      if (res.ok) {
        showToast(`Service Request "${recId}" removed from database.`);
        fetchSavedServiceRequests();
        if (formData["requestNo"] === recId) {
          handleClearForm();
        }
      } else {
        showToast(`Failed to delete record "${recId}".`);
      }
    } catch (err) {
      console.error("[PostgreSQL] Delete error:", err);
      showToast("Error connecting to server to delete record.");
    }
  };

  // Add Part / Row Line
  const handleSavePart = (row: Record<string, unknown>) => {
    if (!activeTab) return;
    const tabId = activeTab.id;
    const updated = [row, ...(tabDatasets[tabId] || [])];
    setTabDatasets((prev) => ({ ...prev, [tabId]: updated }));
    saveTabData(storageKey, tabId, updated);

    const now = new Date().toLocaleTimeString();
    setLastSavedTime(now);
    try {
      localStorage.setItem(`${storageKey}_last_saved`, now);
    } catch {
      // localStorage fallback
    }

    const partName = String(row["item"] || row["itemCode"] || row["description"] || "Part");
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

  // Save full transaction to PostgreSQL
  const handleSaveTransaction = async () => {
    setIsSaving(true);
    saveFormData(storageKey, formData);
    meta.tabs.forEach((tab) => {
      const data = tabDatasets[tab.id];
      if (data) {
        saveTabData(storageKey, tab.id, data);
      }
    });

    const payload = {
      ...formData,
      data: {
        formData,
        tabDatasets,
      },
    };
    const recordRef = String(
      formData[primaryKey] ||
        (meta.sampleRecord as Record<string, unknown>)[primaryKey] ||
        meta.code,
    );

    if (isOfflineForTransactions()) {
      await saveOfflineTransaction({
        code: meta.code,
        storageKey,
        recordRef,
        payload,
      });
      const now = new Date().toLocaleTimeString();
      setLastSavedTime(now);
      setIsSaving(false);
      showToast(`Transaction ${recordRef} stored offline in Dexie. See the browser console for the JSON.`);
      return;
    }

    if (meta.code === "TRX-01") {
      try {
        const res = await apiFetch("/api/service-requests", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          const now = new Date().toLocaleTimeString();
          setLastSavedTime(now);
          showToast(`Service Request ${currentRecordRef} successfully saved to PostgreSQL database!`);
          fetchSavedServiceRequests();
          setIsSaving(false);
          return;
        }
      } catch (err) {
        console.error("[PostgreSQL] Failed to save service request:", err);
        await saveOfflineTransaction({
          code: meta.code,
          storageKey,
          recordRef,
          payload,
        });
        const now = new Date().toLocaleTimeString();
        setLastSavedTime(now);
        setIsSaving(false);
        showToast(`Database was unreachable. Transaction ${recordRef} stored offline in Dexie.`);
        return;
      }
    }

    const now = new Date().toLocaleTimeString();
    setLastSavedTime(now);
    try {
      localStorage.setItem(`${storageKey}_last_saved`, now);
    } catch {
      // ignore
    }
    setIsSaving(false);
    showToast(`Transaction ${currentRecordRef} saved successfully.`);
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
    if (action.includes("Print")) {
      window.print();
      return;
    }
    if (action.includes("Save") || action.includes("Update")) {
      handleSaveTransaction();
      return;
    }
    if (action.includes("Submit")) {
      handleFieldChange("status", "Submitted");
      handleSaveTransaction();
      showToast(`Service Request submitted for triage & service call scheduling.`);
      return;
    }
    if (action.includes("Cancel")) {
      handleFieldChange("status", "Cancelled");
      handleSaveTransaction();
      showToast(`Service Request marked as Cancelled.`);
      return;
    }
    if (action.includes("Create Service Calls")) {
      handleFieldChange("status", "Converted");
      handleSaveTransaction();
      showToast(`Converted to Service Call. Navigating to Service Call Generation...`);
      return;
    }
    showToast(`Action "${action}" recorded.`);
  };

  const primaryKey = meta.fields[0]?.key || 'id';
  const currentRecordRef = String(formData[primaryKey] || (meta.sampleRecord as Record<string, unknown>)[primaryKey] || meta.code);

  const tabMetrics = useMemo(() => {
    return {
      count: currentTabData.length,
    };
  }, [currentTabData]);

  // Filtered saved records list
  const filteredSavedRecords = useMemo(() => {
    if (!searchQuery.trim()) return savedRecords;
    const q = searchQuery.toLowerCase();
    return savedRecords.filter((r) => {
      return (
        String(r['requestNo'] || r['id'] || '').toLowerCase().includes(q) ||
        String(r['customer'] || r['customerName'] || '').toLowerCase().includes(q) ||
        String(r['status'] || '').toLowerCase().includes(q) ||
        String(r['priority'] || '').toLowerCase().includes(q) ||
        String(r['requestType'] || '').toLowerCase().includes(q)
      );
    });
  }, [savedRecords, searchQuery]);

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Toast Notice Banner */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 px-4 py-3 rounded-lg shadow-xl text-xs font-medium flex items-center gap-2 border border-neutral-700 animate-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-emerald-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Screen Title & Top Navigation Header */}
      <div className="bg-card border border-border p-4 sm:p-5 rounded-xl shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              title="Return to Transaction Registry"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                  {meta.code}
                </span>
                <span className="text-xs text-muted-foreground">{meta.module}</span>
                {lastSavedTime && (
                  <span className="text-[11px] text-muted-foreground font-mono">
                    · Saved at {lastSavedTime}
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
              disabled={isSaving}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-md bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs cursor-pointer transition-colors"
              title="Save all changes directly into PostgreSQL database"
            >
              <Save className={`w-3.5 h-3.5 ${isSaving ? "animate-spin" : ""}`} />
              <span>{isSaving ? "Saving..." : "Save Record"}</span>
            </button>

            <button
              onClick={handleClearForm}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md border border-border bg-card text-foreground hover:bg-muted cursor-pointer transition-colors"
              title="Clear all fields to enter a new record"
            >
              <Plus className="w-3.5 h-3.5 text-primary" />
              <span>Clear Fields</span>
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
          </div>
        </div>

        {/* Status Actions Strip */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs">
          <div className="flex flex-wrap items-center gap-1.5">
            {meta.actions
              .filter(
                (a) =>
                  !a.includes("Export") &&
                  !a.includes("History") &&
                  !a.includes("Audit") &&
                  !a.includes("SAP"),
              )
              .map((action) => {
                const isPrimary =
                  action.includes("Save") ||
                  action.includes("Submit") ||
                  action.includes("Create");
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

      {/* Main Interactive Form Card */}
      <div className="bg-card border border-border p-5 sm:p-6 rounded-xl shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b pb-3 border-border">
          <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
            <span>Transaction Header Information</span>
          </h2>
          <span className="text-xs font-mono text-muted-foreground">
            Current Status: <strong className="text-primary">{String(formData["status"] || "Draft")}</strong>
          </span>
        </div>

        {/* Dynamic Form Header Fields Grid with Master Lookups */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {meta.fields.map((field) => {
            // Provide dropdown options from Master tables if available
            let optionsOverride: string[] | undefined = undefined;
            let placeholderOverride: string | undefined = undefined;

            if (field.key === "customer" && masterOptions.customers.length > 0) {
              optionsOverride = masterOptions.customers;
            } else if (field.key === "contact" && masterOptions.contacts.length > 0) {
              optionsOverride = masterOptions.contacts;
            } else if (field.key === "site" && masterOptions.sites.length > 0) {
              optionsOverride = masterOptions.sites;
            } else if (field.key === "receivedBy" && masterOptions.technicians.length > 0) {
              optionsOverride = masterOptions.technicians;
            } else if (field.key === "equipmentSystem" && masterOptions.equipment.length > 0) {
              optionsOverride = masterOptions.equipment;
            } else if (field.key === "requestType" && masterOptions.serviceTypes.length > 0) {
              optionsOverride = masterOptions.serviceTypes;
            }

            return (
              <TransactionField
                key={field.key}
                field={field}
                value={formData[field.key]}
                optionsOverride={optionsOverride}
                placeholderOverride={placeholderOverride}
                onChange={(val) => handleFieldChange(field.key, val)}
                onLinkClick={(key, val) => {
                  showToast(`Master reference: ${val}`);
                }}
              />
            );
          })}
        </div>

        {/* Specialized Interactive Widgets per Screen Type */}
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
                  onClick={() => showToast("Auto-suggest: Matched Lead Tech based on skill rating.")}
                  className="px-2.5 py-1 text-xs rounded bg-card border border-border hover:bg-muted font-medium text-foreground cursor-pointer"
                >
                  Auto-suggest
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
                onClick={() => setMeetLinkGenerated(true)}
                className="px-3 py-1.5 text-xs rounded-md bg-sky-600 text-white font-medium hover:bg-sky-700 cursor-pointer flex items-center gap-1.5 shadow-xs"
              >
                <Video className="w-3.5 h-3.5" />
                <span>{meetLinkGenerated ? "Regenerate Google Meet" : "Create Google Meet Link"}</span>
              </button>
            </div>
            {meetLinkGenerated && (
              <div className="p-2.5 rounded bg-white dark:bg-neutral-900 border border-sky-300 dark:border-sky-800 flex items-center justify-between text-xs">
                <span className="font-mono text-sky-700 dark:text-sky-300">
                  https://meet.google.com/xyz-meeting-room
                </span>
                <span className="text-[10px] text-emerald-600 font-medium">Link Active</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* SAVED RECORDS REGISTER & CONTEXT TABS CONTAINER */}
      <div className="bg-card border border-border rounded-xl shadow-xs overflow-hidden">
        {/* Navigation Tabs Header */}
        <div className="flex border-b border-border bg-muted/40 overflow-x-auto">
          {/* Tab 1: Saved Service Requests in PostgreSQL */}
          {meta.code === "TRX-01" && (
            <button
              onClick={() => setActiveTabId("saved-requests")}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold whitespace-nowrap border-b-2 transition-colors cursor-pointer ${
                activeTabId === "saved-requests"
                  ? "border-primary text-primary bg-background shadow-xs font-bold"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/60"
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>Saved Requests Directory</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold">
                {savedRecords.length} in PostgreSQL
              </span>
            </button>
          )}

          {/* Contextual Sub-tabs (Commercial, Lines, Duplicates, Linked Calls, etc.) */}
          {meta.tabs.map((tab) => {
            const isActive = activeTabId === tab.id;
            const count = (tabDatasets[tab.id] || []).length;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTabId(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold whitespace-nowrap border-b-2 transition-colors cursor-pointer ${
                  isActive
                    ? "border-primary text-primary bg-background shadow-xs font-bold"
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

        {/* Tab Content: Saved Records Directory (Full CRUD List View) */}
        {activeTabId === "saved-requests" && meta.code === "TRX-01" && (
          <div className="p-4 sm:p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <span>Saved Service Requests</span>
                  <span className="text-xs font-mono text-muted-foreground font-normal">
                    ({filteredSavedRecords.length} of {savedRecords.length} records in PostgreSQL)
                  </span>
                </h3>
              </div>

              {/* Search Bar for Saved Service Requests */}
              <div className="relative min-w-[260px] sm:w-72">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search requests, customers, status..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-border bg-background text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            {/* Responsive Table of Saved Requests */}
            <div className="overflow-x-auto border border-border rounded-lg">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-muted/60 border-b border-border">
                    <th className="p-3 font-semibold text-foreground">Request No.</th>
                    <th className="p-3 font-semibold text-foreground">Request Date</th>
                    <th className="p-3 font-semibold text-foreground">Customer & Site</th>
                    <th className="p-3 font-semibold text-foreground">Type</th>
                    <th className="p-3 font-semibold text-foreground">Priority</th>
                    <th className="p-3 font-semibold text-foreground">Status</th>
                    <th className="p-3 text-right font-semibold text-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredSavedRecords.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-muted-foreground">
                        <FileText className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
                        <p className="font-semibold text-foreground">No saved Service Requests found.</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          Enter details in the form above and click "Save Record" to store in PostgreSQL.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredSavedRecords.map((rec, idx) => {
                      const reqNo = String(rec['requestNo'] || rec['id'] || `SR-${idx + 1}`);
                      const statusVal = String(rec['status'] || "Draft");
                      const isSubmitted = statusVal.toLowerCase() === "submitted";
                      return (
                        <tr key={reqNo} className="hover:bg-muted/40 transition-colors">
                          <td className="p-3 font-mono font-bold text-primary whitespace-nowrap">
                            {reqNo}
                          </td>
                          <td className="p-3 text-foreground whitespace-nowrap">
                            {String(rec['requestDate'] || '—')}
                          </td>
                          <td className="p-3 text-foreground">
                            <span className="font-medium block">{String(rec['customer'] || rec['customerName'] || 'Customer')}</span>
                            <span className="text-[11px] text-muted-foreground block">{String(rec['site'] || '')}</span>
                          </td>
                          <td className="p-3 text-foreground whitespace-nowrap">
                            {String(rec['requestType'] || rec['callType'] || 'Breakdown Repair')}
                          </td>
                          <td className="p-3 whitespace-nowrap">
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-muted text-foreground border border-border">
                              {String(rec['priority'] || 'P3 - Medium')}
                            </span>
                          </td>
                          <td className="p-3 whitespace-nowrap">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                isSubmitted
                                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                                  : "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300"
                              }`}
                            >
                              {statusVal}
                            </span>
                          </td>
                          <td className="p-3 text-right whitespace-nowrap">
                            <div className="inline-flex items-center gap-1.5">
                              <button
                                onClick={() => handleLoadRecord(rec)}
                                className="px-2.5 py-1 text-xs font-semibold rounded-md bg-muted hover:bg-primary hover:text-primary-foreground text-foreground transition-colors cursor-pointer flex items-center gap-1"
                                title="Load this request into the editor above"
                              >
                                <Edit3 className="w-3 h-3" />
                                <span>Load</span>
                              </button>
                              <button
                                onClick={() => handleDeleteRecord(rec)}
                                className="p-1 rounded-md hover:bg-rose-50 text-muted-foreground hover:text-rose-600 dark:hover:bg-rose-950/60 transition-colors cursor-pointer"
                                title="Delete this request from database"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab Content: Lines / Child Sub-grids */}
        {activeTabId !== "saved-requests" && activeTab && (
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
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setIsAddPartModalOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Line Item</span>
                </button>

                <button
                  onClick={handleResetTab}
                  className="flex items-center gap-1 px-2.5 py-1.5 text-xs rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer transition-colors"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset Default</span>
                </button>
              </div>
            </div>

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
                        <span>{col.label}</span>
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
                          No items in this register yet.
                        </p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          Click "Add Line Item" above to add items.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    currentTabData.map((row, idx) => (
                      <tr key={idx} className="hover:bg-muted/40 transition-colors">
                        {activeTab.columns.map((col) => (
                          <td
                            key={col.key}
                            className={`p-3 text-foreground whitespace-nowrap ${
                              col.align === "right" ? "text-right font-mono tabular-nums" : ""
                            }`}
                          >
                            <span>{row[col.key] != null ? String(row[col.key]) : "—"}</span>
                          </td>
                        ))}
                        <td className="p-3 text-right whitespace-nowrap">
                          <button
                            onClick={() => handleDeleteRow(idx)}
                            className="p-1 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                            title="Delete item"
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
