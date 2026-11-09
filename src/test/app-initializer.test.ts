import { beforeEach, describe, expect, it, vi } from "vitest";
import jwt from "@/lib/jwt";
import { isUsableJwt, resolveTechnicianStartup } from "@/lib/app-initializer";

describe("offline JWT check", () => {
  it("accepts a token that has not expired", () => {
    const token = jwt.sign({ userId: 1, email: "tech@telesonic.lk" }, "test-secret", {
      expiresIn: "1d",
    });
    expect(isUsableJwt(token)).toBe(true);
  });

  it("rejects an expired token", () => {
    const token = jwt.sign({ userId: 1, email: "tech@telesonic.lk" }, "test-secret", {
      expiresIn: -60,
    });
    expect(isUsableJwt(token)).toBe(false);
  });

  it("rejects a token that is not a JWT", () => {
    expect(isUsableJwt("session-token")).toBe(false);
    expect(isUsableJwt("")).toBe(false);
  });
});

describe("offline startup restore", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    vi.stubGlobal("navigator", { ...navigator, onLine: false });
  });

  it("restores a remembered localStorage session while offline", async () => {
    const token = jwt.sign({ userId: 42, email: "tech@telesonic.lk" }, "test-secret", {
      expiresIn: "1d",
    });
    const user = {
      id: 42,
      name: "Tech A",
      email: "tech@telesonic.lk",
      role: "TECHNICIAN",
    };
    localStorage.setItem("telesonic_remember_session", "true");
    localStorage.setItem("auth_token", token);
    localStorage.setItem("auth_user", JSON.stringify(user));

    const result = await resolveTechnicianStartup();
    expect(result.status).toBe("authenticated");
    if (result.status === "authenticated") {
      expect(result.user.email).toBe("tech@telesonic.lk");
      expect(result.remember).toBe(true);
      expect(result.offlineReady).toBe(true);
    }
  });
});
