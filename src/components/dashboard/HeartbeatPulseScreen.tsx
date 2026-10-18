import React, { useState } from "react";
import {
  Activity,
  AlertTriangle,
  Clock,
  CheckCircle2,
  PauseCircle,
  TrendingUp,
  Radio,
  Filter,
  User,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import {
  DASHBOARD_SCREENS_LIST,
  HEARTBEAT_PULSE_DATA,
  HEARTBEAT_GRID_DATA,
} from "@/data/dashboardSpecData";
import { DashboardScreenHeader } from "./DashboardScreenHeader";

export const HeartbeatPulseScreen: React.FC = () => {
  const meta = DASHBOARD_SCREENS_LIST.find((s) => s.code === "DSH-01")!;
  const [selectedShift, setSelectedShift] = useState<"all" | "morning" | "afternoon">("all");
  const [hoveredHour, setHoveredHour] = useState<number | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 600);
  };

  const chartData = HEARTBEAT_PULSE_DATA.filter((item, index) => {
    if (selectedShift === "morning") return index < 5;
    if (selectedShift === "afternoon") return index >= 5;
    return true;
  });

  const maxOpen = Math.max(...chartData.map((d) => d.open));

  // Live active inbound queue
  const liveQueueItems = [
    {
      callNo: "SC-2026-20531",
      customer: "Ceylon Tobacco Co PLC",
      equipment: "Daikin VRV 18HP (#VRV-091)",
      reported: "18m ago",
      slaMinutesLeft: 42,
      priority: "Critical",
      status: "Dispatched",
      tech: "K. Silva",
      breachRisk: true,
    },
    {
      callNo: "SC-2026-20532",
      customer: "Keells Supermarket - Kohuwala",
      equipment: "Carrier Chiller 50T (#CHL-102)",
      reported: "32m ago",
      slaMinutesLeft: 88,
      priority: "High",
      status: "In Transit",
      tech: "R. Kumar",
      breachRisk: false,
    },
    {
      callNo: "SC-2026-20534",
      customer: "Shangri-La Residences",
      equipment: "Toshiba Inverter Multi-Split",
      reported: "5m ago",
      slaMinutesLeft: 115,
      priority: "Medium",
      status: "Awaiting Tech Assign",
      tech: "Unassigned",
      breachRisk: false,
    },
  ];

  return (
    <section id="screen-dsh-01" className="scroll-mt-28">
      <DashboardScreenHeader
        meta={meta}
        icon={Activity}
        tone="bg-blue-50 text-blue-600 dark:bg-blue-950/70 dark:text-blue-400"
        liveBadge={true}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
      />

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4 mb-6">
        <div className="p-4 sm:p-5 rounded-xl border border-border bg-card shadow-2xs">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-semibold">Active Open Calls</span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-foreground tabular-nums">
              36
            </span>
            <span className="text-xs font-semibold text-emerald-600 flex items-center">
              <TrendingUp className="w-3 h-3 mr-0.5" /> -6 vs peak
            </span>
          </div>
          <p className="mt-1.5 text-[11px] text-muted-foreground">Target queue size: &lt; 40</p>
        </div>

        <div className="p-4 sm:p-5 rounded-xl border border-border bg-card shadow-2xs">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-semibold">Inflow Today</span>
            <Radio className="w-4 h-4 text-blue-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-foreground tabular-nums">
              79
            </span>
            <span className="text-xs font-semibold text-blue-600">+12%</span>
          </div>
          <p className="mt-1.5 text-[11px] text-muted-foreground">Velocity: ~8.8 calls/hr</p>
        </div>

        <div className="p-4 sm:p-5 rounded-xl border border-border bg-card shadow-2xs">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-semibold">Completed Today</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-foreground tabular-nums">
              89
            </span>
            <span className="text-xs font-semibold text-emerald-600 font-mono">FTFR 88.4%</span>
          </div>
          <p className="mt-1.5 text-[11px] text-muted-foreground">Ahead of daily run rate</p>
        </div>

        <div className="p-4 sm:p-5 rounded-xl border border-border bg-card shadow-2xs">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-semibold">SLA Breach Risk</span>
            <AlertTriangle className="w-4 h-4 text-rose-500 animate-bounce" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-rose-600 tabular-nums">
              2
            </span>
            <span className="text-xs font-semibold text-rose-600 px-1.5 py-0.5 rounded bg-rose-50 dark:bg-rose-950/60">
              URGENT
            </span>
          </div>
          <p className="mt-1.5 text-[11px] text-muted-foreground">
            &lt; 45 mins countdown remaining
          </p>
        </div>

        <div className="p-4 sm:p-5 rounded-xl border border-border bg-card shadow-2xs col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-semibold">Held Bottlenecks</span>
            <PauseCircle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-amber-600 tabular-nums">
              5
            </span>
            <span className="text-xs font-semibold text-muted-foreground">In DSH-02</span>
          </div>
          <p className="mt-1.5 text-[11px] text-muted-foreground">Avg hold duration: 3.4 days</p>
        </div>
      </div>

      {/* Main Grid: Hourly Velocity Chart + Live Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mb-8">
        {/* Left Column (7 cols): Hourly Volume Distribution Bar Chart */}
        <div className="lg:col-span-7 rounded-2xl border border-border bg-card p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="text-base font-bold text-foreground">
                  Hourly Service Velocity Breakdown
                </h3>
                <p className="text-xs text-muted-foreground">
                  Comparing hourly active open load, inbound tickets, closures, and hold additions.
                </p>
              </div>

              {/* Shift Filter Pills */}
              <div className="flex items-center bg-muted/70 p-1 rounded-lg text-xs font-medium">
                <button
                  onClick={() => setSelectedShift("all")}
                  className={`px-2.5 py-1 rounded-md transition-colors ${
                    selectedShift === "all"
                      ? "bg-background text-foreground shadow-xs font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Full Day
                </button>
                <button
                  onClick={() => setSelectedShift("morning")}
                  className={`px-2.5 py-1 rounded-md transition-colors ${
                    selectedShift === "morning"
                      ? "bg-background text-foreground shadow-xs font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Morning (08-12)
                </button>
                <button
                  onClick={() => setSelectedShift("afternoon")}
                  className={`px-2.5 py-1 rounded-md transition-colors ${
                    selectedShift === "afternoon"
                      ? "bg-background text-foreground shadow-xs font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Afternoon (13-17)
                </button>
              </div>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground mb-4">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-primary" />
                Active Open Load
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-blue-400" />
                New Calls
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
                Resolved / Closed
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-amber-500" />
                On Hold
              </span>
            </div>
          </div>

          {/* Interactive CSS Bar Chart */}
          <div className="pt-4 pb-2">
            <div className="h-56 flex items-end gap-2 sm:gap-3 border-b border-border/80 pb-2">
              {chartData.map((d, idx) => {
                const openPct = Math.round((d.open / maxOpen) * 100);
                const isHover = hoveredHour === idx;

                return (
                  <div
                    key={d.time}
                    className="relative flex-1 flex flex-col items-center h-full justify-end group cursor-pointer"
                    onMouseEnter={() => setHoveredHour(idx)}
                    onMouseLeave={() => setHoveredHour(null)}
                  >
                    {/* Tooltip */}
                    {isHover && (
                      <div className="absolute -top-16 z-20 whitespace-nowrap rounded-lg bg-foreground text-background px-3 py-1.5 text-xs shadow-lg font-mono">
                        <div className="font-bold border-b border-background/20 pb-0.5">
                          {d.time} Summary
                        </div>
                        <div>
                          Open: {d.open} | +{d.newCalls} in | -{d.closed} out
                        </div>
                      </div>
                    )}

                    <div className="w-full flex items-end justify-center gap-1 h-full">
                      {/* Open Load Bar */}
                      <div
                        className="w-full max-w-[16px] sm:max-w-[22px] rounded-t-sm bg-primary transition-all duration-300"
                        style={{
                          height: `${openPct}%`,
                          opacity: hoveredHour === null || isHover ? 1 : 0.5,
                        }}
                      />
                      {/* Resolved Bar */}
                      <div
                        className="w-full max-w-[8px] sm:max-w-[12px] rounded-t-sm bg-emerald-500 transition-all duration-300"
                        style={{
                          height: `${Math.round((d.closed / 15) * 80)}%`,
                          opacity: hoveredHour === null || isHover ? 1 : 0.5,
                        }}
                      />
                    </div>
                    <span className="mt-2 text-[11px] font-mono text-muted-foreground group-hover:text-foreground group-hover:font-bold">
                      {d.time}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between items-center text-[11px] text-muted-foreground mt-2">
              <span>Standard Shift: 08:00 – 17:00</span>
              <span className="font-semibold text-foreground">
                Peak Load Window: 11:00 (45 Calls)
              </span>
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): Live Inbound Queue with SLA countdowns */}
        <div className="lg:col-span-5 rounded-2xl border border-border bg-card p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                <h3 className="text-base font-bold text-foreground">Live Queue & SLA Timers</h3>
              </div>
              <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-muted text-muted-foreground">
                3 Monitored
              </span>
            </div>
            <p className="text-xs text-muted-foreground mb-4">
              Real-time countdown to SLA response commitment window.
            </p>

            <div className="space-y-3">
              {liveQueueItems.map((item) => (
                <div
                  key={item.callNo}
                  className={`p-3.5 rounded-xl border transition-all ${
                    item.breachRisk
                      ? "border-rose-300 dark:border-rose-800 bg-rose-50/40 dark:bg-rose-950/20"
                      : "border-border bg-muted/30"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div>
                      <span className="font-mono text-xs font-bold text-primary">
                        {item.callNo}
                      </span>
                      <h4 className="text-sm font-semibold text-foreground leading-tight mt-0.5">
                        {item.customer}
                      </h4>
                    </div>
                    <div className="text-right shrink-0">
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                          item.breachRisk
                            ? "bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200 animate-pulse"
                            : "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200"
                        }`}
                      >
                        {item.slaMinutesLeft}m SLA Left
                      </span>
                    </div>
                  </div>

                  <div className="text-xs text-muted-foreground flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border/50">
                    <span className="truncate max-w-[200px]">{item.equipment}</span>
                    <span className="flex items-center gap-1 font-medium text-foreground">
                      <User className="w-3 h-3 text-muted-foreground" />
                      {item.tech}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-border/70 mt-3 flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Compliance SLA Target: 92%</span>
            <span className="font-bold text-primary flex items-center gap-1 cursor-pointer hover:underline">
              <span>View Full Queue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
