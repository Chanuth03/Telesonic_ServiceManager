import React, { useState, useMemo, useEffect } from "react";
import { apiFetch } from "@/lib/api-client";
import {
  ArrowLeft,
  Download,
  History,
  Calendar,
  Video,
  CheckCircle2,
  Plus,
  Save,
  Trash2,
  Layers,
  Search,
  Edit3,
  X,
  Database,
  FileText,
} from "lucide-react";
import { TransactionScreenMeta } from "@/data/transactionsSpecData";
import { TransactionField } from "./TransactionField";
import { TransactionAuditModal } from "./TransactionAuditModal";
import { TransactionExportModal } from "./TransactionExportModal";
import { AddPartModal } from "@/components/common/AddPartModal";
import {
  saveFormData,
  loadSavedTabData,
  saveTabData,
} from "@/data/sparePartsCatalog";
import { TRANSACTION_PROCESS_MAP } from "@/lib/transactions-db";

interface TransactionScreenViewProps {
  meta: TransactionScreenMeta;
  onBack: () => void;
  onNavigateToScreen?: (screenId: string) => void;
}

const HANDOFF_STORAGE_KEY = "telesonic_trx_handoff";

export const TransactionScreenView: React.FC<TransactionScreenViewProps> = ({
  meta,
  onBack,
  onNavigateToScreen,
}) => {
  const storageKey = `telesonic_trx_${meta.code}`;
  const processConfig = TRANSACTION_PROCESS_MAP[meta.code] || {
    code: meta.code,
    processKey: "service-requests",
    apiPath: "/api/service-requests",
    prefix: "TRX",
    primaryField: "recordNo",
  };

  const generateNewRecordNo = (prefix: string) =>
    `${prefix}-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;

  const createFreshRecord = (currentMeta: TransactionScreenMeta) => {
    const cfg = TRANSACTION_PROCESS_MAP[currentMeta.code] || {
      prefix: "TRX",
      primaryField: "recordNo",
    };
    const today = new Date().toISOString().split("T")[0];
    const generatedNo = generateNewRecordNo(cfg.prefix);
    const freshRecord: Record<string, unknown> = {
      recordNo: generatedNo,
      status: "Draft",
    };

    currentMeta.fields.forEach((f) => {
      if (f.key === cfg.primaryField && f.readOnly) {
        freshRecord[f.key] = generatedNo;
      } else if (f.type === "date" && !f.readOnly) {
        freshRecord[f.key] = today;
      } else if (f.key === "status") {
        freshRecord[f.key] = f.options?.[0] || "Draft";
      } else if (f.type === "yesno") {
        freshRecord[f.key] = "No";
      } else if (f.key === "version" || f.key === "proposals" || f.key === "visitsPerYear") {
        freshRecord[f.key] = 1;
      } else if (f.key === "rescheduleCount" || f.key === "daysHeld" || f.key === "toleranceVariance") {
        freshRecord[f.key] = 0;
      } else if (f.key === "totalScore") {
        freshRecord[f.key] = 94;
      } else {
        freshRecord[f.key] = "";
      }
    });

    // Check if there is a cross-screen handoff payload waiting for this screen
    try {
      const rawHandoff = sessionStorage.getItem(HANDOFF_STORAGE_KEY);
      if (rawHandoff) {
        const parsed = JSON.parse(rawHandoff) as {
          targetScreen: string;
          data: Record<string, unknown>;
        };
        if (
          parsed.targetScreen === currentMeta.id ||
          parsed.targetScreen === currentMeta.code
        ) {
          sessionStorage.removeItem(HANDOFF_STORAGE_KEY);
          return {
            ...freshRecord,
            ...parsed.data,
            [cfg.primaryField]:
              currentMeta.fields.find((fl) => fl.key === cfg.primaryField)?.readOnly
                ? generatedNo
                : parsed.data[cfg.primaryField] || freshRecord[cfg.primaryField],
            recordNo: generatedNo,
          };
        }
      }
    } catch {
      // ignore storage errors
    }

    return freshRecord;
  };

  // Form data state: always start fresh on page load/refresh (or from cross-screen handoff)
  const [formData, setFormData] = useState<Record<string, unknown>>(() =>
    createFreshRecord(meta),
  );

  const [activeTabId, setActiveTabId] = useState<string>("saved-requests");
  const [isAuditOpen, setIsAuditOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isAddPartModalOpen, setIsAddPartModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);

  // Saved records directory from PostgreSQL for CRUD listing
  const [savedRecords, setSavedRecords] = useState<Record<string, unknown>[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Master & Upstream Transaction dropdown options from PostgreSQL
  const [masterOptions, setMasterOptions] = useState<{
    customers: string[];
    customerDetails: Array<{
      id: number;
      code: string;
      name: string;
      label: string;
      origin: string;
      paymentHold: string;
    }>;
    contacts: Array<string | { label: string; contactName?: string; customerCode?: string | null }>;
    sites: Array<
      string | { label: string; siteName?: string; customerCode?: string | null; customerId?: number | null }
    >;
    technicians: string[];
    equipment: Array<
      | string
      | {
          label: string;
          equipmentId?: string;
          brand?: string;
          model?: string;
          serialNo?: string;
          customerId?: number | null;
          customerName?: string | null;
          customerCode?: string | null;
          siteName?: string | null;
          origin?: string;
          entitlement?: string;
        }
    >;
    systems: Array<{
      label: string;
      systemId: string;
      systemName: string;
      customerId?: number | null;
      customerName?: string | null;
      customerCode?: string | null;
    }>;
    serials: string[];
    items: string[];
    vendors: string[];
    warehouses: string[];
    franchises: string[];
    serviceRoles: string[];
    serviceTypes: string[];
    holdReasons: string[];
    repeatReasons: string[];
    checklistTemplates: string[];
    warrantyRules: string[];
    contracts: string[];
    projects: Array<{
      label: string;
      projectCode: string;
      projectName: string;
      customer: string;
      budgetLkr: string;
      actualLkr: string;
      committedLkr: string;
    }>;
    glAccounts: string[];
    serviceRequests: Array<{
      requestNo: string;
      label: string;
      customer: string;
      contact: string;
      site: string;
      equipmentSystem: string;
      requestType: string;
      priority: string;
      entitlement: string;
      customerOrigin: string;
      equipmentOrigin: string;
    }>;
    serviceCalls: Array<{
      callNo: string;
      label: string;
      requestNo: string;
      customer: string;
      site: string;
      equipmentSystem: string;
      callType: string;
      priority: string;
      entitlement: string;
      status: string;
      plannedDate: string;
    }>;
    warrantyClaims: string[];
    stockCounts: Array<{
      countNo: string;
      label: string;
      franchise: string;
      warehouse: string;
      status: string;
    }>;
    documents: string[];
  }>({
    customers: [],
    customerDetails: [],
    contacts: [],
    sites: [],
    technicians: [],
    equipment: [],
    systems: [],
    serials: [],
    items: [],
    vendors: [],
    warehouses: [],
    franchises: [],
    serviceRoles: [],
    serviceTypes: [],
    holdReasons: [],
    repeatReasons: [],
    checklistTemplates: [],
    warrantyRules: [],
    contracts: [],
    projects: [],
    glAccounts: [],
    serviceRequests: [],
    serviceCalls: [],
    warrantyClaims: [],
    stockCounts: [],
    documents: [],
  });

  const [isPaymentRefModalOpen, setIsPaymentRefModalOpen] = useState(false);
  const [paymentRefInput, setPaymentRefInput] = useState("");
  const [paymentAmountInput, setPaymentAmountInput] = useState("");
  const [paymentStatusInput, setPaymentStatusInput] = useState("Advance Received");
  const [paymentRemarksInput, setPaymentRemarksInput] = useState("");

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

  // Fetch Saved Records from PostgreSQL for the active transaction process
  const fetchSavedRecords = async () => {
    try {
      const res = await apiFetch(processConfig.apiPath);
      if (res.ok) {
        const json = await res.json();
        const list = json.records || json.requests || [];
        if (Array.isArray(list)) {
          setSavedRecords(list);
        }
      }
    } catch (err) {
      console.warn(`[PostgreSQL] Error fetching records from ${processConfig.apiPath}:`, err);
    }
  };

  // Fetch Master & Transaction Dropdown Options from PostgreSQL
  const fetchMasterOptions = async () => {
    try {
      const res = await apiFetch("/api/service-requests/master-options");
      if (res.ok) {
        const json = await res.json();
        if (json.options) {
          setMasterOptions((prev) => ({ ...prev, ...json.options }));
        }
      }
    } catch (err) {
      console.warn("[PostgreSQL] Error fetching master options:", err);
    }
  };

  // Re-initialize when switching between transaction screens
  useEffect(() => {
    setFormData(createFreshRecord(meta));
    setActiveTabId("saved-requests");
    const nextTabs: Record<string, Array<Record<string, unknown>>> = {};
    meta.tabs.forEach((tab) => {
      nextTabs[tab.id] = loadSavedTabData(
        `telesonic_trx_${meta.code}`,
        tab.id,
        tab.data as Array<Record<string, unknown>>,
      );
    });
    setTabDatasets(nextTabs);
    fetchSavedRecords();
    fetchMasterOptions();
  }, [meta.code]);

  const activeTab = meta.tabs.find((t) => t.id === activeTabId) || meta.tabs[0];
  const currentTabData = useMemo(() => {
    return (activeTab ? tabDatasets[activeTab.id] : []) || [];
  }, [activeTab, tabDatasets]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Smart Field Change Handler with Auto-Derivation from Master & Upstream Records
  const handleFieldChange = (key: string, val: unknown) => {
    setFormData((prev) => {
      const next: Record<string, unknown> = { ...prev, [key]: val };
      const strVal = String(val || "").trim();

      // 1. When Customer is selected -> auto-populate Customer Origin & matching defaults
      if (key === "customer" && strVal) {
        const matchedCust = masterOptions.customerDetails.find(
          (c) =>
            c.label.toLowerCase() === strVal.toLowerCase() ||
            strVal.toLowerCase().includes(c.code.toLowerCase()) ||
            strVal.toLowerCase().includes(c.name.toLowerCase()),
        );
        if (matchedCust && meta.fields.some((f) => f.key === "customerOrigin")) {
          next["customerOrigin"] = matchedCust.origin || "Telesonic Sold";
        }
      }

      // 2. When Equipment / System is selected -> auto-populate Equipment Origin & Entitlement
      if ((key === "equipmentSystem" || key === "equipment") && strVal) {
        const matchedEq = masterOptions.equipment.find(
          (e) => typeof e !== "string" && e.label.toLowerCase() === strVal.toLowerCase(),
        );
        if (matchedEq && typeof matchedEq !== "string") {
          if (meta.fields.some((f) => f.key === "equipmentOrigin")) {
            next["equipmentOrigin"] = matchedEq.origin || "Telesonic Sold";
          }
          if (meta.fields.some((f) => f.key === "entitlement")) {
            next["entitlement"] = matchedEq.entitlement || "Active Under Warranty";
          }
        }
      }

      // 3. When Service Request (requestNo) is selected (e.g. on TRX-02) -> auto-fill Customer, Site, Equipment, Priority
      if (key === "requestNo" && strVal && !meta.fields.find((f) => f.key === "requestNo")?.readOnly) {
        const cleanReq = strVal.split("—")[0]?.trim() || strVal;
        const matchedSr = masterOptions.serviceRequests.find(
          (sr) => sr.requestNo === cleanReq || sr.label === strVal,
        );
        if (matchedSr) {
          if (matchedSr.customer) next["customer"] = matchedSr.customer;
          if (matchedSr.site) next["site"] = matchedSr.site;
          if (matchedSr.equipmentSystem) next["equipmentSystem"] = matchedSr.equipmentSystem;
          if (matchedSr.requestType && meta.fields.some((f) => f.key === "callType")) {
            next["callType"] = matchedSr.requestType;
          }
          if (matchedSr.priority) next["priority"] = matchedSr.priority;
          if (matchedSr.entitlement) next["entitlement"] = matchedSr.entitlement;
          if (meta.fields.some((f) => f.key === "slaDue")) {
            next["slaDue"] = `${new Date(Date.now() + 4 * 3600 * 1000).toISOString().slice(0, 16).replace("T", " ")} (4h Response)`;
          }
        }
      }

      // 4. When Service Call (callNo) is selected -> auto-fill Customer, Site, Equipment, Entitlement, Profitability
      if (key === "callNo" && strVal && !meta.fields.find((f) => f.key === "callNo")?.readOnly) {
        const cleanCall = strVal.split("—")[0]?.trim() || strVal;
        const matchedSc = masterOptions.serviceCalls.find(
          (sc) => sc.callNo === cleanCall || sc.label === strVal,
        );
        if (matchedSc) {
          if (matchedSc.customer && meta.fields.some((f) => f.key === "customer")) {
            next["customer"] = matchedSc.customer;
          }
          if (matchedSc.site && meta.fields.some((f) => f.key === "site")) {
            next["site"] = matchedSc.site;
          }
          if (matchedSc.equipmentSystem) {
            if (meta.fields.some((f) => f.key === "equipmentSystem")) {
              next["equipmentSystem"] = matchedSc.equipmentSystem;
            }
            if (meta.fields.some((f) => f.key === "equipment")) {
              next["equipment"] = matchedSc.equipmentSystem;
            }
          }
          if (matchedSc.entitlement && meta.fields.some((f) => f.key === "entitlement")) {
            next["entitlement"] = matchedSc.entitlement;
          }
          if (matchedSc.plannedDate && meta.fields.some((f) => f.key === "originalDate")) {
            next["originalDate"] = matchedSc.plannedDate;
          }
          if (meta.code === "TRX-26") {
            next["netRevenueLkr"] = "145,000.00";
            next["netCostLkr"] = "82,400.00";
            next["marginLkr"] = "62,600.00";
            next["marginPct"] = 43.2;
            next["costStatus"] = "Profitable";
          }
          if (meta.code === "TRX-35" && !next["totalLkr"]) {
            next["totalLkr"] = "68,500.00";
          }
        }
      }

      // 5. When Project is selected (TRX-27 / TRX-28) -> auto-fill project financials
      if ((key === "projectCode" || key === "project") && strVal) {
        const matchedPrj = masterOptions.projects.find(
          (p) => p.label === strVal || p.projectCode === strVal.split("—")[0]?.trim(),
        );
        if (matchedPrj) {
          if (meta.fields.some((f) => f.key === "name")) next["name"] = matchedPrj.projectName;
          if (meta.fields.some((f) => f.key === "customer")) next["customer"] = matchedPrj.customer;
          if (meta.fields.some((f) => f.key === "budgetLkr")) next["budgetLkr"] = matchedPrj.budgetLkr;
          if (meta.fields.some((f) => f.key === "actualLkr")) next["actualLkr"] = matchedPrj.actualLkr;
          if (meta.fields.some((f) => f.key === "committedLkr")) next["committedLkr"] = matchedPrj.committedLkr;
        }
      }

      // 6. When Stock Count (countNo) is selected (TRX-31 / TRX-32) -> auto-fill Franchise & Variance
      if (key === "countNo" && strVal && !meta.fields.find((f) => f.key === "countNo")?.readOnly) {
        const cleanCnt = strVal.split("—")[0]?.trim() || strVal;
        const matchedCnt = masterOptions.stockCounts.find(
          (sc) => sc.countNo === cleanCnt || sc.label === strVal,
        );
        if (matchedCnt) {
          if (matchedCnt.franchise && meta.fields.some((f) => f.key === "franchise")) {
            next["franchise"] = matchedCnt.franchise;
          }
          if (meta.fields.some((f) => f.key === "totalVarianceValue")) {
            next["totalVarianceValue"] = "-14,250.00";
          }
        }
      }

      // 7. When Sale Date changes on TRX-09 -> auto-calculate Warranty Start & End (12 months)
      if (meta.code === "TRX-09" && key === "saleDate" && strVal) {
        next["warrantyStart"] = strVal;
        const dt = new Date(strVal);
        if (!Number.isNaN(dt.getTime())) {
          dt.setFullYear(dt.getFullYear() + 1);
          next["warrantyEnd"] = dt.toISOString().split("T")[0];
        }
      }

      // 8. When Google Meet Required is toggled on TRX-04
      if (meta.code === "TRX-04" && key === "googleMeetLinkRequired") {
        if (strVal === "Yes") {
          setMeetLinkGenerated(true);
          next["meetLink"] = "https://meet.google.com/tls-diag-room";
        } else {
          setMeetLinkGenerated(false);
          next["meetLink"] = "";
        }
      }

      // 9. When In/Out Date changes on TRX-34 -> auto-calculate Days Held
      if (meta.code === "TRX-34" && (key === "inDate" || key === "outDate")) {
        const dIn = new Date(String(next["inDate"] || ""));
        const dOut = new Date(String(next["outDate"] || new Date().toISOString().split("T")[0]));
        if (!Number.isNaN(dIn.getTime()) && !Number.isNaN(dOut.getTime())) {
          const diff = Math.max(0, Math.round((dOut.getTime() - dIn.getTime()) / (1000 * 3600 * 24)));
          next["daysHeld"] = diff;
        }
      }

      saveFormData(storageKey, next);
      return next;
    });
  };

  // Clear fields / Reset form for new record entry
  const handleClearForm = () => {
    const freshRecord = createFreshRecord(meta);
    setFormData(freshRecord);
    saveFormData(storageKey, freshRecord);
    showToast(`Form fields cleared. Ready for new ${meta.name} entry.`);
  };

  // Load a saved record from the PostgreSQL directory into the form for editing
  const handleLoadRecord = (rec: Record<string, unknown>) => {
    const rawData = (rec["data"] as Record<string, unknown>) || {};
    const innerForm = (rawData["formData"] as Record<string, unknown>) || {};
    const recId = String(
      rec[processConfig.primaryField] ||
        rec["requestNo"] ||
        rec["callNo"] ||
        rec["recordNo"] ||
        rec["id"] ||
        "",
    );
    const merged: Record<string, unknown> = {
      ...formData,
      ...rec,
      ...innerForm,
      [processConfig.primaryField]: recId,
      recordNo: recId,
    };
    setFormData(merged);
    saveFormData(storageKey, merged);

    if (rawData["tabDatasets"]) {
      setTabDatasets(rawData["tabDatasets"] as Record<string, Array<Record<string, unknown>>>);
    }

    if (rec["updatedAt"]) {
      setLastSavedTime(new Date(String(rec["updatedAt"])).toLocaleTimeString());
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
    showToast(`Loaded record ${recId} into editor.`);
  };

  // Delete a saved record from PostgreSQL database
  const handleDeleteRecord = async (rec: Record<string, unknown>) => {
    const recId = String(
      rec[processConfig.primaryField] ||
        rec["requestNo"] ||
        rec["callNo"] ||
        rec["recordNo"] ||
        rec["id"] ||
        "",
    );
    if (
      !window.confirm(
        `Are you sure you want to delete record "${recId}" from PostgreSQL database?`,
      )
    ) {
      return;
    }

    try {
      const res = await apiFetch(`${processConfig.apiPath}/${encodeURIComponent(recId)}`, {
        method: "DELETE",
      });
      if (res.ok) {
        showToast(`Record "${recId}" removed from PostgreSQL database.`);
        await fetchSavedRecords();
        await fetchMasterOptions();
        const currentId = String(
          formData[processConfig.primaryField] || formData["recordNo"] || "",
        );
        if (currentId === recId) {
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
    const partName = String(row["item"] || row["itemCode"] || row["description"] || "Line Item");
    showToast(`"${partName}" added to ${activeTab.label}!`);
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
    showToast(`Reset ${activeTab.label} to default dataset.`);
  };

  // Save full transaction to PostgreSQL (with optional status override)
  const handleSaveTransaction = async (statusOverride?: string): Promise<Record<string, unknown> | null> => {
    setIsSaving(true);
    const effectiveFormData: Record<string, unknown> = {
      ...formData,
      ...(statusOverride ? { status: statusOverride } : {}),
    };
    if (statusOverride) {
      setFormData(effectiveFormData);
    }
    saveFormData(storageKey, effectiveFormData);
    meta.tabs.forEach((tab) => {
      const data = tabDatasets[tab.id];
      if (data) {
        saveTabData(storageKey, tab.id, data);
      }
    });

    const recordId = String(
      effectiveFormData[processConfig.primaryField] ||
        effectiveFormData["recordNo"] ||
        generateNewRecordNo(processConfig.prefix),
    );

    const payload = {
      ...effectiveFormData,
      [processConfig.primaryField]: recordId,
      recordNo: recordId,
      data: {
        formData: {
          ...effectiveFormData,
          [processConfig.primaryField]: recordId,
          recordNo: recordId,
        },
        tabDatasets,
      },
    };

    try {
      const res = await apiFetch(processConfig.apiPath, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const json = await res.json();
        const savedRec = (json.record || json.request || payload) as Record<string, unknown>;
        const now = new Date().toLocaleTimeString();
        setLastSavedTime(now);
        showToast(
          `${meta.code} Record "${recordId}" successfully saved to PostgreSQL database!`,
        );
        await fetchSavedRecords();
        await fetchMasterOptions();
        setIsSaving(false);
        return savedRec;
      } else {
        showToast(`Failed to save record "${recordId}" to PostgreSQL.`);
      }
    } catch (err) {
      console.error("[PostgreSQL] Failed to save transaction:", err);
      showToast("Error connecting to PostgreSQL database.");
    }
    setIsSaving(false);
    return null;
  };

  // Helper to hand off context to another transaction screen and navigate
  const handoffAndNavigate = (targetScreenId: string, contextData: Record<string, unknown>, msg: string) => {
    try {
      sessionStorage.setItem(
        HANDOFF_STORAGE_KEY,
        JSON.stringify({
          targetScreen: targetScreenId,
          data: contextData,
        }),
      );
    } catch {
      // ignore storage errors
    }
    showToast(msg);
    if (onNavigateToScreen) {
      setTimeout(() => {
        onNavigateToScreen(targetScreenId);
      }, 600);
    }
  };

  // Comprehensive Workflow Action Handler across all 35 Transaction Screens
  const handleAction = async (action: string) => {
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
    if (action.includes("Link Payment Ref")) {
      setPaymentRefInput(String(formData["paymentRef"] || ""));
      setPaymentAmountInput(String(formData["paymentAmount"] || ""));
      setIsPaymentRefModalOpen(true);
      return;
    }

    // Cross-screen navigation workflows:
    // 1. TRX-01 -> TRX-02 (Create Service Calls)
    if (action.includes("Create Service Calls")) {
      await handleSaveTransaction("Converted");
      handoffAndNavigate(
        "O1-SCR-TRX-02",
        {
          requestNo: formData["requestNo"],
          customer: formData["customer"],
          site: formData["site"],
          equipmentSystem: formData["equipmentSystem"],
          callType: formData["requestType"] || "Breakdown Repair",
          priority: formData["priority"] || "P2 - High",
          entitlement: formData["entitlement"] || "Active Under Warranty",
          plannedDate: new Date().toISOString().split("T")[0],
          status: "Open",
        },
        "Service Request converted! Navigating to Service Call (TRX-02)...",
      );
      return;
    }

    // 2. TRX-02 -> TRX-05 (Assign Technician)
    if (meta.code === "TRX-02" && action === "Assign") {
      await handleSaveTransaction("Assigned");
      handoffAndNavigate(
        "O1-SCR-TRX-05",
        {
          callNo: formData["callNo"],
          validFrom: formData["plannedDate"] || new Date().toISOString().split("T")[0],
        },
        "Service Call saved! Opening Technician Assignment (TRX-05)...",
      );
      return;
    }

    // 3. TRX-02 -> TRX-04 (Schedule Appointment)
    if (meta.code === "TRX-02" && action === "Schedule") {
      await handleSaveTransaction("Scheduled");
      handoffAndNavigate(
        "O1-SCR-TRX-04",
        {
          callNo: formData["callNo"],
          appointmentDate: formData["plannedDate"] || new Date().toISOString().split("T")[0],
          originalDate: formData["plannedDate"] || new Date().toISOString().split("T")[0],
          windowFrom: "09:00 AM",
          windowTo: "12:00 PM",
        },
        "Service Call saved! Opening Appointment Dialog (TRX-04)...",
      );
      return;
    }

    // 4. TRX-02 -> TRX-06 (Hold)
    if (meta.code === "TRX-02" && action === "Hold") {
      await handleSaveTransaction("On Hold");
      handoffAndNavigate(
        "O1-SCR-TRX-06",
        {
          callNo: formData["callNo"],
          notifyCustomer: "Yes",
        },
        "Service Call marked On Hold! Opening Hold Dialog (TRX-06)...",
      );
      return;
    }

    // 5. TRX-02 -> TRX-20 (Complete -> Service Report)
    if (meta.code === "TRX-02" && action === "Complete") {
      await handleSaveTransaction("Completed");
      handoffAndNavigate(
        "O1-SCR-TRX-20",
        {
          callNo: formData["callNo"],
          customer: formData["customer"],
          equipment: formData["equipmentSystem"],
        },
        "Service Call Completed! Opening Service Report (TRX-20)...",
      );
      return;
    }

    // 6. TRX-07 -> TRX-35 (Submit to Sales -> Service Quotation)
    if (meta.code === "TRX-07" && action.includes("Submit to Sales")) {
      await handleSaveTransaction("Submitted to Sales");
      handoffAndNavigate(
        "O1-SCR-TRX-35",
        {
          callNo: formData["callNo"],
          customer: formData["customer"],
          status: "Draft",
        },
        "Inspection submitted! Opening Service Quotation (TRX-35)...",
      );
      return;
    }

    // 7. TRX-08 -> TRX-09 (Activate Warranty)
    if (meta.code === "TRX-08" && action.includes("Activate Warranty")) {
      await handleSaveTransaction("Commissioned");
      handoffAndNavigate(
        "O1-SCR-TRX-09",
        {
          endCustomerName: formData["customer"],
          saleDate: formData["commissionedDate"] || new Date().toISOString().split("T")[0],
          status: "Activated",
        },
        "Installation commissioned! Opening Warranty Activation (TRX-09)...",
      );
      return;
    }

    // 8. TRX-29 -> TRX-30 (Start Count)
    if (meta.code === "TRX-29" && action.includes("Start Count")) {
      await handleSaveTransaction("Count Initiated");
      handoffAndNavigate(
        "O1-SCR-TRX-30",
        {
          franchise: formData["franchise"],
          scheduledDate: formData["asAtDate"] || new Date().toISOString().split("T")[0],
          status: "Released",
        },
        "Initiating Franchise Stock Count (TRX-30)...",
      );
      return;
    }

    // 9. TRX-30 -> TRX-31 (Release to Counter -> Variance Review)
    if (meta.code === "TRX-30" && action.includes("Release to Counter")) {
      await handleSaveTransaction("Released to Counter");
      handoffAndNavigate(
        "O1-SCR-TRX-31",
        {
          countNo: formData["countNo"],
          franchise: formData["franchise"],
          totalVarianceValue: "-14,250.00",
          status: "Pending Review",
        },
        "Count Sheet released! Opening Count Variance Review (TRX-31)...",
      );
      return;
    }

    // 10. TRX-31 -> TRX-32 (Approve Variances -> Stock Adjustment)
    if (meta.code === "TRX-31" && action.includes("Approve Variances")) {
      await handleSaveTransaction("Approved");
      handoffAndNavigate(
        "O1-SCR-TRX-32",
        {
          countNo: formData["countNo"],
          postingDate: new Date().toISOString().split("T")[0],
          status: "Approved for Adjustment",
        },
        "Variances approved! Opening Stock Adjustment (TRX-32)...",
      );
      return;
    }

    // Status-changing actions that save directly to PostgreSQL:
    if (action.includes("Save Draft")) {
      await handleSaveTransaction("Draft");
      return;
    }
    if (action.includes("Submit") || action.includes("Confirm") || action.includes("Authorise")) {
      await handleSaveTransaction("Submitted");
      return;
    }
    if (action.includes("Approve") || action.includes("Activate") || action.includes("Commission")) {
      await handleSaveTransaction("Approved");
      return;
    }
    if (action.includes("Place On Hold")) {
      await handleSaveTransaction("On Hold");
      return;
    }
    if (action.includes("Resume") || action.includes("Reopen")) {
      await handleSaveTransaction("In Progress");
      return;
    }
    if (action.includes("Close") || action.includes("Finalise") || action.includes("Complete")) {
      await handleSaveTransaction("Closed");
      return;
    }
    if (action.includes("Cancel") || action.includes("Terminate") || action.includes("Reject") || action.includes("Revoke")) {
      if (!window.confirm(`Are you sure you want to execute "${action}" on this record?`)) {
        return;
      }
      await handleSaveTransaction("Cancelled");
      return;
    }
    if (action.includes("Generate Meet Link")) {
      setMeetLinkGenerated(true);
      handleFieldChange("googleMeetLinkRequired", "Yes");
      await handleSaveTransaction("Meet Link Active");
      return;
    }

    // Default for any other operational action: save current state with action status
    await handleSaveTransaction(action);
  };

  // Resolve dropdown options for ANY field across all 35 screens from PostgreSQL masterOptions
  const getFieldDropdownOptions = (fieldKey: string): string[] | undefined => {
    const selectedCustStr = String(formData["customer"] || "").trim().toLowerCase();

    if (fieldKey === "customer") {
      return masterOptions.customers;
    }
    if (fieldKey === "contact") {
      const allContacts = masterOptions.contacts.map((c) =>
        typeof c === "string" ? { label: c, customerCode: "" } : c,
      );
      if (selectedCustStr) {
        const matched = allContacts.filter(
          (c) => c.customerCode && selectedCustStr.includes(c.customerCode.toLowerCase()),
        );
        return (matched.length > 0 ? matched : allContacts).map((m) => m.label);
      }
      return allContacts.map((m) => m.label);
    }
    if (fieldKey === "site") {
      const allSites = masterOptions.sites.map((s) =>
        typeof s === "string" ? { label: s, customerCode: "" } : s,
      );
      if (selectedCustStr) {
        const matched = allSites.filter(
          (s) => s.customerCode && selectedCustStr.includes(s.customerCode.toLowerCase()),
        );
        return (matched.length > 0 ? matched : allSites).map((m) => m.label);
      }
      return allSites.map((m) => m.label);
    }
    if (fieldKey === "equipmentSystem" || fieldKey === "equipment") {
      const allEquip = masterOptions.equipment.map((e) =>
        typeof e === "string" ? { label: e, customerName: "", customerCode: "" } : e,
      );
      if (selectedCustStr) {
        const matched = allEquip.filter((e) => {
          const cName = (e.customerName || "").toLowerCase();
          const cCode = (e.customerCode || "").toLowerCase();
          return (
            (cName && selectedCustStr.includes(cName)) ||
            (cCode && selectedCustStr.includes(cCode))
          );
        });
        return (matched.length > 0 ? matched : allEquip).map((m) => m.label);
      }
      return allEquip.map((m) => m.label);
    }
    if (fieldKey === "systemId") {
      if (selectedCustStr) {
        const matched = masterOptions.systems.filter((s) => {
          const cName = (s.customerName || "").toLowerCase();
          const cCode = (s.customerCode || "").toLowerCase();
          return (
            (cName && selectedCustStr.includes(cName)) ||
            (cCode && selectedCustStr.includes(cCode))
          );
        });
        return (matched.length > 0 ? matched : masterOptions.systems).map((s) => s.label);
      }
      return masterOptions.systems.map((s) => s.label);
    }
    if (
      fieldKey === "receivedBy" ||
      fieldKey === "person" ||
      fieldKey === "inspector" ||
      fieldKey === "raisedBy" ||
      fieldKey === "counter" ||
      fieldKey === "approver"
    ) {
      return masterOptions.technicians;
    }
    if (fieldKey === "serial" || fieldKey === "oldSerial" || fieldKey === "newSerial" || fieldKey === "unitSerial") {
      return masterOptions.serials;
    }
    if (fieldKey === "item") {
      return masterOptions.items;
    }
    if (fieldKey === "dealer" || fieldKey === "vendor" || fieldKey === "supplier") {
      return masterOptions.vendors;
    }
    if (fieldKey === "franchise") {
      return masterOptions.franchises;
    }
    if (fieldKey === "warehouse" || fieldKey === "fromWarehouse" || fieldKey === "toWarehouse") {
      return masterOptions.warehouses;
    }
    if (fieldKey === "roles" || fieldKey === "role") {
      return masterOptions.serviceRoles.length > 0 ? masterOptions.serviceRoles : undefined;
    }
    if (fieldKey === "requestType" || fieldKey === "callType" || fieldKey === "serviceType") {
      return masterOptions.serviceTypes.length > 0 ? masterOptions.serviceTypes : undefined;
    }
    if (fieldKey === "holdReason") {
      return masterOptions.holdReasons.length > 0 ? masterOptions.holdReasons : undefined;
    }
    if (fieldKey === "repeatReason") {
      return masterOptions.repeatReasons.length > 0 ? masterOptions.repeatReasons : undefined;
    }
    if (fieldKey === "checklistTemplate" || fieldKey === "criteriaSet") {
      return masterOptions.checklistTemplates;
    }
    if (fieldKey === "warrantyRule") {
      return masterOptions.warrantyRules;
    }
    if (fieldKey === "contract" || fieldKey === "previousContract") {
      return masterOptions.contracts;
    }
    if (fieldKey === "project" || fieldKey === "projectCode") {
      return masterOptions.projects.map((p) => p.label);
    }
    if (fieldKey === "gl") {
      return masterOptions.glAccounts;
    }
    if (fieldKey === "requestNo" && meta.code !== "TRX-01" && meta.code !== "TRX-17") {
      return masterOptions.serviceRequests.map((sr) => sr.label);
    }
    if (
      (fieldKey === "callNo" && meta.code !== "TRX-02") ||
      fieldKey === "repeatOf" ||
      fieldKey === "calls"
    ) {
      return masterOptions.serviceCalls.map((sc) => sc.label);
    }
    if (fieldKey === "claim") {
      return masterOptions.warrantyClaims;
    }
    if (fieldKey === "countNo" && meta.code !== "TRX-30") {
      return masterOptions.stockCounts.map((sc) => sc.label);
    }
    if (
      fieldKey === "document" ||
      fieldKey === "originatingDocument" ||
      fieldKey === "priorDiscontinuation" ||
      fieldKey === "sapDocument" ||
      fieldKey === "po" ||
      fieldKey === "invoiceDelivery" ||
      fieldKey === "record"
    ) {
      return masterOptions.documents;
    }
    return undefined;
  };

  // Dynamic columns for the Saved Records Directory table based on the active screen's fields
  const directoryColumns = useMemo(() => {
    const cols = meta.fields
      .filter((f) => f.key !== "status" && f.key !== "signature")
      .slice(0, 4);
    return cols;
  }, [meta.fields]);

  // Filtered saved records list
  const filteredSavedRecords = useMemo(() => {
    if (!searchQuery.trim()) return savedRecords;
    const q = searchQuery.toLowerCase();
    return savedRecords.filter((r) =>
      Object.values(r).some((val) =>
        typeof val === "string" || typeof val === "number"
          ? String(val).toLowerCase().includes(q)
          : false,
      ),
    );
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
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-primary/10 text-primary font-bold">
                  {meta.code}
                </span>
                <span className="text-[11px] font-mono text-muted-foreground">
                  API: {processConfig.apiPath}
                </span>
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
              onClick={() => handleSaveTransaction()}
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
                  action.includes("Create") ||
                  action.includes("Confirm") ||
                  action.includes("Approve") ||
                  action.includes("Activate") ||
                  action.includes("Assign") ||
                  action.includes("Schedule");
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
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-bold text-foreground">
              Transaction Header Information
            </h2>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-muted text-muted-foreground border border-border">
              Ref: {String(formData[processConfig.primaryField] || formData["recordNo"] || "NEW")}
            </span>
          </div>
          <span className="text-xs font-mono text-muted-foreground">
            Current Status:{" "}
            <strong className="text-primary">{String(formData["status"] || "Draft")}</strong>
          </span>
        </div>

        {/* Dynamic Form Header Fields Grid with Master & Transaction Lookups */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {meta.fields.map((field) => {
            const optionsOverride = getFieldDropdownOptions(field.key);
            return (
              <TransactionField
                key={field.key}
                field={field}
                value={formData[field.key]}
                optionsOverride={optionsOverride}
                onChange={(val) => handleFieldChange(field.key, val)}
                onLinkClick={(_key, val) => {
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
                  onClick={() =>
                    handleSaveTransaction("Auto-Suggested (BCR-20)")
                  }
                  className="px-2.5 py-1 text-xs rounded bg-card border border-border hover:bg-muted font-medium text-foreground cursor-pointer"
                >
                  Auto-suggest
                </button>
                <button
                  onClick={() => handleSaveTransaction("Appointments Confirmed")}
                  className="px-2.5 py-1 text-xs rounded bg-primary text-primary-foreground font-medium cursor-pointer"
                >
                  Confirm Appointments
                </button>
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Select branch, team, and service type above and click Save Record or Confirm Appointments to persist dispatch schedule to PostgreSQL.
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
                onClick={() => {
                  setMeetLinkGenerated(true);
                  handleFieldChange("googleMeetLinkRequired", "Yes");
                  handleFieldChange("meetLink", "https://meet.google.com/tls-diag-room");
                }}
                className="px-3 py-1.5 text-xs rounded-md bg-sky-600 text-white font-medium hover:bg-sky-700 cursor-pointer flex items-center gap-1.5 shadow-xs"
              >
                <Video className="w-3.5 h-3.5" />
                <span>
                  {meetLinkGenerated ? "Regenerate Google Meet" : "Create Google Meet Link"}
                </span>
              </button>
            </div>
            {(meetLinkGenerated || Boolean(formData["meetLink"])) && (
              <div className="p-2.5 rounded bg-white dark:bg-neutral-900 border border-sky-300 dark:border-sky-800 flex items-center justify-between text-xs">
                <span className="font-mono text-sky-700 dark:text-sky-300">
                  {String(formData["meetLink"] || "https://meet.google.com/tls-diag-room")}
                </span>
                <span className="text-[10px] text-emerald-600 font-medium">Link Active</span>
              </div>
            )}
          </div>
        )}

        {meta.code === "TRX-23" && (
          <div className="mt-4 p-4 rounded-xl border border-border bg-muted/30 flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs font-bold text-foreground block">
                Interactive Technician Evaluation Score Slider
              </span>
              <span className="text-[11px] text-muted-foreground block">
                Adjust total evaluation score or toggle Not-Required Override:
              </span>
            </div>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min={0}
                max={100}
                disabled={evalNotRequired}
                value={Number(formData["totalScore"] ?? evalScore)}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  setEvalScore(v);
                  handleFieldChange("totalScore", v);
                }}
                className="w-36 accent-primary cursor-pointer"
              />
              <span className="text-sm font-mono font-bold text-primary">
                {evalNotRequired ? "N/A" : `${formData["totalScore"] ?? evalScore}%`}
              </span>
              <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                <input
                  type="checkbox"
                  checked={evalNotRequired}
                  onChange={(e) => {
                    setEvalNotRequired(e.target.checked);
                    handleFieldChange("notRequired", e.target.checked ? "Yes" : "No");
                  }}
                />
                <span>Not Required</span>
              </label>
            </div>
          </div>
        )}

        {meta.code === "TRX-30" && (
          <div className="mt-4 p-4 rounded-xl border border-amber-200 dark:border-amber-900 bg-amber-50/50 dark:bg-amber-950/30 flex items-center justify-between">
            <div className="text-xs">
              <span className="font-bold text-foreground block">Blind Count Mode</span>
              <span className="text-muted-foreground text-[11px]">
                When active, system on-hand quantities are hidden from the counter sheet.
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                const nextVal = !blindCountActive;
                setBlindCountActive(nextVal);
                handleFieldChange("blindCount", nextVal ? "Yes" : "No");
              }}
              className={`px-3 py-1.5 rounded-md text-xs font-bold cursor-pointer ${
                blindCountActive
                  ? "bg-amber-600 text-white"
                  : "bg-card border border-border text-foreground"
              }`}
            >
              {blindCountActive ? "Blind Count: ENABLED" : "Blind Count: DISABLED"}
            </button>
          </div>
        )}
      </div>

      {/* SAVED RECORDS REGISTER & CONTEXT TABS CONTAINER */}
      <div className="bg-card border border-border rounded-xl shadow-xs overflow-hidden">
        {/* Navigation Tabs Header */}
        <div className="flex border-b border-border bg-muted/40 overflow-x-auto">
          {/* Tab 1: Saved Records in PostgreSQL (Enabled for ALL 35 Transaction Screens) */}
          <button
            onClick={() => setActiveTabId("saved-requests")}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold whitespace-nowrap border-b-2 transition-colors cursor-pointer ${
              activeTabId === "saved-requests"
                ? "border-primary text-primary bg-background shadow-xs font-bold"
                : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/60"
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Saved Records Directory</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold">
              {savedRecords.length}
            </span>
          </button>

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

        {/* Tab Content: Saved Records Directory (Full CRUD List View for ALL 35 Screens) */}
        {activeTabId === "saved-requests" && (
          <div className="p-4 sm:p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <span>Saved {meta.name} Records</span>
                  <span className="text-xs font-mono text-muted-foreground font-normal">
                    ({filteredSavedRecords.length} of {savedRecords.length} records in PostgreSQL)
                  </span>
                </h3>
              </div>

              {/* Search Bar for Saved Records */}
              <div className="relative min-w-[260px] sm:w-72">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search saved records..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-border bg-background text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            {/* Responsive Table of Saved Records */}
            <div className="overflow-x-auto border border-border rounded-lg">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-muted/60 border-b border-border">
                    <th className="p-3 font-semibold text-foreground">Record / Ref No.</th>
                    {directoryColumns.map((col) => (
                      <th key={col.key} className="p-3 font-semibold text-foreground">
                        {col.label}
                      </th>
                    ))}
                    <th className="p-3 font-semibold text-foreground">Status</th>
                    <th className="p-3 text-right font-semibold text-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredSavedRecords.length === 0 ? (
                    <tr>
                      <td
                        colSpan={directoryColumns.length + 3}
                        className="p-8 text-center text-muted-foreground"
                      >
                        <FileText className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
                        <p className="font-semibold text-foreground">
                          No saved records found for {meta.name}.
                        </p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          Enter details in the form above and click &ldquo;Save Record&rdquo; to store in PostgreSQL.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredSavedRecords.map((rec, idx) => {
                      const recNo = String(
                        rec[processConfig.primaryField] ||
                          rec["requestNo"] ||
                          rec["callNo"] ||
                          rec["recordNo"] ||
                          rec["id"] ||
                          `${processConfig.prefix}-${idx + 1}`,
                      );
                      const statusVal = String(rec["status"] || "Saved");
                      const isPositive =
                        statusVal.toLowerCase().includes("submit") ||
                        statusVal.toLowerCase().includes("approv") ||
                        statusVal.toLowerCase().includes("activ") ||
                        statusVal.toLowerCase().includes("complet") ||
                        statusVal.toLowerCase().includes("convert");
                      return (
                        <tr key={`${recNo}-${idx}`} className="hover:bg-muted/40 transition-colors">
                          <td className="p-3 font-mono font-bold text-primary whitespace-nowrap">
                            {recNo}
                          </td>
                          {directoryColumns.map((col) => (
                            <td key={col.key} className="p-3 text-foreground">
                              {String(rec[col.key] || "—")}
                            </td>
                          ))}
                          <td className="p-3 whitespace-nowrap">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                isPositive
                                  ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                                  : "bg-amber-500/15 text-amber-700 dark:text-amber-300"
                              }`}
                            >
                              {statusVal}
                            </span>
                          </td>
                          <td className="p-3 text-right whitespace-nowrap">
                            <div className="inline-flex items-center gap-1.5">
                              <button
                                onClick={() => handleLoadRecord(rec)}
                                className="px-2.5 py-1 rounded bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground font-semibold text-[11px] inline-flex items-center gap-1 transition-colors cursor-pointer"
                                title="Load record into form to view or edit"
                              >
                                <Edit3 className="w-3 h-3" />
                                <span>Load / Edit</span>
                              </button>
                              <button
                                onClick={() => handleDeleteRecord(rec)}
                                className="p-1.5 rounded text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                                title="Delete record from PostgreSQL"
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

        {/* Contextual Sub-tab Content (Line items, SAP commercial info, etc.) */}
        {activeTabId !== "saved-requests" && activeTab && (
          <div className="p-4 sm:p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-bold text-foreground">{activeTab.label} Register</h3>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold">
                    {currentTabData.length} recorded
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsAddPartModalOpen(true)}
                  className="px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Line / Entry</span>
                </button>
                <button
                  onClick={handleResetTab}
                  className="px-2.5 py-1.5 rounded-md border border-border bg-card text-foreground hover:bg-muted text-xs font-medium cursor-pointer"
                >
                  Reset Default
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
                        className={`p-3 font-semibold text-foreground ${
                          col.align === "right" ? "text-right" : "text-left"
                        }`}
                      >
                        {col.label}
                      </th>
                    ))}
                    <th className="p-3 text-right font-semibold text-foreground w-16">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {currentTabData.length === 0 ? (
                    <tr>
                      <td
                        colSpan={activeTab.columns.length + 1}
                        className="p-6 text-center text-muted-foreground"
                      >
                        No entries in {activeTab.label}. Click &ldquo;Add Line / Entry&rdquo; to add one.
                      </td>
                    </tr>
                  ) : (
                    currentTabData.map((row, rIdx) => (
                      <tr key={rIdx} className="hover:bg-muted/40 transition-colors">
                        {activeTab.columns.map((col) => (
                          <td
                            key={col.key}
                            className={`p-3 text-foreground ${
                              col.align === "right" ? "text-right font-mono" : ""
                            }`}
                          >
                            {String(row[col.key] ?? "—")}
                          </td>
                        ))}
                        <td className="p-3 text-right">
                          <button
                            onClick={() => handleDeleteRow(rIdx)}
                            className="p-1 rounded text-destructive hover:bg-destructive/10 cursor-pointer"
                            title="Remove line"
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

      {/* Audit Modal */}
      <TransactionAuditModal
        isOpen={isAuditOpen}
        onClose={() => setIsAuditOpen(false)}
        recordId={String(formData[processConfig.primaryField] || formData["recordNo"] || meta.code)}
        screenTitle={meta.name}
        screenCode={meta.code}
      />

      {/* Export Modal */}
      <TransactionExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        meta={meta}
        activeTab={
          activeTab || {
            id: "saved-requests",
            label: "Saved Records",
            columns: directoryColumns,
            data: savedRecords as Record<string, string | number>[],
          }
        }
        formData={formData}
      />

      {/* Add Part / Line Modal */}
      <AddPartModal
        isOpen={isAddPartModalOpen}
        onClose={() => setIsAddPartModalOpen(false)}
        onSavePart={handleSavePart}
        tabColumns={activeTab ? activeTab.columns : []}
        tabLabel={activeTab ? activeTab.label : "Line Items"}
        screenCode={meta.code}
      />

      {/* Link Payment Reference Modal (SAP B1 Integration Ready) */}
      {isPaymentRefModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-card border border-border w-full max-w-md rounded-xl shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                  SAP
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">Link Payment Reference</h3>
                  <p className="text-[11px] text-muted-foreground font-mono">
                    {String(formData["requestNo"] || formData["recordNo"] || "Service Request")} · Ready for SAP B1 Integration
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsPaymentRefModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-foreground block mb-1">Customer</label>
                <input
                  type="text"
                  readOnly
                  value={String(formData["customer"] || "—")}
                  className="w-full px-3 py-1.5 rounded-md border border-border bg-muted/60 text-muted-foreground font-medium"
                />
              </div>

              <div>
                <label className="font-semibold text-foreground block mb-1">
                  Payment / Receipt Ref No. <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. RCP-2026-00412 or SAP AR Invoice No."
                  value={paymentRefInput}
                  onChange={(e) => setPaymentRefInput(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-md border border-border bg-background text-foreground font-mono focus:ring-1 focus:ring-primary focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-foreground block mb-1">Amount (LKR)</label>
                  <input
                    type="number"
                    placeholder="0.00"
                    value={paymentAmountInput}
                    onChange={(e) => setPaymentAmountInput(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-md border border-border bg-background text-foreground font-mono focus:ring-1 focus:ring-primary focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="font-semibold text-foreground block mb-1">Payment Status</label>
                  <select
                    value={paymentStatusInput}
                    onChange={(e) => setPaymentStatusInput(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-md border border-border bg-background text-foreground focus:ring-1 focus:ring-primary focus:outline-hidden"
                  >
                    <option value="Advance Received">Advance Received</option>
                    <option value="Paid in Full">Paid in Full</option>
                    <option value="Pending SAP AR Invoice">Pending SAP AR Invoice</option>
                    <option value="Cheque Pending Clearance">Cheque Pending Clearance</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-foreground block mb-1">Remarks / Notes</label>
                <textarea
                  rows={2}
                  placeholder="Bank deposit / Cheque reference or SAP customer card code..."
                  value={paymentRemarksInput}
                  onChange={(e) => setPaymentRemarksInput(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-md border border-border bg-background text-foreground focus:ring-1 focus:ring-primary focus:outline-hidden"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
              <button
                type="button"
                onClick={() => setIsPaymentRefModalOpen(false)}
                className="px-3 py-1.5 rounded-md border border-border text-foreground hover:bg-muted font-medium text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (!paymentRefInput.trim()) {
                    showToast("Please enter a Payment / Receipt Reference number.");
                    return;
                  }
                  handleFieldChange("paymentRef", paymentRefInput.trim());
                  if (paymentAmountInput) {
                    handleFieldChange("paymentAmount", paymentAmountInput.trim());
                  }
                  handleFieldChange("paymentStatus", paymentStatusInput);
                  await handleSaveTransaction();
                  setIsPaymentRefModalOpen(false);
                  showToast(
                    `Payment reference "${paymentRefInput.trim()}" linked to Service Request.`,
                  );
                }}
                className="px-3.5 py-1.5 rounded-md bg-primary text-primary-foreground font-bold text-xs hover:bg-primary/90 cursor-pointer shadow-xs"
              >
                Link Reference
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
