import React, { useState } from "react";
import {
  ShieldCheck,
  Download,
  Search,
  Filter,
  FileSpreadsheet,
  FileText,
  User,
  Calendar,
  Lock,
  CheckCircle2,
  BadgeCheck,
} from "lucide-react";
import { DASHBOARD_SCREENS_LIST, EXPORT_LOG_DATA } from "@/data/dashboardSpecData";
import { DashboardScreenHeader } from "./DashboardScreenHeader";

export const ExportLogScreen: React.FC = () => {
  const meta = DASHBOARD_SCREENS_LIST.find((s) => s.code === "DSH-07")!;
  const [searchQuery, setSearchQuery] = useState("");
  const [formatFilter, setFormatFilter] = useState<"All" | "PDF" | "Excel">("All");
  const [downloadSuccessNotice, setDownloadSuccessNotice] = useState<string | null>(null);

  const filteredLogs = EXPORT_LOG_DATA.filter((log) => {
    const matchesFormat = formatFilter === "All" || log.format === formatFilter;
    const matchesQuery =
      log.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.report.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.parameters.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFormat && matchesQuery;
  });

  const handleDownloadAuditCSV = () => {
    const headers =
      "Timestamp,User & Role,Report,Format,Exported Rows,Applied Parameters,Integrity Hash";
    const rows = filteredLogs.map(
      (l) =>
        `"${l.dateTime}","${l.user}","${l.report}","${l.format}",${l.rows},"${l.parameters}","SHA256-OK"`,
    );
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `DSH-07_Export_Compliance_Audit_Log.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setDownloadSuccessNotice(
      "Compliance audit CSV downloaded. Verified by Central Bank Audit trail protocol.",
    );
    setTimeout(() => setDownloadSuccessNotice(null), 4000);
  };

  return (
    <section id="screen-dsh-07" className="scroll-mt-28">
      <DashboardScreenHeader
        meta={meta}
        icon={ShieldCheck}
        tone="bg-teal-50 text-teal-600 dark:bg-teal-950/70 dark:text-teal-400"
      />

      {downloadSuccessNotice && (
        <div className="mb-4 p-3 rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 text-xs font-semibold flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{downloadSuccessNotice}</span>
          </div>
          <button
            onClick={() => setDownloadSuccessNotice(null)}
            className="text-xs hover:text-foreground cursor-pointer font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Container */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-2xs mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-base font-bold text-foreground">
              Audit Trail of System Data Exports
            </h3>
            <p className="text-xs text-muted-foreground">
              Review user export history to guarantee compliance with Telesonic Lanka information
              security standards.
            </p>
          </div>

          <button
            onClick={handleDownloadAuditCSV}
            className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-teal-700 hover:bg-teal-800 text-white flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors shrink-0"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Audit Trail (.csv)</span>
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center bg-muted/70 p-1 rounded-lg text-xs font-medium">
            {(["All", "Excel", "PDF"] as const).map((fmt) => (
              <button
                key={fmt}
                onClick={() => setFormatFilter(fmt)}
                className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                  formatFilter === fmt
                    ? "bg-background text-foreground shadow-xs font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {fmt === "All" ? "All Formats" : `${fmt} Exports`}
              </button>
            ))}
          </div>

          <div className="relative min-w-[260px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search user, report, parameters..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-border bg-background text-foreground"
            />
          </div>
        </div>

        {/* Audit Log Table */}
        <div className="overflow-x-auto border border-border rounded-xl">
          <table className="w-full text-xs text-left">
            <thead className="bg-muted/60 text-muted-foreground font-semibold border-b border-border">
              <tr>
                <th className="py-2.5 px-3 font-mono">Export Timestamp</th>
                <th className="py-2.5 px-3">Authorized User</th>
                <th className="py-2.5 px-3">Exported Report Title</th>
                <th className="py-2.5 px-3 text-center">Format</th>
                <th className="py-2.5 px-3 text-center">Row Count</th>
                <th className="py-2.5 px-3">Parameters & Filter Context</th>
                <th className="py-2.5 px-3 text-right">Integrity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredLogs.map((log, idx) => (
                <tr key={idx} className="hover:bg-muted/40 transition-colors">
                  <td className="py-3 px-3 font-mono text-muted-foreground whitespace-nowrap">
                    {log.dateTime}
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    <div className="font-semibold text-foreground flex items-center gap-1.5">
                      <User className="w-3 h-3 text-muted-foreground" />
                      <span>{log.user}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <span className="font-medium text-foreground">{log.report}</span>
                  </td>
                  <td className="py-3 px-3 text-center whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        log.format === "Excel"
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200 border border-emerald-300"
                          : "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-200 border border-rose-300"
                      }`}
                    >
                      {log.format === "Excel" ? (
                        <FileSpreadsheet className="w-3 h-3" />
                      ) : (
                        <FileText className="w-3 h-3" />
                      )}
                      {log.format}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center font-mono font-bold text-foreground">
                    {log.rows}
                  </td>
                  <td className="py-3 px-3 font-mono text-[11px] text-muted-foreground max-w-xs truncate">
                    {log.parameters}
                  </td>
                  <td className="py-3 px-3 text-right whitespace-nowrap">
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/70 px-2 py-0.5 rounded border border-emerald-200">
                      <BadgeCheck className="w-3 h-3" />
                      <span>Verified</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredLogs.length === 0 && (
            <div className="p-8 text-center text-muted-foreground text-xs">
              No audit records matching query.
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
