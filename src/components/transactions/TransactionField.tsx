import React from "react";
import { TransactionFieldDef } from "@/data/transactionsSpecData";
import { ExternalLink, CheckSquare } from "lucide-react";

interface TransactionFieldProps {
  field: TransactionFieldDef;
  value: unknown;
  onChange: (val: unknown) => void;
  onLinkClick?: (key: string, val: string) => void;
  optionsOverride?: string[] | undefined;
  placeholderOverride?: string | undefined;
}

export const TransactionField: React.FC<TransactionFieldProps> = ({
  field,
  value,
  onChange,
  onLinkClick,
  optionsOverride,
  placeholderOverride,
}) => {
  const displayVal = value != null ? String(value) : "";
  const effectiveOptions = optionsOverride || field.options;
  const effectivePlaceholder = placeholderOverride || field.placeholder || `Enter ${field.label}...`;

  // If options are provided (either from master dropdown lookup or field definition)
  const isSelect = field.type === "select" || (effectiveOptions && effectiveOptions.length > 0 && !field.readOnly);

  return (
    <div className={`space-y-1 ${field.colSpan === 2 ? "sm:col-span-2" : ""}`}>
      <div className="flex items-center justify-between gap-1.5 text-xs">
        <label className="font-semibold text-foreground flex items-center gap-1">
          {field.label}
          {field.mandatory && (
            <span className="text-destructive font-bold" title="Mandatory Field">
              *
            </span>
          )}
        </label>
      </div>

      {isSelect ? (
        <select
          value={displayVal}
          onChange={(e) => onChange(e.target.value)}
          disabled={field.readOnly}
          className={`w-full px-2.5 py-1.5 text-xs rounded-md border text-foreground transition-colors ${
            field.readOnly
              ? "bg-muted/80 border-border cursor-not-allowed text-muted-foreground"
              : "bg-background border-border hover:border-border/80 focus:outline-hidden focus:ring-1 focus:ring-primary"
          }`}
        >
          <option value="">-- Select {field.label} --</option>
          {effectiveOptions?.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      ) : field.type === "amount" ? (
        <div className="relative">
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[11px] font-mono text-muted-foreground">
            LKR
          </span>
          <input
            type="text"
            value={displayVal}
            readOnly={field.readOnly}
            placeholder={effectivePlaceholder}
            onChange={(e) => onChange(e.target.value)}
            className={`w-full pl-11 pr-2.5 py-1.5 text-xs rounded-md border font-mono tabular-nums text-right text-foreground ${
              field.readOnly
                ? "bg-muted/80 border-border font-medium text-muted-foreground"
                : "bg-background border-border"
            }`}
          />
        </div>
      ) : field.type === "date" ? (
        <input
          type="date"
          value={displayVal}
          readOnly={field.readOnly}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full px-2.5 py-1.5 text-xs rounded-md border font-mono text-foreground ${
            field.readOnly
              ? "bg-muted/80 border-border text-muted-foreground"
              : "bg-background border-border"
          }`}
        />
      ) : field.type === "yesno" ? (
        <select
          value={displayVal}
          onChange={(e) => onChange(e.target.value)}
          disabled={field.readOnly}
          className={`w-full px-2.5 py-1.5 text-xs rounded-md border text-foreground transition-colors ${
            field.readOnly
              ? "bg-muted/80 border-border cursor-not-allowed text-muted-foreground"
              : "bg-background border-border hover:border-border/80 focus:outline-hidden focus:ring-1 focus:ring-primary"
          }`}
        >
          <option value="Yes">Yes</option>
          <option value="No">No</option>
        </select>
      ) : field.type === "link" ? (
        <div className="relative flex items-center">
          <input
            type="text"
            value={displayVal}
            readOnly={field.readOnly}
            placeholder={effectivePlaceholder}
            onChange={(e) => onChange(e.target.value)}
            className={`w-full pr-8 pl-2.5 py-1.5 text-xs rounded-md border text-foreground ${
              field.readOnly
                ? "bg-muted/80 border-border text-muted-foreground"
                : "bg-background border-border hover:border-border/80 focus:outline-hidden focus:ring-1 focus:ring-primary"
            }`}
          />
          {displayVal && (
            <button
              type="button"
              onClick={() => onLinkClick?.(field.key, displayVal)}
              title="Open Linked Master Record"
              className="absolute right-2 text-primary hover:text-primary/80 transition-colors cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      ) : field.type === "signature" ? (
        <div className="flex items-center gap-2 p-2 rounded-md border border-dashed border-border bg-muted/30 text-xs">
          <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-medium text-foreground truncate">
            {displayVal || "Pending Digital Customer Signature"}
          </span>
        </div>
      ) : (
        <input
          type={field.type === "number" ? "number" : "text"}
          value={displayVal}
          readOnly={field.readOnly}
          placeholder={effectivePlaceholder}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full px-2.5 py-1.5 text-xs rounded-md border text-foreground ${
            field.readOnly
              ? "bg-muted/80 border-border text-muted-foreground"
              : "bg-background border-border hover:border-border/80 focus:outline-hidden focus:ring-1 focus:ring-primary"
          }`}
        />
      )}
    </div>
  );
};
