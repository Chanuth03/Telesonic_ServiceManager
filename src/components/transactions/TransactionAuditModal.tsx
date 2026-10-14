import React from "react";
import { X, History, Clock, ShieldCheck } from "lucide-react";

interface TransactionAuditModalProps {
  isOpen: boolean;
  onClose: () => void;
  recordId: string;
  screenTitle: string;
  screenCode: string;
}

export const TransactionAuditModal: React.FC<TransactionAuditModalProps> = ({
  isOpen,
  onClose,
  recordId,
  screenTitle,
  screenCode,
}) => {
  if (!isOpen) return null;

  const mockAuditLogs = [
    {
      id: "AUD-TRX-01",
      date: "2026-10-15 14:22:10",
      user: "Kasun Perera (Service Coordinator)",
      action: "Status Update",
      field: "Status",
      oldVal: "Assigned",
      newVal: "In Progress",
      reason: "Technician arrived at site and commenced mobile inspection",
    },
    {
      id: "AUD-TRX-02",
      date: "2026-10-15 09:30:05",
      user: "SAP_B1_DI_SERVER (Integration Sync)",
      action: "SAP B1 Post",
      field: "SAP Document Ref",
      oldVal: "—",
      newVal: "ITR-2026-88124 (Goods Issue)",
      reason: "Parts released to van inventory for call execution",
    },
    {
      id: "AUD-TRX-03",
      date: "2026-10-14 16:45:00",
      user: "A. Perera (Supervisor)",
      action: "Schedule Change",
      field: "Planned Appointment",
      oldVal: "14-Oct-2026 14:00",
      newVal: "15-Oct-2026 09:30",
      reason: "Customer requested morning slot to avoid factory production freeze",
    },
    {
      id: "AUD-TRX-04",
      date: "2026-10-12 10:15:00",
      user: "Portal_Inbound_API",
      action: "Transaction Created",
      field: "All Fields",
      oldVal: "—",
      newVal: "Draft Committed",
      reason: "Customer registered service request via web portal",
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-2xl bg-card border border-border rounded-lg shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-border bg-muted/40">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded bg-primary/10 text-primary">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">
                Transaction Audit Trail & Change Log
              </h3>
              <p className="text-xs text-muted-foreground">
                {screenCode} · Record Ref:{" "}
                <span className="font-mono font-semibold">{recordId}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-muted-foreground hover:text-foreground rounded-md hover:bg-muted cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content list */}
        <div className="p-5 overflow-y-auto space-y-3.5 flex-1 text-xs">
          <div className="flex items-center justify-between p-2.5 rounded border border-border bg-muted/30">
            <span className="text-muted-foreground">Screen Specification:</span>
            <span className="font-semibold text-foreground">{screenTitle}</span>
          </div>

          <div className="space-y-3">
            {mockAuditLogs.map((log) => (
              <div
                key={log.id}
                className="p-3 rounded-md border border-border bg-card shadow-xs space-y-2 hover:border-primary/40 transition-colors"
              >
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-mono font-bold text-primary flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {log.date}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-muted text-foreground border border-border">
                    {log.action}
                  </span>
                </div>

                <div className="text-foreground">
                  <span className="text-muted-foreground">Modified Field: </span>
                  <span className="font-mono font-semibold text-foreground">{log.field}</span>
                </div>

                <div className="grid grid-cols-2 gap-2 p-2 rounded bg-muted/40 font-mono text-[11px]">
                  <div>
                    <span className="text-[10px] text-muted-foreground block font-sans">
                      Previous Value:
                    </span>
                    <span className="text-destructive line-through truncate block">
                      {log.oldVal}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground block font-sans">
                      Updated Value:
                    </span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold truncate block">
                      {log.newVal}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] pt-1 text-muted-foreground border-t border-border/60">
                  <span>
                    Officer: <strong className="text-foreground">{log.user}</strong>
                  </span>
                  <span className="italic truncate max-w-[240px]" title={log.reason}>
                    Reason: {log.reason}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-border bg-muted/40 text-xs">
          <span className="text-muted-foreground flex items-center gap-1 text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            COM-14 Security Compliance: Tamper-evident immutable transaction log
          </span>
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-md border border-border bg-card text-foreground font-medium hover:bg-muted cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
