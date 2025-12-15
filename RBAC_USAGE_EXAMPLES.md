# 🔐 RBAC Usage Examples

Complete examples for implementing role-based access control in your application.

---

## 1. Server-Side Page Protection

### Admin Page with Server-Side Guard

```typescript
// app/admin/dashboard/page.tsx
import { requireAdmin } from "@/lib/admin-guard";
import { redirect } from "next/navigation";
import { AdminDashboard } from "@/components/admin/dashboard";

export default async function AdminDashboardPage() {
  // ✅ Layer 2: Server-side authorization check
  const auth = await requireAdmin();

  if (!auth.ok) {
    redirect("/projects");
  }

  // ✅ User is ADMIN - safe to render admin content
  return <AdminDashboard />;
}
```

### User Page with User Guard

```typescript
// app/projects/page.tsx
import { requireUser } from "@/lib/admin-guard";
import { redirect } from "next/navigation";
import { ProjectsList } from "@/components/projects/projects-list";

export default async function ProjectsPage() {
  // ✅ Layer 2: Server-side authorization check
  const auth = await requireUser();

  if (!auth.ok) {
    redirect("/login");
  }

  // ✅ User is authenticated - safe to render user content
  return <ProjectsList />;
}
```

---

## 2. API Route Protection

### Admin-Only API Endpoint

```typescript
// app/api/admin/settings/route.ts
import { NextResponse } from "next/server";
import { protectAdminApi, apiError, apiSuccess } from "@/lib/api-guard";
import { prisma } from "@/lib/prisma";

export async function GET() {
  // 🔐 Layer 3: API protection - require ADMIN role
  const auth = await protectAdminApi();
  if (!auth.ok) {
    return apiError(auth.status, auth.message);
  }

  // ✅ Fetch admin settings
  const settings = await prisma.settings.findFirst();
  return apiSuccess(settings);
}

export async function POST(req: Request) {
  // 🔐 Layer 3: API protection - require ADMIN role
  const auth = await protectAdminApi();
  if (!auth.ok) {
    return apiError(auth.status, auth.message);
  }

  const data = await req.json();

  // ✅ Update admin settings
  const settings = await prisma.settings.upsert({
    where: { id: "default" },
    update: data,
    create: { id: "default", ...data },
  });

  return apiSuccess(settings);
}
```

### User-Only API Endpoint

```typescript
// app/api/projects/route.ts
import { NextResponse } from "next/server";
import { protectUserApi, apiError, apiSuccess } from "@/lib/api-guard";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  // 🔐 Layer 3: API protection - require authenticated user
  const auth = await protectUserApi();
  if (!auth.ok) {
    return apiError(auth.status, auth.message);
  }

  // ✅ Fetch user's projects
  const projects = await prisma.project.findMany({
    where: { userId: auth.userId },
    orderBy: { createdAt: "desc" },
  });

  return apiSuccess(projects);
}
```

---

## 3. UI-Level Role Checks

### Hide Admin Menu for Non-Admins

```typescript
// components/layout/navigation.tsx
"use client";

import { AdminOnly } from "@/components/auth/role-guard";
import { Link } from "next/link";

export function Navigation() {
  return (
    <nav>
      <Link href="/projects">Projects</Link>

      {/* ✅ Admin menu - hidden for non-admin users */}
      <AdminOnly>
        <Link href="/admin/users">Users</Link>
        <Link href="/admin/access-requests">Requests</Link>
        <Link href="/admin/settings">Settings</Link>
      </AdminOnly>
    </nav>
  );
}
```

### Conditional Buttons Based on Role

