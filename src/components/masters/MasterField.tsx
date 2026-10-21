import React from "react";
import { AlertCircle } from "lucide-react";
import { MasterFieldDef } from "@/data/mastersSpecData";

interface MasterFieldProps {
  field: MasterFieldDef;
  value: unknown;
  onChange: (val: unknown) => void;
  error?: string | undefined;
}

export const MasterField: React.FC<MasterFieldProps> = ({ field, value, onChange, error }) => {
  const getDefaultPlaceholder = () => {
    if (field.placeholder) return field.placeholder;
    if (field.type === "amount") return "0.00";
    if (field.type === "number") return "0";
    if (field.type === "date") return "YYYY-MM-DD";
    return `Enter ${field.label.toLowerCase()}...`;
  };

  const placeholder = getDefaultPlaceholder();
  const hasError = Boolean(error);

  return (
    <div className={`space-y-1.5 ${field.colSpan === 2 ? "sm:col-span-2" : ""}`}>
      <div className="flex items-center justify-between gap-1.5 text-xs">
        <label className="font-semibold text-neutral-800 dark:text-neutral-200 flex items-center gap-1">
          {field.label}
          {field.mandatory && (
            <span className="text-red-500 font-bold" title="Mandatory Field">
              *
            </span>
          )}
        </label>
        {field.isB1 && (
          <span
            className="inline-flex items-center gap-0.5 px-1 py-0.2 text-[10px] font-mono font-medium rounded-xs bg-sky-100 text-sky-800 dark:bg-sky-950/80 dark:text-sky-300 border border-sky-300 dark:border-sky-800"
            title="SAP B1 Integration Point: Synchronized with SAP Business One"
          >
            ⇄B1
          </span>
        )}
      </div>

            {(field.type as string) === "multiselect" ? (
        (() => {
          const currentSelected: string[] = Array.isArray(value)
            ? (value as string[])
            : typeof value === "string" && value.trim()
              ? value.startsWith("[")
                ? (() => { try { return JSON.parse(value); } catch { return value.split(",").map(s => s.trim()); } })()
                : value.split(",").map((s) => s.trim()).filter(Boolean)
              : [];

          const toggleOption = (opt: string) => {
            let updated: string[];
            if (opt === "ALL") {
              if (currentSelected.includes("ALL")) {
                updated = [];
              } else {
                updated = ["ALL"];
              }
            } else {
              const withoutAll = currentSelected.filter((x) => x !== "ALL");
              if (withoutAll.includes(opt)) {
                updated = withoutAll.filter((x) => x !== opt);
              } else {
                updated = [...withoutAll, opt];
              }
            }
            onChange(updated.join(","));
          };

          return (
            <div className="space-y-2 p-2.5 rounded-lg border border-border bg-muted/20">
              <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto">
                {field.options?.map((opt) => {
                  const isSelected =
                    currentSelected.includes("ALL") || currentSelected.includes(opt);
                  const isStrictAll = opt === "ALL" && currentSelected.includes("ALL");

                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => toggleOption(opt)}
                      className={`px-2.5 py-1 text-[11px] font-mono rounded-md border transition-all cursor-pointer flex items-center gap-1.5 ${
                        isStrictAll
                          ? "bg-primary text-primary-foreground border-primary font-bold shadow-xs"
                          : isSelected
                            ? "bg-primary/15 text-primary border-primary/40 font-semibold"
                            : "bg-background text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${isSelected ? "bg-primary" : "bg-muted-foreground/30"}`} />
                      <span>{opt}</span>
                    </button>
                  );
                })}
              </div>
              <div className="text-[10px] text-muted-foreground font-mono flex items-center justify-between">
                <span>Selected: {currentSelected.length === 0 ? "None" : currentSelected.join(", ")}</span>
                <span className="text-[10px] text-primary underline cursor-pointer" onClick={() => onChange("ALL")}>
                  Select All
                </span>
              </div>
            </div>
          );
        })()
      ) : field.type === "select" ? (
        <select
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
          disabled={field.readOnly}
          className={`w-full px-2.5 py-1.5 text-xs rounded-md border text-neutral-900 dark:text-neutral-100 transition-colors ${
            hasError
              ? "border-red-500 bg-red-50/20 dark:border-red-500 focus:ring-1 focus:ring-red-500"
              : field.readOnly
                ? "bg-neutral-100 dark:bg-neutral-800/80 border-neutral-200 dark:border-neutral-700 cursor-not-allowed text-neutral-500"
                : "bg-white dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700 hover:border-neutral-400 focus:outline-hidden focus:ring-1 focus:ring-primary"
          }`}
        >
          <option value="">Select {field.label}...</option>
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
            value={(value as string) ?? ""}
            readOnly={field.readOnly}
            placeholder={placeholder}
            onChange={(e) => onChange(e.target.value)}
            className={`w-full pl-11 pr-2.5 py-1.5 text-xs rounded-md border font-mono tabular-nums text-right text-neutral-900 dark:text-neutral-100 ${
              hasError
                ? "border-red-500 bg-red-50/20 dark:border-red-500 focus:ring-1 focus:ring-red-500"
                : field.readOnly
                  ? "bg-neutral-100 dark:bg-neutral-800/80 border-neutral-200 dark:border-neutral-700"
                  : "bg-white dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700 hover:border-neutral-400 focus:outline-hidden focus:ring-1 focus:ring-primary"
            }`}
          />
        </div>
      ) : field.type === "date" ? (
        <input
          type="date"
          value={(value as string) ?? ""}
          readOnly={field.readOnly}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full px-2.5 py-1.5 text-xs rounded-md border font-mono text-neutral-900 dark:text-neutral-100 ${
            hasError
              ? "border-red-500 bg-red-50/20 dark:border-red-500 focus:ring-1 focus:ring-red-500"
              : field.readOnly
                ? "bg-neutral-100 dark:bg-neutral-800/80 border-neutral-200 dark:border-neutral-700"
                : "bg-white dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700 hover:border-neutral-400 focus:outline-hidden focus:ring-1 focus:ring-primary"
          }`}
        />
      ) : field.type === "number" ? (
        <input
          type="number"
          value={(value as string) ?? ""}
          readOnly={field.readOnly}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full px-2.5 py-1.5 text-xs rounded-md border font-mono text-neutral-900 dark:text-neutral-100 ${
            hasError
              ? "border-red-500 bg-red-50/20 dark:border-red-500 focus:ring-1 focus:ring-red-500"
              : field.readOnly
                ? "bg-neutral-100 dark:bg-neutral-800/80 border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400"
                : "bg-white dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700 hover:border-neutral-400 focus:outline-hidden focus:ring-1 focus:ring-primary"
          }`}
        />
      ) : (
        <input
          type="text"
          value={(value as string) ?? ""}
          readOnly={field.readOnly}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full px-2.5 py-1.5 text-xs rounded-md border text-neutral-900 dark:text-neutral-100 ${
            hasError
              ? "border-red-500 bg-red-50/20 dark:border-red-500 focus:ring-1 focus:ring-red-500"
              : field.readOnly
                ? "bg-neutral-100 dark:bg-neutral-800/80 border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400"
                : "bg-white dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700 hover:border-neutral-400 focus:outline-hidden focus:ring-1 focus:ring-primary"
          }`}
        />
      )}

      {hasError && (
        <div className="flex items-center gap-1 text-[11px] text-red-500 font-medium">
          <AlertCircle className="w-3 h-3 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};
