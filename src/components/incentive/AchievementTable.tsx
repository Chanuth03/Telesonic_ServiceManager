import { AlertCircle, TrendingUp, AlertTriangle } from "lucide-react";
import { type IncentiveParticipant, formatCurrency } from "@/lib/incentive-data";

interface AchievementTableProps {
  participants: IncentiveParticipant[];
  onResetFilters?: () => void;
}

export function AchievementTable({ participants, onResetFilters }: AchievementTableProps) {
  const totalCommission = participants.reduce((acc, p) => acc + p.projectedCommission, 0);
  const totalInvoicesOver45 = participants.reduce((acc, p) => acc + p.invoicesOver45Days, 0);
  const totalPenaltyExposure = participants.reduce((acc, p) => acc + p.penaltyExposure, 0);

  if (participants.length === 0) {
    return (
      <div className="card-surface p-12 text-center my-4">
        <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground mb-3">
          <AlertCircle size={24} />
        </div>
        <h3 className="font-semibold text-base text-foreground">No matching participants found</h3>
        <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
          No achievement records match the current filter criteria for the selected period and
          division.
        </p>
        {onResetFilters && (
          <button
            onClick={onResetFilters}
            className="mt-4 px-3.5 py-1.5 text-xs font-semibold rounded-md border border-input bg-card hover:bg-muted text-foreground transition-colors"
          >
            Reset filter to All
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="card-surface overflow-hidden my-4 shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse min-w-[760px]">
          <thead>
            <tr className="border-b bg-muted/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <th className="px-4 py-3 font-semibold w-12 text-center">#</th>
              <th className="px-4 py-3 font-semibold">Participant</th>
              <th className="px-4 py-3 font-semibold text-right">Volume %</th>
              <th className="px-4 py-3 font-semibold text-right">Turnover %</th>
              <th className="px-4 py-3 font-semibold text-right">Projected Commission</th>
              <th className="px-4 py-3 font-semibold text-right">Invoices &gt; 45 days</th>
              <th className="px-4 py-3 font-semibold text-right">Penalty Exposure</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {participants.map((p, index) => {
              const isOverVolume = p.volumePct >= 100;
              const hasPenalty = p.penaltyExposure > 0;

              return (
                <tr key={p.id} className="transition-colors hover:bg-muted/40 group">
                  <td className="px-4 py-3.5 text-center text-xs font-mono text-muted-foreground">
                    {index + 1}
                  </td>
                  <td className="px-4 py-3.5 font-medium text-foreground">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground">{p.displayName}</span>
                      {isOverVolume && (
                        <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-success bg-success-soft px-1.5 py-0.5 rounded">
                          <TrendingUp size={11} /> Target Met
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-right font-mono tabular-nums">
                    <span
                      className={
                        p.volumePct >= 100
                          ? "text-success font-semibold"
                          : p.volumePct < 60
                            ? "text-destructive font-medium"
                            : "text-foreground"
                      }
                    >
                      {p.volumePct}%
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-right font-mono tabular-nums">
                    <span
                      className={
                        p.turnoverPct >= 90
                          ? "text-success font-semibold"
                          : p.turnoverPct < 65
                            ? "text-destructive font-medium"
                            : "text-foreground"
                      }
                    >
                      {p.turnoverPct}%
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-right font-mono tabular-nums font-semibold text-foreground">
                    LKR {formatCurrency(p.projectedCommission)}
                  </td>
                  <td className="px-4 py-3.5 text-right font-mono tabular-nums">
                    {p.invoicesOver45Days > 0 ? (
                      <span className="inline-flex items-center gap-1 text-destructive font-medium">
                        <AlertTriangle size={12} />
                        {p.invoicesOver45Days}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">0</span>
                    )}
                  </td>
                  <td className="px-4 py-3.5 text-right font-mono tabular-nums">
                    <span
                      className={
                        hasPenalty ? "text-destructive font-semibold" : "text-muted-foreground"
                      }
                    >
                      {hasPenalty ? `LKR ${formatCurrency(p.penaltyExposure)}` : "0"}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-border bg-muted/70 text-xs font-semibold text-foreground">
              <td colSpan={2} className="px-4 py-3 text-muted-foreground uppercase tracking-wider">
                Summary Total ({participants.length} Active Participants)
              </td>
              <td className="px-4 py-3 text-right font-mono tabular-nums text-muted-foreground">
                Avg{" "}
                {Math.round(
                  participants.reduce((acc, p) => acc + p.volumePct, 0) /
                    (participants.length || 1),
                )}
                %
              </td>
              <td className="px-4 py-3 text-right font-mono tabular-nums text-muted-foreground">
                Avg{" "}
                {Math.round(
                  participants.reduce((acc, p) => acc + p.turnoverPct, 0) /
                    (participants.length || 1),
                )}
                %
              </td>
              <td className="px-4 py-3 text-right font-mono tabular-nums font-bold text-foreground">
                LKR {formatCurrency(totalCommission)}
              </td>
              <td className="px-4 py-3 text-right font-mono tabular-nums text-destructive">
                {totalInvoicesOver45}
              </td>
              <td className="px-4 py-3 text-right font-mono tabular-nums font-bold text-destructive">
                {totalPenaltyExposure > 0 ? `LKR ${formatCurrency(totalPenaltyExposure)}` : "LKR 0"}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
