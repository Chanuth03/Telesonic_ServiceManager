import React, { useState } from "react";
import {
  PauseCircle,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Bell,
  ArrowUpRight,
  Filter,
  Search,
  MessageSquare,
  Building,
  User,
  ShieldAlert,
} from "lucide-react";
import { DASHBOARD_SCREENS_LIST, HOLD_MONITOR_DATA } from "@/data/dashboardSpecData";
import { DashboardScreenHeader } from "./DashboardScreenHeader";

export const HoldMonitorScreen: React.FC = () => {
  const meta = DASHBOARD_SCREENS_LIST.find((s) => s.code === "DSH-02")!;
  const [records, setRecords] = useState(HOLD_MONITOR_DATA);
  const [selectedReason, setSelectedReason] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);

  const reasonsList = [
    "All",
    "Parts Awaited",
    "Poor Workmanship",
    "Customer Site",
    "Payment Clearance",
    "Daikin Escalation",
  ];

  const filteredRecords = records.filter((r) => {
    const matchesReason =
      selectedReason === "All" || r.reason.toLowerCase().includes(selectedReason.toLowerCase());
    const matchesSearch =
      r.callNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.technician.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesReason && matchesSearch;
  });

  const handleReleaseHold = (callNo: string) => {
    setRecords((prev) => prev.filter((r) => r.callNo !== callNo));
    setActionSuccessMessage(
      `Hold released successfully for ${callNo}. Re-routed to Technician Dispatch Queue.`,
    );
    setTimeout(() => {
      setActionSuccessMessage(null);
    }, 4000);
  };

  const handleNotifyCustomer = (callNo: string, customer: string) => {
    setActionSuccessMessage(
      `Automated Dialog SMS and email update dispatched to ${customer} regarding ${callNo}.`,
    );
    setTimeout(() => {
      setActionSuccessMessage(null);
    }, 4000);
  };

  return (
    <section id="screen-dsh-02" className="scroll-mt-28">
      <DashboardScreenHeader
        meta={meta}
        icon={PauseCircle}
        tone="bg-amber-50 text-amber-600 dark:bg-amber-950/70 dark:text-amber-400"
        badgeExtra="BCR-04 Enforced"
      />

      {/* Action toast */}
      {actionSuccessMessage && (
        <div className="mb-4 p-3.5 rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 text-xs font-semibold flex items-center justify-between shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionSuccessMessage}</span>
          </div>
          <button
            onClick={() => setActionSuccessMessage(null)}
            className="text-xs text-muted-foreground hover:text-foreground cursor-pointer font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 sm:gap-4 mb-5">
        <div className="p-4 rounded-xl border border-border bg-card shadow-2xs">
          <span className="text-xs font-semibold text-muted-foreground block mb-1">
            Total Held Calls
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-foreground tabular-nums">
              {records.length}
            </span>
            <span className="text-xs font-medium text-amber-600">Pending Actions</span>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-border bg-card shadow-2xs">
          <span className="text-xs font-semibold text-muted-foreground block mb-1">
            Average Hold Aging
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-foreground tabular-nums">3.4</span>
            <span className="text-xs font-medium text-muted-foreground">Days</span>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-border bg-card shadow-2xs">
          <span className="text-xs font-semibold text-muted-foreground block mb-1">
            Longest Bottleneck
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-rose-600 tabular-nums">6</span>
            <span className="text-xs font-medium text-rose-600">Days (Payment)</span>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-border bg-card shadow-2xs">
          <span className="text-xs font-semibold text-muted-foreground block mb-1">
            Critical Parts Awaited
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-foreground tabular-nums">1</span>
            <span className="text-xs font-medium text-primary">Special Daikin Order</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-2xs mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
          {/* Reason Filter Buttons */}
          <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1">
            {reasonsList.map((reason) => {
              const isActive = selectedReason === reason;
              return (
                <button
                  key={reason}
                  onClick={() => setSelectedReason(reason)}
                  className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-colors cursor-pointer whitespace-nowrap ${
                    isActive
                      ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                      : "bg-muted/70 text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  {reason}
                </button>
              );
            })}
          </div>

          {/* Search box */}
          <div className="relative min-w-[240px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search call #, customer, tech..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-border bg-background focus:outline-hidden focus:ring-1 focus:ring-primary text-foreground"
            />
          </div>
        </div>

        {/* Hold Calls Table */}
        <div className="overflow-x-auto border border-border rounded-xl">
          <table className="w-full text-xs text-left">
            <thead className="bg-muted/60 text-muted-foreground font-semibold border-b border-border">
              <tr>
                <th className="py-2.5 px-3 font-mono">Call #</th>
                <th className="py-2.5 px-3">Customer / Location</th>
                <th className="py-2.5 px-3">Hold Reason Category</th>
                <th className="py-2.5 px-3">Held Date</th>
                <th className="py-2.5 px-3">Exp. Resume</th>
                <th className="py-2.5 px-3">Aging</th>
                <th className="py-2.5 px-3">Technician</th>
                <th className="py-2.5 px-3 text-right">Operational Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredRecords.map((item) => (
                <tr key={item.callNo} className="hover:bg-muted/40 transition-colors">
                  <td className="py-3 px-3 font-mono font-bold text-primary whitespace-nowrap">
                    {item.callNo}
                  </td>
                  <td className="py-3 px-3">
                    <div className="font-semibold text-foreground">{item.customer}</div>
                    <div className="text-[11px] text-muted-foreground flex items-center gap-1">
                      <Building className="w-3 h-3" />
                      {item.branch}
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                        item.reason.includes("Payment")
                          ? "bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border border-rose-200"
                          : item.reason.includes("Parts")
                            ? "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border border-amber-200"
                            : item.reason.includes("Investigation")
                              ? "bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300 border border-purple-200"
                              : "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-200"
                      }`}
                    >
                      <PauseCircle className="w-3 h-3" />
                      {item.reason}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono text-muted-foreground whitespace-nowrap">
                    {item.heldOn}
                  </td>
                  <td className="py-3 px-3 font-mono font-semibold text-foreground whitespace-nowrap">
                    {item.expectedResume}
                  </td>
                  <td className="py-3 px-3 font-bold whitespace-nowrap">
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] ${
                        parseInt(item.age) >= 5
                          ? "bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-200"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {item.age}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="font-medium text-foreground">{item.technician}</span>
                  </td>
                  <td className="py-3 px-3 text-right whitespace-nowrap">
                    <div className="inline-flex items-center gap-1.5">
                      <button
                        onClick={() => handleReleaseHold(item.callNo)}
                        className="px-2.5 py-1 text-xs font-semibold rounded-md bg-emerald-600 hover:bg-emerald-700 text-white transition-colors cursor-pointer"
                        title="Resume call and move to dispatcher"
                      >
                        Release Hold
                      </button>
                      <button
                        onClick={() => handleNotifyCustomer(item.callNo, item.customer)}
                        className="p-1 rounded-md border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                        title="Send SMS update to customer"
                      >
                        <Bell className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredRecords.length === 0 && (
            <div className="p-8 text-center text-muted-foreground text-xs">
              No hold bottlenecks matching the selected filter criteria.
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
