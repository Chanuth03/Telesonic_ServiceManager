import React, { useState, useEffect } from "react";
import {
  PhoneCall,
  PhoneForwarded,
  Search,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Building2,
  Cpu,
  ArrowRight,
  ShieldCheck,
  User,
  Plus,
  PhoneOff,
  Flame,
  Check,
  RotateCcw,
} from "lucide-react";
import { SAMPLE_CALL_LOGS, InboundCallLog } from "@/data/serviceRequestsSpecData";

interface RapidInboundCallLoggerScreenProps {
  onConvertToUnifiedRequest?: (ticketData: Record<string, unknown>) => void;
  onNavigateToScreen?: (screenId: string, contextId?: string) => void;
}

const PRESET_CUSTOMERS = [
  {
    phone: "0112894400",
    name: "Mr. Shantha Bandara",
    company: "Ceylon Agro Machinery PLC",
    cardCode: "C20014",
    site: "No. 45/A, Nawam Mawatha, Colombo 02",
    equipment: [
      {
        serial: "TEL-AC-VRV-90421",
        model: "Daikin VRV IV-X 16HP",
        tag: "Server Room AC 01",
        warranty: "AMC Comprehensive",
      },
      {
        serial: "TEL-AC-CAS-11204",
        model: "Daikin 4-Way Cassette 24k",
        tag: "Boardroom Main",
        warranty: "AMC Comprehensive",
      },
      {
        serial: "TEL-GEN-CAT-500K",
        model: "CAT Diesel Generator 500kVA",
        tag: "Powerhouse Substation",
        warranty: "Expired / Billable",
      },
    ],
  },
  {
    phone: "0312239811",
    name: "Mr. Roshan De Silva",
    company: "Jayasuriya Garments Exports (Pvt) Ltd",
    cardCode: "C10452",
    site: "Phase 1, Zone B, BOI EPZ, Katunayake",
    equipment: [
      {
        serial: "TEL-CHL-TRN-33102",
        model: "Trane Series R 50-Ton Chiller",
        tag: "Plant 2 Primary Chiller",
        warranty: "Expired / Billable",
      },
      {
        serial: "TEL-AHU-CAR-041",
        model: "Carrier Air Handling Unit 15k CFM",
        tag: "Cleanroom AHU #1",
        warranty: "Under Warranty",
      },
    ],
  },
  {
    phone: "0112695431",
    name: "Mr. Dilshan Mendis",
    company: "Royal Colombo Golf Club",
    cardCode: "C10042",
    site: "Model Farm Road, Colombo 08",
    equipment: [
      {
        serial: "TEL-SYS-VRF-RCGC",
        model: "Daikin VRV Multi-System (6 Heads)",
        tag: "Banquet Hall Central",
        warranty: "AMC Comprehensive",
      },
    ],
  },
  {
    phone: "0112931150",
    name: "Mr. Anura Perera",
    company: "Lanka Cold Stores & Sea Food Logistics",
    cardCode: "C30089",
    site: "Fish Market Complex, Peliyagoda",
    equipment: [
      {
        serial: "TEL-REF-BIT-77810",
        model: "Bitzer Semi-Hermetic Pack 30HP",
        tag: "Freezer Room 3 Unit A",
        warranty: "AMC Comprehensive",
      },
    ],
  },
];

