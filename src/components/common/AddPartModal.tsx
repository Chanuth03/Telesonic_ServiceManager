import React, { useState } from "react";
import {
  X,
  Package,
  Plus,
  CheckCircle2,
  DollarSign,
  Cpu,
  Layers,
  Building,
  Hash,
  Sparkles,
} from "lucide-react";
import { TELESONIC_SPARE_PARTS_CATALOG, SparePartItem } from "@/data/sparePartsCatalog";

interface AddPartModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSavePart: (row: Record<string, unknown>) => void;
  tabColumns: Array<{ key: string; label: string }>;
  tabLabel?: string;
  screenCode?: string;
}

export const AddPartModal: React.FC<AddPartModalProps> = ({
  isOpen,
  onClose,
  onSavePart,
  tabColumns,
  tabLabel = "Parts & Materials",
  screenCode = "",
}) => {
  const [selectedCatalogItem, setSelectedCatalogItem] = useState<string>("");
  const [itemCode, setItemCode] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);
  const [uom, setUom] = useState<string>("EA");
  const [unitRate, setUnitRate] = useState<number>(0);
  const [warehouse, setWarehouse] = useState<string>("WH-MAIN (Central Logistics Colombo)");
  const [serial, setSerial] = useState<string>("");
  const [returnType, setReturnType] = useState<string>("Issued for Call");
  const [notes, setNotes] = useState<string>("");

  if (!isOpen) return null;

  const totalAmount = (quantity || 0) * (unitRate || 0);

  const handleSelectCatalog = (code: string) => {
    setSelectedCatalogItem(code);
    const item = TELESONIC_SPARE_PARTS_CATALOG.find((p) => p.code === code);
    if (item) {
      setItemCode(item.code);
      setDescription(item.name);
      setUom(item.uom);
      setUnitRate(item.defaultPriceLkr);
      setWarehouse(item.warehouse);
      if (item.serialManaged) {
        setSerial(
          `SN-${item.code.replace(/[^A-Z0-9]/g, "")}-${Math.floor(1000 + Math.random() * 9000)}`,
        );
      } else {
        setSerial("—");
      }
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemCode.trim()) return;

    // Build row matching tab columns intelligently
    const newRow: Record<string, unknown> = {
      _id: `part_${Date.now()}`,
      _isNew: true,
      addedAt: new Date().toLocaleTimeString(),
    };

    // Populate common standard aliases
    newRow["item"] = itemCode;
    newRow["itemCode"] = itemCode;
    newRow["partCode"] = itemCode;
    newRow["code"] = itemCode;
    newRow["component"] = itemCode;

    newRow["description"] = description;
    newRow["itemName"] = description;
    newRow["desc"] = description;
    newRow["name"] = description;

    newRow["qty"] = String(quantity);
    newRow["quantity"] = String(quantity);
    newRow["reqQty"] = String(quantity);
    newRow["onHand"] = String(quantity);

    newRow["uom"] = uom;
    newRow["unit"] = uom;

    newRow["rate"] = unitRate.toLocaleString("en-US");
    newRow["unitRate"] = unitRate.toLocaleString("en-US");
    newRow["unitPrice"] = `LKR ${unitRate.toLocaleString("en-US")}`;
    newRow["price"] = `LKR ${unitRate.toLocaleString("en-US")}`;

    newRow["amount"] = totalAmount.toLocaleString("en-US");
    newRow["total"] = `LKR ${totalAmount.toLocaleString("en-US")}`;
    newRow["totalAmount"] = `LKR ${totalAmount.toLocaleString("en-US")}`;
    newRow["cost"] = `LKR ${totalAmount.toLocaleString("en-US")}`;

    newRow["warehouse"] = warehouse;
    newRow["van"] = warehouse;
    newRow["source"] = warehouse;

    newRow["serial"] = serial || "—";
    newRow["serialNo"] = serial || "—";
    newRow["trackedSerial"] = serial || "—";

    newRow["returnType"] = returnType;
    newRow["status"] = "Active / Available";
    newRow["category"] = returnType;

    // Also populate any specific tab columns that didn't match standard aliases
    tabColumns.forEach((col) => {
      if (newRow[col.key] === undefined) {
        if (col.key.toLowerCase().includes("qty")) newRow[col.key] = String(quantity);
        else if (
          col.key.toLowerCase().includes("cost") ||
          col.key.toLowerCase().includes("price") ||
          col.key.toLowerCase().includes("rate")
        ) {
          newRow[col.key] = `LKR ${unitRate.toLocaleString("en-US")}`;
        } else if (col.key.toLowerCase().includes("serial")) {
          newRow[col.key] = serial || "—";
        } else if (
          col.key.toLowerCase().includes("warehouse") ||
          col.key.toLowerCase().includes("branch")
        ) {
          newRow[col.key] = warehouse;
        } else if (col.key.toLowerCase().includes("status")) {
          newRow[col.key] = "Saved";
        } else {
          newRow[col.key] = "—";
        }
      }
    });

    onSavePart(newRow);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-card text-card-foreground border border-border w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-border bg-muted/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-foreground">
                Add Spare Part / Line Item
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleFormSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs">
          {/* Quick preset selector */}
          <div className="p-3 rounded-xl bg-primary/5 border border-primary/20 space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-bold text-foreground flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                <span>Quick Select from Telesonic Spares Catalog:</span>
              </label>
              <span className="text-[10px] font-mono text-primary font-semibold">
                {TELESONIC_SPARE_PARTS_CATALOG.length} Items Available
              </span>
            </div>
            <select
              value={selectedCatalogItem}
              onChange={(e) => handleSelectCatalog(e.target.value)}
              className="w-full p-2 text-xs rounded-lg border border-border bg-background text-foreground font-medium focus:ring-2 focus:ring-primary focus:outline-hidden"
            >
              <option value="">-- Choose Genuine Telesonic Spare Part --</option>
              {TELESONIC_SPARE_PARTS_CATALOG.map((part) => (
                <option key={part.code} value={part.code}>
                  {part.code} — {part.name} (LKR {part.defaultPriceLkr.toLocaleString()} /{" "}
                  {part.uom})
                </option>
              ))}
            </select>
          </div>

          {/* Core Fields Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block font-semibold text-foreground mb-1">
                Item / Part Code <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                required
                value={itemCode}
                onChange={(e) => setItemCode(e.target.value)}
                placeholder="e.g. SP-COMP-18K"
                className="w-full p-2 rounded-lg border border-border bg-background text-foreground font-mono focus:ring-2 focus:ring-primary focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-semibold text-foreground mb-1">
                Unit of Measure (UoM)
              </label>
              <select
                value={uom}
                onChange={(e) => setUom(e.target.value)}
                className="w-full p-2 rounded-lg border border-border bg-background text-foreground font-medium focus:ring-2 focus:ring-primary focus:outline-hidden"
              >
                <option value="EA">EA (Each / Unit)</option>
                <option value="Set">Set</option>
                <option value="Cyl">Cylinder (Refrigerant)</option>
                <option value="Mtr">Meters</option>
                <option value="Kg">Kilograms</option>
                <option value="Ltr">Liters</option>
                <option value="Kit">Service Repair Kit</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-foreground mb-1">
              Part Description / Specification <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Inverter Scroll Compressor 18HP 400V"
              className="w-full p-2 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary focus:outline-hidden"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-foreground mb-1">Quantity</label>
              <input
                type="number"
                min="1"
                step="1"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full p-2 rounded-lg border border-border bg-background text-foreground font-mono font-bold focus:ring-2 focus:ring-primary focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-semibold text-foreground mb-1">Unit Rate (LKR)</label>
              <input
                type="number"
                min="0"
                step="100"
                value={unitRate}
                onChange={(e) => setUnitRate(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-full p-2 rounded-lg border border-border bg-background text-foreground font-mono font-bold focus:ring-2 focus:ring-primary focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-semibold text-foreground mb-1">Total (LKR)</label>
              <div className="p-2 rounded-lg border border-border bg-muted/50 text-foreground font-mono font-extrabold text-sm flex items-center justify-between">
                <span>LKR</span>
                <span className="tabular-nums">{totalAmount.toLocaleString("en-US")}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block font-semibold text-foreground mb-1">
                Warehouse / Van Source
              </label>
              <select
                value={warehouse}
                onChange={(e) => setWarehouse(e.target.value)}
                className="w-full p-2 rounded-lg border border-border bg-background text-foreground font-medium focus:ring-2 focus:ring-primary focus:outline-hidden"
              >
                <option value="WH-MAIN (Central Logistics Colombo)">
                  WH-MAIN (Central Logistics Colombo)
                </option>
                <option value="WH-SOUTH (Galle Service Hub)">WH-SOUTH (Galle Service Hub)</option>
                <option value="WH-CENTRAL (Kandy Service Hub)">
                  WH-CENTRAL (Kandy Service Hub)
                </option>
                <option value="VAN-KSILVA (K. Silva Mobile Van)">
                  VAN-KSILVA (K. Silva Mobile Van)
                </option>
                <option value="VAN-DPERERA (D. Perera Mobile Van)">
                  VAN-DPERERA (D. Perera Mobile Van)
                </option>
                <option value="CONS-AIRCON (Franchise Stock Consignment)">
                  CONS-AIRCON (Franchise Stock)
                </option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-foreground mb-1">
                Serial / Batch No. (if tracked)
              </label>
              <input
                type="text"
                value={serial}
                onChange={(e) => setSerial(e.target.value)}
                placeholder="e.g. SN-COMP-9912"
                className="w-full p-2 rounded-lg border border-border bg-background text-foreground font-mono focus:ring-2 focus:ring-primary focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-foreground mb-1">
              Category / Return Type
            </label>
            <select
              value={returnType}
              onChange={(e) => setReturnType(e.target.value)}
              className="w-full p-2 rounded-lg border border-border bg-background text-foreground font-medium focus:ring-2 focus:ring-primary focus:outline-hidden"
            >
              <option value="Issued for Call">Issued for Call (New Replacement)</option>
              <option value="Consumable Consumed">Consumable Consumed On-Site</option>
              <option value="Unused Return">Unused Return to Stores</option>
              <option value="Defective Core Return">Defective Core Return (Under Warranty)</option>
              <option value="Emergency Van Transfer">Emergency Van-to-Van Transfer</option>
            </select>
          </div>

          {/* Modal Footer */}
          <div className="pt-3 border-t border-border flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-border text-foreground hover:bg-muted font-medium transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-colors shadow-sm cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Save Part & Add to Register</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
