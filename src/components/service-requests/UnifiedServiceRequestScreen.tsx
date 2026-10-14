import React, { useState } from "react";
import {
  Building2,
  MapPin,
  Cpu,
  AlertCircle,
  Clock,
  ShieldCheck,
  DollarSign,
  FileText,
  UserCheck,
  Layers,
  Printer,
  Download,
  RefreshCw,
  Save,
  CheckCircle2,
  PhoneCall,
  AlertTriangle,
  History,
  ArrowRight,
  ExternalLink,
  ChevronDown,
  Wrench,
  Search,
} from "lucide-react";
import { ServiceRequestRecord, SAMPLE_SERVICE_REQUESTS } from "@/data/serviceRequestsSpecData";

interface UnifiedServiceRequestScreenProps {
  onNavigateToScreen?: (screenId: string, contextId?: string) => void;
}

export const UnifiedServiceRequestScreen: React.FC<UnifiedServiceRequestScreenProps> = ({
  onNavigateToScreen,
}) => {
  const [requests, setRequests] = useState<ServiceRequestRecord[]>(SAMPLE_SERVICE_REQUESTS);
  const [selectedId, setSelectedId] = useState<string>(SAMPLE_SERVICE_REQUESTS[0].id);
  const [activeTab, setActiveTab] = useState<
    "diagnostics" | "commercial" | "history" | "parts" | "audit"
  >("diagnostics");
  const [isSyncingB1, setIsSyncingB1] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [searchFilter, setSearchFilter] = useState("");

  const currentReq = requests.find((r) => r.id === selectedId) || requests[0];

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSyncSAP = () => {
    setIsSyncingB1(true);
    setTimeout(() => {
      setIsSyncingB1(false);
      showToast(
        "⇄ Synced with SAP Business One DI Server API: CardCode, Credit Limit & Invoices updated.",
      );
    }, 800);
  };

  const handleSave = () => {
    showToast(`Service Request ${currentReq.id} saved successfully & audit logged.`);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportCsv = () => {
    const csvContent = `data:text/csv;charset=utf-8,Ticket ID,Customer,Phone,Equipment Serial,Model,Status,Priority,Credit Limit LKR,Overdue LKR\n"${currentReq.id}","${currentReq.customer.cardName}","${currentReq.customer.phone}","${currentReq.equipment.serialNo}","${currentReq.equipment.model}","${currentReq.status}","${currentReq.priority}","${currentReq.commercial.creditLimitLKR}","${currentReq.commercial.overdueAmountLKR}"`;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${currentReq.id}_service_request.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-emerald-700 text-white px-4 py-3 rounded-lg shadow-xl text-sm font-medium animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-200" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Screen Header & Specification Badge */}
      <div className="bg-card border border-border rounded-xl p-4 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                O1-SCR-TRX-01
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                Priority P1 · SM Browser
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20 flex items-center gap-1">
                ⇄B1 Live Two-Way (BP + Equip + AR Invoice)
              </span>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <span>Unified Service Request with SAP Commercial Information Panel</span>
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Multi-panel service ticket creation and management interface with live SAP Business
              One customer financial health verification.
            </p>
          </div>

          {/* Quick Ticket Switcher & New Button */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search ticket / customer..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="text-xs pl-8 pr-2 py-1.5 rounded-lg border border-border bg-background text-foreground w-48 focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-border bg-background text-foreground cursor-pointer"
            >
              {requests
                .filter(
                  (r) =>
                    !searchFilter ||
                    r.id.toLowerCase().includes(searchFilter.toLowerCase()) ||
                    r.customer.cardName.toLowerCase().includes(searchFilter.toLowerCase()),
                )
                .map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.id}: {r.customer.cardName.slice(0, 24)} ({r.status})
                  </option>
                ))}
            </select>
          </div>
        </div>

        {/* Global Action Bar */}
        <div className="mt-4 pt-3 border-t border-border flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleSave}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer shadow-xs"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save & Sync B1</span>
            </button>

            <button
              onClick={handleSyncSAP}
              disabled={isSyncingB1}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-border bg-background hover:bg-muted text-foreground transition-colors cursor-pointer"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${isSyncingB1 ? "animate-spin text-primary" : "text-sky-500"}`}
              />
              <span>{isSyncingB1 ? "Querying SAP..." : "Refresh SAP Commercial"}</span>
            </button>

            {currentReq.repeatFlag?.isRepeat && onNavigateToScreen && (
              <button
                onClick={() => onNavigateToScreen("O1-SCR-TRX-03", currentReq.id)}
                className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/30 hover:bg-amber-500/20 transition-colors cursor-pointer animate-pulse"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                <span>Repeat Call Alert ({currentReq.repeatFlag.repeatScore}% Match)</span>
              </button>
            )}

            {currentReq.isMultiEquipment && onNavigateToScreen && (
              <button
                onClick={() => onNavigateToScreen("O1-SCR-TRX-04", currentReq.id)}
                className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg bg-purple-500/10 text-purple-700 dark:text-purple-400 border border-purple-500/30 hover:bg-purple-500/20 transition-colors cursor-pointer"
              >
                <Layers className="w-3.5 h-3.5 text-purple-500" />
                <span>Breakdown 6x Multi-Units</span>
              </button>
            )}

            {currentReq.commercial.billingHold && onNavigateToScreen && (
              <button
                onClick={() => onNavigateToScreen("O1-SCR-TRX-03", currentReq.id)}
                className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg bg-destructive/10 text-destructive border border-destructive/30 hover:bg-destructive/20 transition-colors cursor-pointer"
              >
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Resolve Credit Hold</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-lg border border-border bg-background hover:bg-muted text-foreground transition-colors cursor-pointer"
              title="Print Service Job Card (O1-SCR-COM-12 Standard)"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Card</span>
            </button>
            <button
              onClick={handleExportCsv}
              className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-lg border border-border bg-background hover:bg-muted text-foreground transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3-Panel Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Panel 1: Customer Master & Site (Col 4) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Customer Card */}
          <div className="bg-card border border-border rounded-xl p-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-border pb-2.5 mb-3">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-bold text-foreground">Customer & Business Partner</h3>
              </div>
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">
                ⇄B1 OCRD
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[11px] font-medium text-muted-foreground">
                  BP CardCode & Name *
                </label>
                <div className="font-semibold text-foreground mt-0.5 flex items-center justify-between">
                  <span>{currentReq.customer.cardName}</span>
                  <span className="font-mono text-[11px] px-1.5 py-0.5 bg-muted rounded font-bold text-primary">
                    {currentReq.customer.cardCode}
                  </span>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-medium text-muted-foreground">
                  Primary Contact Person
                </label>
                <div className="text-foreground font-medium mt-0.5">
                  {currentReq.customer.contactPerson}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-medium text-muted-foreground">
                    Phone Number
                  </label>
                  <div className="text-foreground font-mono font-medium mt-0.5">
                    {currentReq.customer.phone}
                  </div>
                </div>
                <div>
                  <label className="text-[11px] font-medium text-muted-foreground">Email</label>
                  <div className="text-foreground truncate font-medium mt-0.5">
                    {currentReq.customer.email}
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-border">
                <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                  <MapPin className="w-3.5 h-3.5 text-primary" />
                  <span className="font-semibold text-foreground text-[11px]">
                    Service Site Location
                  </span>
                  <span className="font-mono text-[10px] text-muted-foreground">
                    ({currentReq.customer.siteId})
                  </span>
                </div>
                <div className="text-foreground font-medium text-[11px]">
                  {currentReq.customer.siteName}
                </div>
                <div className="text-muted-foreground text-[11px] mt-0.5">
                  {currentReq.customer.address}
                </div>
                <div className="mt-1 flex items-center gap-2 text-[10px] text-muted-foreground">
                  <span className="px-1.5 py-0.5 bg-muted rounded font-medium">
                    {currentReq.customer.district}
                  </span>
                  <span className="px-1.5 py-0.5 bg-muted rounded font-medium">
                    {currentReq.customer.zone}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Installed Base Equipment Card */}
          <div className="bg-card border border-border rounded-xl p-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-border pb-2.5 mb-3">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-bold text-foreground">Installed Base Equipment</h3>
              </div>
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">
                ⇄B1 OINS
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-[11px] font-medium text-muted-foreground">
                    Serial Number *
                  </label>
                  <div className="font-mono font-bold text-foreground text-xs">
                    {currentReq.equipment.serialNo}
                  </div>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-primary/10 text-primary border border-primary/20">
                  {currentReq.equipment.brand}
                </span>
              </div>

              <div>
                <label className="text-[11px] font-medium text-muted-foreground">
                  Model & Specification
                </label>
                <div className="text-foreground font-medium mt-0.5">
                  {currentReq.equipment.model}
                </div>
                <div className="text-muted-foreground text-[11px]">
                  {currentReq.equipment.category}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-medium text-muted-foreground">
                    Unit Tag / Room
                  </label>
                  <div className="text-foreground font-medium mt-0.5">
                    {currentReq.equipment.equipmentTag}
                  </div>
                </div>
                <div>
                  <label className="text-[11px] font-medium text-muted-foreground">
                    Operating Hours
                  </label>
                  <div className="text-foreground font-mono font-medium mt-0.5">
                    {currentReq.equipment.operatingHours
                      ? `${currentReq.equipment.operatingHours.toLocaleString()} hrs`
                      : "N/A"}
                  </div>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-muted/60 border border-border space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-medium text-muted-foreground">
                    Warranty / Contract:
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      currentReq.equipment.warrantyStatus.includes("Comprehensive") ||
                      currentReq.equipment.warrantyStatus.includes("Warranty")
                        ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-400"
                        : "bg-amber-500/20 text-amber-700 dark:text-amber-400"
                    }`}
                  >
                    {currentReq.equipment.warrantyStatus}
                  </span>
                </div>
                {currentReq.equipment.contractNo && (
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-muted-foreground">Contract Ref:</span>
                    <span className="font-mono font-semibold text-foreground">
                      {currentReq.equipment.contractNo}
                    </span>
                  </div>
                )}
                {currentReq.equipment.contractExpiry && (
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-muted-foreground">Valid Until:</span>
                    <span className="font-medium text-foreground">
                      {currentReq.equipment.contractExpiry}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Panel 2: Fault, Symptoms & SLA (Col 5) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-card border border-border rounded-xl p-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-border pb-2.5 mb-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-bold text-foreground">Service Request & Triage</h3>
              </div>
              <div className="flex items-center gap-1.5">
                <span
                  className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                    currentReq.priority.includes("P1")
                      ? "bg-destructive/15 text-destructive border border-destructive/30"
                      : "bg-amber-500/15 text-amber-600 border border-amber-500/30"
                  }`}
                >
                  {currentReq.priority}
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-muted text-foreground">
                  {currentReq.status}
                </span>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-medium text-muted-foreground">
                    Call Type *
                  </label>
                  <select
                    value={currentReq.callType}
                    onChange={(e) => {
                      const updated = requests.map((r) =>
                        r.id === currentReq.id ? { ...r, callType: e.target.value as any } : r,
                      );
                      setRequests(updated);
                    }}
                    className="w-full mt-1 px-2.5 py-1.5 text-xs rounded border border-border bg-background text-foreground font-medium"
                  >
                    <option value="Breakdown">Breakdown Repair</option>
                    <option value="Preventive Maintenance">Preventive Maintenance</option>
                    <option value="Installation">Installation</option>
                    <option value="Inspection">Inspection & Audit</option>
                    <option value="Warranty Claim">Warranty Claim</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-medium text-muted-foreground">Channel</label>
                  <div className="font-semibold text-foreground mt-1.5 flex items-center gap-1">
                    <PhoneCall className="w-3.5 h-3.5 text-muted-foreground" />
                    <span>{currentReq.channel}</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-medium text-muted-foreground">
                  Fault Category *
                </label>
                <div className="text-foreground font-semibold mt-0.5">
                  {currentReq.fault.category}
                </div>
              </div>

              <div>
                <label className="text-[11px] font-medium text-muted-foreground">
                  Reported Symptoms / Error Code
                </label>
                <div className="mt-1 flex items-center gap-2">
                  {currentReq.fault.errorCode && (
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-destructive/10 text-destructive border border-destructive/20">
                      Error: {currentReq.fault.errorCode}
                    </span>
                  )}
                  <span className="text-foreground font-medium">{currentReq.fault.symptom}</span>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-medium text-muted-foreground">
                  Detailed Problem Description *
                </label>
                <textarea
                  rows={3}
                  value={currentReq.fault.description}
                  onChange={(e) => {
                    const updated = requests.map((r) =>
                      r.id === currentReq.id
                        ? { ...r, fault: { ...r.fault, description: e.target.value } }
                        : r,
                    );
                    setRequests(updated);
                  }}
                  className="w-full mt-1 p-2 text-xs rounded border border-border bg-background text-foreground font-normal focus:ring-1 focus:ring-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-muted-foreground">
                  Preliminary Root Cause Hypothesis
                </label>
                <input
                  type="text"
                  value={currentReq.fault.preliminaryRootCause || ""}
                  onChange={(e) => {
                    const updated = requests.map((r) =>
                      r.id === currentReq.id
                        ? { ...r, fault: { ...r.fault, preliminaryRootCause: e.target.value } }
                        : r,
                    );
                    setRequests(updated);
                  }}
                  className="w-full mt-1 px-2.5 py-1.5 text-xs rounded border border-border bg-background text-foreground"
                />
              </div>

              {/* SLA Clocks */}
              <div className="p-3 rounded-lg bg-muted/60 border border-border">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                    <Clock className="w-3.5 h-3.5 text-primary" />
                    <span>SLA Targets (Option 01 Working Calendar)</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground font-mono">
                    Logged: {currentReq.createdAt}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 rounded bg-background border border-border">
                    <span className="text-[10px] text-muted-foreground block">
                      Response Target:
                    </span>
                    <span className="font-bold text-foreground font-mono">
                      {currentReq.slaResponseTarget}
                    </span>
                  </div>
                  <div className="p-2 rounded bg-background border border-border">
                    <span className="text-[10px] text-muted-foreground block">
                      Resolution Target:
                    </span>
                    <span className="font-bold text-foreground font-mono">
                      {currentReq.slaResolutionTarget}
                    </span>
                  </div>
                </div>
              </div>

              {/* Allocation */}
              <div className="pt-2 border-t border-border flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-muted-foreground">Primary Field Tech:</span>
                  <div className="font-semibold text-foreground text-xs mt-0.5">
                    {currentReq.allocation.assignedTechName || "Unassigned"}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-muted-foreground">Dispatch Depot:</span>
                  <div className="font-medium text-foreground text-xs mt-0.5">
                    {currentReq.allocation.branchName}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Panel 3: SAP Commercial Information Panel (Col 3) */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-card border-2 border-primary/30 rounded-xl p-4 shadow-sm relative overflow-hidden">
            {/* Top decorative accent */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-sky-500 to-indigo-600" />

            <div className="flex items-center justify-between border-b border-border pb-2.5 mb-3 mt-1">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-bold text-foreground">SAP Commercial Panel</h3>
              </div>
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">
                ⇄B1 Real-Time
              </span>
            </div>

            {/* Credit Status Banner */}
            <div
              className={`p-2.5 rounded-lg mb-3 flex items-center justify-between ${
                currentReq.commercial.creditStatus === "Normal"
                  ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20"
                  : currentReq.commercial.creditStatus === "Warning"
                    ? "bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30"
                    : "bg-destructive/15 text-destructive border border-destructive/30"
              }`}
            >
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" />
                <div>
                  <div className="text-[10px] uppercase font-bold tracking-wider">
                    Account Standing
                  </div>
                  <div className="text-xs font-bold">{currentReq.commercial.creditStatus}</div>
                </div>
              </div>
              {currentReq.commercial.billingHold && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-destructive text-destructive-foreground">
                  BILLING HOLD
                </span>
              )}
            </div>

            {/* Financial Metrics Grid */}
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between items-center py-1 border-b border-border/60">
                <span className="text-muted-foreground text-[11px]">SAP Credit Limit:</span>
                <span className="font-mono font-bold text-foreground">
                  LKR {currentReq.commercial.creditLimitLKR.toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-border/60">
                <span className="text-muted-foreground text-[11px]">Current Outstanding:</span>
                <span className="font-mono font-semibold text-foreground">
                  LKR {currentReq.commercial.currentBalanceLKR.toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-border/60">
                <span className="text-muted-foreground text-[11px]">Overdue Invoices:</span>
                <span
                  className={`font-mono font-bold ${
                    currentReq.commercial.overdueAmountLKR > 0
                      ? "text-destructive"
                      : "text-emerald-600 dark:text-emerald-400"
                  }`}
                >
                  LKR {currentReq.commercial.overdueAmountLKR.toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-border/60">
                <span className="text-muted-foreground text-[11px]">Payment Terms:</span>
                <span className="font-medium text-foreground">
                  {currentReq.commercial.paymentTerms}
                </span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-border/60">
                <span className="text-muted-foreground text-[11px]">Price List:</span>
                <span
                  className="font-medium text-foreground text-[10px] truncate max-w-[140px]"
                  title={currentReq.commercial.priceList}
                >
                  {currentReq.commercial.priceList}
                </span>
              </div>

              <div className="flex justify-between items-center py-1">
                <span className="text-muted-foreground text-[11px]">Contract Coverage:</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400 text-[11px]">
                  {currentReq.commercial.coveredUnderContract
                    ? "✓ Covered (Free Labour)"
                    : "✗ Billable Service"}
                </span>
              </div>
            </div>

            {/* Hold Reason Alert if any */}
            {currentReq.commercial.billingHoldReason && (
              <div className="mt-3 p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs">
                <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wide block">
                  Commercial Rule BCR-04:
                </span>
                <p className="text-[11px] text-amber-900 dark:text-amber-200 mt-0.5 leading-snug">
                  {currentReq.commercial.billingHoldReason}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Context Tabs */}
      <div className="bg-card border border-border rounded-xl shadow-xs overflow-hidden">
        <div className="flex border-b border-border bg-muted/40 overflow-x-auto">
          {[
            { id: "diagnostics", label: "Technical Diagnostics & Root Cause", icon: Wrench },
            { id: "commercial", label: "SAP B1 Open Invoices & AMC Terms", icon: DollarSign },
            { id: "history", label: "Equipment Previous Calls (Audit)", icon: History },
            { id: "parts", label: "Parts & Material Estimates", icon: Layers },
            { id: "audit", label: "Transaction Audit Trail (COM-14)", icon: FileText },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold whitespace-nowrap border-b-2 transition-colors cursor-pointer ${
                  isActive
                    ? "border-primary text-primary bg-background"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/60"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className="p-4 text-xs">
          {activeTab === "diagnostics" && (
            <div className="space-y-3">
              <h4 className="font-bold text-foreground text-sm flex items-center gap-2">
                <span>Field Symptom Verification & Diagnostic Checklist</span>
                <span className="text-[10px] font-normal text-muted-foreground">
                  (Master Template O1-SCR-MST-16)
                </span>
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-3 rounded-lg border border-border bg-background space-y-2">
                  <div className="font-semibold text-foreground">1. Electrical & Power Check</div>
                  <label className="flex items-center gap-2 text-muted-foreground cursor-pointer">
                    <input type="checkbox" defaultChecked className="rounded text-primary" />
                    <span>Line voltage measured: 405V 3-Phase</span>
                  </label>
                  <label className="flex items-center gap-2 text-muted-foreground cursor-pointer">
                    <input type="checkbox" defaultChecked className="rounded text-primary" />
                    <span>Control board PCB fuse intact</span>
                  </label>
                  <label className="flex items-center gap-2 text-muted-foreground cursor-pointer">
                    <input type="checkbox" className="rounded text-primary" />
                    <span>Phase reverser relay normal</span>
                  </label>
                </div>

                <div className="p-3 rounded-lg border border-border bg-background space-y-2">
                  <div className="font-semibold text-foreground">2. Refrigerant Circuit Check</div>
                  <label className="flex items-center gap-2 text-muted-foreground cursor-pointer">
                    <input type="checkbox" defaultChecked className="rounded text-primary" />
                    <span>Suction pressure: 7.2 Bar (R410A)</span>
                  </label>
                  <label className="flex items-center gap-2 text-muted-foreground cursor-pointer">
                    <input type="checkbox" defaultChecked className="rounded text-primary" />
                    <span>Discharge pressure: 28.5 Bar (High trip)</span>
                  </label>
                  <label className="flex items-center gap-2 text-muted-foreground cursor-pointer">
                    <input type="checkbox" className="rounded text-primary" />
                    <span>Electronic expansion valve pulse response</span>
                  </label>
                </div>

                <div className="p-3 rounded-lg border border-border bg-background space-y-2">
                  <div className="font-semibold text-foreground">3. Safety & Environmental</div>
                  <label className="flex items-center gap-2 text-muted-foreground cursor-pointer">
                    <input type="checkbox" defaultChecked className="rounded text-primary" />
                    <span>No water or oil leakage on floor</span>
                  </label>
                  <label className="flex items-center gap-2 text-muted-foreground cursor-pointer">
                    <input type="checkbox" defaultChecked className="rounded text-primary" />
                    <span>Condenser airflow clear of obstruction</span>
                  </label>
                  <label className="flex items-center gap-2 text-muted-foreground cursor-pointer">
                    <input type="checkbox" className="rounded text-primary" />
                    <span>Customer site safety clearance permit issued</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeTab === "commercial" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-foreground text-sm">
                  SAP Business One A/R Invoice Sub-Grid (OINV)
                </h4>
                <span className="text-[11px] text-muted-foreground">
                  Currency: Sri Lankan Rupee (LKR)
                </span>
              </div>
              <div className="overflow-x-auto border border-border rounded-lg">
                <table className="w-full text-left">
                  <thead className="bg-muted text-[11px] text-muted-foreground uppercase font-bold border-b border-border">
                    <tr>
                      <th className="p-2.5">Doc # (SAP)</th>
                      <th className="p-2.5">Invoice Date</th>
                      <th className="p-2.5">Due Date</th>
                      <th className="p-2.5 text-right">Total Amount</th>
                      <th className="p-2.5 text-right">Open Balance</th>
                      <th className="p-2.5">Aging</th>
                      <th className="p-2.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border font-mono text-[11px]">
                    <tr>
                      <td className="p-2.5 font-bold text-primary">INV-2026-9041</td>
                      <td className="p-2.5">2026-08-15</td>
                      <td className="p-2.5 text-destructive font-bold">2026-09-15</td>
                      <td className="p-2.5 text-right">LKR 450,000</td>
                      <td className="p-2.5 text-right font-bold text-destructive">LKR 450,000</td>
                      <td className="p-2.5">45 Days</td>
                      <td className="p-2.5">
                        <span className="px-1.5 py-0.5 rounded bg-destructive/15 text-destructive font-sans font-bold text-[10px]">
                          Overdue
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold text-primary">INV-2026-9480</td>
                      <td className="p-2.5">2026-09-20</td>
                      <td className="p-2.5">2026-10-20</td>
                      <td className="p-2.5 text-right">LKR 1,200,000</td>
                      <td className="p-2.5 text-right">LKR 1,200,000</td>
                      <td className="p-2.5">Current</td>
                      <td className="p-2.5">
                        <span className="px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 font-sans font-bold text-[10px]">
                          Within Terms
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "history" && (
            <div className="space-y-3">
              <h4 className="font-bold text-foreground text-sm">
                Previous Service Call Records on Serial #{currentReq.equipment.serialNo}
              </h4>
              <div className="overflow-x-auto border border-border rounded-lg">
                <table className="w-full text-left">
                  <thead className="bg-muted text-[11px] text-muted-foreground uppercase font-bold border-b border-border">
                    <tr>
                      <th className="p-2.5">Ticket #</th>
                      <th className="p-2.5">Date</th>
                      <th className="p-2.5">Call Type</th>
                      <th className="p-2.5">Technician</th>
                      <th className="p-2.5">Root Cause & Action</th>
                      <th className="p-2.5">Parts Replaced</th>
                      <th className="p-2.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border text-[11px]">
                    <tr className="bg-amber-500/5">
                      <td className="p-2.5 font-mono font-bold text-primary">SR-2026-0798</td>
                      <td className="p-2.5">2026-10-02 (11 days ago)</td>
                      <td className="p-2.5">Breakdown</td>
                      <td className="p-2.5 font-medium">Kamal Gunasekara</td>
                      <td className="p-2.5 text-foreground">
                        High-pressure switch reset and condenser fin dust wash
                      </td>
                      <td className="p-2.5 text-muted-foreground">None (Cleaning only)</td>
                      <td className="p-2.5">
                        <span className="px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-700 font-bold text-[10px]">
                          Resolved
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-mono font-bold text-primary">SR-2026-0412</td>
                      <td className="p-2.5">2026-06-18</td>
                      <td className="p-2.5">Preventive PM</td>
                      <td className="p-2.5 font-medium">Sunil Jayatissa</td>
                      <td className="p-2.5 text-foreground">
                        Quarterly contract AMC service #2 completed
                      </td>
                      <td className="p-2.5 text-muted-foreground">Air Filters, Belts</td>
                      <td className="p-2.5">
                        <span className="px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-700 font-bold text-[10px]">
                          Closed
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "parts" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-foreground text-sm">
                  Preliminary Spare Parts Requisition Estimate
                </h4>
                <button className="text-xs px-2.5 py-1 rounded bg-primary text-primary-foreground font-semibold">
                  + Add Item from SAP Inventory
                </button>
              </div>
              <div className="overflow-x-auto border border-border rounded-lg">
                <table className="w-full text-left">
                  <thead className="bg-muted text-[11px] text-muted-foreground uppercase font-bold border-b border-border">
                    <tr>
                      <th className="p-2.5">SAP Item Code</th>
                      <th className="p-2.5">Description</th>
                      <th className="p-2.5 text-center">Qty</th>
                      <th className="p-2.5 text-right">Unit Price (LKR)</th>
                      <th className="p-2.5 text-right">Total (LKR)</th>
                      <th className="p-2.5">Warehouse</th>
                      <th className="p-2.5">Warranty Coverage</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border text-[11px]">
                    <tr>
                      <td className="p-2.5 font-mono font-bold text-primary">SP-DK-HP-SW01</td>
                      <td className="p-2.5">Daikin High Pressure Cut-Out Switch 3.8MPa</td>
                      <td className="p-2.5 text-center font-bold">1</td>
                      <td className="p-2.5 text-right font-mono">18,500.00</td>
                      <td className="p-2.5 text-right font-mono font-bold">18,500.00</td>
                      <td className="p-2.5">WH-CMB-MAIN</td>
                      <td className="p-2.5">
                        <span className="px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-700 font-bold text-[10px]">
                          Free under AMC
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-mono font-bold text-primary">SP-GAS-R410A</td>
                      <td className="p-2.5">Refrigerant R410A Virgin Gas (11.3 kg Cylinder)</td>
                      <td className="p-2.5 text-center font-bold">2</td>
                      <td className="p-2.5 text-right font-mono">32,000.00</td>
                      <td className="p-2.5 text-right font-mono font-bold">64,000.00</td>
                      <td className="p-2.5">WH-CMB-MAIN</td>
                      <td className="p-2.5">
                        <span className="px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-700 font-bold text-[10px]">
                          Free under AMC
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "audit" && (
            <div className="space-y-2">
              <h4 className="font-bold text-foreground text-sm">
                System Audit Trail & SAP B1 Synchronisation Log
              </h4>
              <div className="space-y-1.5 font-mono text-[11px]">
                <div className="p-2 rounded bg-muted/60 flex items-center justify-between">
                  <span>
                    [2026-10-13 08:30:14] Ticket created via Inbound Call Desk by Sanduni
                    Dissanayake
                  </span>
                  <span className="text-muted-foreground">IP 192.168.1.42</span>
                </div>
                <div className="p-2 rounded bg-muted/60 flex items-center justify-between">
                  <span>
                    [2026-10-13 08:30:16] SAP B1iSN query executed for BP CardCode C20014 (Credit
                    Limit & AMC active verified)
                  </span>
                  <span className="text-sky-600 font-bold">HTTP 200 OK</span>
                </div>
                <div className="p-2 rounded bg-muted/60 flex items-center justify-between">
                  <span>
                    [2026-10-13 08:31:02] Repeat Service Detection triggered: 94% match against
                    SR-2026-0798 (Flagged)
                  </span>
                  <span className="text-amber-600 font-bold">TRX-03 Rule Triggered</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
