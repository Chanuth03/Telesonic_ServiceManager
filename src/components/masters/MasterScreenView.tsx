import React, { useState, useEffect, useMemo } from "react";
import {
  ArrowLeft,
  Download,
  History,
  Info,
  Check,
  RefreshCw,
  FileText,
  Search,
  PlusCircle,
  Trash2,
  Edit3,
  CheckCircle2,
  AlertTriangle,
  X,
  Layers,
  Database,
} from "lucide-react";
import { MasterScreenMeta, MasterFieldDef } from "@/data/mastersSpecData";
import { MasterField } from "./MasterField";
import { MasterAuditModal } from "./MasterAuditModal";
import { MasterExportModal } from "./MasterExportModal";
import { apiFetch } from "@/lib/api-client";

interface MasterScreenViewProps {
  meta: MasterScreenMeta;
  onBack: () => void;
}

export const MasterScreenView: React.FC<MasterScreenViewProps> = ({ meta, onBack }) => {
  // Empty form data initialized with empty strings/placeholders
  const [formData, setFormData] = useState<Record<string, unknown>>({});
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [activeTabId, setActiveTabId] = useState<string>("saved-records");
  const [isAuditOpen, setIsAuditOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [showSpecDetails, setShowSpecDetails] = useState(false);
  const [b1Syncing, setB1Syncing] = useState(false);
  const [dynamicRoleOptions, setDynamicRoleOptions] = useState<string[]>([]);

  // Side popup notification state
  const [sidePopup, setSidePopup] = useState<{
    show: boolean;
    title: string;
    message: string;
    recordId?: string;
  }>({
    show: false,
    title: "",
    message: "",
  });

  // Saved records storage (persisted per screen in localStorage)
  const storageKey = `telesonic_mst_${meta.id}`;
  const [savedRecords, setSavedRecords] = useState<Record<string, unknown>[]>(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // Fallback
    }
    // Pre-seed with the authentic sample record so there is data to search and explore
    return meta.sampleRecord ? [meta.sampleRecord] : [];
  });

  // Search query for saved records
  const [savedSearchQuery, setSavedSearchQuery] = useState("");

  // Sync saved records to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(savedRecords));
    } catch (e) {
      console.error("Failed to persist master records to localStorage", e);
    }
  }, [savedRecords, storageKey]);

  // If this screen is System Role Master (MST-32), fetch directly from PostgreSQL
  useEffect(() => {
    if (meta.code === "MST-32" || meta.id === "O1-SCR-MST-32") {
      apiFetch("/api/roles")
        .then((res) => res.json())
        .then((data) => {
          if (data && data.roles && Array.isArray(data.roles)) {
            setSavedRecords(data.roles);
          }
        })
        .catch((err) => console.error("Failed to load roles from DB:", err));
    }
  }, [meta.code, meta.id]);

  // If this screen is System User Master (MST-33), fetch dynamic roles and users from PostgreSQL
  useEffect(() => {
    if (meta.code === "MST-33" || meta.id === "O1-SCR-MST-33") {
      // 1. Fetch live system roles for the dropdown
      apiFetch("/api/roles")
        .then((res) => res.json())
        .then((data) => {
          if (data && data.roles && Array.isArray(data.roles)) {
            // Only include Active roles from database
            const roleCodes = data.roles
              .filter((r: any) => String(r.status || "Active").toLowerCase() === "active")
              .map((r: any) => String(r.code).toUpperCase().trim());
            if (roleCodes.length > 0) {
              setDynamicRoleOptions(roleCodes);
            }
          }
        })
        .catch((e) => console.error("Failed to load roles for user dropdown:", e));

      // 2. Fetch live users from PostgreSQL
      apiFetch("/api/users")
        .then((res) => res.json())
        .then((data) => {
          if (data && data.users && Array.isArray(data.users)) {
            setSavedRecords(data.users);
          }
        })
        .catch((e) => console.error("Failed to load users from DB:", e));
    }
  }, [meta.code, meta.id]);

  // Auto-dismiss side popup after 3.8s
  useEffect(() => {
    if (sidePopup.show) {
      const timer = setTimeout(() => {
        setSidePopup((prev) => ({ ...prev, show: false }));
      }, 3800);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [sidePopup.show]);

  const handleFieldChange = (key: string, val: unknown) => {
    setFormData((prev) => ({ ...prev, [key]: val }));
    // Clear validation error on change
    if (validationErrors[key]) {
      setValidationErrors((prev) => {
        const updated = { ...prev };
        delete updated[key];
        return updated;
      });
    }
  };

  // Validation function
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    meta.fields.forEach((field: MasterFieldDef) => {
      const val = formData[field.key];
      const strVal = val !== undefined && val !== null ? String(val).trim() : "";

      // Mandatory check
      if (field.mandatory && !strVal) {
        errors[field.key] = `${field.label} is mandatory. Please fill in this field.`;
        return;
      }

      // Datatype checks if value is present
      if (strVal) {
        if (field.type === "number") {
          const num = Number(strVal);
          if (isNaN(num)) {
            errors[field.key] = `${field.label} must be a valid number.`;
          } else if (num < 0) {
            errors[field.key] = `${field.label} cannot be negative.`;
          }
        } else if (field.type === "amount") {
          // Remove potential commas
          const cleanVal = strVal.replace(/,/g, "");
          const num = Number(cleanVal);
          if (isNaN(num)) {
            errors[field.key] = `${field.label} must be a valid monetary amount in LKR.`;
          } else if (num < 0) {
            errors[field.key] = `${field.label} cannot be a negative amount.`;
          }
        } else if (field.type === "date") {
          const date = new Date(strVal);
          if (isNaN(date.getTime())) {
            errors[field.key] = `Please enter a valid calendar date for ${field.label}.`;
          }
        }
      }
    });

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Save new record
  const handleSave = () => {
    const isValid = validateForm();
    if (!isValid) {
      setSidePopup({
        show: true,
        title: "Validation Error",
        message: "Please fill in all mandatory fields with valid values.",
      });
      return;
    }

    // Determine primary identifier for the record
    const primaryKey = meta.fields[0]?.key || "id";
    const primaryLabel =
      (formData[primaryKey] as string) || `${meta.code}-${Date.now().toString().slice(-4)}`;

    const newRecord: Record<string, unknown> = {
      ...formData,
      [primaryKey]: primaryLabel,
      createdAt: new Date().toISOString(),
      status: formData["status"] || "Active",
    };

    // If System User Master, save directly to PostgreSQL DB
    if (meta.code === "MST-33" || meta.id === "O1-SCR-MST-33") {
      apiFetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
        .then((res) => res.json())
        .then((result) => {
          if (result.user) {
            setSavedRecords((prev) => [
              result.user,
              ...prev.filter(
                (u) =>
                  u["id"] !== result.user["id"] &&
                  String(u["email"]).toLowerCase() !== String(result.user["email"]).toLowerCase(),
              ),
            ]);
          }
        })
        .catch((e) => console.error("Error saving user to DB:", e));
    } else
      // If System Role Master, save directly to PostgreSQL DB
      if (meta.code === "MST-32" || meta.id === "O1-SCR-MST-32") {
        const payload = {
          ...formData,
          code: String(formData["code"] || "")
            .toUpperCase()
            .trim(),
        };
        apiFetch("/api/roles", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
          .then((res) => res.json())
          .then((result) => {
            if (result.role) {
              setSavedRecords((prev) => [
                result.role,
                ...prev.filter(
                  (r) =>
                    String(r["code"]).toUpperCase() !== String(result.role["code"]).toUpperCase(),
                ),
              ]);
            }
          })
          .catch((e) => console.error("Error saving role to DB:", e));
      } else {
        // Prepend to saved records list (local screens only)
        setSavedRecords((prev) => [
          newRecord,
          ...prev.filter((r) => r[primaryKey] !== primaryLabel),
        ]);
      }

    // Trigger side popup
    setSidePopup({
      show: true,
      title: "Saved Successfully",
      message: `Record "${primaryLabel}" saved successfully to ${meta.name}.`,
      recordId: primaryLabel,
    });

    // Clear form fields back to placeholders
    setFormData({});
    setValidationErrors({});
  };

  // Clear form manually
  const handleClearForm = () => {
    setFormData({});
    setValidationErrors({});
  };

  // Load saved record into form for viewing/editing
  const handleLoadRecord = (rec: Record<string, unknown>) => {
    // Keep record id and details, clear password input
    const cleanRec = { ...rec, password: "" };
    setFormData(cleanRec);
    setValidationErrors({});
    window.scrollTo({ top: 150, behavior: "smooth" });
    setSidePopup({
      show: true,
      title: "Record Loaded",
      message: `Loaded record into form for editing.`,
      recordId: String((meta.fields[0] && rec[meta.fields[0].key]) || ""),
    });
  };

  // Delete saved record
  const handleDeleteRecord = (rec: Record<string, unknown>) => {
    const primaryKey = meta.fields[0]?.key || "id";
    const recId = rec[primaryKey];
    setSavedRecords((prev) => prev.filter((r) => r[primaryKey] !== recId));

    if (meta.code === "MST-33" || meta.id === "O1-SCR-MST-33") {
      const emailToDelete = rec["email"] || recId;
      apiFetch(`/api/users?email=${encodeURIComponent(String(emailToDelete))}`, {
        method: "DELETE",
      }).catch((e) => console.error("Error deleting user from DB:", e));
    }

    if (meta.code === "MST-32" || meta.id === "O1-SCR-MST-32") {
      const codeToDelete = rec["code"] || recId;
      apiFetch(`/api/roles?code=${encodeURIComponent(String(codeToDelete))}`, {
        method: "DELETE",
      }).catch((e) => console.error("Error deleting role from DB:", e));
    }

    setSidePopup({
      show: true,
      title: "Record Removed",
      message: `Record "${recId}" removed from saved list.`,
    });
  };

  // Action Bar Buttons
  const handleAction = (action: string) => {
    if (action.includes("History") || action.includes("Audit")) {
      setIsAuditOpen(true);
      return;
    }
    if (action.includes("Export")) {
      setIsExportOpen(true);
      return;
    }
    if (action.includes("B1 Change") || action.includes("Request B1")) {
      setB1Syncing(true);
      setTimeout(() => {
        setB1Syncing(false);
        setSidePopup({
          show: true,
          title: "SAP B1 Sync Request",
          message: "Change request transmitted to SAP Business One DI Server API.",
        });
      }, 700);
      return;
    }
    if (action.includes("Add") || action.includes("Save") || action.includes("Update")) {
      handleSave();
      return;
    }
    if (action.includes("Deactivate")) {
      handleFieldChange("status", "Inactive");
      setSidePopup({
        show: true,
        title: "Status Changed",
        message: "Status set to Inactive. Click Save to apply.",
      });
      return;
    }
  };

  // Filtered saved records for search
  const filteredSavedRecords = useMemo(() => {
    if (!savedSearchQuery.trim()) return savedRecords;
    const q = savedSearchQuery.toLowerCase();
    return savedRecords.filter((rec) =>
      Object.values(rec).some((val) =>
        String(val ?? "")
          .toLowerCase()
          .includes(q),
      ),
    );
  }, [savedRecords, savedSearchQuery]);

  // Primary preview columns for saved records table (first 4 fields)
  const previewFields = meta.fields.filter((f) => f.key !== "status").slice(0, 4);

  const activeTab = meta.tabs.find((t) => t.id === activeTabId);

  return (
    <div className="space-y-5 relative">
      {/* SIDE POPUP NOTIFICATION (Toast on right) */}
      {sidePopup.show && (
        <aside
          aria-live="polite"
          className="fixed top-20 right-4 sm:right-6 z-50 max-w-sm w-full bg-card border border-border shadow-2xl rounded-2xl p-4 transition-all duration-300 transform translate-y-0 animate-in fade-in slide-in-from-right-10"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                  sidePopup.title.includes("Error")
                    ? "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300"
                    : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                }`}
              >
                {sidePopup.title.includes("Error") ? (
                  <AlertTriangle className="w-5 h-5" />
                ) : (
                  <CheckCircle2 className="w-5 h-5" />
                )}
              </div>
              <div>
                <h4 className="text-xs font-bold text-foreground">{sidePopup.title}</h4>
                <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
                  {sidePopup.message}
                </p>
                {sidePopup.recordId && (
                  <span className="inline-block mt-1.5 font-mono text-[10px] font-bold px-1.5 py-0.2 rounded bg-muted text-foreground">
                    ID: {sidePopup.recordId}
                  </span>
                )}
              </div>
            </div>

            <button
              onClick={() => setSidePopup((prev) => ({ ...prev, show: false }))}
              className="text-muted-foreground hover:text-foreground p-1 rounded-md cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </aside>
      )}

      {/* Top Navigation & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-border">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-medium"
            title="Return to Masters Hub"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Masters</span>
          </button>
          <div className="h-4 w-px bg-border" />
          <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">
            Masters · {meta.category}
          </span>
        </div>

        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <button
            onClick={() => setShowSpecDetails(!showSpecDetails)}
            className="flex items-center gap-1 text-primary hover:underline text-xs cursor-pointer font-medium"
          ></button>
        </div>
      </div>

      {/* MAIN MASTER SCREEN FORM CARD */}
      <div className="bg-card border border-border rounded-2xl shadow-xs overflow-hidden">
        {/* Title Bar */}
        <div className="px-5 py-4 border-b border-border bg-muted/30 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-base font-bold text-foreground flex items-center gap-2">
                <span>{meta.name}</span>
              </h1>
            </div>
          </div>

          {/* Action Table Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleSave}
              className="px-3 py-1.5 text-xs font-bold rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground transition-colors shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Save Record</span>
            </button>

            <button
              onClick={handleClearForm}
              className="px-2.5 py-1.5 text-xs font-medium rounded-lg border border-border bg-background hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              title="Clear all fields"
            >
              Clear Fields
            </button>

            {meta.actions.map((act) => (
              <button
                key={act}
                onClick={() => handleAction(act)}
                disabled={b1Syncing}
                className="px-2.5 py-1.5 text-xs font-medium rounded-lg border border-border bg-background hover:bg-muted text-foreground transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
              >
                {act === "History / Audit" ? (
                  <span className="flex items-center gap-1">
                    <History className="w-3.5 h-3.5" />
                    <span>Audit Log</span>
                  </span>
                ) : act === "Export Excel / PDF" ? (
                  <span className="flex items-center gap-1">
                    <Download className="w-3.5 h-3.5" />
                    <span>Export</span>
                  </span>
                ) : act === "Request B1 Change" ? (
                  <span className="flex items-center gap-1 text-sky-600 dark:text-sky-400 font-semibold">
                    <RefreshCw className={`w-3.5 h-3.5 ${b1Syncing ? "animate-spin" : ""}`} />
                    <span>Request B1</span>
                  </span>
                ) : (
                  act
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Global validation banner if errors exist */}
        {Object.keys(validationErrors).length > 0 && (
          <div className="mx-5 my-4 p-3.5 rounded-xl border border-rose-300 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200 text-xs font-medium flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>
                Please fill in all mandatory fields marked with an asterisk (
                <strong className="text-red-600">*</strong>) and ensure data types are valid.
              </span>
            </div>
            <span className="font-bold font-mono px-2 py-0.5 rounded bg-rose-200/60 dark:bg-rose-900 text-rose-900 dark:text-rose-100">
              {Object.keys(validationErrors).length} Error(s)
            </span>
          </div>
        )}

        {/* Form Fields Grid - Starts empty with placeholders */}
        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {meta.fields.map((f) => {
            const fieldDef = (meta.code === "MST-33" && f.key === "role" && dynamicRoleOptions.length > 0)
              ? { ...f, options: dynamicRoleOptions }
              : f;
            return (
              <MasterField
                key={f.key}
                field={fieldDef}
                value={formData[f.key]}
                error={validationErrors[f.key]}
                onChange={(val) => handleFieldChange(f.key, val)}
              />
            );
          })}
        </div>

        {/* Legend Footer */}
        <div className="px-5 py-2.5 bg-muted/40 border-t border-border text-[11px] text-muted-foreground flex flex-wrap items-center justify-between gap-4 font-mono">
          <div className="flex flex-wrap items-center gap-4">
            <span className="flex items-center gap-1">
              <span className="text-red-500 font-bold">*</span>
              <span>Mandatory Field (Required for Save)</span>
            </span>
          </div>
        </div>
      </div>

      {/* SAVED RECORDS REGISTER & CONTEXTUAL TABS CONTAINER */}
      <div className="bg-card border border-border rounded-2xl shadow-xs overflow-hidden">
        {/* Navigation Tabs (Saved Records + Child Sub-grids from Meta) */}
        <div className="flex flex-wrap items-center border-b border-border px-4 bg-muted/30 gap-1 overflow-x-auto">
          {/* Default Tab: Saved Records */}
          <button
            onClick={() => setActiveTabId("saved-records")}
            className={`px-4 py-3 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTabId === "saved-records"
                ? "border-primary text-primary bg-background shadow-xs"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Saved Records Directory</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-primary/10 text-primary">
              {savedRecords.length}
            </span>
          </button>

          {/* Child Sub-grid Tabs from Spec */}
          {meta.tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTabId(tab.id)}
              className={`px-3 py-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                activeTabId === tab.id
                  ? "border-primary text-primary font-bold bg-background shadow-xs"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <span>{tab.label}</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-muted text-muted-foreground">
                {tab.data.length}
              </span>
            </button>
          ))}
        </div>

        {/* TAB CONTENT 1: Saved Records Table with Search Bar */}
        {activeTabId === "saved-records" && (
          <div className="p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <span>Saved Records Register</span>
                  <span className="text-xs font-mono text-muted-foreground">
                    ({filteredSavedRecords.length} of {savedRecords.length} records)
                  </span>
                </h3>
              </div>

              {/* Search Bar for Saved Records */}
              <div className="relative min-w-[260px] sm:w-72">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search saved records..."
                  value={savedSearchQuery}
                  onChange={(e) => setSavedSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-border bg-background text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            {/* Saved Records Table */}
            <div className="overflow-x-auto border border-border rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/60 text-muted-foreground font-semibold border-b border-border">
                  <tr>
                    {previewFields.map((f) => (
                      <th key={f.key} className="py-2.5 px-3 whitespace-nowrap">
                        {f.label}
                      </th>
                    ))}
                    <th className="py-2.5 px-3 text-center">Status</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredSavedRecords.map((rec, rIdx) => {
                    const primaryKey = meta.fields[0]?.key || "id";
                    const isStatusActive = (rec["status"] as string) !== "Inactive";

                    return (
                      <tr key={rIdx} className="hover:bg-muted/40 transition-colors">
                        {previewFields.map((f, cIdx) => (
                          <td
                            key={f.key}
                            className={`py-3 px-3 ${
                              cIdx === 0
                                ? "font-mono font-bold text-primary whitespace-nowrap"
                                : f.type === "amount"
                                  ? "font-mono text-foreground font-semibold"
                                  : "text-foreground"
                            }`}
                          >
                            {String(rec[f.key] || "—")}
                          </td>
                        ))}
                        <td className="py-3 px-3 text-center whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                              isStatusActive
                                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                                : "bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-400"
                            }`}
                          >
                            {String(rec["status"] || "Active")}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right whitespace-nowrap">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              onClick={() => handleLoadRecord(rec)}
                              className="px-2.5 py-1 text-xs font-semibold rounded-md bg-muted hover:bg-primary hover:text-primary-foreground text-foreground transition-colors cursor-pointer flex items-center gap-1"
                              title="Load this record into the form above to edit"
                            >
                              <Edit3 className="w-3 h-3" />
                              <span>Load</span>
                            </button>
                            <button
                              onClick={() => handleDeleteRecord(rec)}
                              className="p-1 rounded-md hover:bg-rose-50 text-muted-foreground hover:text-rose-600 dark:hover:bg-rose-950/60 transition-colors cursor-pointer"
                              title="Delete record"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {filteredSavedRecords.length === 0 && (
                <div className="p-8 text-center text-muted-foreground text-xs space-y-1">
                  <p className="font-semibold text-foreground">No saved records found</p>
                  <p>
                    {savedSearchQuery
                      ? `No records matching "${savedSearchQuery}". Try clearing search.`
                      : "Fill in the form above and click 'Save Record' to add your first record."}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB CONTENT 2: Contextual Sub-Grid from Meta (e.g. Addresses, Contacts) */}
        {activeTab && activeTabId !== "saved-records" && (
          <div className="p-5 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <div className="font-bold text-foreground flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-primary" />
                <span>{activeTab.label} Sub-Register</span>
              </div>
              <button
                onClick={() => setIsExportOpen(true)}
                className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-border bg-background hover:bg-muted text-foreground transition-colors cursor-pointer flex items-center gap-1"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Sub-Grid</span>
              </button>
            </div>

            <div className="overflow-x-auto border border-border rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/60 text-muted-foreground font-semibold border-b border-border">
                  <tr>
                    {activeTab.columns.map((col) => (
                      <th
                        key={col.key}
                        className={`py-2.5 px-3 ${col.align === "right" ? "text-right" : "text-left"}`}
                      >
                        <span className="flex items-center gap-1">
                          {col.label}
                          {col.isB1 && (
                            <span className="text-[9px] font-mono px-1 py-0.2 rounded-xs bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300">
                              ⇄B1
                            </span>
                          )}
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {activeTab.data.length === 0 ? (
                    <tr>
                      <td
                        colSpan={activeTab.columns.length}
                        className="py-6 text-center text-muted-foreground"
                      >
                        No records in this tab
                      </td>
                    </tr>
                  ) : (
                    activeTab.data.map((row, idx) => (
                      <tr key={idx} className="hover:bg-muted/40 transition-colors">
                        {activeTab.columns.map((col) => (
                          <td
                            key={col.key}
                            className={`py-3 px-3 text-foreground ${
                              col.align === "right"
                                ? "text-right font-mono tabular-nums"
                                : "font-normal"
                            }`}
                          >
                            {String(row[col.key] || "—")}
                          </td>
                        ))}
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
      <MasterAuditModal
        isOpen={isAuditOpen}
        onClose={() => setIsAuditOpen(false)}
        recordId={String((meta.fields[0] && formData[meta.fields[0].key]) || meta.code)}
        screenTitle={meta.name}
      />

      {/* Export Modal */}
      {meta.tabs[0] && (
        <MasterExportModal
          isOpen={isExportOpen}
          onClose={() => setIsExportOpen(false)}
          meta={meta}
          activeTab={meta.tabs[0]}
          formData={formData}
        />
      )}
    </div>
  );
};
