import React from "react";
import { X, History, Clock } from "lucide-react";

interface AuditModalProps {
  isOpen: boolean;
  onClose: () => void;
  recordId: string;
  screenTitle: string;
}

export const MasterAuditModal: React.FC<AuditModalProps> = ({
  isOpen,
  onClose,
  recordId,
  screenTitle,
}) => {
  if (!isOpen) return null;

  const mockAuditLogs = [
    {
      id: "AUD-01",
      date: "2026-10-13 08:45:12",
      user: "Kasun Perera (Service Coordinator)",
      action: "Field Update",
      field: "Preferred Channel",
      oldVal: "Service Portal Walk-in",
      newVal: "Dedicated Hotline",
      reason: "Customer requested direct coordinator routing",
    },
    {
      id: "AUD-02",
      date: "2026-10-11 14:22:09",
      user: "SAP_B1_SYNC (Integration Service)",
      action: "SAP B1 Synchronize",
      field: "Balance (LKR)",
      oldVal: "1,420,000.00",
      newVal: "1,250,000.00",
      reason: "Incoming Payment RCT-77126 posted in SAP B1",
    },
    {
      id: "AUD-03",
      date: "2026-09-28 10:15:00",
      user: "Admin (System)",
      action: "Record Created",
      field: "All Fields",
      oldVal: "—",
      newVal: "Initial Record Committed",
      reason: "New Business Partner Onboarding",
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-2xl bg-white dark:bg-[#121824] border border-neutral-200 dark:border-neutral-800 rounded-lg shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/60">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-neutral-500" />
            <div>
              <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                Audit Trail & History Log
              </h3>
              <p className="text-[11px] text-neutral-500">
                {screenTitle} · Record Ref: <span className="font-mono">{recordId}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded-xs cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 flex-1 overflow-y-auto space-y-3">
          <div className="text-xs text-neutral-500">
            Full tamper-evident audit history showing before/after values, modifying user identity,
            and change justifications.
          </div>

          <div className="divide-y divide-neutral-200/60 dark:divide-neutral-800 border border-neutral-200 dark:border-neutral-800 rounded-md overflow-hidden bg-white dark:bg-neutral-900/40">
            {mockAuditLogs.map((log) => (
              <div
                key={log.id}
                className="p-3 text-xs space-y-1.5 hover:bg-neutral-50/50 dark:hover:bg-neutral-800/30"
              >
                <div className="flex items-center justify-between text-[11px] text-neutral-500 font-mono">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3 h-3" />
                    <span>{log.date}</span>
                    <span>·</span>
                    <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                      {log.user}
                    </span>
                  </div>
                  <span className="px-1.5 py-0.5 rounded-xs bg-neutral-100 dark:bg-neutral-800 font-medium">
                    {log.action}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                  <div>
                    <span className="text-[10px] text-neutral-400 block uppercase">
                      Field Changed
                    </span>
                    <span className="font-medium text-neutral-800 dark:text-neutral-200">
                      {log.field}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-neutral-400 block uppercase">Before</span>
                    <span className="font-mono text-neutral-500 line-through truncate block">
                      {log.oldVal}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-neutral-400 block uppercase">
                      After Value
                    </span>
                    <span className="font-mono text-emerald-600 dark:text-emerald-400 font-medium truncate block">
                      {log.newVal}
                    </span>
                  </div>
                </div>

                <div className="text-[11px] text-neutral-500 pt-0.5">
                  <span className="font-medium text-neutral-600 dark:text-neutral-400">
                    Reason:{" "}
                  </span>
                  {log.reason}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-3 bg-neutral-50 dark:bg-neutral-900/60 border-t border-neutral-200 dark:border-neutral-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-xs font-medium bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 rounded-md transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
