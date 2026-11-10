import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/prisma", () => ({ prisma: {} }));

import {
  getDatasetState,
  isRequiredDataReady,
  syncOfflineData,
} from "@/lib/offline-sync/engine";
import {
  getCachedMasterOptions,
  offlineDB,
  putSyncMetadata,
  setBackendReachable,
} from "@/lib/offline-db";
import { getMobileNotifications, getStockCountItems } from "@/lib/mobile-data";

const auth = { token: "hdr.payload.sig", userId: "42", organizationId: "TELESONIC-DEFAULT" };

const serverJob = {
  id: "SC-TEST-1",
  customerName: "Alpha Co",
  town: "Kandy",
  window: "Today",
  priority: "High",
  role: "Lead Technician",
  status: "Assigned",
  category: "Service Call",
  siteAddress: "Kandy",
  technicianName: "Tech A",
  scheduledDate: "2026-11-10",
};

let requests: string[] = [];

function mockServer(overrides: { vanStock?: unknown[] | null } = {}) {
  requests = [];
  vi.stubGlobal(
    "fetch",
    vi.fn(async (input: RequestInfo | URL) => {
      const url = new URL(String(input));
      requests.push(`${url.pathname}${url.search}`);
      const json = (body: unknown) =>
        new Response(JSON.stringify(body), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      if (url.pathname === "/api/mobile/bootstrap") {
        return json({
          serverTime: "2026-11-10T07:00:00.000Z",
          jobs: [serverJob],
          notifications: [
            { id: "N-SRV-1", title: "Server notice", message: "m", time: "now", read: false, type: "system" },
            { id: "N-SRV-2", title: "Second", message: "m", time: "now", read: false, type: "system" },
          ],
          vanStock:
            overrides.vanStock === undefined
              ? [
                  {
                    sku: "SKU-SRV-1",
                    name: "Server part",
                    category: "Electrical",
                    binLocation: "Bin Z",
                    systemQty: 4,
                    countedQty: 4,
                    unitPrice: 100,
                  },
                ]
              : overrides.vanStock,
        });
      }
      if (url.pathname === "/api/service-requests/master-options") {
        return json({ options: { customers: ["Alpha Co"], technicians: ["Tech A"] } });
      }
      return json({ records: [] });
    }),
  );
}

describe("offline sync engine", () => {
  beforeEach(async () => {
    setBackendReachable(null);
    await offlineDB.open();
    await Promise.all([
      offlineDB.jobs.clear(),
      offlineDB.notifications.clear(),
      offlineDB.stockCount.clear(),
      offlineDB.syncQueue.clear(),
      offlineDB.masterData.clear(),
      offlineDB.syncMetadata.clear(),
      offlineDB.offlineMeta.clear(),
    ]);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("downloads every required dataset without visiting any screen", async () => {
    mockServer();
    const summary = await syncOfflineData({
      reason: "test",
      scope: "required",
      pushFirst: false,
      auth,
    });

    expect(summary.requiredReady).toBe(true);
    expect(await offlineDB.jobs.get("SC-TEST-1")).toBeTruthy();
    expect((await offlineDB.notifications.toArray()).map((n) => n.id)).toContain("N-SRV-1");
    expect((await offlineDB.stockCount.toArray()).map((s) => s.sku)).toEqual(["SKU-SRV-1"]);
    expect(await getCachedMasterOptions("42")).toMatchObject({ customers: ["Alpha Co"] });
    expect(await isRequiredDataReady("42")).toBe(true);

    // Screens read memory stores, which must already hold the downloaded data.
    expect(getStockCountItems().map((s) => s.sku)).toEqual(["SKU-SRV-1"]);
    expect(getMobileNotifications().some((n) => n.id === "N-SRV-1")).toBe(true);
  });

  it("does not call the APIs again while data is still fresh", async () => {
    mockServer();
    await syncOfflineData({ reason: "first", scope: "required", pushFirst: false, auth });
    await new Promise((resolve) => setTimeout(resolve, 20));
    const firstCount = requests.length;

    const second = await syncOfflineData({
      reason: "second",
      scope: "required",
      pushFirst: false,
      auth,
    });
    expect(requests.length).toBe(firstCount);
    expect(second.skipped).toEqual(expect.arrayContaining(["mobile-core", "master-options"]));
  });

  it("asks only for changes once data is stale", async () => {
    mockServer();
    await putSyncMetadata(
      "dataset:mobile-core:42",
      {
        ok: true,
        lastSyncedAt: "2020-01-01T00:00:00.000Z",
        serverTime: "2026-11-09T00:00:00.000Z",
        count: 1,
      },
      "42",
    );
    await syncOfflineData({ reason: "stale", scope: "required", pushFirst: false, auth });
    const bootstrapCall = requests.find((r) => r.startsWith("/api/mobile/bootstrap"));
    expect(bootstrapCall).toContain("since=2026-11-09T00%3A00%3A00.000Z");
    const state = await getDatasetState("mobile-core", "42");
    expect(state?.serverTime).toBe("2026-11-10T07:00:00.000Z");
  });

  it("keeps local notification reads/deletes and unsent stock counts", async () => {
    await offlineDB.notifications.bulkPut([
      { id: "N-SRV-1", title: "Server notice", message: "m", time: "now", read: true, type: "system" },
    ]);
    await offlineDB.offlineMeta.put({
      key: "deleted_notification_ids",
      value: ["N-SRV-2"],
      updatedAt: Date.now(),
    });
    await offlineDB.stockCount.put({
      sku: "SKU-LOCAL",
      name: "Local count",
      category: "Electrical",
      binLocation: "Bin A",
      systemQty: 1,
      countedQty: 0,
      unitPrice: 1,
      updatedAt: Date.now(),
    });
    await offlineDB.syncQueue.add({
      action: "GENERIC_UPDATE",
      entityId: "STOCK-COUNT-1",
      payload: { type: "STOCK_COUNT" },
      createdAt: Date.now(),
      status: "pending",
    });

    mockServer();
    await syncOfflineData({ reason: "merge", scope: "required", pushFirst: false, auth });

    const notifications = await offlineDB.notifications.toArray();
    expect(notifications.find((n) => n.id === "N-SRV-1")?.read).toBe(true);
    expect(notifications.some((n) => n.id === "N-SRV-2")).toBe(false);
    expect((await offlineDB.stockCount.toArray()).map((s) => s.sku)).toEqual(["SKU-LOCAL"]);
  });

  it("marks data not ready when the server is unreachable, keeping the app usable", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new TypeError("Network request failed");
      }),
    );
    const summary = await syncOfflineData({
      reason: "down",
      scope: "required",
      pushFirst: false,
      auth,
    });
    expect(summary.requiredReady).toBe(false);
    expect(summary.failed).toEqual(expect.arrayContaining(["mobile-core", "master-options"]));
  });
});
