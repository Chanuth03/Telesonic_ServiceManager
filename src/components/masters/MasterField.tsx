import React from "react";
import { MasterFieldDef } from "@/data/mastersSpecData";

interface MasterFieldProps {
  field: MasterFieldDef;
  value: any;
  onChange: (val: any) => void;
}

export const MasterField: React.FC<MasterFieldProps> = ({ field, value, onChange }) => {
  return (
    <div className={`space-y-1 ${field.colSpan === 2 ? "sm:col-span-2" : ""}`}>
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

      {field.type === "select" ? (
        <select
          value={value ?? ""}
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
            value={value ?? ""}
            readOnly={field.readOnly}
            onChange={(e) => onChange(e.target.value)}
            className={`w-full pl-11 pr-2.5 py-1.5 text-xs rounded-md border font-mono tabular-nums text-right text-neutral-900 dark:text-neutral-100 ${
              field.readOnly
                ? "bg-neutral-100 dark:bg-neutral-800/80 border-neutral-200 dark:border-neutral-700"
                : "bg-white dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700"
            }`}
          />
        </div>
      ) : field.type === "date" ? (
        <input
          type="date"
          value={value ?? ""}
          readOnly={field.readOnly}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full px-2.5 py-1.5 text-xs rounded-md border font-mono text-neutral-900 dark:text-neutral-100 ${
            field.readOnly
              ? "bg-neutral-100 dark:bg-neutral-800/80 border-neutral-200 dark:border-neutral-700"
              : "bg-white dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700"
          }`}
        />
      ) : (
        <input
          type="text"
          value={value ?? ""}
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
