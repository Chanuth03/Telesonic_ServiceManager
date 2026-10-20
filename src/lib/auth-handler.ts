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
import jwt from "jsonwebtoken";

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

    // 1. User කෙනෙක් ඉන්නවද කියලා Email එකෙන් Check කිරීම (Case-insensitive & trimmed)
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user) {
      return new Response(JSON.stringify({ error: "Invalid Email or Password" }), {
        status: 401,
        headers,
      });
    }

    // 2. Password එක නිවැරදිද කියලා Bcrypt හරහා Compare කිරීම (SQL Injection වලින් 100% ආරක්ෂිතයි)
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return new Response(JSON.stringify({ error: "Invalid Email or Password" }), {
        status: 401,
        headers,
      });
    }

    // 3. User ගේ Role එක ඇතුලත් කරලා Secure JWT Token එකක් හැදීම (Expires in 1 day)
    const token = jwt.sign({ userId: user.id, email: user.email, role: user.role }, JWT_SECRET, {
      expiresIn: "1d",
    });

    // 4. Frontend (Lovable UI) එකට අවශ්‍ය දත්ත සහ Token එක යැවීම
    const responsePayload: LoginResponseSuccess = {
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role, // ADMIN හෝ TECHNICIAN කියා ලැබෙයි
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
