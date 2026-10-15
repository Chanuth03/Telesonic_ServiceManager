import React, { useState } from "react";
import {
  Cpu,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Code,
  FileCode,
  Layers,
  ArrowRight,
  Database,
  Radio,
  Smartphone,
  Eye,
  Check,
} from "lucide-react";
import { DASHBOARD_SCREENS_LIST, INTEGRATION_QUEUE_DATA } from "@/data/dashboardSpecData";
import { DashboardScreenHeader } from "./DashboardScreenHeader";

export const IntegrationQueueScreen: React.FC = () => {
  const meta = DASHBOARD_SCREENS_LIST.find((s) => s.code === "DSH-05")!;
  const [items, setItems] = useState(INTEGRATION_QUEUE_DATA);
  const [selectedChannel, setSelectedChannel] = useState("All");
  const [activePayloadItem, setActivePayloadItem] = useState<
    (typeof INTEGRATION_QUEUE_DATA)[0] | null
  >(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSyncingAll, setIsSyncingAll] = useState(false);

  const channels = ["All", "SAP B1 DI Server", "Dialog SMS Gateway", "Field Mobile Sync API"];

  const filteredItems = items.filter((item) => {
    if (selectedChannel === "All") return true;
    return item.interface.toLowerCase().includes(selectedChannel.toLowerCase());
  });

  const handleRetryItem = (msgId: string) => {
    setItems((prev) =>
      prev.map((i) =>
        i.messageId === msgId ? { ...i, status: "Retrying", attempts: i.attempts + 1 } : i,
      ),
    );
    setToastMessage(`Dispatched re-try payload for ${msgId} to interface queue.`);
    setTimeout(() => {
      setItems((prev) =>
        prev.map((i) => (i.messageId === msgId ? { ...i, status: "Resolved" } : i)),
      );
      setToastMessage(`Message ${msgId} synchronized successfully with SAP B1.`);
      setTimeout(() => setToastMessage(null), 3000);
    }, 1500);
  };

  const handleResyncAll = () => {
    setIsSyncingAll(true);
    setTimeout(() => {
      setIsSyncingAll(false);
      setItems((prev) => prev.map((i) => ({ ...i, status: "Resolved", attempts: i.attempts + 1 })));
      setToastMessage("All integration queues successfully flushed and synchronized.");
      setTimeout(() => setToastMessage(null), 4000);
    }, 1200);
  };

  return (
    <section id="screen-dsh-05" className="scroll-mt-28">
      <DashboardScreenHeader
        meta={meta}
        icon={Cpu}
        tone="bg-indigo-50 text-indigo-600 dark:bg-indigo-950/70 dark:text-indigo-400"
        badgeExtra="DI Server Monitor"
      />

      {toastMessage && (
        <div className="mb-4 p-3 rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 text-xs font-semibold flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-xs hover:text-foreground cursor-pointer font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Interface Channels Health Status Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
        <div className="p-4 rounded-xl border border-border bg-card shadow-2xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-950/70 text-blue-600 flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-foreground">SAP B1 DI Server</h4>
              <span className="text-[11px] text-muted-foreground">HTTP Port 8080 · TLS 1.3</span>
            </div>
          </div>
          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 dark:bg-rose-950 border border-rose-200">
            3 In Queue
          </span>
        </div>

        <div className="p-4 rounded-xl border border-border bg-card shadow-2xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/70 text-emerald-600 flex items-center justify-center">
              <Radio className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-foreground">Dialog SMS Gateway</h4>
              <span className="text-[11px] text-muted-foreground">REST API · SSL Verified</span>
            </div>
          </div>
          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 dark:bg-amber-950 border border-amber-200">
            1 Retrying
          </span>
        </div>

        <div className="p-4 rounded-xl border border-border bg-card shadow-2xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-50 dark:bg-purple-950/70 text-purple-600 flex items-center justify-center">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-foreground">Mobile Offline Sync API</h4>
              <span className="text-[11px] text-muted-foreground">WebSocket · Real-time</span>
            </div>
          </div>
          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950 border border-emerald-200">
            Healthy
          </span>
        </div>
      </div>

      {/* Main Error Queue Container */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-2xs mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-base font-bold text-foreground">
              Integration Exception & Error Queue
            </h3>
            <p className="text-xs text-muted-foreground">
              Monitor failed payloads, XML validation rejections, and trigger automated reprocess
              routines.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleResyncAll}
              disabled={isSyncingAll}
              className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors disabled:opacity-60"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncingAll ? "animate-spin" : ""}`} />
              <span>{isSyncingAll ? "Syncing..." : "Re-sync All Queues"}</span>
            </button>
          </div>
        </div>

        {/* Filter channel pills */}
        <div className="flex flex-wrap items-center gap-1.5 mb-4 overflow-x-auto pb-1">
          {channels.map((ch) => (
            <button
              key={ch}
              onClick={() => setSelectedChannel(ch)}
              className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-colors cursor-pointer whitespace-nowrap ${
                selectedChannel === ch
                  ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                  : "bg-muted/70 text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              {ch}
            </button>
          ))}
        </div>

        {/* Error Queue Table */}
        <div className="overflow-x-auto border border-border rounded-xl">
          <table className="w-full text-xs text-left">
            <thead className="bg-muted/60 text-muted-foreground font-semibold border-b border-border">
              <tr>
                <th className="py-2.5 px-3 font-mono">Message ID</th>
                <th className="py-2.5 px-3">Target Interface</th>
                <th className="py-2.5 px-3">Document Reference</th>
                <th className="py-2.5 px-3">Error Diagnosis / Exception</th>
                <th className="py-2.5 px-3 text-center">Attempts</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-3">Queue Age</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredItems.map((item) => (
                <tr key={item.messageId} className="hover:bg-muted/40 transition-colors">
                  <td className="py-3 px-3 font-mono font-bold text-primary whitespace-nowrap">
                    {item.messageId}
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    <span className="font-semibold text-foreground">{item.interface}</span>
                  </td>
                  <td className="py-3 px-3 font-mono font-medium text-foreground whitespace-nowrap">
                    {item.document}
                  </td>
                  <td className="py-3 px-3 max-w-xs">
                    <span className="text-rose-600 dark:text-rose-400 font-medium leading-snug block">
                      {item.error}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center font-mono">
                    <span className="px-2 py-0.5 rounded bg-muted text-muted-foreground">
                      {item.attempts} / 5
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        item.status === "In Error Queue"
                          ? "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-200 border border-rose-300"
                          : item.status === "Retrying"
                            ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200 border border-amber-300"
                            : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200 border border-emerald-300"
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono text-muted-foreground whitespace-nowrap">
                    {item.age}
                  </td>
                  <td className="py-3 px-3 text-right whitespace-nowrap">
                    <div className="inline-flex items-center gap-1.5">
                      <button
                        onClick={() => handleRetryItem(item.messageId)}
                        disabled={item.status === "Resolved"}
                        className="px-2.5 py-1 text-xs font-semibold rounded-md bg-primary hover:bg-primary/90 text-primary-foreground transition-colors cursor-pointer disabled:opacity-40"
                      >
                        Retry
                      </button>
                      <button
                        onClick={() => setActivePayloadItem(item)}
                        className="p-1 rounded-md border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                        title="Inspect raw XML/JSON payload"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Raw Payload Inspector Modal */}
      {activePayloadItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-2xl rounded-2xl border border-border bg-card p-6 shadow-2xl">
            <div className="flex items-start justify-between pb-4 border-b border-border">
              <div>
                <span className="font-mono text-xs font-bold text-primary">
                  {activePayloadItem.messageId}
                </span>
                <h3 className="text-lg font-bold text-foreground mt-0.5">
                  Integration Payload & Exception Inspector
                </h3>
                <span className="text-xs text-muted-foreground font-mono">
                  {activePayloadItem.interface} · {activePayloadItem.document}
                </span>
              </div>
              <button
                onClick={() => setActivePayloadItem(null)}
                className="text-muted-foreground hover:text-foreground text-sm font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="my-4 space-y-3">
              <div>
                <label className="text-xs font-bold text-rose-600 block mb-1">
                  Exception Diagnostics:
                </label>
                <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-xs text-rose-800 dark:text-rose-200 font-mono">
                  {activePayloadItem.error}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">
                  Raw DI-API SOAP / JSON Payload Body:
                </label>
                <pre className="p-3.5 rounded-lg bg-muted text-foreground font-mono text-[11px] overflow-x-auto max-h-56 leading-relaxed border border-border">
                  {`<?xml version="1.0" encoding="UTF-8"?>
<env:Envelope xmlns:env="http://schemas.xmlsoap.org/soap/envelope/">
  <env:Header>
    <SessionID>SAP-SESSION-9918274</SessionID>
  </env:Header>
  <env:Body>
    <dis:PostDocument xmlns:dis="http://www.sap.com/SBO/DIS">
      <DocType>dDocument_ServiceCall</DocType>
      <DocRef>${activePayloadItem.document}</DocRef>
      <Branch>Colombo HQ (Branch-01)</Branch>
      <PostingDate>2026-10-14T09:30:00Z</PostingDate>
      <Status>Pending</Status>
      <ErrorCode>TIMEOUT_10005</ErrorCode>
    </dis:PostDocument>
  </env:Body>
</env:Envelope>`}
                </pre>
              </div>
            </div>

            <div className="pt-3 border-t border-border flex items-center justify-between">
              <span className="text-[11px] text-muted-foreground">
                Payload captured by DI Server Gateway
              </span>
              <button
                onClick={() => {
                  handleRetryItem(activePayloadItem.messageId);
                  setActivePayloadItem(null);
                }}
                className="px-4 py-2 text-xs font-bold rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer"
              >
                Re-submit to SAP B1 Now
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
