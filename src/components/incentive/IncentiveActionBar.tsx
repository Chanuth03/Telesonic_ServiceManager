import { useState } from "react";
import { Save, X, RefreshCw, FileSpreadsheet, FileText, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

interface IncentiveActionBarProps {
  onSave: () => void;
  onClose: () => void;
  onRefresh: () => void;
  onExportExcel: () => void;
  onExportPdf: () => void;
  isSaving?: boolean;
  isRefreshing?: boolean;
}

export function IncentiveActionBar({
  onSave,
  onClose,
  onRefresh,
  onExportExcel,
  onExportPdf,
  isSaving = false,
  isRefreshing = false,
}: IncentiveActionBarProps) {
  const [exportDropdownOpen, setExportDropdownOpen] = useState(false);

  return (
    <div className="space-y-4 pt-4 border-t">
      {/* Primary Action Buttons */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Left Action Cluster (Save, Close, Refresh, Export Excel / PDF dropdown) */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Save Button (Golden/amber tone as in screenshot) */}
          <button
            onClick={onSave}
            disabled={isSaving}
            className="inline-flex items-center justify-center gap-1.5 px-5 py-2 rounded-md text-xs font-semibold bg-amber-200/80 hover:bg-amber-300/90 text-amber-950 border border-amber-400/80 transition-all shadow-xs cursor-pointer active:scale-95 disabled:opacity-50"
          >
            <Save size={13} />
            <span>{isSaving ? "Saving..." : "Save"}</span>
          </button>

          {/* Close Button (Pale amber tone as in screenshot) */}
          <button
            onClick={onClose}
            className="inline-flex items-center justify-center gap-1.5 px-5 py-2 rounded-md text-xs font-semibold bg-amber-100/70 hover:bg-amber-200/80 text-amber-950 border border-amber-300 transition-all shadow-xs cursor-pointer active:scale-95"
          >
            <X size={13} />
            <span>Close</span>
          </button>

          {/* Refresh Button (Purple outline tone as in screenshot) */}
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-md text-xs font-semibold bg-purple-50/80 hover:bg-purple-100 text-purple-950 dark:bg-purple-950/40 dark:text-purple-200 border border-purple-300 dark:border-purple-700 transition-all shadow-xs cursor-pointer active:scale-95 disabled:opacity-50"
          >
            <RefreshCw size={13} className={isRefreshing ? "animate-spin" : ""} />
            <span>Refresh</span>
          </button>

          {/* Combined Export Excel / PDF dropdown */}
          <div className="relative">
            <button
              onClick={() => setExportDropdownOpen(!exportDropdownOpen)}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-md text-xs font-semibold bg-purple-50/80 hover:bg-purple-100 text-purple-950 dark:bg-purple-950/40 dark:text-purple-200 border border-purple-300 dark:border-purple-700 transition-all shadow-xs cursor-pointer"
            >
              <span>Export Excel / PDF</span>
              <ChevronDown size={12} />
            </button>

            {exportDropdownOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setExportDropdownOpen(false)} />
                <div className="absolute left-0 bottom-full mb-1 w-44 rounded-md border bg-card p-1 shadow-lg z-50 animate-in fade-in zoom-in-95">
                  <button
                    onClick={() => {
                      setExportDropdownOpen(false);
                      onExportExcel();
                    }}
                    className="flex w-full items-center gap-2 rounded px-2.5 py-1.5 text-xs font-medium text-foreground hover:bg-muted transition-colors cursor-pointer"
                  >
                    <FileSpreadsheet size={14} className="text-emerald-600" />
                    <span>Download as Excel</span>
                  </button>
                  <button
                    onClick={() => {
                      setExportDropdownOpen(false);
                      onExportPdf();
                    }}
                    className="flex w-full items-center gap-2 rounded px-2.5 py-1.5 text-xs font-medium text-foreground hover:bg-muted transition-colors cursor-pointer"
                  >
                    <FileText size={14} className="text-rose-600" />
                    <span>Download as PDF</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right Action Cluster (Dedicated Export to Excel & Export to PDF with green outlines) */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onExportExcel}
            className="border-emerald-600 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-xs font-semibold gap-1.5"
          >
            <FileSpreadsheet size={13} className="text-emerald-600" />
            <span>Export to Excel</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={onExportPdf}
            className="border-emerald-600 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-xs font-semibold gap-1.5"
          >
            <FileText size={13} className="text-emerald-600" />
            <span>Export to PDF</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
