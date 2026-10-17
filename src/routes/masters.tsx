import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import {
  Search,
  ArrowLeft,
  ArrowUpRight,
  Layers,
  Users,
  UserCheck,
  MapPin,
  Cpu,
  Barcode,
  Wrench,
  ShieldAlert,
  Boxes,
  UserCog,
  HardHat,
  BadgeAlert,
  ClipboardList,
  PauseCircle,
  Repeat,
  Calendar,
  CheckSquare,
  ShieldCheck,
  Sparkles,
  FileSignature,
  Share2,
  Bell,
  Mail,
  FolderKanban,
  Calculator,
  DollarSign,
  Store,
  AlertTriangle,
  FileSpreadsheet,
  Video,
  ListOrdered,
  Truck,
  type LucideIcon,
} from "lucide-react";
import { MASTER_SCREENS_LIST, MASTER_CATEGORIES } from "@/data/mastersSpecData";
import { MasterScreenView } from "@/components/masters/MasterScreenView";

export const Route = createFileRoute("/masters")({
  head: () => ({
    meta: [
      { title: "Masters Registry — Servio & Telesonic Lanka" },
      {
        name: "description",
        content: "Master Data and System Configuration screens for Service Management Option 01.",
      },
      { property: "og:title", content: "Masters Registry — Servio & Telesonic Lanka" },
      {
        property: "og:description",
        content: "Master Data and System Configuration screens for Service Management Option 01.",
      },
    ],
  }),
  component: MastersPage,
});

interface MasterVisual {
  icon: LucideIcon;
  tone: string;
}

function getMasterVisual(code: string): MasterVisual {
  switch (code) {
    case "MST-01":
      return {
        icon: Users,
        tone: "bg-blue-50 text-blue-600 dark:bg-blue-950/70 dark:text-blue-400",
      };
    case "MST-02":
      return {
        icon: UserCheck,
        tone: "bg-cyan-50 text-cyan-600 dark:bg-cyan-950/70 dark:text-cyan-400",
      };
    case "MST-03":
      return {
        icon: MapPin,
        tone: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/70 dark:text-emerald-400",
      };
    case "MST-04":
      return {
        icon: Cpu,
        tone: "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/70 dark:text-indigo-400",
      };
    case "MST-05":
      return {
        icon: Barcode,
        tone: "bg-amber-50 text-amber-600 dark:bg-amber-950/70 dark:text-amber-400",
      };
    case "MST-06":
      return {
        icon: Wrench,
        tone: "bg-teal-50 text-teal-600 dark:bg-teal-950/70 dark:text-teal-400",
      };
    case "MST-07":
      return {
        icon: ShieldAlert,
        tone: "bg-purple-50 text-purple-600 dark:bg-purple-950/70 dark:text-purple-400",
      };
    case "MST-08":
      return {
        icon: Boxes,
        tone: "bg-blue-50 text-blue-600 dark:bg-blue-950/70 dark:text-blue-400",
      };
    case "MST-09":
      return {
        icon: UserCog,
        tone: "bg-cyan-50 text-cyan-600 dark:bg-cyan-950/70 dark:text-cyan-400",
      };
    case "MST-10":
      return {
        icon: HardHat,
        tone: "bg-amber-50 text-amber-600 dark:bg-amber-950/70 dark:text-amber-400",
      };
    case "MST-11":
      return {
        icon: BadgeAlert,
        tone: "bg-rose-50 text-rose-600 dark:bg-rose-950/70 dark:text-rose-400",
      };
    case "MST-12":
      return {
        icon: ClipboardList,
        tone: "bg-blue-50 text-blue-600 dark:bg-blue-950/70 dark:text-blue-400",
      };
    case "MST-13":
      return {
        icon: PauseCircle,
        tone: "bg-amber-50 text-amber-600 dark:bg-amber-950/70 dark:text-amber-400",
      };
    case "MST-14":
      return {
        icon: Repeat,
        tone: "bg-teal-50 text-teal-600 dark:bg-teal-950/70 dark:text-teal-400",
      };
    case "MST-15":
      return {
        icon: Calendar,
        tone: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/70 dark:text-emerald-400",
      };
    case "MST-16":
      return {
        icon: CheckSquare,
        tone: "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/70 dark:text-indigo-400",
      };
    case "MST-17":
      return {
        icon: ShieldCheck,
        tone: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/70 dark:text-emerald-400",
      };
    case "MST-18":
      return {
        icon: Sparkles,
        tone: "bg-purple-50 text-purple-600 dark:bg-purple-950/70 dark:text-purple-400",
      };
    case "MST-19":
      return {
        icon: FileSignature,
        tone: "bg-blue-50 text-blue-600 dark:bg-blue-950/70 dark:text-blue-400",
      };
    case "MST-20":
      return {
        icon: Share2,
        tone: "bg-cyan-50 text-cyan-600 dark:bg-cyan-950/70 dark:text-cyan-400",
      };
    case "MST-21":
      return {
        icon: Bell,
        tone: "bg-amber-50 text-amber-600 dark:bg-amber-950/70 dark:text-amber-400",
      };
    case "MST-22":
      return {
        icon: Mail,
        tone: "bg-blue-50 text-blue-600 dark:bg-blue-950/70 dark:text-blue-400",
      };
    case "MST-23":
      return {
        icon: FolderKanban,
        tone: "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/70 dark:text-indigo-400",
      };
    case "MST-24":
      return {
        icon: Calculator,
        tone: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/70 dark:text-emerald-400",
      };
    case "MST-25":
      return {
        icon: DollarSign,
        tone: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/70 dark:text-emerald-400",
      };
    case "MST-26":
      return {
        icon: Store,
        tone: "bg-amber-50 text-amber-600 dark:bg-amber-950/70 dark:text-amber-400",
      };
    case "MST-27":
      return {
        icon: AlertTriangle,
        tone: "bg-rose-50 text-rose-600 dark:bg-rose-950/70 dark:text-rose-400",
      };
    case "MST-28":
      return {
        icon: FileSpreadsheet,
        tone: "bg-teal-50 text-teal-600 dark:bg-teal-950/70 dark:text-teal-400",
      };
    case "MST-29":
      return {
        icon: Video,
        tone: "bg-sky-50 text-sky-600 dark:bg-sky-950/70 dark:text-sky-400",
      };
    case "MST-30":
      return {
        icon: ListOrdered,
        tone: "bg-purple-50 text-purple-600 dark:bg-purple-950/70 dark:text-purple-400",
      };
    case "MST-31":
      return {
        icon: Truck,
        tone: "bg-amber-50 text-amber-600 dark:bg-amber-950/70 dark:text-amber-400",
      };
    default:
      return {
        icon: Layers,
        tone: "bg-blue-50 text-blue-600 dark:bg-blue-950/70 dark:text-blue-400",
      };
  }
}