```typescript
// components/projects/project-card.tsx
"use client";

import { useIsAdmin } from "@/components/auth/role-guard";
import { Button } from "@/components/ui/button";

interface ProjectCardProps {
  project: {
    id: string;
    name: string;
  };
}

export function ProjectCard({ project }: ProjectCardProps) {
  const isAdmin = useIsAdmin();

  return (
    <div className="border rounded p-4">
      <h3>{project.name}</h3>

      {/* ✅ Admin-only delete button */}
      {isAdmin && (
        <Button variant="destructive" size="sm">
          Delete
        </Button>
      )}
    </div>
  );
}
```

### Show Different Content Based on Role

```typescript
// components/dashboard/dashboard.tsx
"use client";

import { useUserRole } from "@/components/auth/role-guard";
import { AdminDashboard } from "./admin-dashboard";
import { UserDashboard } from "./user-dashboard";

export function Dashboard() {
  const role = useUserRole();

  if (role === "ADMIN") {
    return <AdminDashboard />;
  }

  return <UserDashboard />;
}
```

---

## 4. Complex Authorization Scenarios

### Protect Specific Resource

```typescript
// app/api/projects/[id]/route.ts
import { protectUserApi, apiError, apiSuccess } from "@/lib/api-guard";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // 🔐 Layer 3: API protection - require authenticated user
  const auth = await protectUserApi();
  if (!auth.ok) {
    return apiError(auth.status, auth.message);
  }

  const { id } = await params;

  // ✅ Fetch project
  const project = await prisma.project.findUnique({
    where: { id },
  });

  if (!project) {
    return apiError(404, "Project not found");
  }

  // ✅ Check ownership (user can only access their own projects)
  if (project.userId !== auth.userId && auth.role !== "ADMIN") {
    return apiError(403, "You don't have access to this project");
  }

  return apiSuccess(project);
}
```

### Admin Can Override User Restrictions

```typescript
// app/api/projects/[id]/delete/route.ts
import { protectUserApi, apiError, apiSuccess } from "@/lib/api-guard";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // 🔐 Layer 3: API protection - require authenticated user
  const auth = await protectUserApi();
  if (!auth.ok) {
    return apiError(auth.status, auth.message);
  }

  const { id } = await params;

  // ✅ Fetch project
  const project = await prisma.project.findUnique({
    where: { id },
  });

  if (!project) {
    return apiError(404, "Project not found");
  }

  // ✅ Check authorization
  const isOwner = project.userId === auth.userId;
  const isAdmin = auth.role === "ADMIN";

  if (!isOwner && !isAdmin) {
    return apiError(403, "You don't have permission to delete this project");
  }

  // ✅ Delete project
  await prisma.project.delete({ where: { id } });

  return apiSuccess({ message: "Project deleted" });
}
```

---

## 5. Error Handling

### Proper Error Responses

```typescript
// app/api/admin/users/route.ts
import { protectAdminApi, apiError, apiSuccess } from "@/lib/api-guard";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  // 🔐 Layer 3: API protection
  const auth = await protectAdminApi();
  if (!auth.ok) {
    // ✅ Return proper error status
    return apiError(auth.status, auth.message);
  }

  try {
    const data = await req.json();

    // ✅ Validate input
    if (!data.email) {
      return apiError(400, "Email is required");
    }

    // ✅ Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      return apiError(400, "User already exists");
    }

    // ✅ Create user
    const user = await prisma.user.create({
      data: {
        email: data.email,
        role: data.role ?? "USER",
        status: "PENDING",
      },
    });

    return apiSuccess(user, 201);
  } catch (error) {
    console.error("Error creating user:", error);
    return apiError(500, "Internal server error");
  }
}
```

---

## 6. Session Management

### Get Current User Session

```typescript
// lib/current-user.ts
import { getCurrentUser } from "@/lib/admin-guard";

export async function getCurrentUserOrNull() {
  const auth = await getCurrentUser();
  
  if (!auth.ok) {
    return null;
  }
  
  return auth.session.user;
}
```

### Use in Page

