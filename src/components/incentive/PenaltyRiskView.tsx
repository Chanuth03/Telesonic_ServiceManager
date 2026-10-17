import { AlertTriangle, ShieldAlert, CheckCircle, FileText } from "lucide-react";
import {
  type IncentiveParticipant,
  type PenaltyRiskInvoice,
  INITIAL_PENALTY_INVOICES,
  formatCurrency,
} from "@/lib/incentive-data";

interface PenaltyRiskViewProps {
  participants: IncentiveParticipant[];
  selectedParticipantFilter: string;
}

export function PenaltyRiskView({ participants, selectedParticipantFilter }: PenaltyRiskViewProps) {
  // Filter invoices matching participants in scope
  const activeParticipantCodes = new Set(participants.map((p) => p.participantCode));
  const filteredInvoices: PenaltyRiskInvoice[] = INITIAL_PENALTY_INVOICES.filter((inv) =>
    activeParticipantCodes.has(inv.participantCode),
  );

  const totalExposure = participants.reduce((acc, p) => acc + p.penaltyExposure, 0);
  const totalOverdueCount = participants.reduce((acc, p) => acc + p.invoicesOver45Days, 0);
  const participantsWithPenalties = participants.filter((p) => p.penaltyExposure > 0);

  if (totalExposure === 0 || filteredInvoices.length === 0) {
    return (
      <div className="card-surface p-12 text-center my-4">
        <div className="mx-auto w-12 h-12 rounded-full bg-success-soft flex items-center justify-center text-success mb-3">
          <CheckCircle size={24} />
        </div>
        <h3 className="font-semibold text-base text-foreground">Zero Penalty Risk Detected</h3>
        <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
          {selectedParticipantFilter === "All"
            ? "All active participants in this scope have zero overdue invoices exceeding 45 days. No commission clawbacks apply."
            : `${selectedParticipantFilter} has maintained a 100% on-time billing profile with zero overdue invoices exceeding 45 days.`}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 my-4">
      {/* Metric Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card-surface p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Total Penalty Clawback
          </p>
          <p className="text-2xl font-bold font-mono tabular-nums text-destructive mt-1">
            LKR {formatCurrency(totalExposure)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Directly deducted from projected commissions
          </p>
        </div>

        <div className="card-surface p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Invoices &gt; 45 Days Overdue
          </p>
          <p className="text-2xl font-bold font-mono tabular-nums text-foreground mt-1">
            {totalOverdueCount}{" "}
            <span className="text-xs font-normal text-muted-foreground">invoices</span>
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Across {participantsWithPenalties.length} sales agent(s)
          </p>
        </div>

        <div className="card-surface p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Risk Mitigation Status
          </p>
          <div className="flex items-center gap-2 mt-1">
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-warning bg-warning-soft px-2 py-0.5 rounded-full">
              <AlertTriangle size={12} /> Action Required
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1.5">
            Finance credit control escalations triggered
          </p>
        </div>
      </div>

      {/* Overdue Invoices Breakdown Table */}
      <div className="card-surface overflow-hidden shadow-sm">
        <div className="p-4 border-b bg-muted/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert size={16} className="text-destructive" />
            <h3 className="font-semibold text-sm text-foreground">
              Overdue Receivables Subject to Commission Penalty (&gt; 45 Days)
            </h3>
          </div>
          <span className="text-xs font-mono text-muted-foreground">
            {filteredInvoices.length} Aging Items
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="px-4 py-3 font-semibold">Invoice #</th>
                <th className="px-4 py-3 font-semibold">Participant</th>
                <th className="px-4 py-3 font-semibold">Customer Name</th>
                <th className="px-4 py-3 font-semibold">Due Date</th>
                <th className="px-4 py-3 font-semibold text-right">Aging Days</th>
                <th className="px-4 py-3 font-semibold text-right">Invoice Value</th>
                <th className="px-4 py-3 font-semibold text-right">Penalty Exposure</th>
                <th className="px-4 py-3 font-semibold text-center">Severity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredInvoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-muted/40 transition-colors">
                  <td className="px-4 py-3 font-mono font-medium text-primary">
                    <span className="flex items-center gap-1.5">
                      <FileText size={13} className="text-muted-foreground" />
                      {inv.invoiceNumber}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium text-foreground">
                    {inv.participantCode} {inv.participantName}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{inv.customerName}</td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                    {inv.dueDate}
                  </td>
                  <td className="px-4 py-3 text-right font-mono tabular-nums font-semibold text-destructive">
                    {inv.agingDays}d
                  </td>
                  <td className="px-4 py-3 text-right font-mono tabular-nums text-foreground">
                    LKR {formatCurrency(inv.invoiceAmount)}
                  </td>
                  <td className="px-4 py-3 text-right font-mono tabular-nums font-semibold text-destructive">
                    LKR {formatCurrency(inv.penaltyExposure)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        inv.severity === "Critical"
                          ? "bg-destructive-soft text-destructive"
                          : inv.severity === "High"
                            ? "bg-warning-soft text-warning"
                            : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {inv.severity}
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
