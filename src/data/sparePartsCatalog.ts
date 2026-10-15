export interface SparePartItem {
  code: string;
  name: string;
  category: string;
  brand: string;
  uom: string;
  defaultPriceLkr: number;
  warehouse: string;
  serialManaged: boolean;
}

export const TELESONIC_SPARE_PARTS_CATALOG: SparePartItem[] = [
  {
    code: "SP-COMP-18K",
    name: "Inverter Scroll Compressor 18HP",
    category: "Compressors & Motors",
    brand: "Carrier Commercial",
    uom: "EA",
    defaultPriceLkr: 285000,
    warehouse: "WH-MAIN (Central Logistics Colombo)",
    serialManaged: true,
  },
  {
    code: "FLT-0921",
    name: "High Efficiency Carbon Filter 24x24",
    category: "Filters & Consumables",
    brand: "Carrier",
    uom: "EA",
    defaultPriceLkr: 8400,
    warehouse: "WH-MAIN (Central Logistics Colombo)",
    serialManaged: false,
  },
  {
    code: "BRG-6204",
    name: "Deep Groove Ball Bearing 6204-2RS",
    category: "Mechanical & Hardware",
    brand: "NSK Japan",
    uom: "EA",
    defaultPriceLkr: 3200,
    warehouse: "VAN-KSILVA (K. Silva Mobile Van)",
    serialManaged: false,
  },
  {
    code: "CAP-45UF",
    name: "Motor Run Capacitor 45uF 450V AC",
    category: "Electrical Components",
    brand: "Epcos TDK",
    uom: "EA",
    defaultPriceLkr: 4750,
    warehouse: "VAN-KSILVA (K. Silva Mobile Van)",
    serialManaged: false,
  },
  {
    code: "FAN-MTR-70W",
    name: "DC Inverter Condenser Fan Motor 70W",
    category: "Compressors & Motors",
    brand: "Panasonic",
    uom: "EA",
    defaultPriceLkr: 38500,
    warehouse: "WH-SOUTH (Galle Service Hub)",
    serialManaged: true,
  },
  {
    code: "SEN-TEMP-02",
    name: "NTC Defrost Temperature Sensor Probe",
    category: "Sensors & Controllers",
    brand: "Daikin / Midea",
    uom: "EA",
    defaultPriceLkr: 6200,
    warehouse: "WH-MAIN (Central Logistics Colombo)",
    serialManaged: false,
  },
  {
    code: "VAL-EXPV-4",
    name: "Electronic Expansion Valve 4-Port (EEV)",
    category: "Valves & Piping",
    brand: "Sanhua",
    uom: "EA",
    defaultPriceLkr: 29800,
    warehouse: "WH-MAIN (Central Logistics Colombo)",
    serialManaged: true,
  },
  {
    code: "PCB-MAIN-VRF",
    name: "VRF Master Outdoor Inverter Logic Board",
    category: "Sensors & Controllers",
    brand: "Toshiba Carrier",
    uom: "EA",
    defaultPriceLkr: 145000,
    warehouse: "WH-MAIN (Central Logistics Colombo)",
    serialManaged: true,
  },
  {
    code: "REF-R410A",
    name: "Refrigerant R410A Gas Cylinder 11.3kg",
    category: "Filters & Consumables",
    brand: "Chemours",
    uom: "Cyl",
    defaultPriceLkr: 42000,
    warehouse: "WH-MAIN (Central Logistics Colombo)",
    serialManaged: false,
  },
  {
    code: "CON-4P-40A",
    name: "Magnetic AC Contactor 4-Pole 40A 240V",
    category: "Electrical Components",
    brand: "Schneider Electric",
    uom: "EA",
    defaultPriceLkr: 9800,
    warehouse: "VAN-KSILVA (K. Silva Mobile Van)",
    serialManaged: false,
  },
  {
    code: "THM-DIG-01",
    name: "Programmable Digital 7-Day Thermostat",
    category: "Sensors & Controllers",
    brand: "Honeywell",
    uom: "EA",
    defaultPriceLkr: 18500,
    warehouse: "WH-SOUTH (Galle Service Hub)",
    serialManaged: true,
  },
  {
    code: "PMP-DRN-12L",
    name: "Silent Condensate Drain Pump 12L/h",
    category: "Pumps & Drainage",
    brand: "Aspen Pumps",
    uom: "EA",
    defaultPriceLkr: 16200,
    warehouse: "WH-MAIN (Central Logistics Colombo)",
    serialManaged: false,
  },
  {
    code: "BELT-V-B54",
    name: "Heavy Duty Industrial V-Belt B-54",
    category: "Mechanical & Hardware",
    brand: "Bando Japan",
    uom: "EA",
    defaultPriceLkr: 2400,
    warehouse: "VAN-KSILVA (K. Silva Mobile Van)",
    serialManaged: false,
  },
];

// LocalStorage persistence helpers
export function loadSavedFormData(
  storageKey: string,
  fallback: Record<string, unknown>,
): Record<string, unknown> {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return { ...fallback, ...parsed };
  } catch {
    return fallback;
  }
}

export function saveFormData(storageKey: string, data: Record<string, unknown>): void {
  try {
    localStorage.setItem(storageKey, JSON.stringify(data));
  } catch (e) {
    console.error("Failed to save to localStorage:", e);
  }
}

export function loadSavedTabData(
  storageKey: string,
  tabId: string,
  fallback: Array<Record<string, unknown>>,
): Array<Record<string, unknown>> {
  try {
    const raw = localStorage.getItem(`${storageKey}_tab_${tabId}`);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
    return fallback;
  } catch {
    return fallback;
  }
}

export function saveTabData(
  storageKey: string,
  tabId: string,
  data: Array<Record<string, unknown>>,
): void {
  try {
    localStorage.setItem(`${storageKey}_tab_${tabId}`, JSON.stringify(data));
  } catch (e) {
    console.error("Failed to save tab data to localStorage:", e);
  }
}
