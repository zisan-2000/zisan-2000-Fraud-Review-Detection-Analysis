// lib/role-config.ts
// 🔐 Production-grade role-based route configuration
// Centralized configuration for all protected routes

export type UserRole = "ADMIN" | "USER";

// 🔹 Route access configuration
export const ROUTE_ACCESS_CONFIG = {
  // Public routes (no auth required)
  public: ["/", "/login", "/request-access"],

  // User routes (any authenticated user)
  user: ["/projects", "/projects/:id"],

  // Admin routes (ADMIN role only)
  admin: ["/admin", "/admin/users", "/admin/access-requests"],
} as const;

// 🔹 Check if route requires admin role
export function isAdminRoute(pathname: string): boolean {
  return ROUTE_ACCESS_CONFIG.admin.some((route) => {
    if (route.includes(":")) {
      const pattern = route.replace(/:[^/]+/g, "[^/]+");
      return new RegExp(`^${pattern}$`).test(pathname);
    }
    return pathname === route || pathname.startsWith(route + "/");
  });
}

// 🔹 Check if route requires authentication
export function isProtectedRoute(pathname: string): boolean {
  return !ROUTE_ACCESS_CONFIG.public.some((route) => {
    if (route.includes(":")) {
      const pattern = route.replace(/:[^/]+/g, "[^/]+");
      return new RegExp(`^${pattern}$`).test(pathname);
    }
    return pathname === route || pathname.startsWith(route + "/");
  });
}

// 🔹 Check if user can access route
export function canAccessRoute(
  pathname: string,
  userRole: UserRole | null
): boolean {
  // Public routes - always accessible
  if (ROUTE_ACCESS_CONFIG.public.some((route) => pathname === route)) {
    return true;
  }

  // Protected routes - require authentication
  if (!userRole) {
    return false;
  }

  // Admin routes - require ADMIN role
  if (isAdminRoute(pathname)) {
    return userRole === "ADMIN";
  }

  // User routes - any authenticated user
  return true;
}

// 🔹 Get required role for route
export function getRequiredRole(pathname: string): UserRole | null {
  if (isAdminRoute(pathname)) {
    return "ADMIN";
  }

  if (ROUTE_ACCESS_CONFIG.user.some((route) => {
    if (route.includes(":")) {
      const pattern = route.replace(/:[^/]+/g, "[^/]+");
      return new RegExp(`^${pattern}$`).test(pathname);
    }
    return pathname === route || pathname.startsWith(route + "/");
  })) {
    return "USER";
  }

  return null;
}