export const RapidInboundCallLoggerScreen: React.FC<RapidInboundCallLoggerScreenProps> = ({
  onConvertToUnifiedRequest,
  onNavigateToScreen,
}) => {
  const [callLogs, setCallLogs] = useState<InboundCallLog[]>(SAMPLE_CALL_LOGS);
  const [callerPhone, setCallerPhone] = useState("0112894400");
  const defaultCustomer = PRESET_CUSTOMERS[0]!;
  const [matchedCustomer, setMatchedCustomer] = useState<(typeof PRESET_CUSTOMERS)[0] | null>(
    defaultCustomer,
  );
  const [selectedSerial, setSelectedSerial] = useState(defaultCustomer.equipment[0]?.serial ?? "");
  const [selectedIssueChip, setSelectedIssueChip] = useState("No Cooling / Compressor Off");
  const [callDuration, setCallDuration] = useState(38);
  const [isTimerRunning, setIsTimerRunning] = useState(true);

  // Triage checklist
  const [powerChecked, setPowerChecked] = useState(true);
  const [smokeHazard, setSmokeHazard] = useState(false);
  const [waterLeakChecked, setWaterLeakChecked] = useState(false);
  const [errorCodeInput, setErrorCodeInput] = useState("E4");
  const [notesInput, setNotesInput] = useState(
    "Customer reports condenser fan started but compressor tripped after 2 mins with error E4.",
  );

  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Call timer effect
  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | undefined;
    if (isTimerRunning) {
      timer = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isTimerRunning]);

  const handlePhoneChange = (phone: string) => {
    setCallerPhone(phone);
    const cleaned = phone.replace(/[^0-9]/g, "");
    const found = PRESET_CUSTOMERS.find(
      (c) => c.phone.includes(cleaned) || cleaned.includes(c.phone),
    );
    if (found) {
      setMatchedCustomer(found);
      setSelectedSerial(found.equipment[0]?.serial || "");
    } else {
      setMatchedCustomer(null);
      setSelectedSerial("");
    }
  };

  const handleSimulateIncoming = (cust: (typeof PRESET_CUSTOMERS)[0]) => {
    setCallerPhone(cust.phone);
    setMatchedCustomer(cust);
    setSelectedSerial(cust.equipment[0]?.serial || "");
    setCallDuration(1);
    setIsTimerRunning(true);
    setToastMsg(`Simulated incoming call answered from ${cust.company} (${cust.phone})`);
    setTimeout(() => setToastMsg(null), 2500);
  };

  const handleConvertTicket = () => {
    setIsTimerRunning(false);
    const newTicketId = `SR-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const newLog: InboundCallLog = {
      id: `CALL-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: new Date().toLocaleTimeString(),
      callerPhone,
      callerName: matchedCustomer?.name || "Unknown Caller",
      companyName: matchedCustomer?.company || "Walk-in / Direct Call",
      cardCode: matchedCustomer?.cardCode,
      matchedEquipmentCount: matchedCustomer?.equipment.length || 0,
      selectedSerial,
      quickIssue: selectedIssueChip,
      triagePassed: true,
      durationSeconds: callDuration,
      status: "Converted to Request",
      createdTicketId: newTicketId,
    };

    setCallLogs([newLog, ...callLogs]);
    setToastMsg(
      `Call converted successfully to Unified Service Request: ${newTicketId}! Routing to O1-SCR-TRX-01...`,
    );

    setTimeout(() => {
      if (onNavigateToScreen) {
        onNavigateToScreen("O1-SCR-TRX-01", newTicketId);
      }
    }, 1200);
  };

  const handleLogAdvisory = () => {
    setIsTimerRunning(false);
    const newLog: InboundCallLog = {
      id: `CALL-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: new Date().toLocaleTimeString(),
      callerPhone,
      callerName: matchedCustomer?.name || "Unknown Caller",
      companyName: matchedCustomer?.company || "Advisory Query",
      cardCode: matchedCustomer?.cardCode,
      matchedEquipmentCount: 0,
      quickIssue: selectedIssueChip,
      triagePassed: true,
      durationSeconds: callDuration,
      status: "Advisory Only",
    };
    setCallLogs([newLog, ...callLogs]);
    setToastMsg("Call logged as Advisory Inquiry without creating dispatch ticket.");
    setTimeout(() => setToastMsg(null), 2500);
  };

  const minutes = Math.floor(callDuration / 60);
  const seconds = callDuration % 60;
  const timeFormatted = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  return (
    <div className="space-y-4">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-emerald-700 text-white px-4 py-3 rounded-lg shadow-xl text-sm font-medium animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-200" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Screen Title & HUD */}
      <div className="bg-card border border-border rounded-xl p-4 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <PhoneCall className="w-5 h-5 text-primary animate-pulse" />
              <span>Rapid Inbound Call Logger</span>
            </h2>
          </div>

          {/* Active Call HUD Timer */}
          <div className="flex items-center gap-3 bg-muted/60 p-2.5 rounded-xl border border-border">
            <div className="flex items-center gap-2">
              <span
                className={`w-2.5 h-2.5 rounded-full ${isTimerRunning ? "bg-emerald-500 animate-ping" : "bg-muted-foreground"}`}
              />
              <div className="text-left">
                <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                  Active Handling Time
                </div>
                <div
                  className={`font-mono text-lg font-extrabold ${callDuration > 45 ? "text-amber-500" : "text-foreground"}`}
                >
                  {timeFormatted}
                </div>
              </div>
            </div>
            <div className="text-[10px] text-muted-foreground pl-2 border-l border-border hidden sm:block">
              Target: &lt; 00:45
              <br />
              Status: {isTimerRunning ? "Live On Call" : "Paused"}
            </div>
          </div>
        </div>

        {/* Quick Simulate Inbound Callers */}
        <div className="mt-3 pt-3 border-t border-border flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-muted-foreground">
            Simulate Inbound Caller:
          </span>
          {PRESET_CUSTOMERS.map((cust) => (
            <button
              key={cust.phone}
              onClick={() => handleSimulateIncoming(cust)}
              className="text-xs px-2.5 py-1 rounded-md border border-border bg-background hover:bg-muted text-foreground transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <PhoneCall className="w-3 h-3 text-primary" />
              <span>
                {cust.company.split(" ")[0]} ({cust.phone})
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Intake Form (2 Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: Caller & Equipment Lookup (Col 7) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Caller Identification Card */}
          <div className="bg-card border border-border rounded-xl p-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-border pb-2.5 mb-3">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Search className="w-4 h-4 text-primary" />
                <span>Caller Identification & SAP BP Auto-Match</span>
              </h3>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[11px] font-medium text-muted-foreground">
                  Incoming Phone Number / Caller ID *
                </label>
                <div className="relative mt-1">
                  <PhoneCall className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    value={callerPhone}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    placeholder="e.g. 0112894400 or 0771234567"
                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-border bg-background font-mono text-sm font-bold text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>
              </div>

              {matchedCustomer ? (
                <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>SAP Verified Business Partner: {matchedCustomer.company}</span>
                    </span>
                    <span className="font-mono text-[11px] font-bold px-1.5 py-0.5 bg-emerald-500/20 rounded text-emerald-900 dark:text-emerald-200">
                      {matchedCustomer.cardCode}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] text-muted-foreground">
                    <div>
                      <span className="font-medium text-foreground">Contact:</span>{" "}
                      {matchedCustomer.name}
                    </div>
                    <div>
                      <span className="font-medium text-foreground">Location:</span>{" "}
                      {matchedCustomer.site}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-300 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>
                    No matching Business Partner in SAP B1. Caller will be registered as New Guest /
                    Unregistered Client.
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Installed Base Serial Selection */}
          <div className="bg-card border border-border rounded-xl p-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-border pb-2.5 mb-3">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Cpu className="w-4 h-4 text-primary" />
                <span>
                  Installed Base Equipment at Site ({matchedCustomer?.equipment.length || 0} Units)
                </span>
              </h3>
            </div>

            {matchedCustomer && matchedCustomer.equipment.length > 0 ? (
              <div className="space-y-2">
                {matchedCustomer.equipment.map((eq) => {
                  const isSelected = selectedSerial === eq.serial;
                  return (
                    <div
                      key={eq.serial}
                      onClick={() => setSelectedSerial(eq.serial)}
                      className={`p-3 rounded-xl border text-xs cursor-pointer transition-all flex items-center justify-between ${
                        isSelected
                          ? "border-primary bg-primary/5 shadow-xs ring-1 ring-primary"
                          : "border-border bg-background hover:bg-muted/50"
                      }`}
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-foreground text-xs">
                            {eq.serial}
                          </span>
                          <span className="font-semibold text-foreground">{eq.tag}</span>
                        </div>
                        <div className="text-muted-foreground text-[11px]">{eq.model}</div>
                      </div>

                      <div className="text-right">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            eq.warranty.includes("Comprehensive") ||
                            eq.warranty.includes("Warranty")
                              ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
                              : "bg-amber-500/15 text-amber-700 dark:text-amber-400"
                          }`}
                        >
                          {eq.warranty}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-4 text-center text-xs text-muted-foreground">
                Enter equipment serial number manually or search item catalogue.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Symptoms, Rapid Triage & Conversion (Col 5) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-card border border-border rounded-xl p-4 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2 border-b border-border pb-2.5">
              <Zap className="w-4 h-4 text-primary" />
              <span>One-Touch Symptom Chips & Triage</span>
            </h3>

            {/* Quick Issue Chips */}
            <div>
              <label className="text-[11px] font-medium text-muted-foreground mb-1.5 block">
                Reported Problem / Common Complaint *
              </label>
              <div className="flex flex-wrap gap-1.5">
                {[
                  "No Cooling / Compressor Off",
                  "Water Leakage / Drain Choke",
                  "Power Trip / Circuit Breaker Spark",
                  "Excessive Noise / Bearing Squeal",
                  "Display Error Code (E4 / U4 / CH05)",
                  "Gas Leak / Low Pressure",
                  "Routine Periodic PM Due",
                ].map((chip) => {
                  const isSelected = selectedIssueChip === chip;
                  return (
                    <button
                      key={chip}
                      onClick={() => setSelectedIssueChip(chip)}
                      className={`text-[11px] px-2.5 py-1 rounded-full font-medium transition-colors cursor-pointer border ${
                        isSelected
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-muted/70 text-foreground border-border hover:bg-muted"
                      }`}
                    >
                      {chip}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Rapid Triage Questions */}
            <div className="p-3 rounded-xl bg-muted/50 border border-border space-y-2.5 text-xs">
              <div className="font-bold text-foreground text-xs flex items-center justify-between">
                <span>Immediate Safety & Triage Checklist</span>
                <span className="text-[10px] text-muted-foreground">Protocol QA-02</span>
              </div>

              <label className="flex items-center gap-2 text-foreground cursor-pointer">
                <input
                  type="checkbox"
                  checked={powerChecked}
                  onChange={(e) => setPowerChecked(e.target.checked)}
                  className="rounded text-primary"
                />
                <span className="text-[11px]">Unit is powered ON and breaker is active</span>
              </label>

              <label className="flex items-center gap-2 text-destructive cursor-pointer font-medium">
                <input
                  type="checkbox"
                  checked={smokeHazard}
                  onChange={(e) => setSmokeHazard(e.target.checked)}
                  className="rounded text-destructive"
                />
                <span className="text-[11px] flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5" />
                  <span>Burning smell, smoke, or electrical sparks (Critical Hazard!)</span>
                </span>
              </label>

              <label className="flex items-center gap-2 text-foreground cursor-pointer">
                <input
                  type="checkbox"
                  checked={waterLeakChecked}
                  onChange={(e) => setWaterLeakChecked(e.target.checked)}
                  className="rounded text-primary"
                />
                <span className="text-[11px]">Active water dripping on assets or floor</span>
              </label>

              <div className="pt-2 border-t border-border flex items-center gap-2">
                <span className="text-[11px] font-medium text-muted-foreground whitespace-nowrap">
                  Error Code on Remote:
                </span>
                <input
                  type="text"
                  value={errorCodeInput}
                  onChange={(e) => setErrorCodeInput(e.target.value)}
                  placeholder="e.g. E4, U4, A3"
                  className="px-2 py-1 rounded border border-border bg-background text-xs font-mono font-bold text-destructive w-28 uppercase"
                />
              </div>
            </div>

            {/* Quick Call Desk Notes */}
            <div>
              <label className="text-[11px] font-medium text-muted-foreground mb-1 block">
                Helpdesk Operator Intake Notes
              </label>
              <textarea
                rows={2}
                value={notesInput}
                onChange={(e) => setNotesInput(e.target.value)}
                className="w-full p-2 text-xs rounded-lg border border-border bg-background text-foreground focus:ring-1 focus:ring-primary focus:outline-none"
              />
            </div>

            {/* Conversion Actions */}
            <div className="pt-2 space-y-2">
              <button
                onClick={handleConvertTicket}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-primary text-primary-foreground font-bold text-xs hover:bg-primary/90 transition-all cursor-pointer shadow-sm hover:shadow"
              >
                <span>Convert to Unified Service Request (O1-SCR-TRX-01)</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleLogAdvisory}
                  className="py-2 px-3 rounded-lg border border-border bg-background hover:bg-muted text-foreground text-xs font-semibold transition-colors cursor-pointer"
                >
                  Log Advisory Only
                </button>
                {onNavigateToScreen && (
                  <button
                    onClick={() => onNavigateToScreen("O1-SCR-TRX-03")}
                    className="py-2 px-3 rounded-lg border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Check Repeat Status
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Inbound Call Intake Journal / History Table */}
      <div className="bg-card border border-border rounded-xl p-4 shadow-xs">
        <div className="flex items-center justify-between border-b border-border pb-2.5 mb-3">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" />
            <span>Today's Inbound Call Queue & Intake Journal</span>
          </h3>
          <span className="text-xs text-muted-foreground font-medium">
            Logged today: {callLogs.length} calls
          </span>
        </div>

        <div className="overflow-x-auto border border-border rounded-lg">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted text-[11px] text-muted-foreground uppercase font-bold border-b border-border">
              <tr>
                <th className="p-2.5">Call ID</th>
                <th className="p-2.5">Time</th>
                <th className="p-2.5">Caller / Company</th>
                <th className="p-2.5">Phone</th>
                <th className="p-2.5">Equipment Serial</th>
                <th className="p-2.5">Issue Tag</th>
                <th className="p-2.5 text-center">Duration</th>
                <th className="p-2.5">Status</th>
                <th className="p-2.5">Created Ticket</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-[11px]">
              {callLogs.map((log) => (
                <tr key={log.id} className="hover:bg-muted/40">
                  <td className="p-2.5 font-mono font-bold text-primary">{log.id}</td>
                  <td className="p-2.5 text-muted-foreground">{log.timestamp}</td>
                  <td className="p-2.5 font-medium text-foreground">{log.companyName}</td>
                  <td className="p-2.5 font-mono text-muted-foreground">{log.callerPhone}</td>
                  <td className="p-2.5 font-mono font-semibold text-foreground">
                    {log.selectedSerial || "—"}
                  </td>
                  <td className="p-2.5 text-foreground">{log.quickIssue}</td>
                  <td className="p-2.5 text-center font-mono font-bold">
                    <span
                      className={log.durationSeconds > 45 ? "text-amber-600" : "text-emerald-600"}
                    >
                      {log.durationSeconds}s
                    </span>
                  </td>
                  <td className="p-2.5">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        log.status === "Converted to Request"
                          ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
                          : log.status === "In Progress"
                            ? "bg-sky-500/15 text-sky-700 dark:text-sky-400"
                            : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {log.status}
                    </span>
                  </td>
                  <td className="p-2.5 font-mono font-bold text-primary">
                    {log.createdTicketId ? (
                      <span
                        className="underline cursor-pointer"
                        onClick={() =>
                          onNavigateToScreen &&
                          onNavigateToScreen("O1-SCR-TRX-01", log.createdTicketId)
                        }
                      >
                        {log.createdTicketId}
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
