import React, { useState } from "react";
import {
  Layers,
  Plus,
  Trash2,
  CheckCircle2,
  ArrowLeft,
  Printer,
  Download,
  Users,
  Cpu,
  Building2,
  Wrench,
  AlertCircle,
  FileCheck,
} from "lucide-react";
import {
  SAMPLE_MULTI_EQUIPMENT_ITEMS,
  MultiEquipmentItem,
  SAMPLE_SERVICE_REQUESTS,
} from "@/data/serviceRequestsSpecData";

interface MultiEquipmentBreakdownScreenProps {
  initialTicketId?: string;
  onNavigateToScreen?: (screenId: string, contextId?: string) => void;
}

export const MultiEquipmentBreakdownScreen: React.FC<MultiEquipmentBreakdownScreenProps> = ({
  initialTicketId = "SR-2026-0845",
  onNavigateToScreen,
}) => {
  const parentRequest =
    SAMPLE_SERVICE_REQUESTS.find((r) => r.id === initialTicketId) || SAMPLE_SERVICE_REQUESTS[4];
  const [items, setItems] = useState<MultiEquipmentItem[]>(
    SAMPLE_MULTI_EQUIPMENT_ITEMS[initialTicketId] ||
      SAMPLE_MULTI_EQUIPMENT_ITEMS["SR-2026-0845"] ||
      [],
  );

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newTag, setNewTag] = useState("");
  const [newSerial, setNewSerial] = useState("");
  const [newModel, setNewModel] = useState("");
  const [newFault, setNewFault] = useState("");
  const [newPriority, setNewPriority] = useState<"Critical" | "High" | "Medium" | "Low">("High");

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleGenerateAllJobs = () => {
    const updated = items.map((item, idx) => ({
      ...item,
      status: "Generated" as const,
      childJobId: item.childJobId || `JOB-2026-${1400 + idx + 1}`,
    }));
    setItems(updated);
    showToast(
      `Generated ${items.length} child work orders linked to master request ${parentRequest.id}!`,
    );
  };

  const handleAssignTechToAll = (techName: string) => {
    const updated = items.map((item) => ({
      ...item,
      assignedTech: techName,
    }));
    setItems(updated);
    showToast(`Assigned technician "${techName}" to all ${items.length} child units.`);
  };

  const handleAddItem = () => {
    if (!newTag || !newSerial) {
      alert("Please provide unit tag and serial number");
      return;
    }
    const newItem: MultiEquipmentItem = {
      id: `MEQ-0${items.length + 1}`,
      unitTag: newTag,
      serialNo: newSerial,
      model: newModel || "Daikin FXFQ Cassette Inverter",
      locationDetails: "Site Premises",
      faultSummary: newFault || "Unit not cooling",
      warrantyStatus: "AMC Comprehensive",
      priority: newPriority,
      childJobId: `JOB-2026-${1400 + items.length + 1}`,
      assignedTech: "Sunil Jayatissa",
      status: "Generated",
    };
    setItems([...items, newItem]);
    setIsAddingNew(false);
    setNewTag("");
    setNewSerial("");
    setNewFault("");
    showToast(`Added unit "${newItem.unitTag}" to breakdown.`);
  };

  const handleDeleteItem = (id: string) => {
    setItems(items.filter((i) => i.id !== id));
    showToast("Equipment line removed.");
  };

  const handleExportCsv = () => {
    const headers = [
      "Line ID",
      "Unit Tag",
      "Serial No",
      "Model",
      "Location",
      "Fault",
      "Warranty",
      "Priority",
      "Child Job ID",
      "Technician",
      "Status",
    ];
    const rows = items.map((i) => [
      i.id,
      `"${i.unitTag}"`,
      i.serialNo,
      `"${i.model}"`,
      `"${i.locationDetails}"`,
      `"${i.faultSummary}"`,
      `"${i.warrantyStatus}"`,
      i.priority,
      i.childJobId || "Pending",
      `"${i.assignedTech || "Unassigned"}"`,
      i.status,
    ]);
    const csvContent =
      "data:text/csv;charset=utf-8," +
      headers.join(",") +
      "\n" +
      rows.map((e) => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${parentRequest.id}_multi_equipment_breakdown.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                O1-SCR-TRX-04
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                Priority P2 · Commercial Site Facility Management
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-muted text-muted-foreground border border-border">
                SM Local Breakdown
              </span>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Layers className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <span>Multi-Equipment Service Request Breakdown Screen</span>
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Splits master commercial facility requests into independent equipment work orders with
              individual faults, technician routing, and tracking.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {onNavigateToScreen && (
              <button
                onClick={() => onNavigateToScreen("O1-SCR-TRX-01", parentRequest.id)}
                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-border bg-background hover:bg-muted text-foreground transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to Master Request ({parentRequest.id})</span>
              </button>
            )}
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-lg border border-border bg-background hover:bg-muted text-foreground transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Schedule</span>
            </button>
            <button
              onClick={handleExportCsv}
              className="flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-lg border border-border bg-background hover:bg-muted text-foreground transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Parent Ticket Summary Strip */}
        <div className="mt-3 pt-3 border-t border-border grid grid-cols-1 md:grid-cols-4 gap-3 text-xs bg-muted/40 p-3 rounded-lg">
          <div>
            <span className="text-[10px] text-muted-foreground block">Master Request ID:</span>
            <span className="font-mono font-bold text-primary">{parentRequest.id}</span>
          </div>
          <div>
            <span className="text-[10px] text-muted-foreground block">Customer:</span>
            <span className="font-semibold text-foreground truncate block">
              {parentRequest.customer.cardName}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-muted-foreground block">Facility Site:</span>
            <span className="font-medium text-foreground">{parentRequest.customer.siteName}</span>
          </div>
          <div>
            <span className="text-[10px] text-muted-foreground block">Breakdown Units Count:</span>
            <span className="font-bold text-foreground font-mono">{items.length} Linked Units</span>
          </div>
        </div>

        {/* Batch Operations Bar */}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleGenerateAllJobs}
              className="px-3 py-1.5 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <FileCheck className="w-3.5 h-3.5" />
              <span>Generate All Child Work Orders ({items.length})</span>
            </button>

            <button
              onClick={() => handleAssignTechToAll("Sunil Jayatissa & Team")}
              className="px-3 py-1.5 rounded-lg border border-border bg-background hover:bg-muted text-foreground font-semibold text-xs transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Users className="w-3.5 h-3.5 text-primary" />
              <span>Assign Lead Tech to All (Sunil Jayatissa)</span>
            </button>
          </div>

          <button
            onClick={() => setIsAddingNew(true)}
            className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Equipment Unit</span>
          </button>
        </div>
      </div>

      {/* Add New Equipment Unit Form Modal */}
      {isAddingNew && (
        <div className="p-4 bg-card border-2 border-purple-500/30 rounded-xl space-y-3 shadow-sm animate-in fade-in">
          <div className="flex items-center justify-between border-b border-border pb-2">
            <h4 className="font-bold text-foreground text-xs flex items-center gap-2">
              <Plus className="w-4 h-4 text-purple-600" />
              <span>Add Installed Equipment to Breakdown</span>
            </h4>
            <button
              onClick={() => setIsAddingNew(false)}
              className="text-muted-foreground hover:text-foreground text-xs"
            >
              ✕ Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="text-[11px] font-medium text-muted-foreground block mb-1">
                Unit Tag / Room *
              </label>
              <input
                type="text"
                placeholder="e.g. Server Room Backup Split"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                className="w-full p-1.5 rounded border border-border bg-background text-foreground"
              />
            </div>
            <div>
              <label className="text-[11px] font-medium text-muted-foreground block mb-1">
                Serial Number *
              </label>
              <input
                type="text"
                placeholder="e.g. TEL-DK-IN-0109"
                value={newSerial}
                onChange={(e) => setNewSerial(e.target.value)}
                className="w-full p-1.5 rounded border border-border bg-background text-foreground font-mono"
              />
            </div>
            <div>
              <label className="text-[11px] font-medium text-muted-foreground block mb-1">
                Model / Specs
              </label>
              <input
                type="text"
                placeholder="e.g. Daikin FXFQ50 18k BTU"
                value={newModel}
                onChange={(e) => setNewModel(e.target.value)}
                className="w-full p-1.5 rounded border border-border bg-background text-foreground"
              />
            </div>
            <div>
              <label className="text-[11px] font-medium text-muted-foreground block mb-1">
                Priority
              </label>
              <select
                value={newPriority}
                onChange={(e) => setNewPriority(e.target.value as any)}
                className="w-full p-1.5 rounded border border-border bg-background text-foreground"
              >
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>

          <div className="text-xs">
            <label className="text-[11px] font-medium text-muted-foreground block mb-1">
              Specific Fault / Symptoms for this Unit
            </label>
            <input
              type="text"
              placeholder="e.g. Louver motor stuck and error code flashing"
              value={newFault}
              onChange={(e) => setNewFault(e.target.value)}
              className="w-full p-1.5 rounded border border-border bg-background text-foreground"
            />
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              onClick={() => setIsAddingNew(false)}
              className="px-3 py-1 rounded-lg border border-border bg-background text-xs font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleAddItem}
              className="px-3 py-1 rounded-lg bg-purple-600 text-white text-xs font-bold hover:bg-purple-700 cursor-pointer"
            >
              Confirm & Add
            </button>
          </div>
        </div>
      )}

      {/* Multi-Equipment Grid Table */}
      <div className="bg-card border border-border rounded-xl p-4 shadow-xs">
        <div className="overflow-x-auto border border-border rounded-lg">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted text-[11px] text-muted-foreground uppercase font-bold border-b border-border">
              <tr>
                <th className="p-3">#</th>
                <th className="p-3">Unit Tag & Location</th>
                <th className="p-3">Serial Number</th>
                <th className="p-3">Model</th>
                <th className="p-3">Specific Fault</th>
                <th className="p-3">Priority</th>
                <th className="p-3">Warranty</th>
                <th className="p-3">Child Job ID</th>
                <th className="p-3">Assigned Tech</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-[11px]">
              {items.map((item, index) => (
                <tr key={item.id} className="hover:bg-muted/40 transition-colors">
                  <td className="p-3 font-mono font-bold text-muted-foreground">{index + 1}</td>
                  <td className="p-3">
                    <div className="font-bold text-foreground">{item.unitTag}</div>
                    <div className="text-[10px] text-muted-foreground">{item.locationDetails}</div>
                  </td>
                  <td className="p-3 font-mono font-semibold text-primary">{item.serialNo}</td>
                  <td className="p-3 text-foreground font-medium">{item.model}</td>
                  <td className="p-3 text-muted-foreground max-w-xs">{item.faultSummary}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        item.priority === "Critical"
                          ? "bg-destructive/15 text-destructive"
                          : item.priority === "High"
                            ? "bg-amber-500/15 text-amber-700 dark:text-amber-400"
                            : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {item.priority}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-400">
                      {item.warrantyStatus}
                    </span>
                  </td>
                  <td className="p-3 font-mono font-bold text-purple-600 dark:text-purple-400">
                    {item.childJobId || (
                      <span className="text-muted-foreground italic">Pending</span>
                    )}
                  </td>
                  <td className="p-3 font-medium text-foreground">
                    {item.assignedTech || "Unassigned"}
                  </td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        item.status === "Generated"
                          ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      className="p-1 text-muted-foreground hover:text-destructive transition-colors cursor-pointer rounded"
                      title="Remove unit"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
