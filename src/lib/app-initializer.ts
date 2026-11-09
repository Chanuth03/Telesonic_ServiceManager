import { apiFetch } from "@/lib/api-client";
import { isOfflineForTransactions, getOfflineAuthSession, probeBackendReachable } from "@/lib/offline-db";
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

function profileFromSession(session: {
  user: Record<string, unknown>;
}): StoredUserProfile | null {
  const user = session.user as unknown as StoredUserProfile;
  if (user == null || user.id == null || !user.name || !user.email) return null;
  return user;
}

function readRememberFlag(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem("telesonic_remember_session") === "true";
  } catch {
    return false;
  }
}

/** Tab session first, then durable localStorage mirror (survives phone restart). */
export function readStoredTechnicianSession(): { token: string; user: StoredUserProfile } | null {
  if (typeof window === "undefined") return null;
  try {
    const sessionToken = sessionStorage.getItem("auth_token");
    const sessionUser = parseStoredProfile(sessionStorage.getItem("auth_user"));
    if (sessionToken && sessionUser && isUsableJwt(sessionToken)) {
      return { token: sessionToken, user: sessionUser };
    }

    if (!readRememberFlag()) return null;
    const localToken = localStorage.getItem("auth_token");
    const localUser = parseStoredProfile(localStorage.getItem("auth_user"));
    if (localToken && localUser && isUsableJwt(localToken)) {
      return { token: localToken, user: localUser };
    }
    // Expired token still useful offline — return it; caller applies offline policy.
    if (localToken && localUser && localToken.split(".").length === 3) {
      return { token: localToken, user: localUser };
    }
  } catch {
    // ignore
  }
  return null;
}

async function readVaultSession(): Promise<{
  token: string;
  user: StoredUserProfile;
  remember: boolean;
  session: SecureAuthSession;
} | null> {
  try {
    const secure = (await getSecureAuthSession()) || (await getOfflineAuthSession());
    if (!secure?.rememberMe) return null;
    const user = profileFromSession(secure);
    if (!user || !secure.token) return null;
    return {
      token: secure.token,
      user,
      remember: true,
      session: secure as SecureAuthSession,
    };
  } catch {
    return null;
  }
}

function toSecureSessionShape(input: {
  token: string;
  user: StoredUserProfile;
  savedAt?: string;
}): SecureAuthSession {
  return {
    token: input.token,
    user: input.user as unknown as Record<string, unknown>,
    rememberMe: true,
    savedAt: input.savedAt || new Date().toISOString(),
    userId: String(input.user.id),
    organizationId: input.user.organizationId || "TELESONIC-DEFAULT",
  };
}

/**
 * Offline / unreachable backend: trust remembered session (vault or local mirror).
 * Online: validate with /api/auth/session; fall back to stored session on network errors.
 */
export async function resolveTechnicianStartup(): Promise<TechnicianStartupResult> {
  const durable = readStoredTechnicianSession();
  const vault = await readVaultSession();
  const deviceOffline = isOfflineForTransactions();

  // Some phones keep navigator.onLine=true under Airplane Mode briefly.
  // If we already have a remembered session, probe quickly; on failure use offline path.
  let treatAsOffline = deviceOffline;
  if (!treatAsOffline && (vault || durable || readRememberFlag())) {
    const reachable = await probeBackendReachable(2000);
    if (!reachable) treatAsOffline = true;
  }

  if (treatAsOffline) {
    const candidate = vault
      ? vault
      : durable
        ? {
            token: durable.token,
            user: durable.user,
            remember: true,
            session: toSecureSessionShape(durable),
          }
        : null;

    // Last resort: remembered profile without a readable token still opens the app offline.
    if (!candidate && readRememberFlag()) {
      const rememberedUser = parseStoredProfile(
        typeof window !== "undefined" ? localStorage.getItem("auth_user") : null,
      );
      if (rememberedUser) {
        return {
          status: "authenticated",
          user: rememberedUser,
          token: sessionStorage.getItem("auth_token") || "offline-session",
          remember: true,
          offlineReady: true,
        };
      }
    }

    if (!candidate) return { status: "login" };

    const jwtOk = isUsableJwt(candidate.token);
    const policyOk = isWithinOfflineAccessPolicy(candidate.session, {
      offline: true,
      jwtStillValid: jwtOk,
    });
    // Offline: accept valid JWT, grace-period expired JWT, or any remembered JWT-shaped token.
    if (!jwtOk && !policyOk && candidate.token.split(".").length !== 3) {
      return { status: "login" };
    }

    return {
      status: "authenticated",
      user: candidate.user,
      token: candidate.token,
      remember: true,
      offlineReady: true,
    };
  }

  const sessionToken = durable?.token || vault?.token || "";
  if (!sessionToken || sessionToken === "offline-session") {
    // No usable online token — if remember flag exists try vault/local once more for login page skip
    if (vault && isUsableJwt(vault.token)) {
      return {
        status: "authenticated",
        user: vault.user,
        token: vault.token,
        remember: true,
      };
    }
    return { status: "login" };
  }

  if (!isUsableJwt(sessionToken)) {
    // Online + expired → must re-login (cannot refresh offline grace while truly online)
    return { status: "login" };
  }

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

    const fallbackUser = durable?.user || vault?.user;
    const fallbackToken = durable?.token || vault?.token;

    if (!response.ok) {
      if (!fallbackUser || !fallbackToken) return { status: "login" };
      return {
        status: "authenticated",
        user: fallbackUser,
        token: fallbackToken,
        remember: !!vault || readRememberFlag(),
      };
    }

    const data = (await response.json()) as {
      success?: boolean;
      token?: string;
      user?: StoredUserProfile;
    };
    if (!data.success || !data.user?.name || !data.user.email || data.user.id == null) {
      if (!fallbackUser || !fallbackToken) return { status: "login" };
      return {
        status: "authenticated",
        user: fallbackUser,
        token: fallbackToken,
        remember: !!vault || readRememberFlag(),
      };
    }

    return {
      status: "authenticated",
      user: data.user,
      token: data.token || sessionToken,
      remember: !!vault || readRememberFlag(),
    };
  } catch {
    const fallbackUser = durable?.user || vault?.user;
    const fallbackToken = durable?.token || vault?.token;
    if (!fallbackUser || !fallbackToken) return { status: "login" };
    return {
      status: "authenticated",
      user: fallbackUser,
      token: fallbackToken,
      remember: !!vault || readRememberFlag(),
    };
  }
}
