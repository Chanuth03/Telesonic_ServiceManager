import React, { useState, useMemo } from "react";
import {
  FileSpreadsheet,
  Search,
  Filter,
  Download,
  Printer,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  ArrowLeft,
  Shield,
  Calendar,
  Layers,
  ChevronRight,
  TrendingUp,
  Award,
  DollarSign,
  UserCheck,
  Eye,
  FileText,
  Percent,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  ExternalLink,
  Users,
  Building2,
  X,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/incentive-data";

export interface ParticipantCalculationResult {
  id: string;
  technicianCode: string;
  technicianName: string;
  role: string;
  division: string;
  schemeCode: string;
  schemeName: string;
  targetVolume: number;
  actualVolume: number;
  volumePct: number;
  targetTurnover: number;
  actualTurnover: number;
  turnoverPct: number;
  slabTier: string;
  slabMultiplier: number;
  grossCommission: number;
  targetIncentive: number;
  attendanceFactor: number;
  penaltyClawback: number;
  netPayable: number;
  status: "Calculated" | "Verified" | "Held" | "Approved";
  jobCount: number;
  overdueInvoiceCount: number;
}

const INITIAL_RESULTS: ParticipantCalculationResult[] = [
  {
    id: "calc-01",
    technicianCode: "TECH-101",
    technicianName: "Ruwan Jayasinghe",
    role: "Senior Field Engineer",
    division: "Consumer Electronics",
    schemeCode: "SCH-CE-FIELD",
    schemeName: "Consumer AV & Smart Appliances Tiered Incentive",
    targetVolume: 40,
    actualVolume: 46,
    volumePct: 115,
    targetTurnover: 850000,
    actualTurnover: 969000,
    turnoverPct: 114,
    slabTier: "Tier 3 (110% - 125%)",
    slabMultiplier: 1.15,
    grossCommission: 98000,
    targetIncentive: 50500,
    attendanceFactor: 1.0,
    penaltyClawback: 0,
    netPayable: 148500,
    status: "Verified",
    jobCount: 46,
    overdueInvoiceCount: 0,
  },
  {
    id: "calc-02",
    technicianCode: "TECH-102",
    technicianName: "Dinesh Bandara",
    role: "Biomedical Specialist",
    division: "Biomedical Engineering",
    schemeCode: "SCH-MED-SPEC",
    schemeName: "Healthcare Diagnostic & Imaging Systems Scheme",
    targetVolume: 25,
    actualVolume: 27,
    volumePct: 108,
    targetTurnover: 1400000,
    actualTurnover: 1484000,
    turnoverPct: 106,
    slabTier: "Tier 2 (100% - 110%)",
    slabMultiplier: 1.05,
    grossCommission: 135000,
    targetIncentive: 81500,
    attendanceFactor: 1.0,
    penaltyClawback: 24500,
    netPayable: 192000,
    status: "Verified",
    jobCount: 27,
    overdueInvoiceCount: 2,
  },
  {
    id: "calc-03",
    technicianCode: "TECH-103",
    technicianName: "Kasun Wijesinghe",
    role: "Network Technician",
    division: "Telecommunications & Networks",
    schemeCode: "SCH-TEL-NET",
    schemeName: "Fiber Optic & Microwave Installation Incentive",
    targetVolume: 35,
    actualVolume: 32,
    volumePct: 91,
    targetTurnover: 600000,
    actualTurnover: 552000,
    turnoverPct: 92,
    slabTier: "Tier 1 (80% - 99%)",
    slabMultiplier: 0.9,
    grossCommission: 58000,
    targetIncentive: 30000,
    attendanceFactor: 1.0,
    penaltyClawback: 0,
    netPayable: 88000,
    status: "Calculated",
    jobCount: 32,
    overdueInvoiceCount: 0,
  },
  {
    id: "calc-04",
    technicianCode: "TECH-104",
    technicianName: "Anura Senanayake",
    role: "IT Solutions Architect",
    division: "Enterprise IT Solutions",
    schemeCode: "SCH-IT-SRV",
    schemeName: "Enterprise Datacenter & Server Maintenance Matrix",
    targetVolume: 20,
    actualVolume: 25,
    volumePct: 125,
    targetTurnover: 2200000,
    actualTurnover: 2684000,
    turnoverPct: 122,
    slabTier: "Tier 4 (> 120% Super Achievement)",
    slabMultiplier: 1.25,
    grossCommission: 165000,
    targetIncentive: 98000,
    attendanceFactor: 1.0,
    penaltyClawback: 18000,
    netPayable: 245000,
    status: "Approved",
    jobCount: 25,
    overdueInvoiceCount: 1,
  },
  {
    id: "calc-05",
    technicianCode: "TECH-105",
    technicianName: "Pradeep Kumara",
    role: "Industrial Automation Tech",
    division: "Industrial Automation",
    schemeCode: "SCH-IND-AUTO",
    schemeName: "PLC & Robotics Field Commission Structure",
    targetVolume: 30,
    actualVolume: 23,
    volumePct: 76,
    targetTurnover: 950000,
    actualTurnover: 741000,
    turnoverPct: 78,
    slabTier: "Below Threshold (< 80%)",
    slabMultiplier: 0.7,
    grossCommission: 48000,
    targetIncentive: 35200,
    attendanceFactor: 0.9,
    penaltyClawback: 31200,
    netPayable: 52000,
    status: "Held",
    jobCount: 23,
    overdueInvoiceCount: 3,
  },
  {
    id: "calc-06",
    technicianCode: "TECH-106",
    technicianName: "Nimal Perera",
    role: "Power Systems Technician",
    division: "Power Systems & Generators",
    schemeCode: "SCH-PWR-GEN",
    schemeName: "Diesel Generator & UPS Service Commission Scheme",
    targetVolume: 28,
    actualVolume: 29,
    volumePct: 103,
    targetTurnover: 750000,
    actualTurnover: 765000,
    turnoverPct: 102,
    slabTier: "Tier 2 (100% - 110%)",
    slabMultiplier: 1.0,
    grossCommission: 72000,
    targetIncentive: 40000,
    attendanceFactor: 1.0,
    penaltyClawback: 0,
    netPayable: 112000,
    status: "Calculated",
    jobCount: 29,
    overdueInvoiceCount: 0,
  },
  {
    id: "calc-07",
    technicianCode: "TECH-107",
    technicianName: "Chaminda Silva",
    role: "Consumer AV Technician",
    division: "Consumer Electronics",
    schemeCode: "SCH-CE-FIELD",
    schemeName: "Consumer AV & Smart Appliances Tiered Incentive",
    targetVolume: 32,
    actualVolume: 28,
    volumePct: 87,
    targetTurnover: 700000,
    actualTurnover: 616000,
    turnoverPct: 88,
    slabTier: "Tier 1 (80% - 99%)",
    slabMultiplier: 0.85,
    grossCommission: 45000,
    targetIncentive: 28500,
    attendanceFactor: 1.0,
    penaltyClawback: 9500,
    netPayable: 64000,
    status: "Verified",
    jobCount: 28,
    overdueInvoiceCount: 1,
  },
];

interface CalculationResultsDetailViewProps {
  onNavigateScreen?: ((screenId: string) => void) | undefined;
  onBack?: (() => void) | undefined;
}

export function CalculationResultsDetailView({
  onNavigateScreen,
  onBack,
}: CalculationResultsDetailViewProps) {
  const [results, setResults] = useState<ParticipantCalculationResult[]>(INITIAL_RESULTS);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDivision, setSelectedDivision] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedResult, setSelectedResult] = useState<ParticipantCalculationResult | null>(null);

  // Filters
  const filteredResults = useMemo(() => {
    return results.filter((r) => {
      const matchSearch =
        !searchTerm ||
        r.technicianCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.technicianName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.schemeName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchDiv = selectedDivision === "All" || r.division === selectedDivision;
      const matchStatus = selectedStatus === "All" || r.status === selectedStatus;
      return matchSearch && matchDiv && matchStatus;
    });
  }, [results, searchTerm, selectedDivision, selectedStatus]);

  // Aggregate stats
  const totals = useMemo(() => {
    return filteredResults.reduce(
      (acc, r) => ({
        count: acc.count + 1,
        gross: acc.gross + r.grossCommission,
        targetBonus: acc.targetBonus + r.targetIncentive,
        penalties: acc.penalties + r.penaltyClawback,
        net: acc.net + r.netPayable,
      }),
      { count: 0, gross: 0, targetBonus: 0, penalties: 0, net: 0 },
    );
  }, [filteredResults]);

  const handleExportCsv = () => {
    const headers = [
      "Technician Code",
      "Technician Name",
      "Division",
      "Scheme Code",
      "Volume %",
      "Turnover %",
      "Slab Multiplier",
      "Gross Commission (LKR)",
      "Target Bonus (LKR)",
      "Attendance Factor",
      "Penalty Clawback (LKR)",
      "Net Payable (LKR)",
      "Status",
    ];

    const rows = filteredResults.map((r) => [
      r.technicianCode,
      `"${r.technicianName}"`,
      `"${r.division}"`,
      r.schemeCode,
      `${r.volumePct}%`,
      `${r.turnoverPct}%`,
      r.slabMultiplier,
      r.grossCommission,
      r.targetIncentive,
      r.attendanceFactor,
      r.penaltyClawback,
      r.netPayable,
      r.status,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Incentive_Calculation_Results_May_2026.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("Calculation results exported to CSV.", {
      description: `${filteredResults.length} records downloaded.`,
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const handleStatusChange = (id: string, newStatus: ParticipantCalculationResult["status"]) => {
    setResults((prev) => prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r)));
    toast.success(`Participant status updated to ${newStatus}.`);
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-4">
        <div className="flex items-center gap-2">
          {onBack && (
            <Button
              variant="outline"
              size="sm"
              onClick={onBack}
              className="h-8 gap-1.5 text-xs font-medium cursor-pointer"
            >
              <ArrowLeft size={13} />
              <span>All Incentive Screens</span>
            </Button>
          )}
          <span className="text-xs text-muted-foreground font-mono bg-muted px-2.5 py-1 rounded">
            Screen #08 · Processing & Runs
          </span>
        </div>

        {/* Quick jump navigation */}
        {onNavigateScreen && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground hidden sm:inline">Jump to:</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigateScreen("calculation-run")}
              className="h-7 text-xs gap-1 cursor-pointer"
            >
              <span>Batch Engine</span>
              <ArrowRight size={11} />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigateScreen("approval-posting")}
              className="h-7 text-xs gap-1 cursor-pointer"
            >
              <span>Approvals</span>
              <ArrowRight size={11} />
            </Button>
          </div>
        )}
      </div>

      {/* Screen Title & Batch Context Banner */}
      <div className="card-surface p-5 sm:p-6 rounded-lg border bg-card shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-success text-success-foreground shadow-xs">
              <FileSpreadsheet size={24} />
            </span>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                  Calculation Results Detail View
                </h1>
                <span className="rounded-md bg-success-soft text-success px-2 py-0.5 text-xs font-semibold">
                  Batch #RUN-2026-05-MTD-04
                </span>
              </div>
              <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
                Telesonic Lanka · Individual participant incentive computations, quota achievements,
                slabs, attendance proration, and aging penalty deductions.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCsv}
              className="gap-1.5 text-xs h-8"
            >
              <Download size={13} />
              <span>Export CSV</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              className="gap-1.5 text-xs h-8"
            >
              <Printer size={13} />
              <span>Print Statements</span>
            </Button>
          </div>
        </div>

        {/* Aggregated KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-6 pt-5 border-t">
          <div className="space-y-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground block">
              Participants
            </span>
            <span className="text-xl font-bold text-foreground font-mono">{totals.count}</span>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground block">
              Gross Commission
            </span>
            <span className="text-xl font-bold text-foreground font-mono">
              LKR {formatCurrency(totals.gross)}
            </span>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground block">
              Target Bonus
            </span>
            <span className="text-xl font-bold text-foreground font-mono text-primary">
              LKR {formatCurrency(totals.targetBonus)}
            </span>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground block">
              Penalty Clawbacks
            </span>
            <span className="text-xl font-bold text-destructive font-mono">
              -LKR {formatCurrency(totals.penalties)}
            </span>
          </div>

          <div className="col-span-2 sm:col-span-1 space-y-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground block">
              Net Payable Pool
            </span>
            <span className="text-xl font-bold text-success font-mono">
              LKR {formatCurrency(totals.net)}
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card-surface p-4 rounded-lg border bg-card flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="text"
            placeholder="Search by code, technician name, or scheme..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-9 text-xs h-9 w-full bg-card"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <select
            value={selectedDivision}
            onChange={(e) => setSelectedDivision(e.target.value)}
            className="input-field h-9 text-xs bg-card"
          >
            <option value="All">All Divisions</option>
            <option value="Consumer Electronics">Consumer Electronics</option>
            <option value="Biomedical Engineering">Biomedical Engineering</option>
            <option value="Telecommunications & Networks">Telecommunications & Networks</option>
            <option value="Enterprise IT Solutions">Enterprise IT Solutions</option>
            <option value="Industrial Automation">Industrial Automation</option>
            <option value="Power Systems & Generators">Power Systems & Generators</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="input-field h-9 text-xs bg-card"
          >
            <option value="All">All Verification Statuses</option>
            <option value="Calculated">Calculated</option>
            <option value="Verified">Verified</option>
            <option value="Approved">Approved</option>
            <option value="Held">Held / Under Review</option>
          </select>
        </div>
      </div>

      {/* Main Results Table */}
      <div className="card-surface overflow-hidden rounded-lg border bg-card shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse min-w-[980px]">
            <thead>
              <tr className="border-b bg-muted/50 text-left font-semibold text-muted-foreground">
                <th className="px-3.5 py-3">Technician / Code</th>
                <th className="px-3.5 py-3">Division & Scheme</th>
                <th className="px-3.5 py-3 text-right">Target Achieved</th>
                <th className="px-3.5 py-3 text-right">Slab Tier</th>
                <th className="px-3.5 py-3 text-right">Gross Comm.</th>
                <th className="px-3.5 py-3 text-right">Target Bonus</th>
                <th className="px-3.5 py-3 text-right">Penalty</th>
                <th className="px-3.5 py-3 text-right font-bold text-foreground">Net Payable</th>
                <th className="px-3.5 py-3 text-center">Status</th>
                <th className="px-3.5 py-3 text-center">Drilldown</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredResults.map((r) => {
                const isOver = r.volumePct >= 100;
                const hasPenalty = r.penaltyClawback > 0;

                return (
                  <tr key={r.id} className="hover:bg-muted/30 transition-colors group">
                    <td className="px-3.5 py-3 font-medium text-foreground">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[11px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground">
                          {r.technicianCode}
                        </span>
                        <div>
                          <div className="font-semibold text-foreground">{r.technicianName}</div>
                          <div className="text-[10px] text-muted-foreground">{r.role}</div>
                        </div>
                      </div>
                    </td>

                    <td className="px-3.5 py-3 text-muted-foreground">
                      <div className="font-medium text-foreground">{r.division}</div>
                      <div className="text-[10px] text-muted-foreground truncate max-w-[180px]">
                        {r.schemeName}
                      </div>
                    </td>

                    <td className="px-3.5 py-3 text-right font-mono tabular-nums">
                      <div className={isOver ? "text-success font-semibold" : "text-foreground"}>
                        Vol: {r.volumePct}% ({r.actualVolume}/{r.targetVolume})
                      </div>
                      <div className="text-[10px] text-muted-foreground">Val: {r.turnoverPct}%</div>
                    </td>

                    <td className="px-3.5 py-3 text-right font-mono text-[11px]">
                      <span className="px-2 py-0.5 bg-muted rounded font-medium text-foreground">
                        {r.slabMultiplier}x
                      </span>
                    </td>

                    <td className="px-3.5 py-3 text-right font-mono tabular-nums text-foreground">
                      LKR {formatCurrency(r.grossCommission)}
                    </td>

                    <td className="px-3.5 py-3 text-right font-mono tabular-nums text-primary font-medium">
                      LKR {formatCurrency(r.targetIncentive)}
                    </td>

                    <td className="px-3.5 py-3 text-right font-mono tabular-nums">
                      {hasPenalty ? (
                        <span className="text-destructive font-semibold">
                          -LKR {formatCurrency(r.penaltyClawback)}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">0</span>
                      )}
                    </td>

                    <td className="px-3.5 py-3 text-right font-mono tabular-nums font-bold text-foreground text-sm">
                      LKR {formatCurrency(r.netPayable)}
                    </td>

                    <td className="px-3.5 py-3 text-center">
                      <select
                        value={r.status}
                        onChange={(e) =>
                          handleStatusChange(
                            r.id,
                            e.target.value as ParticipantCalculationResult["status"],
                          )
                        }
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded border ${
                          r.status === "Approved"
                            ? "bg-success-soft text-success border-success/30"
                            : r.status === "Verified"
                              ? "bg-primary/10 text-primary border-primary/30"
                              : r.status === "Held"
                                ? "bg-destructive-soft text-destructive border-destructive/30"
                                : "bg-muted text-muted-foreground border-border"
                        }`}
                      >
                        <option value="Calculated">Calculated</option>
                        <option value="Verified">Verified</option>
                        <option value="Approved">Approved</option>
                        <option value="Held">Held</option>
                      </select>
                    </td>

                    <td className="px-3.5 py-3 text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedResult(r)}
                        className="h-7 w-7 p-0 cursor-pointer"
                        title="View Detailed Computation Drilldown"
                      >
                        <Eye size={13} className="text-primary" />
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredResults.length === 0 && (
          <div className="p-12 text-center text-muted-foreground text-xs">
            No technician incentive records match the search and filter settings.
          </div>
        )}
      </div>

      {/* Drilldown Modal */}
      {selectedResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="relative w-full max-w-2xl rounded-xl border bg-card p-6 shadow-xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between border-b pb-4">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-lg bg-primary text-primary-foreground">
                  <UserCheck size={20} />
                </span>
                <div>
                  <h3 className="font-bold text-base text-foreground">
                    {selectedResult.technicianName} ({selectedResult.technicianCode})
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {selectedResult.role} · {selectedResult.division}
                  </p>
                </div>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedResult(null)}
                className="h-8 w-8 p-0"
              >
                <X size={16} />
              </Button>
            </div>

            {/* Scheme Details */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs bg-muted/40 p-3.5 rounded-lg border">
              <div>
                <span className="text-muted-foreground block text-[11px]">Applied Scheme</span>
                <span className="font-semibold text-foreground font-mono">
                  {selectedResult.schemeCode}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[11px]">Achievement Tier</span>
                <span className="font-semibold text-foreground">{selectedResult.slabTier}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[11px]">Attendance Factor</span>
                <span className="font-semibold text-foreground">
                  {selectedResult.attendanceFactor * 100}% (Prorated)
                </span>
              </div>
            </div>

            {/* Computation Breakdown Math */}
            <div className="space-y-2 border rounded-lg p-4 bg-card text-xs">
              <h4 className="font-semibold text-xs text-foreground uppercase tracking-wider">
                Formula Computation Breakdown
              </h4>

              <div className="space-y-1.5 pt-2 font-mono">
                <div className="flex justify-between py-1 border-b">
                  <span className="text-muted-foreground">
                    Base Gross Commission ({selectedResult.jobCount} job sheets closed):
                  </span>
                  <span className="font-medium text-foreground">
                    LKR {formatCurrency(selectedResult.grossCommission)}
                  </span>
                </div>

                <div className="flex justify-between py-1 border-b">
                  <span className="text-muted-foreground">
                    Target Achievement Bonus ({selectedResult.slabMultiplier}x multiplier):
                  </span>
                  <span className="font-medium text-primary">
                    + LKR {formatCurrency(selectedResult.targetIncentive)}
                  </span>
                </div>

                <div className="flex justify-between py-1 border-b">
                  <span className="text-muted-foreground">
                    Aging Penalty Clawback ({selectedResult.overdueInvoiceCount} invoices &gt; 45
                    days):
                  </span>
                  <span className="font-medium text-destructive">
                    - LKR {formatCurrency(selectedResult.penaltyClawback)}
                  </span>
                </div>

                <div className="flex justify-between pt-2 text-sm font-bold">
                  <span className="text-foreground">Net Disbursable Incentive:</span>
                  <span className="text-success font-bold">
                    LKR {formatCurrency(selectedResult.netPayable)}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  window.print();
                }}
                className="gap-1.5 text-xs"
              >
                <Printer size={13} />
                <span>Print Individual Payslip</span>
              </Button>

              <Button size="sm" onClick={() => setSelectedResult(null)} className="text-xs">
                Close Drilldown
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
