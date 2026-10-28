import React, { useState, useEffect, useMemo } from "react";
import {
  ArrowLeft,
  Download,
  History,
  Info,
  Check,
  RefreshCw,
  FileText,
  Search,
  PlusCircle,
  Trash2,
  Edit3,
  CheckCircle2,
  AlertTriangle,
  X,
  Layers,
  Database,
} from "lucide-react";
import { MasterScreenMeta, MasterFieldDef } from "@/data/mastersSpecData";
import { MasterField } from "./MasterField";
import { MasterAuditModal } from "./MasterAuditModal";
import { MasterExportModal } from "./MasterExportModal";
import { apiFetch } from "@/lib/api-client";

interface MasterScreenViewProps {
  meta: MasterScreenMeta;
  onBack: () => void;
}

export const MasterScreenView: React.FC<MasterScreenViewProps> = ({ meta, onBack }) => {
  // Empty form data initialized with empty strings/placeholders
  const [formData, setFormData] = useState<Record<string, unknown>>({});
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [activeTabId, setActiveTabId] = useState<string>("saved-records");
  const [isAuditOpen, setIsAuditOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [showSpecDetails, setShowSpecDetails] = useState(false);
  const [b1Syncing, setB1Syncing] = useState(false);
  const [dynamicRoleOptions, setDynamicRoleOptions] = useState<string[]>([]);
  const [customerOptions, setCustomerOptions] = useState<{ id: number; code: string; name: string }[]>([]);
  const [itemOptions, setItemOptions] = useState<{ id: number; code: string; name: string }[]>([]);
  const [siteOptions, setSiteOptions] = useState<{ id: number; code: string; name: string; customerId: number }[]>([]);
  const [serialOptions, setSerialOptions] = useState<{ id: number; serialNo: string; itemName?: string }[]>([]);

  // Side popup notification state
  const [sidePopup, setSidePopup] = useState<{
    show: boolean;
    title: string;
    message: string;
    recordId?: string;
  }>({
    show: false,
    title: "",
    message: "",
  });

  // Saved records storage - always authoritative from PostgreSQL backend
  const [savedRecords, setSavedRecords] = useState<Record<string, unknown>[]>([]);

  // Search query for saved records
  const [savedSearchQuery, setSavedSearchQuery] = useState("");

  // Fetch records directly from PostgreSQL for all masters
  useEffect(() => {
    // 1. If this screen is System Role Master (MST-32)
    if (meta.code === "MST-32" || meta.id === "O1-SCR-MST-32") {
      apiFetch("/api/roles")
        .then((res) => res.json())
        .then((data) => {
          if (data && data.roles && Array.isArray(data.roles)) {
            setSavedRecords(data.roles);
          }
        })
        .catch((err) => console.error("Failed to load roles from DB:", err));
      return;
    }

    // 2. If this screen is System User Master (MST-33)
    if (meta.code === "MST-33" || meta.id === "O1-SCR-MST-33") {
      apiFetch("/api/roles")
        .then((res) => res.json())
        .then((data) => {
          if (data && data.roles && Array.isArray(data.roles)) {
            const roleCodes = data.roles
              .filter((r: any) => String(r.status || "Active").toLowerCase() === "active")
              .map((r: any) => String(r.code).toUpperCase().trim());
            if (roleCodes.length > 0) {
              setDynamicRoleOptions(roleCodes);
            }
          }
        })
        .catch((e) => console.error("Failed to load roles for user dropdown:", e));

      apiFetch("/api/users")
        .then((res) => res.json())
        .then((data) => {
          if (data && data.users && Array.isArray(data.users)) {
            setSavedRecords(data.users);
          }
        })
        .catch((e) => console.error("Failed to load users from DB:", e));
      return;
    }

    // 3. If this screen is Customer Master (MST-01 / O1-SCR-MST-01)
    if (meta.code === "MST-01" || meta.id === "O1-SCR-MST-01") {
      apiFetch("/api/customers")
        .then((res) => res.json())
        .then((data) => {
          if (data && data.customers && Array.isArray(data.customers)) {
            setSavedRecords(data.customers);
          }
        })
        .catch((err) => console.error("Failed to load customers from DB:", err));
      return;
    }

    // 4. If this screen is Contact Person Master (MST-02 / O1-SCR-MST-02)
    if (meta.code === "MST-02" || meta.id === "O1-SCR-MST-02") {
      // Fetch customers to populate the Customer dropdown
      apiFetch("/api/customers")
        .then((res) => res.json())
        .then((data) => {
          if (data && data.customers && Array.isArray(data.customers)) {
            setCustomerOptions(
              data.customers.map((c: any) => ({
                id: c.id,
                code: c.customerCode,
                name: c.customerName,
              }))
            );
          }
        })
        .catch((err) => console.error("Failed to load customers for contact screen:", err));

      // Fetch all contacts initially
      apiFetch("/api/contacts")
        .then((res) => res.json())
        .then((data) => {
          if (data && data.contacts && Array.isArray(data.contacts)) {
            setSavedRecords(data.contacts);
          }
        })
        .catch((err) => console.error("Failed to load contacts from DB:", err));
      return;
    }

    // 5. If this screen is Site and Location Master (MST-03 / O1-SCR-MST-03)
    if (meta.code === "MST-03" || meta.id === "O1-SCR-MST-03") {
      // Fetch customers to populate the Customer dropdown
      apiFetch("/api/customers")
        .then((res) => res.json())
        .then((data) => {
          if (data && data.customers && Array.isArray(data.customers)) {
            setCustomerOptions(
              data.customers.map((c: any) => ({
                id: c.id,
                code: c.customerCode,
                name: c.customerName,
              }))
            );
          }
        })
        .catch((err) => console.error("Failed to load customers for site screen:", err));

      // Fetch all sites initially
      apiFetch("/api/sites")
        .then((res) => res.json())
        .then((data) => {
          if (data && data.sites && Array.isArray(data.sites)) {
            setSavedRecords(data.sites);
          }
        })
        .catch((err) => console.error("Failed to load sites from DB:", err));
      return;
    }

    // 6. If this screen is Item Master (MST-04 / O1-SCR-MST-04)
    if (meta.code === "MST-04" || meta.id === "O1-SCR-MST-04") {
      apiFetch("/api/items")
        .then((res) => res.json())
        .then((data) => {
          if (data && data.items && Array.isArray(data.items)) {
            setSavedRecords(data.items);
          }
        })
        .catch((err) => console.error("Failed to load items from DB:", err));
      return;
    }

    // 7. MST-05: Item Serial & Batch Register
    if (meta.code === "MST-05" || meta.id === "O1-SCR-MST-05") {
      apiFetch("/api/customers").then((r) => r.json()).then((d) => {
        if (d?.customers) setCustomerOptions(d.customers.map((c: any) => ({ id: c.id, code: c.customerCode, name: c.customerName })));
      });
      apiFetch("/api/items").then((r) => r.json()).then((d) => {
        if (d?.items) setItemOptions(d.items.map((i: any) => ({ id: i.id, code: i.itemCode, name: i.itemName })));
      });
      return;
    }

    // 8. MST-06: Equipment / Installed Base
    if (meta.code === "MST-06" || meta.id === "O1-SCR-MST-06") {
      apiFetch("/api/customers").then((r) => r.json()).then((d) => {
        if (d?.customers) setCustomerOptions(d.customers.map((c: any) => ({ id: c.id, code: c.customerCode, name: c.customerName })));
      });
      apiFetch("/api/sites").then((r) => r.json()).then((d) => {
        if (d?.sites) setSiteOptions(d.sites.map((s: any) => ({ id: s.id, code: s.siteCode, name: s.siteName, customerId: s.customerId })));
      });
      apiFetch("/api/equipments").then((r) => r.json()).then((d) => {
        if (d?.equipments && Array.isArray(d.equipments)) setSavedRecords(d.equipments);
      });
      return;
    }

    // 9. MST-07: Other-Brand / Competitor Equipment
    if (meta.code === "MST-07" || meta.id === "O1-SCR-MST-07") {
      apiFetch("/api/customers").then((r) => r.json()).then((d) => {
        if (d?.customers) setCustomerOptions(d.customers.map((c: any) => ({ id: c.id, code: c.customerCode, name: c.customerName })));
      });
      apiFetch("/api/sites").then((r) => r.json()).then((d) => {
        if (d?.sites) setSiteOptions(d.sites.map((s: any) => ({ id: s.id, code: s.siteCode, name: s.siteName, customerId: s.customerId })));
      });
      apiFetch("/api/other-brand-equipments").then((r) => r.json()).then((d) => {
        if (d?.equipments && Array.isArray(d.equipments)) setSavedRecords(d.equipments);
      });
      return;
    }

    // 10. MST-08: Multi-Component Equipment System
    if (meta.code === "MST-08" || meta.id === "O1-SCR-MST-08") {
      apiFetch("/api/customers").then((r) => r.json()).then((d) => {
        if (d?.customers) setCustomerOptions(d.customers.map((c: any) => ({ id: c.id, code: c.customerCode, name: c.customerName })));
      });
      apiFetch("/api/sites").then((r) => r.json()).then((d) => {
        if (d?.sites) setSiteOptions(d.sites.map((s: any) => ({ id: s.id, code: s.siteCode, name: s.siteName, customerId: s.customerId })));
      });
      apiFetch("/api/equipment-systems").then((r) => r.json()).then((d) => {
        if (d?.systems) setSavedRecords(d.systems);
      });
      return;
    }

    // 11. MST-09: Employee / Technician
    if (meta.code === "MST-09" || meta.id === "O1-SCR-MST-09") {
      apiFetch("/api/technicians").then((r) => r.json()).then((d) => {
        if (d?.technicians) setSavedRecords(d.technicians);
      });
      return;
    }

    // 12. MST-10: Subcontractors
    if (meta.code === "MST-10" || meta.id === "O1-SCR-MST-10") {
      apiFetch("/api/subcontractors").then((r) => r.json()).then((d) => {
        if (d?.subcontractors) setSavedRecords(d.subcontractors);
      });
      return;
    }

    // 13. MST-11: Service Role Master
    if (meta.code === "MST-11" || meta.id === "O1-SCR-MST-11") {
      apiFetch("/api/service-roles").then((r) => r.json()).then((d) => {
        if (d?.roles) setSavedRecords(d.roles);
      });
      return;
    }

    // 14. MST-12: Service Type / Reason / Priority / Status
    if (meta.code === "MST-12" || meta.id === "O1-SCR-MST-12") {
      apiFetch("/api/service-types").then((r) => r.json()).then((d) => {
        if (d?.serviceTypes) setSavedRecords(d.serviceTypes);
      });
      return;
    }

    // 15. MST-13: Hold Reasons
    if (meta.code === "MST-13" || meta.id === "O1-SCR-MST-13") {
      apiFetch("/api/hold-reasons").then((r) => r.json()).then((d) => {
        if (d?.holdReasons) setSavedRecords(d.holdReasons);
      });
      return;
    }

    // 16. MST-14: Repeat Reasons and Detection Period
    if (meta.code === "MST-14" || meta.id === "O1-SCR-MST-14") {
      apiFetch("/api/repeat-reasons").then((r) => r.json()).then((d) => {
        if (d?.repeatReasons) setSavedRecords(d.repeatReasons);
      });
      return;
    }

    // 17. MST-15: SLA Rules and Working Calendar
    if (meta.code === "MST-15" || meta.id === "O1-SCR-MST-15") {
      apiFetch("/api/sla-rules").then((r) => r.json()).then((d) => {
        if (d?.slaRules) setSavedRecords(d.slaRules);
      });
      return;
    }

    // 18. MST-16: Checklist Templates
    if (meta.code === "MST-16" || meta.id === "O1-SCR-MST-16") {
      apiFetch("/api/checklist-templates").then((r) => r.json()).then((d) => {
        if (d?.checklistTemplates) setSavedRecords(d.checklistTemplates);
      });
      return;
    }

    // 19. MST-17: Warranty Rules
    if (meta.code === "MST-17" || meta.id === "O1-SCR-MST-17") {
      apiFetch("/api/warranty-rules").then((r) => r.json()).then((d) => {
        if (d?.warrantyRules) setSavedRecords(d.warrantyRules);
      });
      return;
    }

    // 20. MST-18: Free Service Plan
    if (meta.code === "MST-18" || meta.id === "O1-SCR-MST-18") {
      apiFetch("/api/free-service-plans").then((r) => r.json()).then((d) => {
        if (d?.plans) setSavedRecords(d.plans);
      });
      return;
    }

    // 21. MST-19: Contract Templates
    if (meta.code === "MST-19" || meta.id === "O1-SCR-MST-19") {
      apiFetch("/api/contract-templates").then((r) => r.json()).then((d) => {
        if (d?.templates) setSavedRecords(d.templates);
      });
      return;
    }

    // 22. MST-20: Relationship Stages / Reasons
    if (meta.code === "MST-20" || meta.id === "O1-SCR-MST-20") {
      apiFetch("/api/relationship-stages").then((r) => r.json()).then((d) => {
        if (d?.stages) setSavedRecords(d.stages);
      });
      return;
    }

    // 23. MST-21: Reminder Rules and Intervals
    if (meta.code === "MST-21" || meta.id === "O1-SCR-MST-21") {
      apiFetch("/api/reminder-rules").then((r) => r.json()).then((d) => {
        if (d?.reminderRules) setSavedRecords(d.reminderRules);
      });
      return;
    }

    // 24. MST-22: Notification Templates
    if (meta.code === "MST-22" || meta.id === "O1-SCR-MST-22") {
      apiFetch("/api/notification-templates").then((r) => r.json()).then((d) => {
        if (d?.templates) setSavedRecords(d.templates);
      });
      return;
    }

    // 25. MST-23: Project and G/L Budget
    if (meta.code === "MST-23" || meta.id === "O1-SCR-MST-23") {
      apiFetch("/api/project-budgets").then((r) => r.json()).then((d) => {
        if (d?.budgets) setSavedRecords(d.budgets);
      });
      return;
    }

    // 26. MST-24: Cost Element / G/L Mapping
    if (meta.code === "MST-24" || meta.id === "O1-SCR-MST-24") {
      apiFetch("/api/cost-element-mappings").then((r) => r.json()).then((d) => {
        if (d?.mappings) setSavedRecords(d.mappings);
      });
      return;
    }

    // 27. MST-25: Labour Rates
    if (meta.code === "MST-25" || meta.id === "O1-SCR-MST-25") {
      apiFetch("/api/labour-rates").then((r) => r.json()).then((d) => {
        if (d?.rates) setSavedRecords(d.rates);
      });
      return;
    }

    // 28. MST-26: Franchise and Franchise Warehouse
    if (meta.code === "MST-26" || meta.id === "O1-SCR-MST-26") {
      apiFetch("/api/franchise-warehouses").then((r) => r.json()).then((d) => {
        if (d?.warehouses) setSavedRecords(d.warehouses);
      });
      return;
    }

    // 29. MST-27: Deviation Reasons
    if (meta.code === "MST-27" || meta.id === "O1-SCR-MST-27") {
      apiFetch("/api/deviation-reasons").then((r) => r.json()).then((d) => {
        if (d?.reasons) setSavedRecords(d.reasons);
      });
      return;
    }

    // 30. MST-28: Export Permissions
    if (meta.code === "MST-28" || meta.id === "O1-SCR-MST-28") {
      apiFetch("/api/export-permissions").then((r) => r.json()).then((d) => {
        if (d?.permissions) setSavedRecords(d.permissions);
      });
      return;
    }

    // 31. MST-29: Google Meet Settings
    if (meta.code === "MST-29" || meta.id === "O1-SCR-MST-29") {
      apiFetch("/api/google-meet-settings").then((r) => r.json()).then((d) => {
        if (d?.settings) setSavedRecords(d.settings);
      });
      return;
    }

    // 32. MST-30: Equipment Category Attributes
    if (meta.code === "MST-30" || meta.id === "O1-SCR-MST-30") {
      apiFetch("/api/equipment-category-attributes").then((r) => r.json()).then((d) => {
        if (d?.categories) setSavedRecords(d.categories);
      });
      return;
    }

    // 33. MST-31: Tools, Tool Boxes and Vehicles
    if (meta.code === "MST-31" || meta.id === "O1-SCR-MST-31") {
      apiFetch("/api/tool-vehicle-assets").then((r) => r.json()).then((d) => {
        if (d?.assets) setSavedRecords(d.assets);
      });
      return;
    }

    // 7. For all other Master Screens (MST-05 through MST-31), load live records from PostgreSQL
    apiFetch(`/api/masters?screenCode=${encodeURIComponent(meta.code)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data && data.records && Array.isArray(data.records) && data.records.length > 0) {
          setSavedRecords(data.records);
        }
      })
      .catch((e) => console.error(`Failed to load master records for ${meta.code} from DB:`, e));
  }, [meta.code, meta.id]);

  // Auto-dismiss side popup after 3.8s
  useEffect(() => {
    if (sidePopup.show) {
      const timer = setTimeout(() => {
        setSidePopup((prev) => ({ ...prev, show: false }));
      }, 3800);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [sidePopup.show]);

  const handleFieldChange = (key: string, val: unknown) => {
    setFormData((prev) => ({ ...prev, [key]: val }));

    // If on MST-02 and Customer changed, filter/load that customer's contact persons
    if ((meta.code === "MST-02" || meta.id === "O1-SCR-MST-02") && (key === "customerName" || key === "customerId")) {
      const selectedName = String(val).trim();
      const matched = customerOptions.find(
        (c) => c.name.toLowerCase() === selectedName.toLowerCase() || String(c.id) === selectedName
      );
      if (matched) {
        apiFetch(`/api/contacts?customerId=${matched.id}`)
          .then((res) => res.json())
          .then((data) => {
            if (data && data.contacts && Array.isArray(data.contacts)) {
              setSavedRecords(data.contacts);
            }
          })
          .catch((err) => console.error("Failed to load contacts for customer:", err));
      }
    }

    // If on MST-03 and Customer changed, filter/load that customer's sites
    if ((meta.code === "MST-03" || meta.id === "O1-SCR-MST-03") && (key === "customerName" || key === "customer")) {
      const selectedName = String(val).trim();
      const matched = customerOptions.find(
        (c) => c.name.toLowerCase() === selectedName.toLowerCase() || String(c.id) === selectedName
      );
      if (matched) {
        apiFetch(`/api/sites?customerId=${matched.id}`)
          .then((res) => res.json())
          .then((data) => {
            if (data && data.sites && Array.isArray(data.sites)) {
              setSavedRecords(data.sites);
            }
          })
          .catch((err) => console.error("Failed to load sites for customer:", err));
      }
    }

    // If on MST-08 and Customer changed, filter/load that customer's systems
    if ((meta.code === "MST-08" || meta.id === "O1-SCR-MST-08") && (key === "customer" || key === "customerName")) {
      const selectedName = String(val).trim();
      const matched = customerOptions.find(
        (c) => c.name.toLowerCase() === selectedName.toLowerCase() || String(c.id) === selectedName
      );
      if (matched) {
        apiFetch(`/api/equipment-systems?customerId=${matched.id}`)
          .then((res) => res.json())
          .then((data) => {
            if (data?.systems) setSavedRecords(data.systems);
          });
      }
    }

    // If on MST-07 and Customer changed, filter/load that customer's equipments
    if ((meta.code === "MST-07" || meta.id === "O1-SCR-MST-07") && (key === "customer" || key === "customerName")) {
      const selectedName = String(val).trim();
      const matched = customerOptions.find(
        (c) => c.name.toLowerCase() === selectedName.toLowerCase() || String(c.id) === selectedName
      );
      if (matched) {
        apiFetch(`/api/other-brand-equipments?customerId=${matched.id}`)
          .then((res) => res.json())
          .then((data) => {
            if (data && data.equipments && Array.isArray(data.equipments)) {
              setSavedRecords(data.equipments);
            }
          })
          .catch((err) => console.error("Failed to load other-brand equipments for customer:", err));
      }
    }

    // If on MST-06 and Customer changed, filter/load that customer's equipments
    if ((meta.code === "MST-06" || meta.id === "O1-SCR-MST-06") && (key === "customer" || key === "customerName")) {
      const selectedName = String(val).trim();
      const matched = customerOptions.find(
        (c) => c.name.toLowerCase() === selectedName.toLowerCase() || String(c.id) === selectedName
      );
      if (matched) {
        apiFetch(`/api/equipments?customerId=${matched.id}`)
          .then((res) => res.json())
          .then((data) => {
            if (data && data.equipments && Array.isArray(data.equipments)) {
              setSavedRecords(data.equipments);
            }
          })
          .catch((err) => console.error("Failed to load equipments for customer:", err));
      }
    }

    // If on MST-05 and Customer changed, filter/load that customer's serials
    if ((meta.code === "MST-05" || meta.id === "O1-SCR-MST-05") && (key === "customer" || key === "customerName")) {
      const selectedName = String(val).trim();
      const matched = customerOptions.find(
        (c) => c.name.toLowerCase() === selectedName.toLowerCase() || String(c.id) === selectedName
      );
      if (matched) {
        apiFetch(`/api/serials?customerId=${matched.id}`)
          .then((res) => res.json())
          .then((data) => {
            if (data && data.serials && Array.isArray(data.serials)) {
              setSavedRecords(data.serials);
            }
          })
          .catch((err) => console.error("Failed to load serials for customer:", err));
      }
    }

    // Clear validation error on change
    if (validationErrors[key]) {
      setValidationErrors((prev) => {
        const updated = { ...prev };
        delete updated[key];
        return updated;
      });
    }
  };

  // Validation function
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    meta.fields.forEach((field: MasterFieldDef) => {
      const val = formData[field.key];
      const strVal = val !== undefined && val !== null ? String(val).trim() : "";

      // Mandatory check
      if (field.mandatory && !strVal) {
        errors[field.key] = `${field.label} is mandatory. Please fill in this field.`;
        return;
      }

      // Datatype checks if value is present
      if (strVal) {
        if (field.type === "number") {
          const num = Number(strVal);
          if (isNaN(num)) {
            errors[field.key] = `${field.label} must be a valid number.`;
          } else if (num < 0) {
            errors[field.key] = `${field.label} cannot be negative.`;
          }
        } else if (field.type === "amount") {
          // Remove potential commas
          const cleanVal = strVal.replace(/,/g, "");
          const num = Number(cleanVal);
          if (isNaN(num)) {
            errors[field.key] = `${field.label} must be a valid monetary amount in LKR.`;
          } else if (num < 0) {
            errors[field.key] = `${field.label} cannot be a negative amount.`;
          }
        } else if (field.type === "date") {
          const date = new Date(strVal);
          if (isNaN(date.getTime())) {
            errors[field.key] = `Please enter a valid calendar date for ${field.label}.`;
          }
        }
      }
    });

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Save new record
  const handleSave = () => {
    const isValid = validateForm();
    if (!isValid) {
      setSidePopup({
        show: true,
        title: "Validation Error",
        message: "Please fill in all mandatory fields with valid values.",
      });
      return;
    }

    // Determine primary identifier for the record
    const primaryKey = meta.fields[0]?.key || "id";
    const primaryLabel =
      (formData[primaryKey] as string) || `${meta.code}-${Date.now().toString().slice(-4)}`;

    // Auto-sync status with active field if active is present
    const activeFieldPresent = meta.fields.some((f) => f.key === "active");
    const computedStatus = activeFieldPresent
      ? (String(formData["active"] || "Yes").toLowerCase() === "no" ? "Inactive" : "Active")
      : (formData["status"] || "Active");

    const payload = {
      ...formData,
      status: computedStatus,
    };

    const newRecord: Record<string, unknown> = {
      ...payload,
      [primaryKey]: primaryLabel,
      createdAt: new Date().toISOString(),
    };

    // If System User Master, save directly to PostgreSQL DB
    if (meta.code === "MST-33" || meta.id === "O1-SCR-MST-33") {
      apiFetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
        .then((res) => res.json())
        .then((result) => {
          if (result.user) {
            setSavedRecords((prev) => [
              result.user,
              ...prev.filter(
                (u) =>
                  u["id"] !== result.user["id"] &&
                  String(u["email"]).toLowerCase() !== String(result.user["email"]).toLowerCase(),
              ),
            ]);
          }
        })
        .catch((e) => console.error("Error saving user to DB:", e));
    } else
      // If System Role Master, save directly to PostgreSQL DB
      if (meta.code === "MST-32" || meta.id === "O1-SCR-MST-32") {
        const payload = {
          ...formData,
          code: String(formData["code"] || "")
            .toUpperCase()
            .trim(),
        };
        apiFetch("/api/roles", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
          .then((res) => res.json())
          .then((result) => {
            if (result.role) {
              setSavedRecords((prev) => [
                result.role,
                ...prev.filter(
                  (r) =>
                    String(r["code"]).toUpperCase() !== String(result.role["code"]).toUpperCase(),
                ),
              ]);
            }
          })
          .catch((e) => console.error("Error saving role to DB:", e));
      } else if (meta.code === "MST-01" || meta.id === "O1-SCR-MST-01") {
        // Save Customer directly to dedicated PostgreSQL table
        apiFetch("/api/customers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        })
          .then((res) => res.json())
          .then((result) => {
            if (result.customer) {
              setSavedRecords((prev) => [
                result.customer,
                ...prev.filter(
                  (c) =>
                    c["id"] !== result.customer["id"] &&
                    String(c["customerCode"]).toUpperCase() !==
                      String(result.customer["customerCode"]).toUpperCase(),
                ),
              ]);
            }
          })
          .catch((e) => console.error("Error saving customer to DB:", e));
      } else if (meta.code === "MST-02" || meta.id === "O1-SCR-MST-02") {
        // Find customer by customerName or customerId
        let rawCustName = String(formData["customerName"] || formData["customerId"] || "").trim();
        let matchedOption = customerOptions.find(
          (c) => c.name.toLowerCase() === rawCustName.toLowerCase() || String(c.id) === rawCustName
        );

        let resolvedCustId = matchedOption ? matchedOption.id : Number(rawCustName) || 1;
        let resolvedCustName = matchedOption ? matchedOption.name : rawCustName;
        let resolvedCustCode = matchedOption ? `${matchedOption.code} (${matchedOption.name})` : undefined;

        const contactPayload = {
          ...formData,
          customerId: resolvedCustId,
          customerName: resolvedCustName,
          customerCode: resolvedCustCode || formData["customerCode"],
        };

        // Save Contact Person directly to dedicated PostgreSQL table
        apiFetch("/api/contacts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(contactPayload),
        })
          .then((res) => res.json())
          .then((result) => {
            if (result.contact) {
              setSavedRecords((prev) => [
                result.contact,
                ...prev.filter(
                  (c) =>
                    c["id"] !== result.contact["id"] &&
                    !(c["customerId"] === result.contact["customerId"] && c["contactName"] === result.contact["contactName"]),
                ),
              ]);
            }
          })
          .catch((e) => console.error("Error saving contact person to DB:", e));
      } else if (meta.code === "MST-03" || meta.id === "O1-SCR-MST-03") {
        // Find customer by customerName or customer
        let rawCustName = String(formData["customerName"] || formData["customer"] || "").trim();
        let matchedOption = customerOptions.find(
          (c) => c.name.toLowerCase() === rawCustName.toLowerCase() || String(c.id) === rawCustName
        );

        let resolvedCustId = matchedOption ? matchedOption.id : Number(rawCustName) || 1;
        let resolvedCustName = matchedOption ? matchedOption.name : rawCustName;
        let resolvedCustCode = matchedOption ? matchedOption.code : undefined;

        const sitePayload = {
          ...formData,
          customerId: resolvedCustId,
          customerName: resolvedCustName,
          customerCode: resolvedCustCode || formData["customerCode"],
        };

        // Save Site directly to dedicated PostgreSQL table
        apiFetch("/api/sites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(sitePayload),
        })
          .then((res) => res.json())
          .then((result) => {
            if (result.site) {
              setSavedRecords((prev) => [
                result.site,
                ...prev.filter(
                  (s) =>
                    s["id"] !== result.site["id"] &&
                    String(s["siteCode"]).toUpperCase() !== String(result.site["siteCode"]).toUpperCase(),
                ),
              ]);
            }
          })
          .catch((e) => console.error("Error saving site to DB:", e));
      } else if (meta.code === "MST-04" || meta.id === "O1-SCR-MST-04") {
        // Save Item directly to dedicated PostgreSQL table
        apiFetch("/api/items", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        })
          .then((res) => res.json())
          .then((result) => {
            if (result.item) {
              setSavedRecords((prev) => [
                result.item,
                ...prev.filter(
                  (i) =>
                    i["id"] !== result.item["id"] &&
                    String(i["itemCode"]).toUpperCase() !== String(result.item["itemCode"]).toUpperCase(),
                ),
              ]);
            }
          })
          .catch((e) => console.error("Error saving item to DB:", e));
      } else if (meta.code === "MST-08" || meta.id === "O1-SCR-MST-08") {
        let rawCust = String(formData["customer"] || formData["customerName"] || "").trim();
        let matchedCust = customerOptions.find(
          (c) => c.name.toLowerCase() === rawCust.toLowerCase() || String(c.id) === rawCust
        );
        let rawSite = String(formData["site"] || formData["siteName"] || "").trim();
        let matchedSite = siteOptions.find(
          (s) => s.name.toLowerCase() === rawSite.toLowerCase() || s.code.toLowerCase() === rawSite.toLowerCase() || String(s.id) === rawSite
        );
        const sysPayload = {
          ...formData,
          customerId: matchedCust ? matchedCust.id : undefined,
          customerName: matchedCust ? matchedCust.name : rawCust || undefined,
          siteId: matchedSite ? matchedSite.id : undefined,
          siteName: matchedSite ? matchedSite.name : rawSite || undefined,
        };
        apiFetch("/api/equipment-systems", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(sysPayload),
        }).then((res) => res.json()).then((result) => {
          if (result.system) {
            setSavedRecords((prev) => [result.system, ...prev.filter((s) => s["id"] !== result.system["id"] && String(s["systemId"]).toUpperCase() !== String(result.system["systemId"]).toUpperCase())]);
          }
        });
      } else if (meta.code === "MST-09" || meta.id === "O1-SCR-MST-09") {
        apiFetch("/api/technicians", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }).then((res) => res.json()).then((result) => {
          if (result.technician) {
            setSavedRecords((prev) => [result.technician, ...prev.filter((t) => t["id"] !== result.technician["id"] && String(t["employeeId"]).toUpperCase() !== String(result.technician["employeeId"]).toUpperCase())]);
          }
        });
      } else if (meta.code === "MST-10" || meta.id === "O1-SCR-MST-10") {
        apiFetch("/api/subcontractors", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }).then((res) => res.json()).then((result) => {
          if (result.subcontractor) {
            setSavedRecords((prev) => [result.subcontractor, ...prev.filter((s) => s["id"] !== result.subcontractor["id"] && String(s["vendorCode"]).toUpperCase() !== String(result.subcontractor["vendorCode"]).toUpperCase())]);
          }
        });
      } else if (meta.code === "MST-11" || meta.id === "O1-SCR-MST-11") {
        apiFetch("/api/service-roles", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }).then((res) => res.json()).then((result) => {
          if (result.role) {
            setSavedRecords((prev) => [result.role, ...prev.filter((r) => r["id"] !== result.role["id"] && String(r["roleCode"]).toUpperCase() !== String(result.role["roleCode"]).toUpperCase())]);
          }
        });
      } else if (meta.code === "MST-12" || meta.id === "O1-SCR-MST-12") {
        apiFetch("/api/service-types", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }).then((res) => res.json()).then((result) => {
          if (result.serviceType) {
            setSavedRecords((prev) => [result.serviceType, ...prev.filter((t) => t["id"] !== result.serviceType["id"] && String(t["code"]).toUpperCase() !== String(result.serviceType["code"]).toUpperCase())]);
          }
        });
      } else if (meta.code === "MST-13" || meta.id === "O1-SCR-MST-13") {
        apiFetch("/api/hold-reasons", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }).then((res) => res.json()).then((result) => {
          if (result.holdReason) {
            setSavedRecords((prev) => [result.holdReason, ...prev.filter((t) => t["id"] !== result.holdReason["id"] && String(t["reasonCode"]).toUpperCase() !== String(result.holdReason["reasonCode"]).toUpperCase())]);
          }
        });
      } else if (meta.code === "MST-14" || meta.id === "O1-SCR-MST-14") {
        apiFetch("/api/repeat-reasons", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }).then((res) => res.json()).then((result) => {
          if (result.repeatReason) {
            setSavedRecords((prev) => [result.repeatReason, ...prev.filter((t) => t["id"] !== result.repeatReason["id"] && String(t["reasonCode"]).toUpperCase() !== String(result.repeatReason["reasonCode"]).toUpperCase())]);
          }
        });
      } else if (meta.code === "MST-15" || meta.id === "O1-SCR-MST-15") {
        apiFetch("/api/sla-rules", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }).then((res) => res.json()).then((result) => {
          if (result.slaRule) {
            setSavedRecords((prev) => [result.slaRule, ...prev.filter((t) => t["id"] !== result.slaRule["id"] && String(t["ruleCode"]).toUpperCase() !== String(result.slaRule["ruleCode"]).toUpperCase())]);
          }
        });
      } else if (meta.code === "MST-16" || meta.id === "O1-SCR-MST-16") {
        apiFetch("/api/checklist-templates", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }).then((res) => res.json()).then((result) => {
          if (result.checklistTemplate) {
            setSavedRecords((prev) => [result.checklistTemplate, ...prev.filter((t) => t["id"] !== result.checklistTemplate["id"] && String(t["templateCode"]).toUpperCase() !== String(result.checklistTemplate["templateCode"]).toUpperCase())]);
          }
        });
      } else if (meta.code === "MST-17" || meta.id === "O1-SCR-MST-17") {
        apiFetch("/api/warranty-rules", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }).then((res) => res.json()).then((result) => {
          if (result.warrantyRule) {
            setSavedRecords((prev) => [result.warrantyRule, ...prev.filter((t) => t["id"] !== result.warrantyRule["id"] && String(t["ruleCode"]).toUpperCase() !== String(result.warrantyRule["ruleCode"]).toUpperCase())]);
          }
        });
      } else if (meta.code === "MST-18" || meta.id === "O1-SCR-MST-18") {
        apiFetch("/api/free-service-plans", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }).then((res) => res.json()).then((result) => {
          if (result.plan) {
            setSavedRecords((prev) => [result.plan, ...prev.filter((t) => t["id"] !== result.plan["id"] && String(t["planCode"]).toUpperCase() !== String(result.plan["planCode"]).toUpperCase())]);
          }
        });
      } else if (meta.code === "MST-19" || meta.id === "O1-SCR-MST-19") {
        apiFetch("/api/contract-templates", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }).then((res) => res.json()).then((result) => {
          if (result.template) {
            setSavedRecords((prev) => [result.template, ...prev.filter((t) => t["id"] !== result.template["id"] && String(t["template"]).toUpperCase() !== String(result.template["template"]).toUpperCase())]);
          }
        });
      } else if (meta.code === "MST-20" || meta.id === "O1-SCR-MST-20") {
        apiFetch("/api/relationship-stages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }).then((res) => res.json()).then((result) => {
          if (result.stage) {
            setSavedRecords((prev) => [result.stage, ...prev.filter((t) => t["id"] !== result.stage["id"] && String(t["code"]).toUpperCase() !== String(result.stage["code"]).toUpperCase())]);
          }
        });
      } else if (meta.code === "MST-21" || meta.id === "O1-SCR-MST-21") {
        apiFetch("/api/reminder-rules", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }).then((res) => res.json()).then((result) => {
          if (result.reminderRule) {
            setSavedRecords((prev) => [result.reminderRule, ...prev.filter((t) => t["id"] !== result.reminderRule["id"] && String(t["ruleCode"]).toUpperCase() !== String(result.reminderRule["ruleCode"]).toUpperCase())]);
          }
        });
      } else if (meta.code === "MST-22" || meta.id === "O1-SCR-MST-22") {
        apiFetch("/api/notification-templates", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }).then((res) => res.json()).then((result) => {
          if (result.template) {
            setSavedRecords((prev) => [result.template, ...prev.filter((t) => t["id"] !== result.template["id"] && String(t["templateId"]).toUpperCase() !== String(result.template["templateId"]).toUpperCase())]);
          }
        });
      } else if (meta.code === "MST-23" || meta.id === "O1-SCR-MST-23") {
        apiFetch("/api/project-budgets", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }).then((res) => res.json()).then((result) => {
          if (result.budget) {
            setSavedRecords((prev) => [result.budget, ...prev.filter((t) => t["id"] !== result.budget["id"] && String(t["projectCode"]).toUpperCase() !== String(result.budget["projectCode"]).toUpperCase())]);
          }
        });
      } else if (meta.code === "MST-24" || meta.id === "O1-SCR-MST-24") {
        apiFetch("/api/cost-element-mappings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }).then((res) => res.json()).then((result) => {
          if (result.mapping) {
            setSavedRecords((prev) => [result.mapping, ...prev.filter((t) => t["id"] !== result.mapping["id"] && String(t["costElement"]).toUpperCase() !== String(result.mapping["costElement"]).toUpperCase())]);
          }
        });
      } else if (meta.code === "MST-25" || meta.id === "O1-SCR-MST-25") {
        apiFetch("/api/labour-rates", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }).then((res) => res.json()).then((result) => {
          if (result.rate) {
            setSavedRecords((prev) => [result.rate, ...prev.filter((t) => t["id"] !== result.rate["id"] && String(t["rateCode"]).toUpperCase() !== String(result.rate["rateCode"]).toUpperCase())]);
          }
        });
      } else if (meta.code === "MST-26" || meta.id === "O1-SCR-MST-26") {
        apiFetch("/api/franchise-warehouses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }).then((res) => res.json()).then((result) => {
          if (result.warehouse) {
            setSavedRecords((prev) => [result.warehouse, ...prev.filter((t) => t["id"] !== result.warehouse["id"] && String(t["franchiseBp"]).toUpperCase() !== String(result.warehouse["franchiseBp"]).toUpperCase())]);
          }
        });
      } else if (meta.code === "MST-27" || meta.id === "O1-SCR-MST-27") {
        apiFetch("/api/deviation-reasons", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }).then((res) => res.json()).then((result) => {
          if (result.reason) {
            setSavedRecords((prev) => [result.reason, ...prev.filter((t) => t["id"] !== result.reason["id"] && String(t["reasonCode"]).toUpperCase() !== String(result.reason["reasonCode"]).toUpperCase())]);
          }
        });
      } else if (meta.code === "MST-28" || meta.id === "O1-SCR-MST-28") {
        apiFetch("/api/export-permissions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }).then((res) => res.json()).then((result) => {
          if (result.permission) {
            setSavedRecords((prev) => [result.permission, ...prev.filter((t) => t["id"] !== result.permission["id"] && (String(t["role"]) !== String(result.permission["role"]) || String(t["reportGrid"]) !== String(result.permission["reportGrid"])))]);
          }
        });
      } else if (meta.code === "MST-29" || meta.id === "O1-SCR-MST-29") {
        apiFetch("/api/google-meet-settings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }).then((res) => res.json()).then((result) => {
          if (result.setting) {
            setSavedRecords((prev) => [result.setting, ...prev.filter((t) => t["id"] !== result.setting["id"] && String(t["workspaceDomain"]).toUpperCase() !== String(result.setting["workspaceDomain"]).toUpperCase())]);
          }
        });
      } else if (meta.code === "MST-30" || meta.id === "O1-SCR-MST-30") {
        apiFetch("/api/equipment-category-attributes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }).then((res) => res.json()).then((result) => {
          if (result.category) {
            setSavedRecords((prev) => [result.category, ...prev.filter((t) => t["id"] !== result.category["id"] && String(t["categoryCode"]).toUpperCase() !== String(result.category["categoryCode"]).toUpperCase())]);
          }
        });
      } else if (meta.code === "MST-31" || meta.id === "O1-SCR-MST-31") {
        apiFetch("/api/tool-vehicle-assets", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }).then((res) => res.json()).then((result) => {
          if (result.asset) {
            setSavedRecords((prev) => [result.asset, ...prev.filter((t) => t["id"] !== result.asset["id"] && String(t["assetId"]).toUpperCase() !== String(result.asset["assetId"]).toUpperCase())]);
          }
        });
      } else if (meta.code === "MST-07" || meta.id === "O1-SCR-MST-07") {
        // Resolve customer
        let rawCust = String(formData["customer"] || formData["customerName"] || "").trim();
        let matchedCust = customerOptions.find(
          (c) => c.name.toLowerCase() === rawCust.toLowerCase() || String(c.id) === rawCust
        );

        // Resolve site
        let rawSite = String(formData["site"] || formData["siteName"] || "").trim();
        let matchedSite = siteOptions.find(
          (s) => s.name.toLowerCase() === rawSite.toLowerCase() || s.code.toLowerCase() === rawSite.toLowerCase() || String(s.id) === rawSite
        );

        const otherPayload = {
          ...formData,
          customerId: matchedCust ? matchedCust.id : undefined,
          customerName: matchedCust ? matchedCust.name : rawCust || undefined,
          siteId: matchedSite ? matchedSite.id : undefined,
          siteName: matchedSite ? matchedSite.name : rawSite || undefined,
        };

        // Save Other Brand Equipment directly to dedicated PostgreSQL table
        apiFetch("/api/other-brand-equipments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(otherPayload),
        })
          .then((res) => res.json())
          .then((result) => {
            if (result.equipment) {
              setSavedRecords((prev) => [
                result.equipment,
                ...prev.filter(
                  (e) =>
                    e["id"] !== result.equipment["id"] &&
                    String(e["equipmentId"]).toUpperCase() !== String(result.equipment["equipmentId"]).toUpperCase(),
                ),
              ]);
            }
          })
          .catch((e) => console.error("Error saving other-brand equipment to DB:", e));
      } else if (meta.code === "MST-06" || meta.id === "O1-SCR-MST-06") {
        // Resolve customer
        let rawCust = String(formData["customer"] || formData["customerName"] || "").trim();
        let matchedCust = customerOptions.find(
          (c) => c.name.toLowerCase() === rawCust.toLowerCase() || String(c.id) === rawCust
        );

        // Resolve site
        let rawSite = String(formData["site"] || formData["siteName"] || "").trim();
        let matchedSite = siteOptions.find(
          (s) => s.name.toLowerCase() === rawSite.toLowerCase() || s.code.toLowerCase() === rawSite.toLowerCase() || String(s.id) === rawSite
        );

        // Resolve serial
        let rawSerial = String(formData["serial"] || formData["serialNo"] || "").trim();
        let matchedSerial = serialOptions.find(
          (s) => s.serialNo.toLowerCase() === rawSerial.toLowerCase() || String(s.id) === rawSerial
        );

        const equipPayload = {
          ...formData,
          customerId: matchedCust ? matchedCust.id : undefined,
          customerName: matchedCust ? matchedCust.name : rawCust || undefined,
          siteId: matchedSite ? matchedSite.id : undefined,
          siteName: matchedSite ? matchedSite.name : rawSite || undefined,
          serialId: matchedSerial ? matchedSerial.id : undefined,
          serialNo: matchedSerial ? matchedSerial.serialNo : rawSerial || undefined,
        };

        // Save Equipment directly to dedicated PostgreSQL table
        apiFetch("/api/equipments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(equipPayload),
        })
          .then((res) => res.json())
          .then((result) => {
            if (result.equipment) {
              setSavedRecords((prev) => [
                result.equipment,
                ...prev.filter(
                  (e) =>
                    e["id"] !== result.equipment["id"] &&
                    String(e["equipmentId"]).toUpperCase() !== String(result.equipment["equipmentId"]).toUpperCase(),
                ),
              ]);
            }
          })
          .catch((e) => console.error("Error saving equipment to DB:", e));
      } else if (meta.code === "MST-05" || meta.id === "O1-SCR-MST-05") {
        // Resolve customer
        let rawCust = String(formData["customer"] || formData["customerName"] || "").trim();
        let matchedCust = customerOptions.find(
          (c) => c.name.toLowerCase() === rawCust.toLowerCase() || String(c.id) === rawCust
        );

        // Resolve item
        let rawItem = String(formData["item"] || formData["itemName"] || "").trim();
        // Dropdown value format: "{itemCode} - {itemName}"
        let itemCodePart = rawItem.includes(" - ") ? (rawItem.split(" - ")[0] ?? "").trim() : rawItem;
        let matchedItem = itemOptions.find(
          (i) =>
            i.code.toLowerCase() === itemCodePart.toLowerCase() ||
            i.name.toLowerCase() === rawItem.toLowerCase() ||
            `${i.code} - ${i.name}`.toLowerCase() === rawItem.toLowerCase() ||
            String(i.id) === rawItem
        );

        // Resolve site
        let rawSite = String(formData["site"] || formData["siteName"] || "").trim();
        let matchedSite = siteOptions.find(
          (s) => s.name.toLowerCase() === rawSite.toLowerCase() || s.code.toLowerCase() === rawSite.toLowerCase() || String(s.id) === rawSite
        );

        const serialPayload = {
          ...formData,
          customerId: matchedCust ? matchedCust.id : undefined,
          customerName: matchedCust ? matchedCust.name : rawCust || undefined,
          itemId: matchedItem ? matchedItem.id : undefined,
          itemCode: matchedItem ? matchedItem.code : undefined,
          itemName: matchedItem ? matchedItem.name : rawItem || undefined,
          siteId: matchedSite ? matchedSite.id : undefined,
          siteName: matchedSite ? matchedSite.name : rawSite || undefined,
        };

        // Save Serial directly to dedicated PostgreSQL table
        apiFetch("/api/serials", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(serialPayload),
        })
          .then((res) => res.json())
          .then((result) => {
            if (result.serial) {
              setSavedRecords((prev) => [
                result.serial,
                ...prev.filter(
                  (s) =>
                    s["id"] !== result.serial["id"] &&
                    String(s["serialNo"]).toUpperCase() !== String(result.serial["serialNo"]).toUpperCase(),
                ),
              ]);
            }
          })
          .catch((e) => console.error("Error saving serial to DB:", e));
      } else {
        // Save Master Record (MST-05 to MST-31) directly to PostgreSQL
        apiFetch("/api/masters", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            screenCode: meta.code,
            recordKey: primaryLabel,
            data: newRecord,
            status: newRecord["status"] || "Active",
          }),
        })
          .then((res) => res.json())
          .then((result) => {
            if (result.record) {
              setSavedRecords((prev) => [
                result.record,
                ...prev.filter(
                  (r) => r[primaryKey] !== primaryLabel && r["_dbId"] !== result.record["_dbId"],
                ),
              ]);
            } else {
              setSavedRecords((prev) => [
                newRecord,
                ...prev.filter((r) => r[primaryKey] !== primaryLabel),
              ]);
            }
          })
          .catch((e) => {
            console.error("Error saving master record to DB:", e);
            setSavedRecords((prev) => [
              newRecord,
              ...prev.filter((r) => r[primaryKey] !== primaryLabel),
            ]);
          });
      }

    // Trigger side popup
    setSidePopup({
      show: true,
      title: "Saved Successfully",
      message: `Record "${primaryLabel}" saved successfully to ${meta.name}.`,
      recordId: primaryLabel,
    });

    // Clear form fields back to placeholders
    setFormData({});
    setValidationErrors({});
  };

  // Clear form manually
  const handleClearForm = () => {
    setFormData({});
    setValidationErrors({});
  };

  // Load saved record into form for viewing/editing
  const handleLoadRecord = (rec: Record<string, unknown>) => {
    // Keep record id and details, clear password input
    const cleanRec = { ...rec, password: "" };
    setFormData(cleanRec);
    setValidationErrors({});
    window.scrollTo({ top: 150, behavior: "smooth" });
    setSidePopup({
      show: true,
      title: "Record Loaded",
      message: `Loaded record into form for editing.`,
      recordId: String((meta.fields[0] && rec[meta.fields[0].key]) || ""),
    });
  };

  // Delete saved record
  const handleDeleteRecord = (rec: Record<string, unknown>) => {
    const primaryKey = meta.fields[0]?.key || "id";
    const recId = rec[primaryKey];
    setSavedRecords((prev) => prev.filter((r) => r[primaryKey] !== recId));

    if (meta.code === "MST-33" || meta.id === "O1-SCR-MST-33") {
      const emailToDelete = rec["email"] || recId;
      apiFetch(`/api/users?email=${encodeURIComponent(String(emailToDelete))}`, {
        method: "DELETE",
      }).catch((e) => console.error("Error deleting user from DB:", e));
    }

    if (meta.code === "MST-32" || meta.id === "O1-SCR-MST-32") {
      const codeToDelete = rec["code"] || recId;
      apiFetch(`/api/roles?code=${encodeURIComponent(String(codeToDelete))}`, {
        method: "DELETE",
      }).catch((e) => console.error("Error deleting role from DB:", e));
    }

    if (meta.code === "MST-01" || meta.id === "O1-SCR-MST-01") {
      const idToDelete = rec["id"];
      const codeToDelete = rec["customerCode"] || recId;
      const url = idToDelete
        ? `/api/customers?id=${encodeURIComponent(String(idToDelete))}`
        : `/api/customers?customerCode=${encodeURIComponent(String(codeToDelete))}`;
      apiFetch(url, { method: "DELETE" }).catch((e) =>
        console.error("Error deleting customer from DB:", e),
      );
    }

    if (meta.code === "MST-02" || meta.id === "O1-SCR-MST-02") {
      const idToDelete = rec["id"];
      if (idToDelete) {
        apiFetch(`/api/contacts?id=${encodeURIComponent(String(idToDelete))}`, {
          method: "DELETE",
        }).catch((e) => console.error("Error deleting contact person from DB:", e));
      }
    }

    if (meta.code === "MST-03" || meta.id === "O1-SCR-MST-03") {
      const idToDelete = rec["id"];
      const codeToDelete = rec["siteCode"] || recId;
      const url = idToDelete
        ? `/api/sites?id=${encodeURIComponent(String(idToDelete))}`
        : `/api/sites?siteCode=${encodeURIComponent(String(codeToDelete))}`;
      apiFetch(url, { method: "DELETE" }).catch((e) =>
        console.error("Error deleting site from DB:", e),
      );
    }

    if (meta.code === "MST-04" || meta.id === "O1-SCR-MST-04") {
      const idToDelete = rec["id"];
      const codeToDelete = rec["itemCode"] || recId;
      const url = idToDelete
        ? `/api/items?id=${encodeURIComponent(String(idToDelete))}`
        : `/api/items?itemCode=${encodeURIComponent(String(codeToDelete))}`;
      apiFetch(url, { method: "DELETE" }).catch((e) =>
        console.error("Error deleting item from DB:", e),
      );
    }

    if (meta.code === "MST-07" || meta.id === "O1-SCR-MST-07") {
      const idToDelete = rec["id"];
      const eqIdToDelete = rec["equipmentId"] || recId;
      const url = idToDelete
        ? `/api/other-brand-equipments?id=${encodeURIComponent(String(idToDelete))}`
        : `/api/other-brand-equipments?equipmentId=${encodeURIComponent(String(eqIdToDelete))}`;
      apiFetch(url, { method: "DELETE" })
        .then(() => {
          apiFetch("/api/other-brand-equipments")
            .then((res) => res.json())
            .then((data) => {
              if (data && data.equipments && Array.isArray(data.equipments)) {
                setSavedRecords(data.equipments);
              }
            });
        })
        .catch((e) => console.error("Error deleting other-brand equipment from DB:", e));
    }

    if (meta.code === "MST-06" || meta.id === "O1-SCR-MST-06") {
      const idToDelete = rec["id"];
      const eqIdToDelete = rec["equipmentId"] || recId;
      const url = idToDelete
        ? `/api/equipments?id=${encodeURIComponent(String(idToDelete))}`
        : `/api/equipments?equipmentId=${encodeURIComponent(String(eqIdToDelete))}`;
      apiFetch(url, { method: "DELETE" })
        .then(() => {
          apiFetch("/api/equipments")
            .then((res) => res.json())
            .then((data) => {
              if (data && data.equipments && Array.isArray(data.equipments)) {
                setSavedRecords(data.equipments);
              }
            });
        })
        .catch((e) => console.error("Error deleting equipment from DB:", e));
    }

    if (meta.code === "MST-05" || meta.id === "O1-SCR-MST-05") {
      const idToDelete = rec["id"];
      const serialToDelete = rec["serialNo"] || recId;
      const url = idToDelete
        ? `/api/serials?id=${encodeURIComponent(String(idToDelete))}`
        : `/api/serials?serialNo=${encodeURIComponent(String(serialToDelete))}`;
      apiFetch(url, { method: "DELETE" }).then(() => {
        apiFetch("/api/serials").then((res) => res.json()).then((data) => {
          if (data?.serials) setSavedRecords(data.serials);
        });
      }).catch((e) =>
        console.error("Error deleting serial from DB:", e),
      );
    }

    if (meta.code === "MST-08" || meta.id === "O1-SCR-MST-08") {
      const idToDelete = rec["id"];
      const sysIdToDelete = rec["systemId"] || recId;
      const url = idToDelete
        ? `/api/equipment-systems?id=${encodeURIComponent(String(idToDelete))}`
        : `/api/equipment-systems?systemId=${encodeURIComponent(String(sysIdToDelete))}`;
      apiFetch(url, { method: "DELETE" }).then(() => {
        apiFetch("/api/equipment-systems").then((res) => res.json()).then((data) => {
          if (data?.systems) setSavedRecords(data.systems);
        });
      }).catch((e) => console.error("Error deleting equipment system from DB:", e));
    }

    if (meta.code === "MST-09" || meta.id === "O1-SCR-MST-09") {
      const idToDelete = rec["id"];
      const empIdToDelete = rec["employeeId"] || recId;
      const url = idToDelete
        ? `/api/technicians?id=${encodeURIComponent(String(idToDelete))}`
        : `/api/technicians?employeeId=${encodeURIComponent(String(empIdToDelete))}`;
      apiFetch(url, { method: "DELETE" }).then(() => {
        apiFetch("/api/technicians").then((res) => res.json()).then((data) => {
          if (data?.technicians) setSavedRecords(data.technicians);
        });
      }).catch((e) => console.error("Error deleting technician from DB:", e));
    }

    if (meta.code === "MST-10" || meta.id === "O1-SCR-MST-10") {
      const idToDelete = rec["id"];
      const vCodeToDelete = rec["vendorCode"] || recId;
      const url = idToDelete
        ? `/api/subcontractors?id=${encodeURIComponent(String(idToDelete))}`
        : `/api/subcontractors?vendorCode=${encodeURIComponent(String(vCodeToDelete))}`;
      apiFetch(url, { method: "DELETE" }).then(() => {
        apiFetch("/api/subcontractors").then((res) => res.json()).then((data) => {
          if (data?.subcontractors) setSavedRecords(data.subcontractors);
        });
      }).catch((e) => console.error("Error deleting subcontractor from DB:", e));
    }

    if (meta.code === "MST-11" || meta.id === "O1-SCR-MST-11") {
      const idToDelete = rec["id"];
      const rCodeToDelete = rec["roleCode"] || recId;
      const url = idToDelete
        ? `/api/service-roles?id=${encodeURIComponent(String(idToDelete))}`
        : `/api/service-roles?roleCode=${encodeURIComponent(String(rCodeToDelete))}`;
      apiFetch(url, { method: "DELETE" }).then(() => {
        apiFetch("/api/service-roles").then((res) => res.json()).then((data) => {
          if (data?.roles) setSavedRecords(data.roles);
        });
      }).catch((e) => console.error("Error deleting service role from DB:", e));
    }

    if (meta.code === "MST-12" || meta.id === "O1-SCR-MST-12") {
      const idToDelete = rec["id"];
      const codeToDelete = rec["code"] || recId;
      const url = idToDelete
        ? `/api/service-types?id=${encodeURIComponent(String(idToDelete))}`
        : `/api/service-types?code=${encodeURIComponent(String(codeToDelete))}`;
      apiFetch(url, { method: "DELETE" }).then(() => {
        apiFetch("/api/service-types").then((res) => res.json()).then((data) => {
          if (data?.serviceTypes) setSavedRecords(data.serviceTypes);
        });
      }).catch((e) => console.error("Error deleting service type from DB:", e));
    }

    if (meta.code === "MST-13" || meta.id === "O1-SCR-MST-13") {
      const idToDelete = rec["id"];
      const rCodeToDelete = rec["reasonCode"] || recId;
      const url = idToDelete
        ? `/api/hold-reasons?id=${encodeURIComponent(String(idToDelete))}`
        : `/api/hold-reasons?reasonCode=${encodeURIComponent(String(rCodeToDelete))}`;
      apiFetch(url, { method: "DELETE" }).then(() => {
        apiFetch("/api/hold-reasons").then((res) => res.json()).then((data) => {
          if (data?.holdReasons) setSavedRecords(data.holdReasons);
        });
      }).catch((e) => console.error("Error deleting hold reason from DB:", e));
    }

    if (meta.code === "MST-14" || meta.id === "O1-SCR-MST-14") {
      const idToDelete = rec["id"];
      const rCodeToDelete = rec["reasonCode"] || recId;
      const url = idToDelete
        ? `/api/repeat-reasons?id=${encodeURIComponent(String(idToDelete))}`
        : `/api/repeat-reasons?reasonCode=${encodeURIComponent(String(rCodeToDelete))}`;
      apiFetch(url, { method: "DELETE" }).then(() => {
        apiFetch("/api/repeat-reasons").then((res) => res.json()).then((data) => {
          if (data?.repeatReasons) setSavedRecords(data.repeatReasons);
        });
      }).catch((e) => console.error("Error deleting repeat reason from DB:", e));
    }

    if (meta.code === "MST-15" || meta.id === "O1-SCR-MST-15") {
      const idToDelete = rec["id"];
      const rCodeToDelete = rec["ruleCode"] || recId;
      const url = idToDelete
        ? `/api/sla-rules?id=${encodeURIComponent(String(idToDelete))}`
        : `/api/sla-rules?ruleCode=${encodeURIComponent(String(rCodeToDelete))}`;
      apiFetch(url, { method: "DELETE" }).then(() => {
        apiFetch("/api/sla-rules").then((res) => res.json()).then((data) => {
          if (data?.slaRules) setSavedRecords(data.slaRules);
        });
      }).catch((e) => console.error("Error deleting SLA rule from DB:", e));
    }

    if (meta.code === "MST-16" || meta.id === "O1-SCR-MST-16") {
      const idToDelete = rec["id"];
      const tCodeToDelete = rec["templateCode"] || recId;
      const url = idToDelete
        ? `/api/checklist-templates?id=${encodeURIComponent(String(idToDelete))}`
        : `/api/checklist-templates?templateCode=${encodeURIComponent(String(tCodeToDelete))}`;
      apiFetch(url, { method: "DELETE" }).then(() => {
        apiFetch("/api/checklist-templates").then((res) => res.json()).then((data) => {
          if (data?.checklistTemplates) setSavedRecords(data.checklistTemplates);
        });
      }).catch((e) => console.error("Error deleting checklist template from DB:", e));
    }

    if (meta.code === "MST-17" || meta.id === "O1-SCR-MST-17") {
      const idToDelete = rec["id"];
      const rCodeToDelete = rec["ruleCode"] || recId;
      const url = idToDelete
        ? `/api/warranty-rules?id=${encodeURIComponent(String(idToDelete))}`
        : `/api/warranty-rules?ruleCode=${encodeURIComponent(String(rCodeToDelete))}`;
      apiFetch(url, { method: "DELETE" }).then(() => {
        apiFetch("/api/warranty-rules").then((res) => res.json()).then((data) => {
          if (data?.warrantyRules) setSavedRecords(data.warrantyRules);
        });
      }).catch((e) => console.error("Error deleting warranty rule from DB:", e));
    }

    if (meta.code === "MST-18" || meta.id === "O1-SCR-MST-18") {
      const idToDelete = rec["id"];
      const pCodeToDelete = rec["planCode"] || recId;
      const url = idToDelete
        ? `/api/free-service-plans?id=${encodeURIComponent(String(idToDelete))}`
        : `/api/free-service-plans?planCode=${encodeURIComponent(String(pCodeToDelete))}`;
      apiFetch(url, { method: "DELETE" }).then(() => {
        apiFetch("/api/free-service-plans").then((res) => res.json()).then((data) => {
          if (data?.plans) setSavedRecords(data.plans);
        });
      }).catch((e) => console.error("Error deleting free service plan from DB:", e));
    }

    if (meta.code === "MST-19" || meta.id === "O1-SCR-MST-19") {
      const idToDelete = rec["id"];
      const templateToDelete = rec["template"] || recId;
      const url = idToDelete
        ? `/api/contract-templates?id=${encodeURIComponent(String(idToDelete))}`
        : `/api/contract-templates?template=${encodeURIComponent(String(templateToDelete))}`;
      apiFetch(url, { method: "DELETE" }).then(() => {
        apiFetch("/api/contract-templates").then((res) => res.json()).then((data) => {
          if (data?.templates) setSavedRecords(data.templates);
        });
      }).catch((e) => console.error("Error deleting contract template from DB:", e));
    }

    if (meta.code === "MST-20" || meta.id === "O1-SCR-MST-20") {
      const idToDelete = rec["id"];
      const codeToDelete = rec["code"] || recId;
      const url = idToDelete
        ? `/api/relationship-stages?id=${encodeURIComponent(String(idToDelete))}`
        : `/api/relationship-stages?code=${encodeURIComponent(String(codeToDelete))}`;
      apiFetch(url, { method: "DELETE" }).then(() => {
        apiFetch("/api/relationship-stages").then((res) => res.json()).then((data) => {
          if (data?.stages) setSavedRecords(data.stages);
        });
      }).catch((e) => console.error("Error deleting relationship stage from DB:", e));
    }

    if (meta.code === "MST-21" || meta.id === "O1-SCR-MST-21") {
      const idToDelete = rec["id"];
      const rCodeToDelete = rec["ruleCode"] || recId;
      const url = idToDelete
        ? `/api/reminder-rules?id=${encodeURIComponent(String(idToDelete))}`
        : `/api/reminder-rules?ruleCode=${encodeURIComponent(String(rCodeToDelete))}`;
      apiFetch(url, { method: "DELETE" }).then(() => {
        apiFetch("/api/reminder-rules").then((res) => res.json()).then((data) => {
          if (data?.reminderRules) setSavedRecords(data.reminderRules);
        });
      }).catch((e) => console.error("Error deleting reminder rule from DB:", e));
    }

    if (meta.code === "MST-22" || meta.id === "O1-SCR-MST-22") {
      const idToDelete = rec["id"];
      const tIdToDelete = rec["templateId"] || recId;
      const url = idToDelete
        ? `/api/notification-templates?id=${encodeURIComponent(String(idToDelete))}`
        : `/api/notification-templates?templateId=${encodeURIComponent(String(tIdToDelete))}`;
      apiFetch(url, { method: "DELETE" }).then(() => {
        apiFetch("/api/notification-templates").then((res) => res.json()).then((data) => {
          if (data?.templates) setSavedRecords(data.templates);
        });
      }).catch((e) => console.error("Error deleting notification template from DB:", e));
    }

    if (meta.code === "MST-23" || meta.id === "O1-SCR-MST-23") {
      const idToDelete = rec["id"];
      const pCodeToDelete = rec["projectCode"] || recId;
      const url = idToDelete
        ? `/api/project-budgets?id=${encodeURIComponent(String(idToDelete))}`
        : `/api/project-budgets?projectCode=${encodeURIComponent(String(pCodeToDelete))}`;
      apiFetch(url, { method: "DELETE" }).then(() => {
        apiFetch("/api/project-budgets").then((res) => res.json()).then((data) => {
          if (data?.budgets) setSavedRecords(data.budgets);
        });
      }).catch((e) => console.error("Error deleting project budget from DB:", e));
    }

    if (meta.code === "MST-24" || meta.id === "O1-SCR-MST-24") {
      const idToDelete = rec["id"];
      const elemToDelete = rec["costElement"] || recId;
      const url = idToDelete
        ? `/api/cost-element-mappings?id=${encodeURIComponent(String(idToDelete))}`
        : `/api/cost-element-mappings?costElement=${encodeURIComponent(String(elemToDelete))}`;
      apiFetch(url, { method: "DELETE" }).then(() => {
        apiFetch("/api/cost-element-mappings").then((res) => res.json()).then((data) => {
          if (data?.mappings) setSavedRecords(data.mappings);
        });
      }).catch((e) => console.error("Error deleting cost element mapping from DB:", e));
    }

    if (meta.code === "MST-25" || meta.id === "O1-SCR-MST-25") {
      const idToDelete = rec["id"];
      const rCodeToDelete = rec["rateCode"] || recId;
      const url = idToDelete
        ? `/api/labour-rates?id=${encodeURIComponent(String(idToDelete))}`
        : `/api/labour-rates?rateCode=${encodeURIComponent(String(rCodeToDelete))}`;
      apiFetch(url, { method: "DELETE" }).then(() => {
        apiFetch("/api/labour-rates").then((res) => res.json()).then((data) => {
          if (data?.rates) setSavedRecords(data.rates);
        });
      }).catch((e) => console.error("Error deleting labour rate from DB:", e));
    }

    if (meta.code === "MST-26" || meta.id === "O1-SCR-MST-26") {
      const idToDelete = rec["id"];
      const bpToDelete = rec["franchiseBp"] || recId;
      const url = idToDelete
        ? `/api/franchise-warehouses?id=${encodeURIComponent(String(idToDelete))}`
        : `/api/franchise-warehouses?franchiseBp=${encodeURIComponent(String(bpToDelete))}`;
      apiFetch(url, { method: "DELETE" }).then(() => {
        apiFetch("/api/franchise-warehouses").then((res) => res.json()).then((data) => {
          if (data?.warehouses) setSavedRecords(data.warehouses);
        });
      }).catch((e) => console.error("Error deleting franchise warehouse from DB:", e));
    }

    if (meta.code === "MST-27" || meta.id === "O1-SCR-MST-27") {
      const idToDelete = rec["id"];
      const rCodeToDelete = rec["reasonCode"] || recId;
      const url = idToDelete
        ? `/api/deviation-reasons?id=${encodeURIComponent(String(idToDelete))}`
        : `/api/deviation-reasons?reasonCode=${encodeURIComponent(String(rCodeToDelete))}`;
      apiFetch(url, { method: "DELETE" }).then(() => {
        apiFetch("/api/deviation-reasons").then((res) => res.json()).then((data) => {
          if (data?.reasons) setSavedRecords(data.reasons);
        });
      }).catch((e) => console.error("Error deleting deviation reason from DB:", e));
    }

    if (meta.code === "MST-28" || meta.id === "O1-SCR-MST-28") {
      const idToDelete = rec["id"];
      const url = idToDelete
        ? `/api/export-permissions?id=${encodeURIComponent(String(idToDelete))}`
        : `/api/export-permissions?role=${encodeURIComponent(String(rec["role"]))}&reportGrid=${encodeURIComponent(String(rec["reportGrid"]))}`;
      apiFetch(url, { method: "DELETE" }).then(() => {
        apiFetch("/api/export-permissions").then((res) => res.json()).then((data) => {
          if (data?.permissions) setSavedRecords(data.permissions);
        });
      }).catch((e) => console.error("Error deleting export permission from DB:", e));
    }

    if (meta.code === "MST-29" || meta.id === "O1-SCR-MST-29") {
      const idToDelete = rec["id"];
      const domainToDelete = rec["workspaceDomain"] || recId;
      const url = idToDelete
        ? `/api/google-meet-settings?id=${encodeURIComponent(String(idToDelete))}`
        : `/api/google-meet-settings?workspaceDomain=${encodeURIComponent(String(domainToDelete))}`;
      apiFetch(url, { method: "DELETE" }).then(() => {
        apiFetch("/api/google-meet-settings").then((res) => res.json()).then((data) => {
          if (data?.settings) setSavedRecords(data.settings);
        });
      }).catch((e) => console.error("Error deleting google meet setting from DB:", e));
    }

    if (meta.code === "MST-30" || meta.id === "O1-SCR-MST-30") {
      const idToDelete = rec["id"];
      const catToDelete = rec["categoryCode"] || recId;
      const url = idToDelete
        ? `/api/equipment-category-attributes?id=${encodeURIComponent(String(idToDelete))}`
        : `/api/equipment-category-attributes?categoryCode=${encodeURIComponent(String(catToDelete))}`;
      apiFetch(url, { method: "DELETE" }).then(() => {
        apiFetch("/api/equipment-category-attributes").then((res) => res.json()).then((data) => {
          if (data?.categories) setSavedRecords(data.categories);
        });
      }).catch((e) => console.error("Error deleting equipment category attribute from DB:", e));
    }

    if (meta.code === "MST-31" || meta.id === "O1-SCR-MST-31") {
      const idToDelete = rec["id"];
      const assetToDelete = rec["assetId"] || recId;
      const url = idToDelete
        ? `/api/tool-vehicle-assets?id=${encodeURIComponent(String(idToDelete))}`
        : `/api/tool-vehicle-assets?assetId=${encodeURIComponent(String(assetToDelete))}`;
      apiFetch(url, { method: "DELETE" }).then(() => {
        apiFetch("/api/tool-vehicle-assets").then((res) => res.json()).then((data) => {
          if (data?.assets) setSavedRecords(data.assets);
        });
      }).catch((e) => console.error("Error deleting tool/vehicle asset from DB:", e));
    }

    setSidePopup({
      show: true,
      title: "Record Removed",
      message: `Record "${recId}" removed from saved list.`,
    });
  };

  // Action Bar Buttons
  const handleAction = (action: string) => {
    if (action.includes("History") || action.includes("Audit")) {
      setIsAuditOpen(true);
      return;
    }
    if (action.includes("Export")) {
      setIsExportOpen(true);
      return;
    }
    if (action.includes("B1 Change") || action.includes("Request B1")) {
      setB1Syncing(true);
      setTimeout(() => {
        setB1Syncing(false);
        setSidePopup({
          show: true,
          title: "SAP B1 Sync Request",
          message: "Change request transmitted to SAP Business One DI Server API.",
        });
      }, 700);
      return;
    }
    if (action.includes("Add") || action.includes("Save") || action.includes("Update")) {
      handleSave();
      return;
    }
    if (action.includes("Deactivate")) {
      handleFieldChange("status", "Inactive");
      setSidePopup({
        show: true,
        title: "Status Changed",
        message: "Status set to Inactive. Click Save to apply.",
      });
      return;
    }
  };

  // Filtered saved records for search
  const filteredSavedRecords = useMemo(() => {
    if (!savedSearchQuery.trim()) return savedRecords;
    const q = savedSearchQuery.toLowerCase();
    return savedRecords.filter((rec) =>
      Object.values(rec).some((val) =>
        String(val ?? "")
          .toLowerCase()
          .includes(q),
      ),
    );
  }, [savedRecords, savedSearchQuery]);

  // Primary preview columns for saved records table (first 4 fields, excluding duplicate status/active columns)
  const previewFields = meta.fields.filter((f) => f.key !== "status" && f.key !== "active").slice(0, 4);

  const activeTab = meta.tabs.find((t) => t.id === activeTabId);

  return (
    <div className="space-y-5 relative">
      {/* SIDE POPUP NOTIFICATION (Toast on right) */}
      {sidePopup.show && (
        <aside
          aria-live="polite"
          className="fixed top-20 right-4 sm:right-6 z-50 max-w-sm w-full bg-card border border-border shadow-2xl rounded-2xl p-4 transition-all duration-300 transform translate-y-0 animate-in fade-in slide-in-from-right-10"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                  sidePopup.title.includes("Error")
                    ? "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300"
                    : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                }`}
              >
                {sidePopup.title.includes("Error") ? (
                  <AlertTriangle className="w-5 h-5" />
                ) : (
                  <CheckCircle2 className="w-5 h-5" />
                )}
              </div>
              <div>
                <h4 className="text-xs font-bold text-foreground">{sidePopup.title}</h4>
                <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
                  {sidePopup.message}
                </p>
                {sidePopup.recordId && (
                  <span className="inline-block mt-1.5 font-mono text-[10px] font-bold px-1.5 py-0.2 rounded bg-muted text-foreground">
                    ID: {sidePopup.recordId}
                  </span>
                )}
              </div>
            </div>

            <button
              onClick={() => setSidePopup((prev) => ({ ...prev, show: false }))}
              className="text-muted-foreground hover:text-foreground p-1 rounded-md cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </aside>
      )}

      {/* Top Navigation & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-border">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-medium"
            title="Return to Masters Hub"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Masters</span>
          </button>
          <div className="h-4 w-px bg-border" />
          <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">
            Masters · {meta.category}
          </span>
        </div>

        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <button
            onClick={() => setShowSpecDetails(!showSpecDetails)}
            className="flex items-center gap-1 text-primary hover:underline text-xs cursor-pointer font-medium"
          ></button>
        </div>
      </div>

      {/* MAIN MASTER SCREEN FORM CARD */}
      <div className="bg-card border border-border rounded-2xl shadow-xs overflow-hidden">
        {/* Title Bar */}
        <div className="px-5 py-4 border-b border-border bg-muted/30 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-base font-bold text-foreground flex items-center gap-2">
                <span>{meta.name}</span>
              </h1>
            </div>
          </div>

          {/* Action Table Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleSave}
              className="px-3 py-1.5 text-xs font-bold rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground transition-colors shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Save Record</span>
            </button>

            <button
              onClick={handleClearForm}
              className="px-2.5 py-1.5 text-xs font-medium rounded-lg border border-border bg-background hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              title="Clear all fields"
            >
              Clear Fields
            </button>

            {/* Export Button */}
            <button
              onClick={() => setIsExportOpen(true)}
              className="px-2.5 py-1.5 text-xs font-medium rounded-lg border border-border bg-background hover:bg-muted text-foreground transition-colors shadow-2xs cursor-pointer flex items-center gap-1"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* Global validation banner if errors exist */}
        {Object.keys(validationErrors).length > 0 && (
          <div className="mx-5 my-4 p-3.5 rounded-xl border border-rose-300 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200 text-xs font-medium flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>
                Please fill in all mandatory fields marked with an asterisk (
                <strong className="text-red-600">*</strong>) and ensure data types are valid.
              </span>
            </div>
            <span className="font-bold font-mono px-2 py-0.5 rounded bg-rose-200/60 dark:bg-rose-900 text-rose-900 dark:text-rose-100">
              {Object.keys(validationErrors).length} Error(s)
            </span>
          </div>
        )}

        {/* Form Fields Grid - Starts empty with placeholders */}
        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {meta.fields.map((f) => {
            let fieldDef = f;
            if (meta.code === "MST-33" && f.key === "role" && dynamicRoleOptions.length > 0) {
              fieldDef = { ...f, options: dynamicRoleOptions };
            } else if (
              (meta.code === "MST-02" || meta.code === "MST-03" || meta.code === "MST-05" || meta.code === "MST-06" || meta.code === "MST-07" || meta.code === "MST-08" || meta.id === "O1-SCR-MST-02" || meta.id === "O1-SCR-MST-03" || meta.id === "O1-SCR-MST-05" || meta.id === "O1-SCR-MST-06" || meta.id === "O1-SCR-MST-07") &&
              (f.key === "customerId" || f.key === "customerName" || f.key === "customer") &&
              customerOptions.length > 0
            ) {
              fieldDef = {
                ...f,
                type: "select",
                options: customerOptions.map((c) => c.name),
              };
            } else if (
              (meta.code === "MST-05" || meta.id === "O1-SCR-MST-05") &&
              (f.key === "item" || f.key === "itemId" || f.key === "itemName") &&
              itemOptions.length > 0
            ) {
              fieldDef = {
                ...f,
                type: "select",
                options: itemOptions.map((i) => `${i.code} - ${i.name}`),
              };
            } else if (
              (meta.code === "MST-06" || meta.code === "MST-07" || meta.code === "MST-08" || meta.id === "O1-SCR-MST-06" || meta.id === "O1-SCR-MST-07" || meta.id === "O1-SCR-MST-08") &&
              (f.key === "site" || f.key === "siteName")
            ) {
              // If customer is selected, filter sites for this customer
              const rawCust = String(formData["customer"] || formData["customerName"] || "").trim();
              const matchedCust = customerOptions.find(
                (c) => c.name.toLowerCase() === rawCust.toLowerCase() || String(c.id) === rawCust
              );
              const availableSites = matchedCust
                ? siteOptions.filter((s) => s.customerId === matchedCust.id)
                : siteOptions;
              fieldDef = {
                ...f,
                type: "select",
                options: availableSites.length > 0 ? availableSites.map((s) => s.name) : ["Default Customer Site"],
              };
            } else if (
              (meta.code === "MST-06" || meta.id === "O1-SCR-MST-06") &&
              (f.key === "serial" || f.key === "serialNo") &&
              serialOptions.length > 0
            ) {
              fieldDef = {
                ...f,
                type: "select",
                options: serialOptions.map((s) => s.serialNo),
              };
            } else if (
              (meta.code === "MST-05" || meta.id === "O1-SCR-MST-05") &&
              (f.key === "warehouse" || f.key === "location")
            ) {
              fieldDef = {
                ...f,
                type: "select",
                options: [
                  "Central Stores",
                  "Colombo Main Warehouse",
                  "VAN-KSILVA (Field Stock)",
                  "VAN-PERERA (Field Stock)",
                  "Transit / Staging Area",
                  "Customer Site Installed",
                ],
              };
            }
            return (
              <MasterField
                key={f.key}
                field={fieldDef}
                value={formData[f.key]}
                error={validationErrors[f.key]}
                onChange={(val) => handleFieldChange(f.key, val)}
              />
            );
          })}
        </div>

        {/* Legend Footer */}
        <div className="px-5 py-2.5 bg-muted/40 border-t border-border text-[11px] text-muted-foreground flex flex-wrap items-center justify-between gap-4 font-mono">
          <div className="flex flex-wrap items-center gap-4">
            <span className="flex items-center gap-1">
              <span className="text-red-500 font-bold">*</span>
              <span>Mandatory Field (Required for Save)</span>
            </span>
          </div>
        </div>
      </div>

      {/* SAVED RECORDS REGISTER & CONTEXTUAL TABS CONTAINER */}
      <div className="bg-card border border-border rounded-2xl shadow-xs overflow-hidden">
        {/* Navigation Tabs (Saved Records + Child Sub-grids from Meta) */}
        <div className="flex flex-wrap items-center border-b border-border px-4 bg-muted/30 gap-1 overflow-x-auto">
          {/* Default Tab: Saved Records */}
          <button
            onClick={() => setActiveTabId("saved-records")}
            className={`px-4 py-3 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTabId === "saved-records"
                ? "border-primary text-primary bg-background shadow-xs"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Saved Records Directory</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-primary/10 text-primary">
              {savedRecords.length}
            </span>
          </button>

          {/* Child Sub-grid Tabs from Spec */}
          {meta.tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTabId(tab.id)}
              className={`px-3 py-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                activeTabId === tab.id
                  ? "border-primary text-primary font-bold bg-background shadow-xs"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <span>{tab.label}</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-muted text-muted-foreground">
                {tab.data.length}
              </span>
            </button>
          ))}
        </div>

        {/* TAB CONTENT 1: Saved Records Table with Search Bar */}
        {activeTabId === "saved-records" && (
          <div className="p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <span>Saved Records Register</span>
                  <span className="text-xs font-mono text-muted-foreground">
                    ({filteredSavedRecords.length} of {savedRecords.length} records)
                  </span>
                </h3>
              </div>

              {/* Search Bar for Saved Records */}
              <div className="relative min-w-[260px] sm:w-72">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search saved records..."
                  value={savedSearchQuery}
                  onChange={(e) => setSavedSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-border bg-background text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            {/* Saved Records Table */}
            <div className="overflow-x-auto border border-border rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/60 text-muted-foreground font-semibold border-b border-border">
                  <tr>
                    
                    {previewFields.map((f) => (
                      <th key={f.key} className="py-2.5 px-3 whitespace-nowrap">
                        {f.label}
                      </th>
                    ))}
                    <th className="py-2.5 px-3 text-center">Status</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredSavedRecords.map((rec, rIdx) => {
                    const primaryKey = meta.fields[0]?.key || "id";
                    const activeVal = rec["active"] !== undefined ? String(rec["active"]) : undefined;
                    const statusVal = rec["status"] !== undefined ? String(rec["status"]) : (activeVal === "No" ? "Inactive" : "Active");
                    const isStatusActive = statusVal.toLowerCase() === "active" && activeVal !== "No";
                    const displayId = String(rec["id"] || rec["_dbId"] || rIdx + 1);

                    return (
                      <tr key={rIdx} className="hover:bg-muted/40 transition-colors">
                        
                        {previewFields.map((f, cIdx) => (
                          <td
                            key={f.key}
                            className={`py-3 px-3 ${
                              cIdx === 0
                                ? "font-mono font-bold text-primary whitespace-nowrap"
                                : f.type === "amount"
                                  ? "font-mono text-foreground font-semibold"
                                  : "text-foreground"
                            }`}
                          >
                            {String(rec[f.key] || "—")}
                          </td>
                        ))}
                        <td className="py-3 px-3 text-center whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                              isStatusActive
                                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                                : "bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-400"
                            }`}
                          >
                            {statusVal}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right whitespace-nowrap">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              onClick={() => handleLoadRecord(rec)}
                              className="px-2.5 py-1 text-xs font-semibold rounded-md bg-muted hover:bg-primary hover:text-primary-foreground text-foreground transition-colors cursor-pointer flex items-center gap-1"
                              title="Load this record into the form above to edit"
                            >
                              <Edit3 className="w-3 h-3" />
                              <span>Load</span>
                            </button>
                            <button
                              onClick={() => handleDeleteRecord(rec)}
                              className="p-1 rounded-md hover:bg-rose-50 text-muted-foreground hover:text-rose-600 dark:hover:bg-rose-950/60 transition-colors cursor-pointer"
                              title="Delete record"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {filteredSavedRecords.length === 0 && (
                <div className="p-8 text-center text-muted-foreground text-xs space-y-1">
                  <p className="font-semibold text-foreground">No saved records found</p>
                  <p>
                    {savedSearchQuery
                      ? `No records matching "${savedSearchQuery}". Try clearing search.`
                      : "Fill in the form above and click 'Save Record' to add your first record."}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB CONTENT 2: Contextual Sub-Grid from Meta (e.g. Addresses, Contacts) */}
        {activeTab && activeTabId !== "saved-records" && (
          <div className="p-5 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <div className="font-bold text-foreground flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-primary" />
                <span>{activeTab.label} Sub-Register</span>
              </div>
              <button
                onClick={() => setIsExportOpen(true)}
                className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-border bg-background hover:bg-muted text-foreground transition-colors cursor-pointer flex items-center gap-1"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Sub-Grid</span>
              </button>
            </div>

            <div className="overflow-x-auto border border-border rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/60 text-muted-foreground font-semibold border-b border-border">
                  <tr>
                    {activeTab.columns.map((col) => (
                      <th
                        key={col.key}
                        className={`py-2.5 px-3 ${col.align === "right" ? "text-right" : "text-left"}`}
                      >
                        <span className="flex items-center gap-1">{col.label}</span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {activeTab.data.length === 0 ? (
                    <tr>
                      <td
                        colSpan={activeTab.columns.length}
                        className="py-6 text-center text-muted-foreground"
                      >
                        No records in this tab
                      </td>
                    </tr>
                  ) : (
                    activeTab.data.map((row, idx) => (
                      <tr key={idx} className="hover:bg-muted/40 transition-colors">
                        {activeTab.columns.map((col) => (
                          <td
                            key={col.key}
                            className={`py-3 px-3 text-foreground ${
                              col.align === "right"
                                ? "text-right font-mono tabular-nums"
                                : "font-normal"
                            }`}
                          >
                            {String(row[col.key] || "—")}
                          </td>
                        ))}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Audit Modal */}
      <MasterAuditModal
        isOpen={isAuditOpen}
        onClose={() => setIsAuditOpen(false)}
        recordId={String((meta.fields[0] && formData[meta.fields[0].key]) || meta.code)}
        screenTitle={meta.name}
      />

      {/* Export Modal */}
      {meta.tabs[0] && (
        <MasterExportModal
          isOpen={isExportOpen}
          onClose={() => setIsExportOpen(false)}
          meta={meta}
          activeTab={meta.tabs[0]}
          formData={formData}
        />
      )}
    </div>
  );
};
