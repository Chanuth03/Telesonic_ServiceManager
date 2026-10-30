/**
 * Secure Login API Route & Authentication Handler
 *
 * Implements:
 * 1. Email check via Prisma PostgreSQL database
 * 2. Bcrypt password comparison (protection against timing attacks & injection)
 * 3. Secure JWT token issuance with userId, email, and role (ADMIN / TECHNICIAN)
 * 4. Token validation and profile response for Frontend (Lovable UI)
 */

import { prisma } from "./prisma";
import bcrypt from "bcryptjs";
import jwt from "./jwt";

const JWT_SECRET =
  (typeof process !== "undefined" && process.env?.JWT_SECRET) ||
  "super_secret_telesonic_jwt_key_2026_xyz";

export interface JwtPayloadData {
  userId: string;
  email: string;
  role: "ADMIN" | "TECHNICIAN";
  iat?: number;
  exp?: number;
}

export interface LoginResponseSuccess {
  success: true;
  message: string;
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: "ADMIN" | "TECHNICIAN";
  };
}

export interface LoginResponseError {
  success?: false;
  error: string;
}

/**
 * Handle POST /api/auth/login and /api/login
 */
export async function handleLoginRequest(request: Request): Promise<Response> {
  const headers = new Headers({
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  });

  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers });
  }

  try {
    let body: { email?: string; password?: string };
    try {
      body = await request.json();
    } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON in request body" }), {
        status: 400,
        headers,
      });
    }

    const { email, password } = body;

    if (!email || !password) {
      return new Response(JSON.stringify({ error: "Email and password are required" }), {
        status: 400,
        headers,
      });
    }

        // 1. Check if user exists in PostgreSQL database
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user) {
      return new Response(JSON.stringify({ error: "Invalid Email or Password" }), {
        status: 401,
        headers,
      });
    }

    // 2. Check if account is active
    if (user.status && user.status.toLowerCase() === "inactive") {
      return new Response(
        JSON.stringify({ error: "Your account is deactivated. Please contact an administrator." }),
        { status: 403, headers }
      );
    }

    // 3. Bcrypt password comparison against hashed password in database
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return new Response(JSON.stringify({ error: "Invalid Email or Password" }), {
        status: 401,
        headers,
      });
    }

    // 4. Fetch assigned role and its permissions from system_roles table
    let rolePermissions: string[] = [];
    const roleRecord = await prisma.systemRole.findUnique({
      where: { code: user.role.toUpperCase().trim() },
    });

    if (roleRecord && roleRecord.permissions) {
      try {
        if (roleRecord.permissions.startsWith("[") || roleRecord.permissions.startsWith("{")) {
          const parsed = JSON.parse(roleRecord.permissions);
          rolePermissions = Array.isArray(parsed) ? parsed : Object.keys(parsed);
        } else {
          rolePermissions = roleRecord.permissions.split(",").map((p) => p.trim()).filter(Boolean);
        }
      } catch {
        rolePermissions = roleRecord.permissions.split(",").map((p) => p.trim()).filter(Boolean);
      }
    } else if (user.role.toUpperCase() === "ADMIN") {
      rolePermissions = ["ALL"];
    }

    // 5. Issue JWT Token with permissions
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
        permissions: rolePermissions,
      },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    // 6. Return user profile with permissions
    const responsePayload = {
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        permissions: rolePermissions,
      },
    };

    return new Response(JSON.stringify(responsePayload), {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error("[Auth Login Error]:", error);
    return new Response(JSON.stringify({ error: "Something went wrong on the server" }), {
      status: 500,
      headers,
    });
  }
}

/**
 * Verify JWT token helper
 */
export function verifyJwtToken(token: string): JwtPayloadData | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayloadData;
  } catch {
    return null;
  }
}

/**
 * GET /api/auth/session — confirm a bearer token with the server.
 * Used when the device is online so a stored token is not trusted on its own.
 */
export async function handleSessionRequest(request: Request): Promise<Response> {
  const headers = new Headers({
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  });

  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers });
  }

  const header = request.headers.get("Authorization") || "";
  const token = header.toLowerCase().startsWith("bearer ") ? header.slice(7).trim() : "";
  const payload = verifyJwtToken(token);
  const userId = Number(payload?.userId);

  if (!payload || !Number.isFinite(userId)) {
    return new Response(JSON.stringify({ success: false, error: "Unauthorized" }), {
      status: 401,
      headers,
    });
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || (user.status && user.status.toLowerCase() === "inactive")) {
    return new Response(JSON.stringify({ success: false, error: "Unauthorized" }), {
      status: 401,
      headers,
    });
  }

  return new Response(
    JSON.stringify({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    }),
    { status: 200, headers },
  );
}