```typescript
// app/profile/page.tsx
import { getCurrentUserOrNull } from "@/lib/current-user";

export default async function ProfilePage() {
  const user = await getCurrentUserOrNull();

  if (!user) {
    redirect("/login");
  }

  return (
    <div>
      <h1>Profile</h1>
      <p>Name: {user.name}</p>
      <p>Email: {user.email}</p>
      <p>Role: {user.role}</p>
    </div>
  );
}
```

---

## 7. Middleware Custom Logic

### Add Custom Route Protection

```typescript
// middleware.ts
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function isPublicRoute(pathname: string): boolean {
  const publicRoutes = ["/", "/login", "/request-access"];
  return publicRoutes.includes(pathname);
}

function isAdminRoute(pathname: string): boolean {
  return pathname.startsWith("/admin");
}

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  // ✅ Allow public routes
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  // ✅ Check authentication
  const sessionToken = req.cookies.get("next-auth.session-token")?.value;
  if (!sessionToken) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // ✅ Fetch session
  const session = await prisma.session.findUnique({
    where: { sessionToken },
    select: {
      expires: true,
      user: { select: { role: true, status: true } },
    },
  });

  if (!session || session.expires < new Date()) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // ✅ Check admin routes
  if (isAdminRoute(pathname) && session.user.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/projects", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/projects/:path*", "/admin/:path*"],
};
```

---

## 8. Testing RBAC

### Unit Test Example

```typescript
// __tests__/api/admin/users.test.ts
import { POST } from "@/app/api/admin/users/route";
import { getServerSession } from "next-auth";

jest.mock("next-auth");

describe("POST /api/admin/users", () => {
  it("should return 401 if not authenticated", async () => {
    (getServerSession as jest.Mock).mockResolvedValue(null);

    const req = new Request("http://localhost:3000/api/admin/users", {
      method: "POST",
      body: JSON.stringify({ email: "test@example.com" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it("should return 403 if not admin", async () => {
    (getServerSession as jest.Mock).mockResolvedValue({
      user: { id: "1", role: "USER", status: "ACTIVE" },
    });

    const req = new Request("http://localhost:3000/api/admin/users", {
      method: "POST",
      body: JSON.stringify({ email: "test@example.com" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(403);
  });

  it("should create user if admin", async () => {
    (getServerSession as jest.Mock).mockResolvedValue({
      user: { id: "1", role: "ADMIN", status: "ACTIVE" },
    });

    const req = new Request("http://localhost:3000/api/admin/users", {
      method: "POST",
      body: JSON.stringify({ email: "test@example.com" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(201);
  });
});
```

---

## 9. Common Patterns

### Pattern 1: Admin Override

```typescript
// Check if user is owner OR admin
const canModify = userId === currentUserId || userRole === "ADMIN";
```

### Pattern 2: Audit Logging

```typescript
// Log admin actions
await prisma.auditLog.create({
  data: {
    action: "USER_UPDATED",
    adminId: auth.userId,
    targetUserId: userId,
    changes: { role: "ADMIN" },
    timestamp: new Date(),
  },
});
```

### Pattern 3: Soft Delete

```typescript
// Don't delete, just mark as deleted
await prisma.user.update({
  where: { id: userId },
  data: { deletedAt: new Date() },
});
```

---

## 10. Deployment Checklist

- ✅ Set `NEXTAUTH_SECRET` in production
- ✅ Enable HTTPS only
- ✅ Set secure cookies
- ✅ Configure CORS if needed
- ✅ Add security headers
- ✅ Enable rate limiting on auth endpoints
- ✅ Monitor failed login attempts
- ✅ Set up audit logging
- ✅ Regular security audits
- ✅ Keep dependencies updated

---

## Summary

This guide covers:

✅ Server-side page protection
✅ API route protection
✅ UI-level role checks
✅ Complex authorization scenarios
✅ Error handling
✅ Session management
✅ Middleware customization
✅ Testing strategies
✅ Common patterns
✅ Deployment checklist

**All examples follow production-grade security best practices!**
