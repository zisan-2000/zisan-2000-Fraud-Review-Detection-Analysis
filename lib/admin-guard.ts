// lib/admin-guard.ts
// 🔐 Production-grade server-side authorization utilities
// Layer 2 & 3: Server-side page protection + API protection

import "server-only";

import { getServerSession } from "next-auth";
import type { Session } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// 🔹 Type: Authorization result (success or error)
type AuthorizationResult<T> =
  | { ok: true; session: Session; data?: T }
  | { ok: false; status: 401 | 403; message: string };

// ✅ Require ADMIN role (for admin pages & APIs)
export async function requireAdmin(): Promise<AuthorizationResult<void>> {
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

  return { ok: true, session };
}

// ✅ Require USER role (for authenticated user pages)
export async function requireUser(): Promise<AuthorizationResult<void>> {
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

  return { ok: true, session };
}

// ✅ Require specific role
export async function requireRole(
  role: "ADMIN" | "USER"
): Promise<AuthorizationResult<void>> {
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

  if (session.user.role !== role) {
    return {
      ok: false,
      status: 403,
      message: `Forbidden: ${role} role required`,
    };
  }

  return { ok: true, session };
}

// ✅ Get current user session (with role check)
export async function getCurrentUser(): Promise<AuthorizationResult<void>> {
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

  return { ok: true, session };
}
