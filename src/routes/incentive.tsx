import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useMemo, useEffect } from "react";
import {
  Trophy,
  Layers,
  ArrowLeft,
  ArrowUpRight,
  Search,
  Filter,
  SlidersHorizontal,
  Home,
  CheckCircle2,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Toaster, toast } from "sonner";
import {
  type IncentiveFilterState,
  type IncentiveParticipant,
  incentiveStorage,
  exportIncentiveToExcel,
  exportIncentiveToPdf,
} from "@/lib/incentive-data";
import {
  INCENTIVE_SCREENS,
  type IncentiveScreenItem,
  type ScreenCategory,
} from "@/lib/incentive-screens-data";
import { IncentiveFilters } from "@/components/incentive/IncentiveFilters";
import { AchievementTable } from "@/components/incentive/AchievementTable";
import { PenaltyRiskView } from "@/components/incentive/PenaltyRiskView";
import { RunStatusView } from "@/components/incentive/RunStatusView";
import { IncentiveActionBar } from "@/components/incentive/IncentiveActionBar";
import { IncentiveScreenWorkspace } from "@/components/incentive/IncentiveScreenWorkspace";
import { IncentiveDashboardWorkspace } from "@/components/incentive/IncentiveDashboardWorkspace";

export const Route = createFileRoute("/incentive")({
  head: () => ({
    meta: [
      { title: "Incentive & Commission Management — Service Manager" },
      {
        name: "description",
        content:
          "Telesonic Lanka Incentive & Commission Management: 19 core functional screens, schemes, rate matrices, calculation runs, settlements and performance monitoring.",
      },
      { property: "og:title", content: "Incentive & Commission Management — Service Manager" },
      {
        property: "og:description",
        content:
          "Telesonic Lanka Incentive & Commission Management: 19 core functional screens, schemes, rate matrices, calculation runs, settlements and performance monitoring.",
      },
    ],
  }),
  component: IncentiveModulePage,
});

