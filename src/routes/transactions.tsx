import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import {
  ArrowLeft,
  Search,
  ArrowUpRight,
  Layers,
  Headphones,
  Wrench,
  Calendar,
  Clock,
  UserCheck,
  PauseCircle,
  Eye,
  Cpu,
  BadgeCheck,
  ShieldAlert,
  RefreshCw,
  FileSignature,
  UserPlus,
  History,
  Bell,
  CheckCircle,
  Package,
  HardHat,
  DollarSign,
  Printer,
  ClipboardCheck,
  Trophy,
  Sliders,
  RotateCcw,
  Shield,
  BarChart3,
  FolderKanban,
  LineChart,
  Store,
  Barcode,
  Scale,
  GitCommit,
  Mail,
  Truck,
  ReceiptText,
  type LucideIcon,
} from "lucide-react";
import {
  TRANSACTION_SCREENS_LIST,
  TRANSACTION_GROUPS,
  TransactionScreenMeta,
} from "@/data/transactionsSpecData";
import { TransactionScreenView } from "@/components/transactions/TransactionScreenView";

export const Route = createFileRoute("/transactions")({
  head: () => ({
    meta: [
      { title: "Transactions Hub — Servio & Telesonic Lanka" },
      {
        name: "description",
        content:
          "Operational Transaction Screens (O1-SCR-TRX-01 to TRX-35) for Service Management Option 01.",
      },
      { property: "og:title", content: "Transactions Hub — Servio & Telesonic Lanka" },
      {
        property: "og:description",
        content:
          "Operational Transaction Screens (O1-SCR-TRX-01 to TRX-35) for Service Management Option 01.",
      },
    ],
  }),
  component: TransactionsPage,
});

interface ScreenVisual {
  icon: LucideIcon;
  tone: string;
}

