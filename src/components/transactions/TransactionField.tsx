import React from "react";
import { TransactionFieldDef } from "@/data/transactionsSpecData";
import { ExternalLink, CheckSquare } from "lucide-react";

interface TransactionFieldProps {
  field: TransactionFieldDef;
  value: unknown;
  onChange: (val: unknown) => void;
  onLinkClick?: (key: string, val: string) => void;
}

export const TransactionField: React.FC<TransactionFieldProps> = ({
  field,
  value,
  onChange,
  onLinkClick,
}) => {
  const displayVal = value != null ? String(value) : "";

  return (
    <div className={`space-y-1 ${field.colSpan === 2 ? "sm:col-span-2" : ""}`}>
      <div className="flex items-center justify-between gap-1.5 text-xs">
        <label className="font-semibold text-neutral-800 dark:text-neutral-200 flex items-center gap-1">
          {field.label}
          {field.mandatory && (
            <span className="text-destructive font-bold" title="Mandatory Field">
              *
            </span>
          )}
        </label>
      </div>

      {field.type === "select" ? (
        <select
          value={displayVal}
          onChange={(e) => onChange(e.target.value)}
          disabled={field.readOnly}
          className={`w-full px-2.5 py-1.5 text-xs rounded-md border text-neutral-900 dark:text-neutral-100 transition-colors ${
            field.readOnly
              ? "bg-neutral-100 dark:bg-neutral-800/80 border-neutral-200 dark:border-neutral-700 cursor-not-allowed text-neutral-500"
              : "bg-white dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700 hover:border-neutral-400 focus:outline-hidden focus:ring-1 focus:ring-primary"
          }`}
        >
          {field.options?.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      ) : field.type === "amount" ? (
        <div className="relative">
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[11px] font-mono text-neutral-400">
            LKR
          </span>
          <input
            type="text"
            value={displayVal}
            readOnly={field.readOnly}
            onChange={(e) => onChange(e.target.value)}
            className={`w-full pl-11 pr-2.5 py-1.5 text-xs rounded-md border font-mono tabular-nums text-right text-neutral-900 dark:text-neutral-100 ${
              field.readOnly
                ? "bg-neutral-100 dark:bg-neutral-800/80 border-neutral-200 dark:border-neutral-700 font-medium"
                : "bg-white dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700"
            }`}
          />
        </div>
      ) : field.type === "date" ? (
        <input
          type="date"
          value={displayVal}
          readOnly={field.readOnly}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full px-2.5 py-1.5 text-xs rounded-md border font-mono text-neutral-900 dark:text-neutral-100 ${
            field.readOnly
              ? "bg-neutral-100 dark:bg-neutral-800/80 border-neutral-200 dark:border-neutral-700"
              : "bg-white dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700"
          }`}
        />
      ) : field.type === "yesno" ? (
        <select
          value={displayVal}
          onChange={(e) => onChange(e.target.value)}
          disabled={field.readOnly}
          className={`w-full px-2.5 py-1.5 text-xs rounded-md border text-neutral-900 dark:text-neutral-100 transition-colors ${
            field.readOnly
              ? "bg-neutral-100 dark:bg-neutral-800/80 border-neutral-200 dark:border-neutral-700 cursor-not-allowed text-neutral-500"
              : "bg-white dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700 hover:border-neutral-400 focus:outline-hidden focus:ring-1 focus:ring-primary"
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
            onChange={(e) => onChange(e.target.value)}
            className={`w-full pr-8 pl-2.5 py-1.5 text-xs rounded-md border text-neutral-900 dark:text-neutral-100 ${
              field.readOnly
                ? "bg-neutral-100 dark:bg-neutral-800/80 border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400"
                : "bg-white dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700 hover:border-neutral-400 focus:outline-hidden focus:ring-1 focus:ring-primary"
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
        <div className="flex items-center gap-2 p-2 rounded-md border border-dashed border-neutral-300 dark:border-neutral-700 bg-neutral-50/60 dark:bg-neutral-900/40 text-xs">
          <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-medium text-neutral-700 dark:text-neutral-300 truncate">
            {displayVal || "Pending Digital Customer Signature"}
          </span>
        </div>
      ) : (
        <input
          type={field.type === "number" ? "number" : "text"}
          value={displayVal}
          readOnly={field.readOnly}
          placeholder={field.placeholder || ""}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full px-2.5 py-1.5 text-xs rounded-md border text-neutral-900 dark:text-neutral-100 ${
            field.readOnly
              ? "bg-neutral-100 dark:bg-neutral-800/80 border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400"
              : "bg-white dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700 hover:border-neutral-400 focus:outline-hidden focus:ring-1 focus:ring-primary"
          }`}
        />
      )}
    </div>
  );
};
