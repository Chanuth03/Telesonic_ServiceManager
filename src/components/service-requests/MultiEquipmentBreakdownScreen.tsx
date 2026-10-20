import React, { useState } from "react";
import {
  Layers,
  Wrench,
  CheckCircle2,
  Clock,
  Plus,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  Building,
  User,
  Calendar,
  Sparkles,
  Search,
  Filter,
  FileText,
  AlertTriangle,
  RefreshCw,
  Trash2,
} from "lucide-react";
import {
  ServiceRequestRecord,
  MultiEquipmentItem,
  SAMPLE_SERVICE_REQUESTS,
  SAMPLE_MULTI_EQUIPMENT_ITEMS,
} from "@/data/serviceRequestsSpecData";

interface MultiEquipmentBreakdownScreenProps {
  initialTicketId?: string | undefined;
  onNavigateToScreen?: ((screenId: string, contextId?: string) => void) | undefined;
}

export const MultiEquipmentBreakdownScreen: React.FC<MultiEquipmentBreakdownScreenProps> = ({
  initialTicketId,
  onNavigateToScreen,
}) => {
  // Find multi-equipment parent requests or default to first
  const multiRequests = SAMPLE_SERVICE_REQUESTS.filter(
    (r) => r.isMultiEquipment || r.id === "SR-2026-0845",
  );
  const defaultSelectedId =
    initialTicketId && SAMPLE_SERVICE_REQUESTS.some((r) => r.id === initialTicketId)
      ? initialTicketId
      : multiRequests[0]?.id || SAMPLE_SERVICE_REQUESTS[0]?.id || "SR-2026-0845";

  const [selectedTicketId, setSelectedTicketId] = useState<string>(defaultSelectedId);
  const [itemsStore, setItemsStore] = useState<Record<string, MultiEquipmentItem[]>>(
    SAMPLE_MULTI_EQUIPMENT_ITEMS,
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New Item Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newUnitTag, setNewUnitTag] = useState("");
  const [newSerialNo, setNewSerialNo] = useState("");
  const [newModel, setNewModel] = useState("FXFQ50AVEB 4-Way Inverter 18k BTU");
  const [newLocation, setNewLocation] = useState("");
  const [newFault, setNewFault] = useState("");
  const [newPriority, setNewPriority] = useState<"Critical" | "High" | "Medium" | "Low">("Medium");
  const [newTech, setNewTech] = useState("Sunil Jayatissa");

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const currentRequest =
    SAMPLE_SERVICE_REQUESTS.find((r) => r.id === selectedTicketId) || SAMPLE_SERVICE_REQUESTS[0]!;

  const currentItems = itemsStore[selectedTicketId] || [];

  const filteredItems = currentItems.filter((item) => {
    const matchesSearch =
      item.unitTag.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.serialNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.faultSummary.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "ALL" || item.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const generatedCount = currentItems.filter((i) => i.status === "Generated").length;
  const scheduledCount = currentItems.filter((i) => i.status === "Scheduled").length;
  const draftCount = currentItems.filter((i) => i.status === "Draft").length;

  const handleGenerateAllJobs = () => {
    let nextJobNumber = 1410;
    const updated = currentItems.map((item) => {
      if (!item.childJobId) {
        const jobId = `JOB-2026-${nextJobNumber++}`;
        return {
          ...item,
          childJobId: jobId,
          status: "Generated" as const,
        };
      }
      return item;
    });

    setItemsStore((prev) => ({
      ...prev,
      [selectedTicketId]: updated,
    }));
    showToast(`Successfully generated child jobs for all equipment units on ${selectedTicketId}`);
  };

  const handleScheduleJob = (itemId: string) => {
    const updated = currentItems.map((item) => {
      if (item.id === itemId) {
        return {
          ...item,
          status: "Scheduled" as const,
        };
      }
      return item;
    });
    setItemsStore((prev) => ({
      ...prev,
      [selectedTicketId]: updated,
    }));
    showToast(`Child job scheduled with technician.`);
  };

  const handleDeleteItem = (itemId: string) => {
    const updated = currentItems.filter((item) => item.id !== itemId);
    setItemsStore((prev) => ({
      ...prev,
      [selectedTicketId]: updated,
    }));
    showToast("Equipment unit removed from breakdown.");
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUnitTag || !newSerialNo) {
      showToast("Please provide both Unit Tag and Serial Number");
      return;
    }

    const newItem: MultiEquipmentItem = {
      id: `MEQ-0${currentItems.length + 1}`,
      unitTag: newUnitTag,
      serialNo: newSerialNo,
      model: newModel,
      locationDetails: newLocation || "Standard Zone",
      faultSummary: newFault || "General breakdown check required",
      warrantyStatus: currentRequest.equipment.warrantyStatus,
      priority: newPriority,
      childJobId: `JOB-2026-${1420 + currentItems.length}`,
      assignedTech: newTech,
      status: "Generated",
    };

    setItemsStore((prev) => ({
      ...prev,
      [selectedTicketId]: [...currentItems, newItem],
    }));

    setIsAddModalOpen(false);
    setNewUnitTag("");
    setNewSerialNo("");
    setNewLocation("");
    setNewFault("");
    showToast("Added new equipment unit and spawned child job");
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-4 right-4 z-50 bg-foreground text-background px-4 py-2.5 rounded-lg shadow-lg text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Screen Header & Navigation */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-xs font-bold text-primary px-2 py-0.5 rounded bg-primary/10 border border-primary/20">
                O1-SCR-TRX-04
              </span>
              <span className="text-xs font-medium text-muted-foreground">
                Section A3 • Transaction Screens
              </span>
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                Local Breakdown & Child Job Dispatch
              </span>
            </div>
            <h2 className="text-xl font-bold text-foreground">
              Multi-Equipment Service Request Breakdown
            </h2>
            <p className="text-xs text-muted-foreground mt-1 max-w-2xl">
              Breakdown of large parent commercial requests (hotels, VRF systems, factories) into
              distinct equipment child jobs for independent diagnosis, technician allocation, and
              parts booking.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() =>
                onNavigateToScreen && onNavigateToScreen("O1-SCR-TRX-01", selectedTicketId)
              }
              className="px-3 py-1.5 rounded-lg border border-border text-xs font-semibold hover:bg-muted text-foreground flex items-center gap-1.5 transition-colors"
            >
              <FileText className="w-3.5 h-3.5 text-primary" />
              <span>Open in TRX-01</span>
            </button>
            <button
              onClick={handleGenerateAllJobs}
              className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 flex items-center gap-1.5 transition-opacity shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Generate All Child Jobs</span>
            </button>
          </div>
        </div>

        {/* Parent Ticket Selector Bar */}
        <div className="mt-5 pt-4 border-t border-border flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground">
              Parent Service Request:
            </span>
            <select
              value={selectedTicketId}
              onChange={(e) => setSelectedTicketId(e.target.value)}
              className="input-field text-xs font-mono font-bold max-w-xs"
            >
              {SAMPLE_SERVICE_REQUESTS.map((req) => (
                <option key={req.id} value={req.id}>
                  {req.id} — {req.customer.cardName} (
                  {req.isMultiEquipment ? `${req.multiEquipmentCount || 6} Units` : "Single Unit"})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground">Channel:</span>
            <span className="text-xs font-bold text-foreground bg-muted px-2 py-0.5 rounded">
              {currentRequest.channel}
            </span>
            <span className="text-xs font-medium text-muted-foreground ml-2">Priority:</span>
            <span className="text-xs font-bold text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
              {currentRequest.priority}
            </span>
          </div>
        </div>
      </div>

      {/* Parent Ticket Context Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-xl p-4 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground mb-2">
            <Building className="w-3.5 h-3.5 text-primary" />
            <span>CUSTOMER & SITE</span>
          </div>
          <div className="font-bold text-sm text-foreground">
            {currentRequest.customer.cardName}
          </div>
          <div className="text-xs text-muted-foreground mt-0.5">
            {currentRequest.customer.siteName}
          </div>
          <div className="text-xs text-muted-foreground mt-0.5">
            {currentRequest.customer.address}
          </div>
          <div className="text-xs font-mono text-primary mt-2 flex items-center gap-1">
            <User className="w-3 h-3" />
            <span>
              {currentRequest.customer.contactPerson} ({currentRequest.customer.phone})
            </span>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-4 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground mb-2">
            <Layers className="w-3.5 h-3.5 text-primary" />
            <span>MASTER SYSTEM SPECIFICATION</span>
          </div>
          <div className="font-bold text-sm text-foreground">{currentRequest.equipment.model}</div>
          <div className="text-xs text-muted-foreground mt-0.5">
            System Serial:{" "}
            <span className="font-mono text-foreground font-semibold">
              {currentRequest.equipment.serialNo}
            </span>
          </div>
          <div className="text-xs text-muted-foreground mt-0.5">
            Category: {currentRequest.equipment.category}
          </div>
          <div className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-2 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>
              {currentRequest.equipment.warrantyStatus} (
              {currentRequest.equipment.contractNo || "Standard"})
            </span>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-4 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground mb-2">
            <Wrench className="w-3.5 h-3.5 text-primary" />
            <span>REPORTED SYSTEM FAULT</span>
          </div>
          <div className="font-bold text-xs text-foreground line-clamp-1">
            {currentRequest.title}
          </div>
          <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
            {currentRequest.fault.description}
          </div>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-destructive/10 text-destructive border border-destructive/20">
              Error: {currentRequest.fault.errorCode || "COMM-U4"}
            </span>
            <span className="text-[10px] text-muted-foreground">
              Logged by: {currentRequest.loggedBy.split(" ")[0]}
            </span>
          </div>
        </div>
      </div>

      {/* KPI Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-card border border-border rounded-xl p-3 shadow-xs">
          <div className="text-xs text-muted-foreground">Total Units in System</div>
          <div className="text-2xl font-bold font-mono text-foreground mt-1">
            {currentItems.length}
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-3 shadow-xs">
          <div className="text-xs text-emerald-600 dark:text-emerald-400">Child Jobs Generated</div>
          <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
            {generatedCount}
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-3 shadow-xs">
          <div className="text-xs text-blue-600 dark:text-blue-400">Scheduled for Field</div>
          <div className="text-2xl font-bold font-mono text-blue-600 dark:text-blue-400 mt-1">
            {scheduledCount}
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-3 shadow-xs">
          <div className="text-xs text-amber-600 dark:text-amber-400">Pending Draft</div>
          <div className="text-2xl font-bold font-mono text-amber-600 dark:text-amber-400 mt-1">
            {draftCount}
          </div>
        </div>
      </div>

      {/* Equipment Breakdown Table Section */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-bold text-foreground">
              Equipment Sub-Units & Child Job Register
            </h3>
            <span className="text-xs font-mono bg-muted px-2 py-0.5 rounded text-muted-foreground">
              {filteredItems.length} records
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search unit tag, serial, model..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field pl-8 text-xs py-1.5 w-48 sm:w-64"
              />
            </div>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="input-field text-xs py-1.5"
            >
              <option value="ALL">All Statuses</option>
              <option value="Draft">Draft</option>
              <option value="Generated">Generated</option>
              <option value="Scheduled">Scheduled</option>
            </select>

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 flex items-center gap-1.5 transition-opacity cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Unit</span>
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto border border-border rounded-lg">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted text-muted-foreground font-semibold border-b border-border">
              <tr>
                <th className="p-3">Unit Tag / Component</th>
                <th className="p-3">Serial No</th>
                <th className="p-3">Model</th>
                <th className="p-3">Physical Location</th>
                <th className="p-3">Specific Symptom</th>
                <th className="p-3">Priority</th>
                <th className="p-3">Assigned Tech</th>
                <th className="p-3">Child Job ID</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={10} className="p-8 text-center text-muted-foreground">
                    No equipment units found for this breakdown.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-muted/40 transition-colors">
                    <td className="p-3 font-semibold text-foreground">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-[11px] text-muted-foreground">
                          {item.id}
                        </span>
                        <span>{item.unitTag}</span>
                      </div>
                    </td>
                    <td className="p-3 font-mono text-[11px] text-foreground">{item.serialNo}</td>
                    <td className="p-3 text-muted-foreground">{item.model}</td>
                    <td className="p-3 text-muted-foreground">{item.locationDetails}</td>
                    <td className="p-3 text-foreground max-w-xs truncate" title={item.faultSummary}>
                      {item.faultSummary}
                    </td>
                    <td className="p-3">
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                          item.priority === "Critical"
                            ? "bg-destructive/10 text-destructive border-destructive/20"
                            : item.priority === "High"
                              ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
                              : "bg-muted text-foreground border-border"
                        }`}
                      >
                        {item.priority}
                      </span>
                    </td>
                    <td className="p-3 text-foreground font-medium">{item.assignedTech || "—"}</td>
                    <td className="p-3 font-mono font-bold text-primary">
                      {item.childJobId ? (
                        <span className="bg-primary/10 px-1.5 py-0.5 rounded border border-primary/20">
                          {item.childJobId}
                        </span>
                      ) : (
                        <span className="text-muted-foreground italic">Not created</span>
                      )}
                    </td>
                    <td className="p-3">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          item.status === "Scheduled"
                            ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20"
                            : item.status === "Generated"
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                              : "bg-muted text-muted-foreground border border-border"
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {item.status !== "Scheduled" && (
                          <button
                            onClick={() => handleScheduleJob(item.id)}
                            className="px-2 py-1 rounded bg-muted hover:bg-muted/80 text-foreground text-[11px] font-medium transition-colors"
                            title="Schedule technician"
                          >
                            Schedule
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          className="p-1 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                          title="Remove unit"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Unit Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-xl p-6 shadow-xl max-w-lg w-full space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-bold text-base text-foreground">
                Add Sub-Equipment to Breakdown
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-muted-foreground hover:text-foreground text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddItem} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold block text-foreground mb-1">Unit Tag / Label</label>
                <input
                  type="text"
                  placeholder="e.g. VIP Dining Private Lounge Cassette #2"
                  value={newUnitTag}
                  onChange={(e) => setNewUnitTag(e.target.value)}
                  className="input-field"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block text-foreground mb-1">Serial Number</label>
                  <input
                    type="text"
                    placeholder="e.g. TEL-DK-IN-0107"
                    value={newSerialNo}
                    onChange={(e) => setNewSerialNo(e.target.value)}
                    className="input-field font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="font-semibold block text-foreground mb-1">Model</label>
                  <input
                    type="text"
                    value={newModel}
                    onChange={(e) => setNewModel(e.target.value)}
                    className="input-field"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold block text-foreground mb-1">
                  Physical Location
                </label>
                <input
                  type="text"
                  placeholder="e.g. 1st Floor Conference Room East"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  className="input-field"
                />
              </div>

              <div>
                <label className="font-semibold block text-foreground mb-1">
                  Specific Unit Symptom
                </label>
                <input
                  type="text"
                  placeholder="e.g. PCB communication link down, fan motor noisy"
                  value={newFault}
                  onChange={(e) => setNewFault(e.target.value)}
                  className="input-field"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block text-foreground mb-1">Priority</label>
                  <select
                    value={newPriority}
                    onChange={(e) =>
                      setNewPriority(e.target.value as "Critical" | "High" | "Medium" | "Low")
                    }
                    className="input-field"
                  >
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold block text-foreground mb-1">
                    Assign Technician
                  </label>
                  <select
                    value={newTech}
                    onChange={(e) => setNewTech(e.target.value)}
                    className="input-field"
                  >
                    <option value="Sunil Jayatissa">Sunil Jayatissa (Lead)</option>
                    <option value="Ashan Fonseka">Ashan Fonseka</option>
                    <option value="Ruwan Senanayake">Ruwan Senanayake</option>
                    <option value="Pradeep Silva">Pradeep Silva</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg border border-border text-foreground font-semibold hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90"
                >
                  Add Unit & Spawn Job
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
