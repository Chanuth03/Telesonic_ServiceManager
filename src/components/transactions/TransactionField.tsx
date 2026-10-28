import React from "react";
import { TransactionFieldDef } from "@/data/transactionsSpecData";

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
  optionsOverride,
  placeholderOverride,
}) => {
  const displayVal = value != null ? String(value) : "";
  const effectiveOptions = optionsOverride || field.options || [];
  const effectivePlaceholder =
    placeholderOverride || field.placeholder || `Enter ${field.label}...`;

  // Master lookup entities (`type === "link"`) or select fields render as a dropdown when editable
  const isSelect =
    !field.readOnly &&
    (field.type === "select" || field.type === "link" || effectiveOptions.length > 0);

  const hasCurrentValueInOptions =
    !displayVal || effectiveOptions.some((opt) => opt === displayVal);

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
          {!hasCurrentValueInOptions && displayVal && (
            <option value={displayVal}>{displayVal}</option>
          )}
          {effectiveOptions.map((opt) => (
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
          className={`w-full px-2.5 py-1.5 text-xs rounded-md border text-foreground ${
            field.readOnly
              ? "bg-muted/80 border-border font-medium text-muted-foreground cursor-not-allowed"
              : "bg-background border-border"
          }`}
        />
      ) : field.type === "yesno" ? (
        <select
          value={displayVal || "No"}
          onChange={(e) => onChange(e.target.value)}
          disabled={field.readOnly}
          className="w-full px-2.5 py-1.5 text-xs rounded-md border border-border bg-background text-foreground"
        >
          <option value="Yes">Yes</option>
          <option value="No">No</option>
        </select>
      ) : (
        <input
          type={field.type === "number" ? "number" : "text"}
          value={displayVal}
          readOnly={field.readOnly}
          placeholder={effectivePlaceholder}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full px-2.5 py-1.5 text-xs rounded-md border text-foreground ${
            field.readOnly
              ? "bg-muted/80 border-border font-medium text-muted-foreground cursor-not-allowed"
              : "bg-background border-border hover:border-border/80 focus:outline-hidden focus:ring-1 focus:ring-primary"
          }`}
        />
      )}
    </div>
  );
};
