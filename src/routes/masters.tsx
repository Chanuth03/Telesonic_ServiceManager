import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { Database, Search, ArrowRight, ArrowLeft, Layers, ShieldCheck, FileCheck, CheckCircle2 } from "lucide-react";
import { MASTER_SCREENS_LIST, MASTER_CATEGORIES, MasterScreenMeta } from "@/data/mastersSpecData";
import { MasterScreenView } from "@/components/masters/MasterScreenView";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/masters")({
  head: () => ({
    meta: [
      { title: "Masters Registry — Servio & Telesonic Lanka" },
      { name: "description", content: "Master Data and System Configuration screens for Service Management Option 01." },
      { property: "og:title", content: "Masters Registry — Servio & Telesonic Lanka" },
      { property: "og:description", content: "Master Data and System Configuration screens for Service Management Option 01." },
    ],
  }),
  component: MastersPage,
});

function MastersPage() {
  const [selectedScreenId, setSelectedScreenId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const activeScreenMeta = useMemo(() => {
    if (!selectedScreenId) return null;
    return MASTER_SCREENS_LIST.find((s) => s.id === selectedScreenId || s.code === selectedScreenId) || null;
  }, [selectedScreenId]);

  const filteredScreens = useMemo(() => {
    return MASTER_SCREENS_LIST.filter((screen) => {
      if (selectedCategory !== 'All' && screen.category !== selectedCategory) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesId = screen.id.toLowerCase().includes(q) || screen.code.toLowerCase().includes(q);
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
            <span>All 30 Master Screens</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground hidden sm:inline">Jump to Master Screen:</span>
            <select
              value={activeScreenMeta.id}
              onChange={(e) => setSelectedScreenId(e.target.value)}
              className="text-xs px-2 py-1 rounded border border-border bg-background text-foreground"
            >
              {MASTER_SCREENS_LIST.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.code}: {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <MasterScreenView
          meta={activeScreenMeta}
          onBack={() => setSelectedScreenId(null)}
        />
      </div>
    );
  }

  return (
    <div className="py-4 sm:py-6 space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-primary mb-1 uppercase tracking-wider">
            <Database className="w-4 h-4" />
            <span>Telesonic Lanka Service Management (Option 01)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Master Data & Configuration Screens
          </h1>
          <p className="mt-1 text-sm text-muted-foreground max-w-2xl">
            Complete suite of 30 master screens (A2 & A3 specification register) synchronized with SAP Business One, complete with validation rules, status flows, and sub-grids.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 text-xs font-mono font-medium rounded-md bg-primary-soft text-primary">
            {MASTER_SCREENS_LIST.length} Screens Configured
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Category Filter Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-muted/60 rounded-lg border border-border/60">
          {MASTER_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-card text-foreground shadow-xs font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search screens, codes, or fields..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      {/* Screen Tiles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredScreens.map((screen) => (
          <div
            key={screen.id}
            onClick={() => setSelectedScreenId(screen.id)}
            className="group flex flex-col justify-between p-4 rounded-lg border border-border bg-card text-card-foreground shadow-xs hover:shadow-md hover:border-primary/50 transition-all cursor-pointer"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="px-1.5 py-0.5 text-[11px] font-mono font-bold rounded bg-muted text-muted-foreground">
                  {screen.code}
                </span>
                <span className="text-[10px] font-mono text-muted-foreground">
                  {screen.id}
                </span>
              </div>

              <h2 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1 mb-1.5">
                {screen.name}
              </h2>

              <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed mb-3">
                {screen.purpose}
              </p>
            </div>

            <div className="pt-3 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
              <span className="text-[11px] truncate max-w-[180px]">
                {screen.category}
              </span>
              <span className="flex items-center gap-1 font-semibold text-primary group-hover:translate-x-0.5 transition-transform">
                <span>Open Screen</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        ))}
      </div>

      {filteredScreens.length === 0 && (
        <div className="text-center py-12 text-sm text-muted-foreground">
          No master screens found matching your search.
        </div>
      )}
    </div>
  );
}