function getScreenVisual(code: string): ScreenVisual {
  switch (code) {
    case "TRX-01":
      return {
        icon: Headphones,
        tone: "bg-blue-50 text-blue-600 dark:bg-blue-950/70 dark:text-blue-400",
      };
    case "TRX-02":
      return {
        icon: Wrench,
        tone: "bg-cyan-50 text-cyan-600 dark:bg-cyan-950/70 dark:text-cyan-400",
      };
    case "TRX-03":
      return {
        icon: Calendar,
        tone: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/70 dark:text-emerald-400",
      };
    case "TRX-04":
      return {
        icon: Clock,
        tone: "bg-amber-50 text-amber-600 dark:bg-amber-950/70 dark:text-amber-400",
      };
    case "TRX-05":
      return {
        icon: UserCheck,
        tone: "bg-purple-50 text-purple-600 dark:bg-purple-950/70 dark:text-purple-400",
      };
    case "TRX-06":
      return {
        icon: PauseCircle,
        tone: "bg-rose-50 text-rose-600 dark:bg-rose-950/70 dark:text-rose-400",
      };
    case "TRX-07":
      return {
        icon: Eye,
        tone: "bg-teal-50 text-teal-600 dark:bg-teal-950/70 dark:text-teal-400",
      };
    case "TRX-08":
      return {
        icon: Cpu,
        tone: "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/70 dark:text-indigo-400",
      };
    case "TRX-09":
      return {
        icon: BadgeCheck,
        tone: "bg-blue-50 text-blue-600 dark:bg-blue-950/70 dark:text-blue-400",
      };
    case "TRX-10":
      return {
        icon: ShieldAlert,
        tone: "bg-amber-50 text-amber-600 dark:bg-amber-950/70 dark:text-amber-400",
      };
    case "TRX-11":
      return {
        icon: RefreshCw,
        tone: "bg-cyan-50 text-cyan-600 dark:bg-cyan-950/70 dark:text-cyan-400",
      };
    case "TRX-12":
      return {
        icon: FileSignature,
        tone: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/70 dark:text-emerald-400",
      };
    case "TRX-13":
      return {
        icon: UserPlus,
        tone: "bg-purple-50 text-purple-600 dark:bg-purple-950/70 dark:text-purple-400",
      };
    case "TRX-14":
      return {
        icon: History,
        tone: "bg-blue-50 text-blue-600 dark:bg-blue-950/70 dark:text-blue-400",
      };
    case "TRX-15":
      return {
        icon: Bell,
        tone: "bg-amber-50 text-amber-600 dark:bg-amber-950/70 dark:text-amber-400",
      };
    case "TRX-16":
      return {
        icon: CheckCircle,
        tone: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/70 dark:text-emerald-400",
      };
    case "TRX-17":
      return {
        icon: Package,
        tone: "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/70 dark:text-indigo-400",
      };
    case "TRX-18":
      return {
        icon: HardHat,
        tone: "bg-amber-50 text-amber-600 dark:bg-amber-950/70 dark:text-amber-400",
      };
    case "TRX-19":
      return {
        icon: DollarSign,
        tone: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/70 dark:text-emerald-400",
      };
    case "TRX-20":
      return {
        icon: Printer,
        tone: "bg-blue-50 text-blue-600 dark:bg-blue-950/70 dark:text-blue-400",
      };
    case "TRX-21":
      return {
        icon: ClipboardCheck,
        tone: "bg-teal-50 text-teal-600 dark:bg-teal-950/70 dark:text-teal-400",
      };
    case "TRX-22":
      return {
        icon: Trophy,
        tone: "bg-purple-50 text-purple-600 dark:bg-purple-950/70 dark:text-purple-400",
      };
    case "TRX-23":
      return {
        icon: Sliders,
        tone: "bg-cyan-50 text-cyan-600 dark:bg-cyan-950/70 dark:text-cyan-400",
      };
    case "TRX-24":
      return {
        icon: RotateCcw,
        tone: "bg-rose-50 text-rose-600 dark:bg-rose-950/70 dark:text-rose-400",
      };
    case "TRX-25":
      return {
        icon: Shield,
        tone: "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/70 dark:text-indigo-400",
      };
    case "TRX-26":
      return {
        icon: BarChart3,
        tone: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/70 dark:text-emerald-400",
      };
    case "TRX-27":
      return {
        icon: FolderKanban,
        tone: "bg-blue-50 text-blue-600 dark:bg-blue-950/70 dark:text-blue-400",
      };
    case "TRX-28":
      return {
        icon: LineChart,
        tone: "bg-teal-50 text-teal-600 dark:bg-teal-950/70 dark:text-teal-400",
      };
    case "TRX-29":
      return {
        icon: Store,
        tone: "bg-amber-50 text-amber-600 dark:bg-amber-950/70 dark:text-amber-400",
      };
    case "TRX-30":
      return {
        icon: Barcode,
        tone: "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/70 dark:text-indigo-400",
      };
    case "TRX-31":
      return {
        icon: Scale,
        tone: "bg-rose-50 text-rose-600 dark:bg-rose-950/70 dark:text-rose-400",
      };
    case "TRX-32":
      return {
        icon: GitCommit,
        tone: "bg-cyan-50 text-cyan-600 dark:bg-cyan-950/70 dark:text-cyan-400",
      };
    case "TRX-33":
      return {
        icon: Mail,
        tone: "bg-blue-50 text-blue-600 dark:bg-blue-950/70 dark:text-blue-400",
      };
    case "TRX-34":
      return {
        icon: Truck,
        tone: "bg-amber-50 text-amber-600 dark:bg-amber-950/70 dark:text-amber-400",
      };
    case "TRX-35":
      return {
        icon: ReceiptText,
        tone: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/70 dark:text-emerald-400",
      };
    default:
      return {
        icon: Layers,
        tone: "bg-blue-50 text-blue-600 dark:bg-blue-950/70 dark:text-blue-400",
      };
  }
}