function IncentiveModulePage() {
  const navigate = useNavigate();

  // Active Screen ID (null means the 19-tile landing page)
  const [selectedScreenId, setSelectedScreenId] = useState<string | null>(null);

  // Sync with URL query parameter if present on mount and on popstate
  useEffect(() => {
    if (typeof window === "undefined") return;
    const syncFromUrl = () => {
      const params = new URLSearchParams(window.location.search);
      const screenParam = params.get("screen");
      setSelectedScreenId(screenParam);
    };

    syncFromUrl();
    window.addEventListener("popstate", syncFromUrl);
    return () => window.removeEventListener("popstate", syncFromUrl);
  }, []);

  const handleOpenScreen = (screenId: string) => {
    setSelectedScreenId(screenId);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("screen", screenId);
      window.history.pushState({}, "", url.toString());
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleCloseScreen = () => {
    setSelectedScreenId(null);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.delete("screen");
      window.history.pushState({}, "", url.pathname);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Search & category filter on the 19 tiles landing page
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<ScreenCategory>("All");

  // Operational Dashboard State (for Screen 16: Incentive Dashboard)
  const [filters, setFilters] = useState<IncentiveFilterState>(() => incentiveStorage.getFilters());
  const [participants, setParticipants] = useState<IncentiveParticipant[]>(() =>
    incentiveStorage.getParticipants(),
  );
  const [activeTab, setActiveTab] = useState<string>("achievement");
  const [isSaving, setIsSaving] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isRecalculating, setIsRecalculating] = useState(false);
  const [selectedStage, setSelectedStage] = useState<number | null>(null);

  const LIFECYCLE_STAGES = [
    {
      stageNumber: 1,
      title: "Master Scheme Setup",
      screenNumbers: [1, 2, 3, 5, 20],
      screenCodes: "Screens 1, 2, 3, 5, 20",
      description: "Scheme Master, Rate Matrix, Slabs, Profiles & Divisions",
      tone: "text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-950/40 dark:border-blue-900",
    },
    {
      stageNumber: 2,
      title: "Quotas & Inputs",
      screenNumbers: [4, 6, 7],
      screenCodes: "Screens 4, 6, 7",
      description: "Monthly Targets, Attendance & Service Facts",
      tone: "text-cyan-600 bg-cyan-50 border-cyan-200 dark:bg-cyan-950/40 dark:border-cyan-900",
    },
    {
      stageNumber: 3,
      title: "Engine & Adjustments",
      screenNumbers: [8, 9, 10],
      screenCodes: "Screens 8, 9, 10",
      description: "Batch Engine, Drill-Down & Bonus Claims",
      tone: "text-purple-600 bg-purple-50 border-purple-200 dark:bg-purple-950/40 dark:border-purple-900",
    },
    {
      stageNumber: 4,
      title: "Governance & GL",
      screenNumbers: [11, 12],
      screenCodes: "Screens 11, 12",
      description: "Four-Eyes Sign-Off, SAP B1 Accrual JE & Period Lock",
      tone: "text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-950/40 dark:border-amber-900",
    },
    {
      stageNumber: 5,
      title: "Payslips & Disputes",
      screenNumbers: [13, 14],
      screenCodes: "Screens 13, 14",
      description: "Participant Statements & Dispute Resolution Log",
      tone: "text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-900",
    },
    {
      stageNumber: 6,
      title: "Monitoring & Risk",
      screenNumbers: [15, 16, 17, 18, 19],
      screenCodes: "Screens 15, 16, 17, 18, 19",
      description: "Analytics, Dashboard, Penalty, Audit & Parameters",
      tone: "text-slate-700 bg-slate-100 border-slate-300 dark:bg-slate-800 dark:border-slate-700",
    },
  ];

  // Filtered 19 tiles
  const filteredScreens = useMemo(() => {
    return INCENTIVE_SCREENS.filter((screen) => {
      if (selectedStage !== null) {
        const stage = LIFECYCLE_STAGES.find((s) => s.stageNumber === selectedStage);
        if (stage && !stage.screenNumbers.includes(screen.screenNumber)) return false;
      }

      const matchCategory = selectedCategory === "All" || screen.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        screen.title.toLowerCase().includes(q) ||
        screen.description.toLowerCase().includes(q) ||
        screen.screenNumber.toString().includes(q) ||
        screen.category.toLowerCase().includes(q);
      return matchCategory && matchSearch;
    });
  }, [searchQuery, selectedCategory, selectedStage]);

  const activeScreen = useMemo(() => {
    if (!selectedScreenId) return null;
    return INCENTIVE_SCREENS.find((s) => s.id === selectedScreenId) || null;
  }, [selectedScreenId]);

  // Operational Dashboard Handlers
  const handleUpdateFilters = (updated: Partial<IncentiveFilterState>) => {
    setFilters((prev) => {
      const next = { ...prev, ...updated };
      incentiveStorage.setFilters(next);
      return next;
    });
  };

  const filteredParticipants = useMemo(() => {
    return participants.filter((p) => {
      const matchPeriod = p.period === filters.period;
      const matchDivision = p.division === filters.division;
      const matchParticipant =
        filters.participant === "All" || p.displayName === filters.participant;
      return matchPeriod && matchDivision && matchParticipant;
    });
  }, [participants, filters]);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      incentiveStorage.setFilters(filters);
      incentiveStorage.setParticipants(participants);
      setIsSaving(false);
      toast.success("Incentive parameters and form state saved successfully.", {
        description: `Active scope: ${filters.period} · ${filters.division}`,
      });
    }, 400);
  };

  const handleClose = () => {
    setSelectedScreenId(null);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      const refreshed = incentiveStorage.getParticipants();
      setParticipants(refreshed);
      setIsRefreshing(false);
      toast.success("Dashboard data refreshed from ERP billing engine.", {
        description: `${refreshed.length} participant records loaded.`,
      });
    }, 500);
  };

  const handleExportExcel = () => {
    exportIncentiveToExcel(filteredParticipants, filters);
    toast.success("Excel report generated and downloaded.", {
      description: `Exported ${filteredParticipants.length} participant records.`,
    });
  };

  const handleExportPdf = () => {
    exportIncentiveToPdf(filteredParticipants, filters);
    toast.info("Printable PDF report opened in preview.", {
      description: "Review and click Print / Save as PDF.",
    });
  };

  const handleTriggerRecalculation = () => {
    setIsRecalculating(true);
    setTimeout(() => {
      setIsRecalculating(false);
      toast.success("Incentive calculation engine cycle completed.", {
        description: "Run ID: RUN-2026-05-MTD-04 executed in 3.1s without errors.",
      });
    }, 1500);
  };

  const categories: ScreenCategory[] = [
    "All",
    "Master Data",
    "Targets & Rules",
    "Inputs & Imports",
    "Processing & Runs",
    "Approvals & Posting",
    "Settlements & Statements",
    "Monitoring & Risk",
  ];

  return (
    <div className="space-y-6 pb-12">
      <Toaster position="top-right" richColors />

      {/* ========================================================== */}
      {/* CASE 1: LANDING PAGE WITH ALL 19 SCREEN TILES             */}
      {/* ========================================================== */}
      {!activeScreen ? (
        <div className="space-y-6">
          {/* Breadcrumb Navigation & Back to Dashboard */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-4">
            <nav
              aria-label="Breadcrumb"
              className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground"
            >
              <Link
                to="/"
                className="flex items-center gap-1.5 font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                <Home size={14} />
                <span>Home</span>
              </Link>
              <span className="text-muted-foreground/60">&gt;</span>
              <span className="font-semibold text-foreground">
                Incentive & Commission Management
              </span>
            </nav>

            <Button asChild variant="outline" size="sm" className="h-8 gap-1.5 text-xs font-medium">
              <Link to="/">
                <ArrowLeft size={13} />
                <span>Back to Dashboard</span>
              </Link>
            </Button>
          </div>

          {/* Module Hero Banner */}
          <div className="card-surface p-5 sm:p-6 rounded-lg border bg-card">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-success text-success-foreground shadow-xs">
                  <Trophy size={24} />
                </span>
                <div>
                  <div className="flex items-center gap-2.5">
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                      Incentive & Commission Management
                    </h1>
                    <span className="rounded-md bg-success-soft text-success px-2 py-0.5 text-xs font-semibold">
                      19 Functional Screens
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Telesonic Lanka &middot; Configure schemes, rate matrices, monthly targets,
                    attendances, calculation runs, settlements, and performance dashboards.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start md:self-auto">
                <span className="text-xs text-muted-foreground font-mono bg-muted/80 px-3 py-1.5 rounded-md border">
                  ERP Sync: Active &middot; SAP Business One
                </span>
              </div>
            </div>

            {/* Search & Category Filter Toolbar */}
            <div className="mt-6 border-t pt-4 space-y-3">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="relative flex-1 max-w-md">
                  <Search
                    size={15}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  />
                  <input
                    type="text"
                    placeholder="Search 19 screen modules by name, description or number..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="input-field pl-9 bg-card text-xs h-9 w-full"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground"
                    >
                      Clear
                    </button>
                  )}
                </div>

                <span className="text-xs text-muted-foreground self-center sm:self-auto font-medium">
                  Showing {filteredScreens.length} of {INCENTIVE_SCREENS.length} Screens
                </span>
              </div>

              {/* Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`whitespace-nowrap rounded-md px-3 py-1 font-medium transition-colors cursor-pointer ${
                      selectedCategory === cat
                        ? "bg-primary text-primary-foreground shadow-xs"
                        : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ========================================================== */}
          {/* VISUAL 6-STAGE PROCESS LIFECYCLE (SECTION 5 STANDARD)      */}
          {/* ========================================================== */}
          <div className="card-surface p-4 sm:p-5 rounded-xl border bg-card shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-primary" />
                  Telesonic End-to-End Month-End Incentive Lifecycle
                </span>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Sequential business process flow matching Section 5 specifications. Click any
                  stage to inspect relevant screens.
                </p>
              </div>

              <div className="flex items-center gap-2">
                {selectedStage !== null && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedStage(null)}
                    className="h-7 text-xs text-primary font-semibold hover:bg-primary/10"
                  >
                    View All Stages
                  </Button>
                )}
                <span className="text-[11px] font-mono text-muted-foreground bg-muted px-2.5 py-1 rounded">
                  {INCENTIVE_SCREENS.length} Active Modules
                </span>
              </div>
            </div>

            {/* Stepper Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-1">
              {LIFECYCLE_STAGES.map((st) => {
                const isSelected = selectedStage === st.stageNumber;
                return (
                  <button
                    key={st.stageNumber}
                    onClick={() => setSelectedStage(isSelected ? null : st.stageNumber)}
                    className={`p-3 rounded-lg border text-left transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                      isSelected
                        ? "border-primary bg-primary/10 shadow-sm ring-1 ring-primary"
                        : "border-border bg-card hover:bg-muted/40"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-muted text-foreground">
                        Stage {st.stageNumber}
                      </span>
                      <span className="text-[10px] font-mono text-muted-foreground">
                        {st.screenNumbers.length} Screens
                      </span>
                    </div>

                    <div>
                      <div className="font-bold text-xs text-foreground leading-tight">
                        {st.title}
                      </div>
                      <div className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">
                        {st.screenCodes}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Grid of 19 Clickable Screen Tiles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
            {filteredScreens.map((screen) => {
              const ScreenIcon = screen.icon;
              return (
                <button
                  key={screen.id}
                  onClick={() => handleOpenScreen(screen.id)}
                  className="group relative flex flex-col justify-between text-left rounded-xl border bg-card p-5 text-card-foreground shadow-xs transition-all hover:-translate-y-1 hover:border-primary/40 hover:bg-card hover:shadow-md cursor-pointer motion-reduce:transform-none"
                >
                  <div className="w-full">
                    {/* Top Row: Icon, Screen # and Arrow */}
                    <div className="flex w-full items-start justify-between gap-2 mb-3">
                      <span
                        className={`grid h-11 w-11 shrink-0 place-items-center rounded-lg ${screen.tone}`}
                      >
                        <ScreenIcon className="size-5" />
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-mono font-bold text-foreground bg-muted px-2 py-0.5 rounded border border-border">
                          Step #{screen.screenNumber.toString().padStart(2, "0")}
                        </span>
                        <ArrowUpRight className="text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform size-4" />
                      </div>
                    </div>

                    {/* Title */}
                    <h2 className="text-sm font-bold sm:text-base group-hover:text-primary transition-colors leading-snug">
                      {screen.title}
                    </h2>

                    {/* Description */}
                    <p className="mt-1.5 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {screen.description}
                    </p>
                  </div>

                  {/* Bottom Footer Meta */}
                  <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-3 text-xs">
                    <span className="text-[10px] font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded">
                      {screen.category}
                    </span>
                    <span className="text-xs font-semibold text-primary group-hover:underline">
                      Open Step &rarr;
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {filteredScreens.length === 0 && (
            <div className="card-surface p-12 text-center rounded-lg border bg-card">
              <p className="text-sm font-semibold text-foreground">No matching screens found</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Try searching with a different keyword or reset the category filter.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("All");
                }}
                className="mt-4 text-xs"
              >
                Reset Filters
              </Button>
            </div>
          )}
        </div>
      ) : (
        /* ========================================================== */
        /* UNIFORM 19-SCREEN WORKSPACE WITH PROCESS LIFECYCLE HEADER  */
        /* ========================================================== */
        <IncentiveScreenWorkspace
          screen={activeScreen}
          onBack={handleCloseScreen}
          onNavigateScreen={handleOpenScreen}
        />
      )}
    </div>
  );
}
