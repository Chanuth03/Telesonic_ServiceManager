import { apiFetch } from "@/lib/api-client";
import { isOfflineForTransactions } from "@/lib/offline-db";
import jwt from "@/lib/jwt";

export interface StoredUserProfile {
  id: string | number;
  name: string;
  email: string;
  role: string;
  title?: string;
  avatarInitials?: string;
  permissions?: string[];
}

export type TechnicianStartupResult =
  | {
      status: "authenticated";
      user: StoredUserProfile;
      token: string;
      remember: boolean;
    }
  | { status: "login" };

export function isUsableJwt(token: string | null | undefined): boolean {
  if (!token || token.split(".").length !== 3) return false;
  const payload = jwt.decode<{ exp?: number }>(token);
  if (!payload) return false;
  if (typeof payload.exp === "number" && payload.exp <= Math.floor(Date.now() / 1000)) {
    return false;
  }
  return true;
}

function parseStoredProfile(raw: string | null): StoredUserProfile | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as StoredUserProfile;
    if (parsed == null || parsed.id == null || !parsed.name || !parsed.email) return null;
    return parsed;
  } catch {
    return null;
  }
}

/** JWT plus technician profile saved by "Keep me signed in". */
export function readStoredTechnicianSession(): { token: string; user: StoredUserProfile } | null {
  if (typeof window === "undefined") return null;
  try {
    const token = localStorage.getItem("auth_token");
    const user = parseStoredProfile(localStorage.getItem("auth_user"));
    if (!token || !user || !isUsableJwt(token)) return null;
    return { token, user };
  } catch {
    return null;
  }
}

/**
 * Offline: trust a non-expired JWT and profile already in localStorage.
 * Online: ask /api/auth/session to confirm that token with the server.
 * If the server cannot be reached, fall back to the stored session.
 */
export async function resolveTechnicianStartup(): Promise<TechnicianStartupResult> {
  const stored = readStoredTechnicianSession();

  if (isOfflineForTransactions()) {
    if (!stored) return { status: "login" };
    return { status: "authenticated", user: stored.user, token: stored.token, remember: true };
  }

  const sessionToken =
    (typeof window !== "undefined" ? sessionStorage.getItem("auth_token") : null) || stored?.token || "";
  if (!isUsableJwt(sessionToken)) return { status: "login" };

  try {
    const response = await apiFetch(
      "/api/auth/session",
      {
        method: "GET",
        headers: { Authorization: `Bearer ${sessionToken}` },
      },
      { networkOnly: true },
    );

    if (response.status === 401 || response.status === 403) return { status: "login" };

    if (!response.ok) {
      if (!stored) return { status: "login" };
      return { status: "authenticated", user: stored.user, token: stored.token, remember: true };
    }

    const data = (await response.json()) as {
      success?: boolean;
      token?: string;
      user?: StoredUserProfile;
    };
    if (!data.success || !data.user?.name || !data.user.email || data.user.id == null) {
      return { status: "login" };
    }

    const remember =
      typeof window !== "undefined" && localStorage.getItem("telesonic_remember_session") === "true";
    return {
      status: "authenticated",
      user: data.user,
      token: data.token || sessionToken,
      remember,
    };
  } catch {
    if (!stored) return { status: "login" };
    return { status: "authenticated", user: stored.user, token: stored.token, remember: true };
  }
}
