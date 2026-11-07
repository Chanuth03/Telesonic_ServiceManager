import { beforeEach, describe, expect, it } from "vitest";
import {
  getDexieTransactionsForScreen,
  getPendingTransactionRecords,
  offlineDB,
  saveOfflineTransaction,
  syncPendingOfflineTransactions,
} from "@/lib/offline-db";

describe("offline Dexie transactions (Airplane Mode safe)", () => {
  beforeEach(async () => {
    await offlineDB.open();
    await offlineDB.transactions.clear();
    await offlineDB.syncQueue.clear();
  });

  it("stores every save in IndexedDB before any API call and keeps it after reload", async () => {
    const first = await saveOfflineTransaction({
      code: "TRX-01",
      storageKey: "telesonic_trx_TRX-01",
      recordRef: "SR-1001",
      apiPath: "/api/service-requests",
      payload: { requestNo: "SR-1001", status: "Draft", customerName: "Alpha" },
    });

    expect(first.syncStatus).toBe("pending");
    expect(first.idempotencyKey).toContain("SR-1001");

    const listed = await getDexieTransactionsForScreen("TRX-01", "telesonic_trx_TRX-01");
    expect(listed).toHaveLength(1);
    expect(listed[0]?.["requestNo"] || listed[0]?.["recordNo"]).toBe("SR-1001");

    // Simulate app restart: reopen DB and read again
    offlineDB.close();
    await offlineDB.open();
    const afterRestart = await getDexieTransactionsForScreen("TRX-01");
    expect(afterRestart).toHaveLength(1);
    expect(String(afterRestart[0]?.["status"])).toBe("Draft");
  });

  it("updates the same record on edit (stable id) instead of duplicating", async () => {
    await saveOfflineTransaction({
      code: "TRX-01",
      storageKey: "telesonic_trx_TRX-01",
      recordRef: "SR-2002",
      apiPath: "/api/service-requests",
      payload: { requestNo: "SR-2002", status: "Draft" },
    });
    await saveOfflineTransaction({
      code: "TRX-01",
      storageKey: "telesonic_trx_TRX-01",
      recordRef: "SR-2002",
      apiPath: "/api/service-requests",
      payload: { requestNo: "SR-2002", status: "Submitted" },
    });

    const listed = await getDexieTransactionsForScreen("TRX-01");
    expect(listed).toHaveLength(1);
    expect(String(listed[0]?.["status"])).toBe("Submitted");
    expect(await offlineDB.transactions.count()).toBe(1);
  });

  it("syncs pending rows exactly once with idempotency key", async () => {
    await saveOfflineTransaction({
      code: "TRX-01",
      storageKey: "telesonic_trx_TRX-01",
      recordRef: "SR-3003",
      apiPath: "/api/service-requests",
      payload: { requestNo: "SR-3003", status: "Draft" },
    });

    const seenKeys: string[] = [];
    const apiFetchImpl = async (_url: string, init?: RequestInit) => {
      const headers = new Headers(init?.headers);
      seenKeys.push(headers.get("Idempotency-Key") || "");
      return new Response(JSON.stringify({ success: true }), { status: 200 });
    };

    // Force probe by stubbing fetch used inside probe — syncPendingOfflineTransactions
    // probes via window.fetch; in vitest jsdom, navigator.onLine is usually true.
    const originalFetch = globalThis.fetch;
    globalThis.fetch = (async () => new Response("{}", { status: 401 })) as typeof fetch;

    const first = await syncPendingOfflineTransactions(apiFetchImpl);
    expect(first.synced).toBe(1);
    expect(seenKeys).toHaveLength(1);

    const second = await syncPendingOfflineTransactions(apiFetchImpl);
    expect(second.synced).toBe(0);
    expect(seenKeys).toHaveLength(1);

    const pending = await getPendingTransactionRecords();
    expect(pending).toHaveLength(0);

    globalThis.fetch = originalFetch;
  });
});