function MastersPage() {
  const [selectedScreenId, setSelectedScreenId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");

  const activeScreenMeta = useMemo(() => {
    if (!selectedScreenId) return null;
    return (
      MASTER_SCREENS_LIST.find((s) => s.id === selectedScreenId || s.code === selectedScreenId) ||
      null
    );
  }, [selectedScreenId]);

  const filteredScreens = useMemo(() => {
    return MASTER_SCREENS_LIST.filter((screen) => {
      if (selectedCategory !== "All" && screen.category !== selectedCategory) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesId =
          screen.id.toLowerCase().includes(q) || screen.code.toLowerCase().includes(q);
        const matchesName = screen.name.toLowerCase().includes(q);
        const matchesPurpose = screen.purpose.toLowerCase().includes(q);
        const matchesCategory = screen.category.toLowerCase().includes(q);
        return matchesId || matchesName || matchesPurpose || matchesCategory;
      }
      return true;
    });
  }, [selectedCategory, searchQuery]);

  // If a screen is currently open, render its full wireframe
  if (activeScreenMeta) {
    return (
      <div className="py-2 sm:py-4">
        {/* Quick Screen Switcher Bar */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 bg-card p-3 rounded-lg border border-border shadow-xs">
          <button
            onClick={() => setSelectedScreenId(null)}
            className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>All 31 Master Screens</span>
          </button>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-muted-foreground hidden sm:inline">
              Jump to Master Screen:
            </span>
            <select
              value={activeScreenMeta.id}
              onChange={(e) => setSelectedScreenId(e.target.value)}
              className="text-xs px-2.5 py-1.5 rounded border border-border bg-background text-foreground font-medium"
            >
              {MASTER_SCREENS_LIST.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.code}: {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <MasterScreenView meta={activeScreenMeta} onBack={() => setSelectedScreenId(null)} />
      </div>
    );
  }

  return (
    <div className="py-4 sm:py-6 space-y-5">
      {/* Search Bar with Count Indicator */}
      <div className="relative w-full">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={`Search ${MASTER_SCREENS_LIST.length} screen modules by name, description or number...`}
          className="w-full pl-10 pr-36 py-2.5 text-xs rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-1 focus:ring-primary shadow-xs"
        />
      </div>

      {/* Category Filter Pill Buttons & PDF Guide */}
      <div className="flex flex-wrap items-center justify-between gap-3 overflow-x-auto pb-1">
        <div className="flex flex-wrap items-center gap-2">
          {MASTER_CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 text-xs rounded-full transition-colors cursor-pointer whitespace-nowrap font-medium ${
                  isActive
                    ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                    : "bg-muted/70 text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Screen Cards Grid: 4 columns matching the reference screenshot */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {filteredScreens.map((screen) => {
          const { icon: Icon, tone } = getMasterVisual(screen.code);
          const num = screen.code.replace("MST-", "#");

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

                {/* Description */}
                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                  {screen.purpose}
                </p>
              </div>

              {/* Footer Row: Category on Left, Open -> on Right */}
              <div className="pt-3 border-t border-border/60 flex items-center justify-between text-xs mt-3">
                <span className="text-muted-foreground font-medium truncate max-w-[130px]">
                  {screen.category}
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
            No master screens found matching your query
          </h3>
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            Try adjusting your search criteria or resetting category filters to view all 31 screens.
          </p>
          <button
            onClick={() => {
              setSelectedCategory("All");
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
