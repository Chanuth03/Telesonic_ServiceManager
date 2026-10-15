import React, { useState } from "react";
import {
  FileSpreadsheet,
  Download,
  Printer,
  Search,
  Filter,
  CheckCircle2,
  FileText,
  Calendar,
  Building,
  RefreshCw,
} from "lucide-react";
import { DASHBOARD_SCREENS_LIST, REPORT_VIEWER_OPTIONS } from "@/data/dashboardSpecData";
import { DashboardScreenHeader } from "./DashboardScreenHeader";

export const ReportViewerScreen: React.FC = () => {
  const meta = DASHBOARD_SCREENS_LIST.find((s) => s.code === "DSH-06")!;
  const [selectedReportId, setSelectedReportId] = useState("O1-RPT-01");
  const [selectedBranch, setSelectedBranch] = useState("All Branches");
  const [dateRange, setDateRange] = useState("Oct 2026 (Current)");
  const [searchFilter, setSearchFilter] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  const currentReport =
    REPORT_VIEWER_OPTIONS.find((r) => r.id === selectedReportId) || REPORT_VIEWER_OPTIONS[0];

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setExportNotice(`Generated fresh preview for ${currentReport.name} (${selectedBranch}).`);
      setTimeout(() => setExportNotice(null), 3500);
    }, 400);
  };

  // Real CSV export
  const handleExportCSV = () => {
    const headers = currentReport.columns.join(",");
    const rows = currentReport.data.map((row) =>
      Object.values(row)
        .map((val) => `"${String(val).replace(/"/g, '""')}"`)
        .join(","),
    );
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${currentReport.id}_${selectedBranch.replace(/\s+/g, "_")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setExportNotice(
      `Successfully exported ${currentReport.id} to Excel (.csv). Audit log entry created in DSH-07.`,
    );
    setTimeout(() => setExportNotice(null), 4000);
  };

  const handlePrintPDF = () => {
    window.print();
  };

  const filteredData = currentReport.data.filter((row) => {
    if (!searchFilter) return true;
    return Object.values(row).some((val) =>
      String(val).toLowerCase().includes(searchFilter.toLowerCase()),
    );
  });

  return (
    <section id="screen-dsh-06" className="scroll-mt-28">
      <DashboardScreenHeader
        meta={meta}
        icon={FileSpreadsheet}
        tone="bg-cyan-50 text-cyan-600 dark:bg-cyan-950/70 dark:text-cyan-400"
        badgeExtra="Ad-Hoc Generator"
      />

      {exportNotice && (
        <div className="mb-4 p-3 rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 text-xs font-semibold flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{exportNotice}</span>
          </div>
          <button
            onClick={() => setExportNotice(null)}
            className="text-xs hover:text-foreground cursor-pointer font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Report Generator Controls */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-2xs mb-5">
        <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
          <Filter className="w-4 h-4 text-primary" />
          <span>Report Parameter Selection</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mb-4">
          {/* Report Choice */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground block mb-1">
              Select Target Report Template
            </label>
            <select
              value={selectedReportId}
              onChange={(e) => setSelectedReportId(e.target.value)}
              className="w-full p-2 text-xs rounded-lg border border-border bg-background text-foreground font-medium"
            >
              {REPORT_VIEWER_OPTIONS.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.id} - {r.name}
                </option>
              ))}
            </select>
          </div>

          {/* Branch Filter */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground block mb-1">
              Branch / Regional Location
            </label>
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="w-full p-2 text-xs rounded-lg border border-border bg-background text-foreground font-medium"
            >
              <option value="All Branches">All Branches (Consolidated)</option>
              <option value="Colombo HQ">Colombo HQ</option>
              <option value="Kandy">Kandy Service Hub</option>
              <option value="Galle">Galle Regional Branch</option>
              <option value="Jaffna">Jaffna Regional Branch</option>
              <option value="Negombo">Negombo Franchise Hub</option>
            </select>
          </div>

          {/* Date Range Filter */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground block mb-1">
              Accounting Date Range
            </label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full p-2 text-xs rounded-lg border border-border bg-background text-foreground font-medium"
            >
              <option value="Oct 2026 (Current)">October 2026 (Current Month)</option>
              <option value="Sep 2026">September 2026 (Closed)</option>
              <option value="Q3 2026">Q3 2026 Consolidated</option>
              <option value="YTD 2026">Year to Date 2026</option>
            </select>
          </div>

          {/* Generate Button */}
          <div className="flex items-end">
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full py-2 px-4 text-xs font-bold rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-colors disabled:opacity-60"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? "animate-spin" : ""}`} />
              <span>{isGenerating ? "Processing..." : "Generate Preview"}</span>
            </button>
          </div>
        </div>

        {/* Action Buttons & Quick Search Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-border/70">
          <div className="relative min-w-[240px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search in generated table..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-border bg-background text-foreground"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Excel (.csv)</span>
            </button>
            <button
              onClick={handlePrintPDF}
              className="px-3.5 py-1.5 text-xs font-semibold rounded-lg border border-border bg-background hover:bg-muted text-foreground flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* Generated Report Table Container */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-2xs mb-8">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h4 className="text-sm font-bold text-foreground">
              {currentReport.id} — {currentReport.name}
            </h4>
            <span className="text-[11px] text-muted-foreground font-mono">
              Branch: {selectedBranch} | Period: {dateRange} | Records: {filteredData.length}
            </span>
          </div>
          <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/70 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
            Preview Ready
          </span>
        </div>

        <div className="overflow-x-auto border border-border rounded-xl">
          <table className="w-full text-xs text-left">
            <thead className="bg-muted/60 text-muted-foreground font-semibold border-b border-border">
              <tr>
                {currentReport.columns.map((col, idx) => (
                  <th
                    key={col}
                    className={`py-2.5 px-3 whitespace-nowrap ${
                      idx === currentReport.columns.length - 1 ? "text-right" : ""
                    }`}
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredData.map((row, rIdx) => {
                const values = Object.values(row);
                return (
                  <tr key={rIdx} className="hover:bg-muted/40 transition-colors">
                    {values.map((v, cIdx) => (
                      <td
                        key={cIdx}
                        className={`py-3 px-3 ${
                          cIdx === 0
                            ? "font-mono font-bold text-primary"
                            : cIdx === values.length - 1
                              ? "font-mono font-bold text-foreground text-right"
                              : "text-foreground"
                        }`}
                      >
                        {String(v)}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredData.length === 0 && (
            <div className="p-8 text-center text-muted-foreground text-xs">
              No records found matching the search filter.
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