function TransactionsPage() {
  const [selectedScreenId, setSelectedScreenId] = useState<string | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");

  const activeScreenMeta = useMemo(() => {
    if (!selectedScreenId) return null;
    return (
      TRANSACTION_SCREENS_LIST.find(
        (s) => s.id === selectedScreenId || s.code === selectedScreenId,
      ) || null
    );
  }, [selectedScreenId]);

  const filteredScreens = useMemo(() => {
    return TRANSACTION_SCREENS_LIST.filter((screen) => {
      if (selectedGroup !== "All" && screen.group !== selectedGroup) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesId =
          screen.id.toLowerCase().includes(q) || screen.code.toLowerCase().includes(q);
        const matchesName = screen.name.toLowerCase().includes(q);
        const matchesModule = screen.module.toLowerCase().includes(q);
        const matchesPurpose = screen.purpose.toLowerCase().includes(q);
        return matchesId || matchesName || matchesModule || matchesPurpose;
      }
      return true;
    });
  }, [selectedGroup, searchQuery]);

  // If a screen is currently active/open, render full screen wireframe view
  if (activeScreenMeta) {
    return (
      <div className="py-2 sm:py-4 space-y-4">
        {/* Navigation Switcher Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-card p-3 rounded-lg border border-border shadow-xs">
          <button
            onClick={() => setSelectedScreenId(null)}
            className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
          </button>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-muted-foreground hidden sm:inline">
              Jump to Transaction Screen:
            </span>
            <select
              value={activeScreenMeta.id}
              onChange={(e) => setSelectedScreenId(e.target.value)}
              className="text-xs px-2.5 py-1.5 rounded border border-border bg-background text-foreground font-medium"
            >
              {TRANSACTION_SCREENS_LIST.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.code}: {s.name} ({s.module})
                </option>
              ))}
            </select>
          </div>
        </div>

        <TransactionScreenView
          meta={activeScreenMeta}
          onBack={() => setSelectedScreenId(null)}
          onNavigateToScreen={(screenId) => setSelectedScreenId(screenId)}
        />
      </div>
    );
  }

  return (
    <div className="py-4 sm:py-6 space-y-5">
      {/* Search Input Bar with Count Indicator */}
      <div className="relative w-full">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={`Search ${TRANSACTION_SCREENS_LIST.length} screen modules by name, description or number...`}
          className="w-full pl-10 pr-36 py-2.5 text-xs rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-1 focus:ring-primary shadow-xs"
        />
        
      </div>

      {/* Module Group Filter Pill Buttons & PDF Guide */}
      <div className="flex flex-wrap items-center justify-between gap-3 overflow-x-auto pb-1">
        <div className="flex flex-wrap items-center gap-2">
          {TRANSACTION_GROUPS.map((group) => {
            const isActive = selectedGroup === group;
            return (
              <button
                key={group}
                onClick={() => setSelectedGroup(group)}
                className={`px-3.5 py-1.5 text-xs rounded-full transition-colors cursor-pointer whitespace-nowrap font-medium ${
                  isActive
                    ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                    : "bg-muted/70 text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {group}
              </button>
            );
          })}
        </div>
      </div>

      {/* Screen Cards Grid: 4 columns like the screenshot */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {filteredScreens.map((screen) => {
          const { icon: Icon, tone } = getScreenVisual(screen.code);
          const num = screen.code.replace("TRX-", "#");

          return (
            <div
              key={screen.id}
              onClick={() => setSelectedScreenId(screen.id)}
              className="group flex flex-col justify-between p-5 rounded-2xl border border-border bg-card hover:border-primary/60 hover:shadow-md transition-all cursor-pointer min-h-[210px]"
            >
              <div>
                {/* Top Row: Icon Container on Left, Number Badge + Arrow on Right */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${tone}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-muted/80 text-muted-foreground">
                      {num}
                    </span>
                    <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors leading-snug mb-1 line-clamp-2">
                  {screen.name}
                </h3>
              </div>

              {/* Footer Row: Module Category on Left, Open -> on Right */}
              <div className="pt-3 border-t border-border/60 flex items-center justify-between text-xs mt-3">
                <span className="text-muted-foreground font-medium truncate max-w-[130px]">
                  {screen.module}
                </span>
                <span className="font-bold text-primary flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                  <span>Open</span>
                  <span>→</span>
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {filteredScreens.length === 0 && (
        <div className="p-12 text-center rounded-2xl border border-dashed border-border bg-card space-y-3">
          <Layers className="w-8 h-8 text-muted-foreground mx-auto" />
          <h3 className="text-sm font-bold text-foreground">
            No transaction screens match your query
          </h3>
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            Try adjusting your search criteria or resetting group filters to view all 35 screens.
          </p>
          <button
            onClick={() => {
              setSelectedGroup("All");
              setSearchQuery("");
            }}
            className="px-3.5 py-1.5 text-xs font-semibold rounded-full bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
}
