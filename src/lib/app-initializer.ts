import { apiFetch } from "@/lib/api-client";
import { isOfflineForTransactions, getOfflineAuthSession } from "@/lib/offline-db";
import {
  getSecureAuthSession,
  isWithinOfflineAccessPolicy,
  type SecureAuthSession,
} from "@/lib/secure-session-store";
import jwt from "@/lib/jwt";

export interface StoredUserProfile {
  id: string | number;
  name: string;
  email: string;
  role: string;
  title?: string;
  avatarInitials?: string;
  permissions?: string[];
  organizationId?: string;
}

export type TechnicianStartupResult =
  | {
      status: "authenticated";
      user: StoredUserProfile;
      token: string;
      remember: boolean;
      offlineReady?: boolean;
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

function profileFromSession(session: SecureAuthSession | SavedSessionLike): StoredUserProfile | null {
  const user = session.user as unknown as StoredUserProfile;
  if (user == null || user.id == null || !user.name || !user.email) return null;
  return user;
}

interface SavedSessionLike {
  token: string;
  user: Record<string, unknown>;
  rememberMe: boolean;
  savedAt: string;
  offlineExpiresAt?: string;
}

/** Prefer secure vault; fall back to sessionStorage for the active tab only. */
export function readStoredTechnicianSession(): { token: string; user: StoredUserProfile } | null {
  if (typeof window === "undefined") return null;
  try {
    const token = sessionStorage.getItem("auth_token");
    const user = parseStoredProfile(sessionStorage.getItem("auth_user"));
    if (token && user && isUsableJwt(token)) return { token, user };
  } catch {
    // ignore
  }
  return null;
}

function readSessionStorageSession(): { token: string; user: StoredUserProfile } | null {
  return readStoredTechnicianSession();
}

async function readVaultSession(): Promise<{
  token: string;
  user: StoredUserProfile;
  remember: boolean;
  session: SecureAuthSession;
} | null> {
  const secure = (await getSecureAuthSession()) || (await getOfflineAuthSession());
  if (!secure?.rememberMe) return null;
  const user = profileFromSession(secure as SecureAuthSession);
  if (!user || !secure.token) return null;
  return {
    token: secure.token,
    user,
    remember: true,
    session: secure as SecureAuthSession,
  };
}

/**
 * Offline: trust a non-expired JWT, or an expired JWT still inside the offline access grace window.
 * Online: ask /api/auth/session with a short timeout; fall back to the stored session.
 */
export async function resolveTechnicianStartup(): Promise<TechnicianStartupResult> {
  const tabSession = readSessionStorageSession();
  const vault = await readVaultSession();
  const offline = isOfflineForTransactions();

  if (offline) {
    const candidate = vault || (tabSession
      ? {
          token: tabSession.token,
          user: tabSession.user,
          remember: true,
          session: {
            token: tabSession.token,
            user: tabSession.user as unknown as Record<string, unknown>,
            rememberMe: true,
            savedAt: new Date().toISOString(),
            userId: String(tabSession.user.id),
            organizationId: tabSession.user.organizationId || "TELESONIC-DEFAULT",
          } satisfies SecureAuthSession,
        }
      : null);

    if (!candidate) return { status: "login" };

    const jwtOk = isUsableJwt(candidate.token);
    const policyOk = isWithinOfflineAccessPolicy(candidate.session, {
      offline: true,
      jwtStillValid: jwtOk,
    });
    if (!jwtOk && !policyOk) return { status: "login" };

    return {
      status: "authenticated",
      user: candidate.user,
      token: candidate.token,
      remember: candidate.remember,
      offlineReady: true,
    };
  }

  const sessionToken = tabSession?.token || vault?.token || "";
  if (!sessionToken) return { status: "login" };

  // Online but JWT expired: require re-login (offline grace does not apply while online).
  if (!isUsableJwt(sessionToken)) return { status: "login" };

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 3500);
    let response: Response;
    try {
      response = await apiFetch(
        "/api/auth/session",
        {
          method: "GET",
          headers: { Authorization: `Bearer ${sessionToken}` },
          signal: controller.signal,
        },
        { networkOnly: true },
      );
    } finally {
      clearTimeout(timer);
    }

    if (response.status === 401 || response.status === 403) return { status: "login" };

    if (!response.ok) {
      const fallbackUser = tabSession?.user || vault?.user;
      const fallbackToken = tabSession?.token || vault?.token;
      if (!fallbackUser || !fallbackToken) return { status: "login" };
      return {
        status: "authenticated",
        user: fallbackUser,
        token: fallbackToken,
        remember: !!vault,
      };
    }

    const data = (await response.json()) as {
      success?: boolean;
      token?: string;
      user?: StoredUserProfile;
    };
    if (!data.success || !data.user?.name || !data.user.email || data.user.id == null) {
      const fallbackUser = tabSession?.user || vault?.user;
      const fallbackToken = tabSession?.token || vault?.token;
      if (!fallbackUser || !fallbackToken) return { status: "login" };
      return {
        status: "authenticated",
        user: fallbackUser,
        token: fallbackToken,
        remember: !!vault,
      };
    }

    return {
      status: "authenticated",
      user: data.user,
      token: data.token || sessionToken,
      remember: !!vault || (typeof window !== "undefined" && localStorage.getItem("telesonic_remember_session") === "true"),
    };
  } catch {
    const fallbackUser = tabSession?.user || vault?.user;
    const fallbackToken = tabSession?.token || vault?.token;
    if (!fallbackUser || !fallbackToken) return { status: "login" };
    return {
      status: "authenticated",
      user: fallbackUser,
      token: fallbackToken,
      remember: !!vault,
    };
  }
}
