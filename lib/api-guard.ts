// lib/api-guard.ts
// 🔐 Production-grade API route protection utilities
// Layer 3: API-level role-based access control

import "server-only";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// 🔹 Type: API authorization result
export type ApiAuthResult =
  | { ok: true; userId: string; role: "ADMIN" | "USER" }
  | { ok: false; status: 401 | 403; message: string };

// ✅ Protect API route - require ADMIN role
export async function protectAdminApi(): Promise<ApiAuthResult> {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return { ok: false, status: 401, message: "Unauthorized: No session" };
  }

  if (session.user.status !== "ACTIVE") {
    return {
      ok: false,
      status: 403,
      message: `Forbidden: User status is ${session.user.status}`,
    };
  }

  if (session.user.role !== "ADMIN") {
    return {
      ok: false,
      status: 403,
      message: "Forbidden: Admin role required",
    };
  }

  return { ok: true, userId: session.user.id, role: "ADMIN" };
}

// ✅ Protect API route - require USER role
export async function protectUserApi(): Promise<ApiAuthResult> {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return { ok: false, status: 401, message: "Unauthorized: No session" };
  }

  if (session.user.status !== "ACTIVE") {
    return {
      ok: false,
      status: 403,
      message: `Forbidden: User status is ${session.user.status}`,
    };
  }

  return { ok: true, userId: session.user.id, role: session.user.role };
}

// ✅ Protect API route - require specific role
export async function protectApiRoute(
  requiredRole: "ADMIN" | "USER"
): Promise<ApiAuthResult> {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return { ok: false, status: 401, message: "Unauthorized: No session" };
  }

  if (session.user.status !== "ACTIVE") {
    return {
      ok: false,
      status: 403,
      message: `Forbidden: User status is ${session.user.status}`,
    };
  }

  if (session.user.role !== requiredRole) {
    return {
      ok: false,
      status: 403,
      message: `Forbidden: ${requiredRole} role required`,
    };
  }

  return { ok: true, userId: session.user.id, role: requiredRole };
}

// 🔹 Helper: Return JSON error response
export function apiError(status: 400 | 401 | 403 | 404, message: string) {
  return NextResponse.json({ error: message }, { status });
}

// 🔹 Helper: Return JSON success response
export function apiSuccess<T>(data: T, status: number = 200) {
  return NextResponse.json(data, { status });
}
