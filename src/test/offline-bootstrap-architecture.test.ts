import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  cacheMasterOptionsForUser,
  cacheUserProfileLocally,
  getCachedMasterOptions,
  getDexieTransactionsForScreen,
  getPendingTransactionRecords,
  isOfflineBootstrapComplete,
  offlineDB,
  putSyncMetadata,
  saveOfflineTransaction,
  syncPendingOfflineTransactions,
} from "@/lib/offline-db";
import {
  clearSecureAuthSession,
  getSecureAuthSession,
  isWithinOfflineAccessPolicy,
  saveSecureAuthSession,
  computeOfflineExpiry,
} from "@/lib/secure-session-store";

describe("login-based offline-first architecture", () => {
  beforeEach(async () => {
    await offlineDB.open();
    await Promise.all([
      offlineDB.transactions.clear(),
      offlineDB.transactionItems.clear(),
      offlineDB.syncQueue.clear(),
      offlineDB.users.clear(),
      offlineDB.organizations.clear(),
      offlineDB.roles.clear(),
      offlineDB.permissions.clear(),
      offlineDB.configurations.clear(),
      offlineDB.masterData.clear(),
      offlineDB.syncMetadata.clear(),
    ]);
    await clearSecureAuthSession();
    sessionStorage.clear();
    localStorage.clear();
  });

  it("stores credentials in encrypted vault, not localStorage", async () => {
    await saveSecureAuthSession({
      token: "hdr.payload.sig",
      user: { id: "42", name: "Tech A", email: "a@telesonic.lk", role: "TECHNICIAN" },
      rememberMe: true,
      savedAt: new Date().toISOString(),
      userId: "42",
      organizationId: "TELESONIC-DEFAULT",
      offlineExpiresAt: computeOfflineExpiry(new Date().toISOString()),
    });

    expect(localStorage.getItem("auth_token")).toBeNull();
    const session = await getSecureAuthSession();
    expect(session?.token).toBe("hdr.payload.sig");
    expect(session?.userId).toBe("42");
  });

  it("caches profile, roles, permissions and master data for offline use", async () => {
    await cacheUserProfileLocally({
      id: "42",
      email: "a@telesonic.lk",
      name: "Tech A",
      role: "TECHNICIAN",
      permissions: ["JOBS_ASSIGNED", "PWA_OFFLINE"],
    });
    await cacheMasterOptionsForUser("42", "TELESONIC-DEFAULT", {
      customers: ["Alpha Co"],
      technicians: ["Tech A"],
    });
    await putSyncMetadata(`bootstrap:42`, { complete: true }, "42", "TELESONIC-DEFAULT");

    expect(await offlineDB.users.get("42")).toBeTruthy();
    expect(await offlineDB.roles.where("userId").equals("42").count()).toBe(1);
    expect(await offlineDB.permissions.where("userId").equals("42").count()).toBe(2);
    expect(await getCachedMasterOptions("42")).toMatchObject({ customers: ["Alpha Co"] });
    expect(await isOfflineBootstrapComplete("42")).toBe(true);
  });

  it("saves five offline transactions as PENDING and keeps them after reopen", async () => {
    sessionStorage.setItem(
      "auth_user",
      JSON.stringify({ id: "42", name: "Tech A", email: "a@telesonic.lk", role: "TECHNICIAN" }),
    );

    for (let i = 1; i <= 5; i++) {
      await saveOfflineTransaction({
        code: "TRX-01",
        storageKey: "telesonic_trx_TRX-01",
        recordRef: `SR-OFF-${i}`,
        apiPath: "/api/service-requests",
        payload: {
          requestNo: `SR-OFF-${i}`,
          status: "Draft",
          data: { tabDatasets: { parts: [{ item: `Part-${i}`, qty: 1 }] } },
        },
      });
    }

    const listed = await getDexieTransactionsForScreen("TRX-01");
    expect(listed).toHaveLength(5);
    expect(listed.every((row) => row["_syncStatus"] === "pending")).toBe(true);
    expect(await offlineDB.transactionItems.count()).toBe(5);

    offlineDB.close();
    await offlineDB.open();

    const afterRestart = await getPendingTransactionRecords("42");
    expect(afterRestart).toHaveLength(5);
    expect(afterRestart.every((row) => row.syncStatus === "pending")).toBe(true);
  });

  it("syncs five PENDING rows to SYNCED once with idempotency (no duplicates)", async () => {
    sessionStorage.setItem(
      "auth_user",
      JSON.stringify({ id: "42", name: "Tech A", email: "a@telesonic.lk", role: "TECHNICIAN" }),
    );

    for (let i = 1; i <= 5; i++) {
      await saveOfflineTransaction({
        code: "TRX-01",
        storageKey: "telesonic_trx_TRX-01",
        recordRef: `SR-SYNC-${i}`,
        apiPath: "/api/service-requests",
        payload: { requestNo: `SR-SYNC-${i}`, status: "Draft" },
      });
    }

    const seenKeys = new Set<string>();
    const apiFetchImpl = async (_url: string, init?: RequestInit) => {
      const headers = new Headers(init?.headers);
      const key = headers.get("Idempotency-Key") || "";
      expect(seenKeys.has(key)).toBe(false);
      seenKeys.add(key);
      return new Response(
        JSON.stringify({ success: true, record: { id: `SRV-${seenKeys.size}`, requestNo: `SR-SYNC-${seenKeys.size}` } }),
        { status: 200 },
      );
    };

    const originalFetch = globalThis.fetch;
    globalThis.fetch = (async () => new Response("{}", { status: 200 })) as typeof fetch;

    const first = await syncPendingOfflineTransactions(apiFetchImpl);
    expect(first.synced).toBe(5);
    expect(first.failed).toBe(0);
    expect(seenKeys.size).toBe(5);

    const second = await syncPendingOfflineTransactions(apiFetchImpl);
    expect(second.synced).toBe(0);
    expect(seenKeys.size).toBe(5);

    const pending = await getPendingTransactionRecords("42");
    expect(pending).toHaveLength(0);
    const all = await offlineDB.transactions.toArray();
    expect(all.every((row) => row.syncStatus === "synced")).toBe(true);
    expect(all.every((row) => !!row.serverId)).toBe(true);

    globalThis.fetch = originalFetch;
  });

  it("applies offline access policy for expired tokens while offline", () => {
    const savedAt = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString();
    const session = {
      token: "x.y.z",
      user: { id: "42" },
      rememberMe: true,
      savedAt,
      userId: "42",
      organizationId: "TELESONIC-DEFAULT",
      offlineExpiresAt: computeOfflineExpiry(savedAt),
    };
    expect(
      isWithinOfflineAccessPolicy(session, { offline: true, jwtStillValid: false }),
    ).toBe(true);
    expect(
      isWithinOfflineAccessPolicy(session, { offline: false, jwtStillValid: false }),
    ).toBe(false);
  });

  it("uses exponential backoff after failed sync attempts", async () => {
    sessionStorage.setItem(
      "auth_user",
      JSON.stringify({ id: "42", name: "Tech A", email: "a@telesonic.lk", role: "TECHNICIAN" }),
    );
    await saveOfflineTransaction({
      code: "TRX-01",
      storageKey: "telesonic_trx_TRX-01",
      recordRef: "SR-FAIL-1",
      apiPath: "/api/service-requests",
      payload: { requestNo: "SR-FAIL-1" },
    });

    const originalFetch = globalThis.fetch;
    globalThis.fetch = (async () => new Response("{}", { status: 200 })) as typeof fetch;

    const failingFetch = vi.fn(async () => new Response("nope", { status: 500 }));
    const result = await syncPendingOfflineTransactions(failingFetch);
    expect(result.failed).toBe(1);

    const row = await offlineDB.transactions.get("TRX-01::SR-FAIL-1");
    expect(row?.syncStatus).toBe("failed");
    expect(row?.retryCount).toBe(1);
    expect(typeof row?.nextRetryAt).toBe("number");
    expect((row?.nextRetryAt || 0) > Date.now()).toBe(true);

    // Immediate retry should skip due to backoff window
    const skipped = await getPendingTransactionRecords("42");
    expect(skipped).toHaveLength(0);

    globalThis.fetch = originalFetch;
  });
});
