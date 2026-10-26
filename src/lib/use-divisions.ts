import { useState, useEffect, useCallback, useMemo } from "react";
import { apiFetch } from "./api-client";
import { type DivisionItem } from "./division-master-db";

export interface DivisionOption {
  code: string;
  name: string;
  label: string;
  costCenterCode: string;
}

// Enterprise Core Fallback Divisions
export const FALLBACK_DIVISIONS: DivisionOption[] = [
  { code: "RLC", name: "Retail & Consumer Electronics", label: "RLC - Retail & Consumer Electronics", costCenterCode: "CC-RLC-01" },
  { code: "CAC", name: "Commercial Air Conditioning", label: "CAC - Commercial Air Conditioning", costCenterCode: "CC-CAC-02" },
  { code: "MHA", name: "Major Home Appliances", label: "MHA - Major Home Appliances", costCenterCode: "CC-MHA-03" },
  { code: "SRV", name: "Service & Technical Department", label: "SRV - Service & Technical Department", costCenterCode: "CC-SRV-04" },
  { code: "MTR", name: "Modern Trade & Key Accounts", label: "MTR - Modern Trade & Key Accounts", costCenterCode: "CC-MTR-05" },
];

export const FALLBACK_DIVISION_NAMES = [
  "Retail & Consumer Electronics",
  "Commercial Air Conditioning",
  "Major Home Appliances",
  "Service & Technical Department",
  "Modern Trade & Key Accounts",
  "Consumer Electronics",
  "Mobile & Accessories",
  "Enterprise Solutions",
];

let cachedDivisions: DivisionOption[] | null = null;
let lastFetchTime = 0;
const CACHE_TTL = 3000; // 3 seconds for instant refresh between screens

/**
 * Universal Hook to consume PostgreSQL Division Master in any screen
 */
export function useIncentiveDivisions() {
  const [divisions, setDivisions] = useState<DivisionOption[]>(cachedDivisions || []);
  const [loading, setLoading] = useState<boolean>(!cachedDivisions);
  const [error, setError] = useState<string | null>(null);

  const fetchDivisions = useCallback(async (force = false) => {
    const now = Date.now();
    if (!force && cachedDivisions && now - lastFetchTime < CACHE_TTL) {
      setDivisions(cachedDivisions);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await apiFetch("/api/incentives/divisions?status=Active");
      if (!res.ok) throw new Error("Failed to fetch divisions");
      const data = await res.json();

      if (data.success && Array.isArray(data.items)) {
        const mapped: DivisionOption[] = data.items.map((item: DivisionItem) => ({
          code: item.divisionCode,
          name: item.divisionName,
          label: `${item.divisionCode} - ${item.divisionName}`,
          costCenterCode: item.costCenterCode,
        }));

        cachedDivisions = mapped;
        lastFetchTime = now;
        setDivisions(mapped);
        setError(null);
      }
    } catch (err: any) {
      setError(err?.message || "Failed to load divisions from DB");
      if (!cachedDivisions) {
        setDivisions(FALLBACK_DIVISIONS);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDivisions();
  }, [fetchDivisions]);

  const divisionNames = useMemo(() => {
    return divisions.map((d) => d.name);
  }, [divisions]);

  const divisionCodes = useMemo(() => {
    return divisions.map((d) => d.code);
  }, [divisions]);

  return {
    divisions,
    divisionNames,
    divisionCodes,
    loading,
    error,
    refresh: () => fetchDivisions(true),
  };
}
