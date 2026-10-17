import { useState } from "react";
import { Play, CheckCircle2, AlertCircle, Clock, Server, RefreshCw } from "lucide-react";
import {
  type CalculationRunLog,
  INITIAL_RUN_LOGS,
  type IncentiveFilterState,
} from "@/lib/incentive-data";
import { Button } from "@/components/ui/button";

interface RunStatusViewProps {
  filters: IncentiveFilterState;
  onTriggerRecalculation: () => void;
  isRecalculating: boolean;
}

export function RunStatusView({
  filters,
  onTriggerRecalculation,
  isRecalculating,
}: RunStatusViewProps) {
  const [runLogs] = useState<CalculationRunLog[]>(INITIAL_RUN_LOGS);
  const latestRun = runLogs[0];

  return (
    <div className="space-y-6 my-4">
      {/* Current Run Engine Status Card */}
      <div className="card-surface p-6 border-l-4 border-l-primary">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 rounded-full bg-success animate-pulse" />
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Incentive Engine Status: Online
              </span>
            </div>
            <h3 className="text-lg font-bold text-foreground mt-1">
              Active Calculation Batch: {filters.period} ({filters.division})
            </h3>
            <p className="text-sm text-muted-foreground mt-0.5">
              Engine applies volume achievement matrices, turnover targets, and 45-day overdue aging
              penalty clawbacks.
            </p>
          </div>

          <Button
            onClick={onTriggerRecalculation}
            disabled={isRecalculating}
            className="self-start sm:self-auto gap-2 shadow-sm"
          >
            {isRecalculating ? (
              <>
                <RefreshCw size={14} className="animate-spin" />
                Executing Run...
              </>
            ) : (
              <>
                <Play size={14} className="fill-current" />
                Trigger Recalculation
              </>
            )}
          </Button>
        </div>

        {/* Engine Metadata Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-5 border-t">
          <div>
            <span className="text-xs text-muted-foreground block font-medium">Last Run ID</span>
            <span className="text-sm font-mono font-semibold text-foreground">
              {latestRun?.runId ?? "N/A"}
            </span>
          </div>
          <div>
            <span className="text-xs text-muted-foreground block font-medium">
              Last Calculation
            </span>
            <span className="text-sm font-mono text-foreground">
              {latestRun?.timestamp ?? "N/A"}
            </span>
          </div>
          <div>
            <span className="text-xs text-muted-foreground block font-medium">Processing Time</span>
            <span className="text-sm font-mono font-semibold text-foreground">
              {latestRun?.duration ?? "3.4s"}
            </span>
          </div>
          <div>
            <span className="text-xs text-muted-foreground block font-medium">
              Calculation Engine
            </span>
            <span className="text-sm font-medium text-foreground">Commission Engine v4.2</span>
          </div>
        </div>
      </div>

      {/* Historical Batch Run Logs */}
      <div className="card-surface overflow-hidden shadow-sm">
        <div className="p-4 border-b bg-muted/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Server size={16} className="text-primary" />
            <h3 className="font-semibold text-sm text-foreground">
              Calculation Batch Run History (Audit Log)
            </h3>
          </div>
          <span className="text-xs text-muted-foreground">
            {runLogs.length} Execution Runs Recorded
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse min-w-[720px]">
            <thead>
              <tr className="border-b bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="px-4 py-3 font-semibold">Run ID</th>
                <th className="px-4 py-3 font-semibold">Execution Timestamp</th>
                <th className="px-4 py-3 font-semibold">Period / Division</th>
                <th className="px-4 py-3 font-semibold">Triggered By</th>
                <th className="px-4 py-3 font-semibold text-right">Records</th>
                <th className="px-4 py-3 font-semibold text-right">Duration</th>
                <th className="px-4 py-3 font-semibold text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {runLogs.map((log) => (
                <tr key={log.runId} className="hover:bg-muted/40 transition-colors">
                  <td className="px-4 py-3 font-mono font-medium text-primary text-xs">
                    {log.runId}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Clock size={12} />
                      {log.timestamp}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium text-foreground text-xs">
                    {log.period} · {log.division}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{log.triggeredBy}</td>
                  <td className="px-4 py-3 text-right font-mono tabular-nums text-xs font-semibold">
                    {log.recordsProcessed}
                  </td>
                  <td className="px-4 py-3 text-right font-mono tabular-nums text-xs text-muted-foreground">
                    {log.duration}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        log.status === "Completed"
                          ? "bg-success-soft text-success"
                          : log.status === "In Progress"
                            ? "bg-info-soft text-info"
                            : "bg-destructive-soft text-destructive"
                      }`}
                    >
                      {log.status === "Completed" && <CheckCircle2 size={11} />}
                      {log.status === "Failed" && <AlertCircle size={11} />}
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
