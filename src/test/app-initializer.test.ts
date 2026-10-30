import { describe, expect, it } from "vitest";
import jwt from "@/lib/jwt";
import { isUsableJwt } from "@/lib/app-initializer";

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
