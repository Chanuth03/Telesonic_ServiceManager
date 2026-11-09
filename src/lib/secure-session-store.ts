/**
 * Encrypted session vault for authentication credentials.
 *
 * Tokens are NEVER stored in plain localStorage or Dexie.
 * Uses a dedicated IndexedDB database + Web Crypto AES-GCM with a
 * non-extractable device key (best available browser-side secure storage
 * without a native keychain plugin).
 */

const VAULT_DB = "TelesonicSecureVault";
const VAULT_VERSION = 1;
const STORE_KEYS = "keys";
const STORE_SECRETS = "secrets";
const DEVICE_KEY_ID = "device-aes-key";
const SESSION_SECRET_ID = "auth-session";

/** Offline access policy: allow expired JWT for this many seconds while device is offline. */
export const OFFLINE_SESSION_GRACE_SECONDS = 7 * 24 * 60 * 60; // 7 days

export interface SecureAuthSession {
  token: string;
  user: Record<string, unknown>;
  rememberMe: boolean;
  savedAt: string;
  userId: string;
  organizationId: string;
  offlineExpiresAt?: string;
}

function openVault(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("IndexedDB unavailable"));
      return;
    }
    const req = indexedDB.open(VAULT_DB, VAULT_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_KEYS)) {
        db.createObjectStore(STORE_KEYS, { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains(STORE_SECRETS)) {
        db.createObjectStore(STORE_SECRETS, { keyPath: "id" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error || new Error("Failed to open secure vault"));
  });
}

function idbGet<T>(db: IDBDatabase, store: string, key: string): Promise<T | undefined> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, "readonly");
    const req = tx.objectStore(store).get(key);
    req.onsuccess = () => resolve(req.result as T | undefined);
    req.onerror = () => reject(req.error);
  });
}

function idbPut(db: IDBDatabase, store: string, value: unknown): Promise<void> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, "readwrite");
    tx.objectStore(store).put(value);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

function idbDelete(db: IDBDatabase, store: string, key: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, "readwrite");
    tx.objectStore(store).delete(key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function getOrCreateDeviceKey(db: IDBDatabase): Promise<CryptoKey> {
  const existing = await idbGet<{ id: string; key: CryptoKey }>(db, STORE_KEYS, DEVICE_KEY_ID);
  if (existing?.key) return existing.key;

  const key = await crypto.subtle.generateKey({ name: "AES-GCM", length: 256 }, false, [
    "encrypt",
    "decrypt",
  ]);
  await idbPut(db, STORE_KEYS, { id: DEVICE_KEY_ID, key });
  return key;
}

function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
}

async function encryptPayload(key: CryptoKey, plaintext: string): Promise<{ iv: number[]; cipher: number[] }> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(plaintext);
  const cipherBuf = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, encoded);
  return {
    iv: Array.from(iv),
    cipher: Array.from(new Uint8Array(cipherBuf)),
  };
}

async function decryptPayload(
  key: CryptoKey,
  iv: number[],
  cipher: number[],
): Promise<string> {
  const plainBuf = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: toArrayBuffer(new Uint8Array(iv)) },
    key,
    toArrayBuffer(new Uint8Array(cipher)),
  );
  return new TextDecoder().decode(plainBuf);
}

export async function saveSecureAuthSession(session: SecureAuthSession): Promise<void> {
  if (typeof window === "undefined" || !window.crypto?.subtle) {
    throw new Error("Secure storage requires Web Crypto");
  }
  const db = await openVault();
  try {
    const key = await getOrCreateDeviceKey(db);
    const encrypted = await encryptPayload(key, JSON.stringify(session));
    await idbPut(db, STORE_SECRETS, {
      id: SESSION_SECRET_ID,
      ...encrypted,
      updatedAt: Date.now(),
    });
  } finally {
    db.close();
  }
}

export async function getSecureAuthSession(): Promise<SecureAuthSession | null> {
  if (typeof window === "undefined" || !window.crypto?.subtle) return null;
  try {
    const db = await openVault();
    try {
      const row = await idbGet<{ id: string; iv: number[]; cipher: number[] }>(
        db,
        STORE_SECRETS,
        SESSION_SECRET_ID,
      );
      if (!row?.iv || !row?.cipher) return null;
      const key = await getOrCreateDeviceKey(db);
      const json = await decryptPayload(key, row.iv, row.cipher);
      const parsed = JSON.parse(json) as SecureAuthSession;
      if (!parsed?.token || !parsed?.user) return null;
      return parsed;
    } finally {
      db.close();
    }
  } catch (err) {
    console.error("[SecureVault] Failed to read session:", err);
    return null;
  }
}

export async function clearSecureAuthSession(): Promise<void> {
  if (typeof window === "undefined") return;
  try {
    const db = await openVault();
    try {
      await idbDelete(db, STORE_SECRETS, SESSION_SECRET_ID);
    } finally {
      db.close();
    }
  } catch {
    // ignore
  }
}

/** Active-tab memory only — never persist the raw token here long-term. */
export function setActiveSessionMemory(token: string, userJson: string): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem("auth_token", token);
    sessionStorage.setItem("auth_user", userJson);
  } catch {
    // ignore
  }
}

export function clearActiveSessionMemory(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem("auth_token");
    sessionStorage.removeItem("auth_user");
    sessionStorage.removeItem("mobile_authenticated");
    sessionStorage.removeItem("mobile_tech_id");
    sessionStorage.removeItem("app_user_role");
  } catch {
    // ignore
  }
}

/**
 * Strip legacy plaintext tokens from localStorage after migrating to the vault.
 * Keeps non-secret flags (remember preference) only.
 */
export function scrubPlaintextAuthFromLocalStorage(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem("auth_token");
    // Keep auth_user profile JSON for fast UI restore is discouraged; remove token only.
    // Profile is restored from the secure vault.
  } catch {
    // ignore
  }
}

export function computeOfflineExpiry(savedAtIso: string): string {
  const base = Date.parse(savedAtIso) || Date.now();
  return new Date(base + OFFLINE_SESSION_GRACE_SECONDS * 1000).toISOString();
}

export function isWithinOfflineAccessPolicy(
  session: SecureAuthSession | null,
  opts: { offline: boolean; jwtStillValid: boolean },
): boolean {
  if (!session?.rememberMe || !session.token) return false;
  if (opts.jwtStillValid) return true;
  if (!opts.offline) return false;
  const expires = session.offlineExpiresAt
    ? Date.parse(session.offlineExpiresAt)
    : Date.parse(session.savedAt) + OFFLINE_SESSION_GRACE_SECONDS * 1000;
  return Number.isFinite(expires) && Date.now() <= expires;
}
