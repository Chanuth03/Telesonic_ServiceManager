import { describe, it, expect } from "vitest";
import { handleLoginRequest, verifyJwtToken } from "@/lib/auth-handler";
import { prisma } from "@/lib/prisma";

describe("Secure Login API Route (PostgreSQL, Bcrypt & JWT)", () => {
  it("authenticates valid ADMIN with bcrypt and returns valid JWT token", async () => {
    const request = new Request("http://localhost:3000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "admin@telesonic.lk",
        password: "admin123",
      }),
    });

    const response = await handleLoginRequest(request);
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.message).toBe("Login successful");
    expect(typeof data.token).toBe("string");
    expect(data.user).toBeDefined();
    expect(data.user.email).toBe("admin@telesonic.lk");
    expect(data.user.role).toBe("ADMIN");

    // Verify JWT Token contents
    const decoded = verifyJwtToken(data.token);
    expect(decoded).not.toBeNull();
    expect(decoded?.email).toBe("admin@telesonic.lk");
    expect(decoded?.role).toBe("ADMIN");
    expect(decoded?.userId).toBe(data.user.id);
  });

  it("authenticates valid TECHNICIAN with bcrypt and returns valid JWT token", async () => {
    const request = new Request("http://localhost:3000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "tech@telesonic.lk",
        password: "tech123",
      }),
    });

    const response = await handleLoginRequest(request);
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.user.role).toBe("TECHNICIAN");

    const decoded = verifyJwtToken(data.token);
    expect(decoded?.role).toBe("TECHNICIAN");
  });

  it("rejects invalid password with 401 status", async () => {
    const request = new Request("http://localhost:3000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "admin@telesonic.lk",
        password: "wrong_password_999",
      }),
    });

    const response = await handleLoginRequest(request);
    expect(response.status).toBe(401);

    const data = await response.json();
    expect(data.error).toBe("Invalid Email or Password");
  });

  it("rejects non-existent email with 401 status", async () => {
    const request = new Request("http://localhost:3000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "nonexistent@company.com",
        password: "admin123",
      }),
    });

    const response = await handleLoginRequest(request);
    expect(response.status).toBe(401);

    const data = await response.json();
    expect(data.error).toBe("Invalid Email or Password");
  });

  it("rejects requests missing email or password with 400 status", async () => {
    const request = new Request("http://localhost:3000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "admin@telesonic.lk",
      }),
    });

    const response = await handleLoginRequest(request);
    expect(response.status).toBe(400);
  });
});
