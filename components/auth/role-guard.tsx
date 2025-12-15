"use client";

import { useSession } from "next-auth/react";
import type React from "react";

interface RoleGuardProps {
  children: React.ReactNode;
  requiredRole?: "ADMIN" | "USER";
  fallback?: React.ReactNode;
}

function hasAccess(userRole: "ADMIN" | "USER", requiredRole: "ADMIN" | "USER") {
  if (requiredRole === "USER") {
    // ADMIN can access USER content
    return userRole === "USER" || userRole === "ADMIN";
  }
  // ADMIN content
  return userRole === "ADMIN";
}

export function RoleGuard({
  children,
  requiredRole = "USER",
  fallback = null,
}: RoleGuardProps) {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return null;
  }

  if (!session?.user) {
    return <>{fallback}</>;
  }

  if (!hasAccess(session.user.role, requiredRole)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

export function AdminOnly({
  children,
  fallback = null,
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  return (
    <RoleGuard requiredRole="ADMIN" fallback={fallback}>
      {children}
    </RoleGuard>
  );
}

export function UserOnly({
  children,
  fallback = null,
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  return (
    <RoleGuard requiredRole="USER" fallback={fallback}>
      {children}
    </RoleGuard>
  );
}

export function useCanAccess(requiredRole: "ADMIN" | "USER"): boolean {
  const { data: session, status } = useSession();

  if (status === "loading" || !session?.user) {
    return false;
  }

  return hasAccess(session.user.role, requiredRole);
}

export function useIsAdmin(): boolean {
  const { data: session, status } = useSession();

  if (status === "loading" || !session?.user) {
    return false;
  }

  return session.user.role === "ADMIN";
}

export function useUserRole(): "ADMIN" | "USER" | null {
  const { data: session, status } = useSession();

  if (status === "loading" || !session?.user) {
    return null;
  }

  return session.user.role;
}
