import { beforeEach, describe, expect, it } from "vitest";
import { resetMobileMemoryStores, updateJobPartsList, updateMobileJobStatus } from "@/lib/mobile-data";
import {
  resetMobileOfflineBridgeForTests,
  startMobileOfflineBridge,
} from "@/lib/mobile-offline-bridge";
import { getDexieJobById, getUnsyncedDexieRecords, offlineDB } from "@/lib/offline-db";

async function flushSaves() {
  await new Promise((resolve) => setTimeout(resolve, 40));
}

describe("mobile offline bridge", () => {
  beforeEach(async () => {
    resetMobileOfflineBridgeForTests();
    resetMobileMemoryStores();
    await offlineDB.jobs.clear();
    await offlineDB.syncQueue.clear();
    await offlineDB.stockCount.clear();
    await offlineDB.notifications.clear();
  });

  it("keeps an accepted job on the device until it can be uploaded", async () => {
    await startMobileOfflineBridge();
    updateMobileJobStatus("SC-2026-20511", "Accepted");
    await flushSaves();

    const saved = await getDexieJobById("SC-2026-20511");
    expect(saved?.status).toBe("Accepted");
    expect(saved?.syncStatus).toBe("pending");

    const unsynced = await getUnsyncedDexieRecords();
    expect(unsynced.queueItems.some((item) => item.entityId === "SC-2026-20511")).toBe(true);
  });

  it("keeps parts used on the device after the technician saves them", async () => {
    await startMobileOfflineBridge();
    updateJobPartsList("SC-2026-20511", [
      {
        id: "PART-TEST-1",
        partCode: "SKU-1",
        name: "Filter",
        category: "Filters",
        unitPrice: 10,
        availableStock: 2,
        qtyUsed: 1,
        qtyReturned: 0,
      },
    ]);
    await flushSaves();

    const saved = await getDexieJobById("SC-2026-20511");
    expect(saved?.parts?.[0]?.name).toBe("Filter");
    expect(saved?.syncStatus).toBe("pending");
  });
});
