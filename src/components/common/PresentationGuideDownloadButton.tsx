import React, { useState } from "react";
import {
  FileText,
  Download,
  CheckCircle2,
  ExternalLink,
  BookOpen,
  Sparkles,
  ChevronRight,
  X,
  Layers,
  Database,
  ArrowRightLeft,
  LayoutDashboard,
} from "lucide-react";
import { generateTelesonicGuidePdf } from "@/utils/generateGuidePdf";

interface Props {
  variant?: "primary" | "secondary" | "outline" | "compact";
  className?: string;
  showModalOnInfo?: boolean;
}

export const PresentationGuideDownloadButton: React.FC<Props> = ({
  variant = "primary",
  className = "",
  showModalOnInfo = true,
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleDownload = async () => {
    try {
      setIsGenerating(true);
      // Generate PDF
      const doc = generateTelesonicGuidePdf();
      doc.save("Telesonic_3_Tiles_Step_By_Step_Guide.pdf");

      setDownloadSuccess(true);
      setTimeout(() => {
        setDownloadSuccess(false);
      }, 4000);
    } catch {
      // Fallback to static link
      const link = document.createElement("a");
      link.href = "/Telesonic_3_Tiles_Step_By_Step_Guide.pdf";
      link.download = "Telesonic_3_Tiles_Step_By_Step_Guide.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } finally {
      setIsGenerating(false);
    }
  };

  const buttonStyle =
    variant === "primary"
      ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
      : variant === "outline"
        ? "border border-border bg-card text-foreground hover:bg-muted"
        : variant === "compact"
          ? "border border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 text-xs px-2.5 py-1"
          : "bg-muted text-foreground hover:bg-muted/80";

  return (
    <>
      <div className={`inline-flex items-center gap-1.5 ${className}`}>
        <button
          onClick={handleDownload}
          disabled={isGenerating}
          title="Download Step-by-Step PDF Manual for Masters, Transactions, and Dashboard"
          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${buttonStyle}`}
        >
          {isGenerating ? (
            <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : downloadSuccess ? (
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          ) : (
            <Download className="w-3.5 h-3.5" />
          )}
          <span>{downloadSuccess ? "PDF Downloaded!" : "Download PDF Guide"}</span>
        </button>

        {showModalOnInfo && (
          <button
            onClick={() => setIsModalOpen(true)}
            title="Preview Step-by-Step Instructions"
            className="p-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted text-xs cursor-pointer transition-colors"
          >
            <BookOpen className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Step-by-Step Presentation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-4xl max-h-[90vh] bg-card border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-border bg-muted/40 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-primary/10 text-primary">
                  <FileText className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-base font-bold text-foreground">
                    Presentation & Step-by-Step Operational Instructions
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Verified working guide for Masters, Transactions, and Dashboard
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownload}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 cursor-pointer shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Save PDF Document</span>
                </button>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 text-xs text-foreground">
              {/* Executive Summary Card */}
              <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="font-bold text-foreground text-sm">
                    Ready for Stakeholder Presentation
                  </h4>
                  <p className="text-muted-foreground leading-relaxed">
                    All three tiles are live with persistent front-end storage. When you add parts,
                    modify work orders, or release holds, state is retained in browser localStorage.
                    Below is your complete step-by-step presentation roadmap.
                  </p>
                </div>
              </div>

              {/* Tile 1: Masters */}
              <div className="border border-border rounded-xl p-5 bg-card space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                      <Database className="w-4 h-4" />
                    </span>
                    <h4 className="text-sm font-bold text-foreground">
                      Tile 1: Masters Module (/masters)
                    </h4>
                  </div>
                  <span className="text-xs font-mono font-medium text-muted-foreground">
                    28 Screen Definitions
                  </span>
                </div>
                <p className="text-muted-foreground">
                  Hosts foundation master data for Telesonic HVAC/R operations across Sri Lanka.
                </p>
                <div className="space-y-2 pt-2">
                  <div className="p-2.5 rounded-lg bg-muted/50 border border-border/60">
                    <span className="font-bold text-blue-600 dark:text-blue-400 mr-2">Step 1:</span>
                    <span>
                      Open <strong>/masters</strong> from the launcher. Notice the search bar and 28
                      categorized master screens.
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-muted/50 border border-border/60">
                    <span className="font-bold text-blue-600 dark:text-blue-400 mr-2">Step 2:</span>
                    <span>
                      Click on <strong>MST-05 (Item / Spare Parts Master)</strong> or{" "}
                      <strong>MST-08 (Multi-Component Equipment)</strong>.
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-muted/50 border border-border/60">
                    <span className="font-bold text-blue-600 dark:text-blue-400 mr-2">Step 3:</span>
                    <span>
                      Click the green <strong>"+ Add Part / Row Item"</strong> button located above
                      the table.
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-muted/50 border border-border/60">
                    <span className="font-bold text-blue-600 dark:text-blue-400 mr-2">Step 4:</span>
                    <span>
                      Pick an item from the <strong>Telesonic Genuine Spares Catalog</strong> (e.g.,
                      Daikin Inverter Compressor, R410A Refrigerant, or Inverter PCB) or enter
                      custom fields.
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-muted/50 border border-border/60">
                    <span className="font-bold text-blue-600 dark:text-blue-400 mr-2">Step 5:</span>
                    <span>
                      Click <strong>"Save Line Item"</strong>. The row appears immediately with a
                      green <strong>New</strong> badge and is saved to localStorage.
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-muted/50 border border-border/60">
                    <span className="font-bold text-blue-600 dark:text-blue-400 mr-2">Step 6:</span>
                    <span>
                      Edit any header field and click <strong>"Save Record"</strong> in the top
                      toolbar to commit the master definition.
                    </span>
                  </div>
                </div>
              </div>

              {/* Tile 2: Transactions */}
              <div className="border border-border rounded-xl p-5 bg-card space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400">
                      <ArrowRightLeft className="w-4 h-4" />
                    </span>
                    <h4 className="text-sm font-bold text-foreground">
                      Tile 2: Transactions Hub (/transactions)
                    </h4>
                  </div>
                  <span className="text-xs font-mono font-medium text-muted-foreground">
                    42 Transaction Workflows
                  </span>
                </div>
                <p className="text-muted-foreground">
                  Field work orders, quotations, and parts requisition with live LKR pricing and
                  approval holds.
                </p>
                <div className="space-y-2 pt-2">
                  <div className="p-2.5 rounded-lg bg-muted/50 border border-border/60">
                    <span className="font-bold text-teal-600 dark:text-teal-400 mr-2">Step 1:</span>
                    <span>
                      Open <strong>/transactions</strong> from the launcher. Filter by category
                      (Requisitions, Field Service, etc.).
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-muted/50 border border-border/60">
                    <span className="font-bold text-teal-600 dark:text-teal-400 mr-2">Step 2:</span>
                    <span>
                      Select <strong>TRX-17 (Parts Issue & Return Request)</strong> or{" "}
                      <strong>TRX-35 (Service Quotation)</strong>.
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-muted/50 border border-border/60">
                    <span className="font-bold text-teal-600 dark:text-teal-400 mr-2">Step 3:</span>
                    <span>
                      Navigate to the <strong>"Parts & Materials"</strong> tab. Notice current lines
                      and total amount (LKR).
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-muted/50 border border-border/60">
                    <span className="font-bold text-teal-600 dark:text-teal-400 mr-2">Step 4:</span>
                    <span>
                      Click the green <strong>"+ Add Spare Part"</strong> button.
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-muted/50 border border-border/60">
                    <span className="font-bold text-teal-600 dark:text-teal-400 mr-2">Step 5:</span>
                    <span>
                      Select a spare part (e.g. <em>Copeland Scroll Compressor</em>), enter Quantity
                      = 2, and click <strong>"Save Line Item"</strong>.
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-muted/50 border border-border/60">
                    <span className="font-bold text-teal-600 dark:text-teal-400 mr-2">Step 6:</span>
                    <span>
                      Point out to your audience how the table immediately recalculates total parts
                      value and updates localStorage.
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-muted/50 border border-border/60">
                    <span className="font-bold text-teal-600 dark:text-teal-400 mr-2">Step 7:</span>
                    <span>
                      Click <strong>"Save Transaction"</strong> in the top header. An in-app toast
                      confirms persistence.
                    </span>
                  </div>
                </div>
              </div>

              {/* Tile 3: Dashboard */}
              <div className="border border-border rounded-xl p-5 bg-card space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400">
                      <LayoutDashboard className="w-4 h-4" />
                    </span>
                    <h4 className="text-sm font-bold text-foreground">
                      Tile 3: Unified Dashboard (/dashboard)
                    </h4>
                  </div>
                  <span className="text-xs font-mono font-medium text-muted-foreground">
                    A6 Specification — 7 Screens in 1 Page
                  </span>
                </div>
                <p className="text-muted-foreground">
                  Continuous single-page view organized into 3 operational groups with fast-jump
                  navigation.
                </p>
                <div className="space-y-2 pt-2">
                  <div className="p-2.5 rounded-lg bg-muted/50 border border-border/60">
                    <span className="font-bold text-purple-600 dark:text-purple-400 mr-2">
                      Group 1:
                    </span>
                    <span>
                      <strong>Live Monitoring & Operational Pulse</strong>: Live SLA pulse (DSH-01),
                      interactive Hold Monitor (DSH-02), and Repeat Job Analysis (DSH-03).
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-muted/50 border border-border/60">
                    <span className="font-bold text-purple-600 dark:text-purple-400 mr-2">
                      Group 2:
                    </span>
                    <span>
                      <strong>Executive & Financial Performance</strong>: Management KPIs (DSH-04)
                      and Report Viewer (DSH-06) with genuine Excel CSV file download.
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-muted/50 border border-border/60">
                    <span className="font-bold text-purple-600 dark:text-purple-400 mr-2">
                      Group 3:
                    </span>
                    <span>
                      <strong>System Integration & Data Governance</strong>: Integration Queue
                      (DSH-05) with working "Retry" button, and ISO 27001 Export Audit Log (DSH-07).
                    </span>
                  </div>
                </div>
              </div>

              {/* 5-Minute Presentation Script Summary */}
              <div className="p-4 rounded-xl border border-rose-500/20 bg-rose-500/5 space-y-2">
                <h4 className="font-bold text-foreground text-sm text-rose-700 dark:text-rose-400">
                  Recommended 5-Minute Presentation Flow
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-2 pt-1 text-xs">
                  <div className="p-2.5 rounded bg-background border border-border">
                    <p className="font-bold text-foreground">0:00 - 1:00</p>
                    <p className="text-muted-foreground">
                      Workspace launcher & 3 core modules overview.
                    </p>
                  </div>
                  <div className="p-2.5 rounded bg-background border border-border">
                    <p className="font-bold text-foreground">1:00 - 2:15</p>
                    <p className="text-muted-foreground">
                      Masters demo: MST-05, add spare part from catalog, persistent save.
                    </p>
                  </div>
                  <div className="p-2.5 rounded bg-background border border-border">
                    <p className="font-bold text-foreground">2:15 - 3:45</p>
                    <p className="text-muted-foreground">
                      Transactions demo: TRX-17, add compressor, live pricing sum, commit.
                    </p>
                  </div>
                  <div className="p-2.5 rounded bg-background border border-border">
                    <p className="font-bold text-foreground">3:45 - 5:00</p>
                    <p className="text-muted-foreground">
                      Dashboard demo: single page scroll, release hold, export real CSV.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 border-t border-border bg-muted/30 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                Telesonic Engineering (Pvt) Ltd • Option 01 Service Management
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownload}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground font-semibold text-xs hover:bg-primary/90 cursor-pointer shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Full PDF Guide</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
