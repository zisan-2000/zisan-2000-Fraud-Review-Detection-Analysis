# 🔐 RBAC Quick Reference

Fast lookup for implementing role-based access control.

---

## 4-Layer Protection Overview

| Layer | Location | When | Protection |
|-------|----------|------|-----------|
| 1️⃣ **Middleware** | `middleware.ts` | Before page render | Route access, session validation |
| 2️⃣ **Server-Side** | `app/*/layout.tsx`, `app/*/page.tsx` | Page render | Authorization check, redirect |
| 3️⃣ **API** | `app/api/*/route.ts` | API call | Role verification, data access |
| 4️⃣ **UI** | Components | Client render | Hide/show content, UX |

---

## Quick Start

### 1. Protect Admin Page

```typescript
// app/admin/users/page.tsx
import { requireAdmin } from "@/lib/admin-guard";
import { redirect } from "next/navigation";

export default async function AdminUsersPage() {
  const auth = await requireAdmin();
  if (!auth.ok) redirect("/projects");
  
  return <UserManagement />;
}
```

### 2. Protect API Route

```typescript
// app/api/admin/users/route.ts
import { protectAdminApi, apiError, apiSuccess } from "@/lib/api-guard";

export async function GET() {
  const auth = await protectAdminApi();
  if (!auth.ok) return apiError(auth.status, auth.message);
  
  const users = await prisma.user.findMany();
  return apiSuccess(users);
}
```

### 3. Hide UI for Non-Admins

```typescript
// components/admin-menu.tsx
import { AdminOnly } from "@/components/auth/role-guard";

export function AdminMenu() {
  return (
    <AdminOnly>
      <Link href="/admin/users">Users</Link>
    </AdminOnly>
  );
}
```

---

## Authorization Functions

### Server-Side (lib/admin-guard.ts)

```typescript
// Require ADMIN role
const auth = await requireAdmin();

// Require any authenticated user
const auth = await requireUser();

// Require specific role
const auth = await requireRole("ADMIN");

// Get current user
const auth = await getCurrentUser();

// Check result
if (!auth.ok) {
  // auth.status: 401 | 403
  // auth.message: error message
} else {
  // auth.session: NextAuth session
}
```

### API-Level (lib/api-guard.ts)

```typescript
// Require ADMIN role
const auth = await protectAdminApi();

// Require any authenticated user
const auth = await protectUserApi();

// Require specific role
const auth = await protectApiRoute("ADMIN");

// Check result
if (!auth.ok) {
  return apiError(auth.status, auth.message);
} else {
  // auth.userId: string
  // auth.role: "ADMIN" | "USER"
}
```

### UI-Level (components/auth/role-guard.tsx)

```typescript
// Component: Show for ADMIN only
<AdminOnly fallback={null}>
  <Button>Delete</Button>
</AdminOnly>

// Component: Show for authenticated users
<UserOnly fallback={null}>
  <Button>Save</Button>
</UserOnly>

// Hook: Check if admin
const isAdmin = useIsAdmin();

// Hook: Get user role
const role = useUserRole(); // "ADMIN" | "USER" | null

// Hook: Check access
const canAccess = useCanAccess("ADMIN");
```

---

## Response Helpers

### API Success

```typescript
// Return data with 200 status
return apiSuccess(data);

// Return data with custom status
return apiSuccess(data, 201);
```

### API Error

```typescript
// 401 Unauthorized
return apiError(401, "No session");

// 403 Forbidden
return apiError(403, "Admin role required");

// 404 Not Found
return apiError(404, "User not found");

// 400 Bad Request
return apiError(400, "Invalid input");
```

---

## Common Scenarios

### Scenario 1: Admin-Only Page

```typescript
// app/admin/dashboard/page.tsx
import { requireAdmin } from "@/lib/admin-guard";
import { redirect } from "next/navigation";

export default async function AdminDashboard() {
  const auth = await requireAdmin();
  if (!auth.ok) redirect("/projects");
  
  return <Dashboard />;
}
```

### Scenario 2: User-Owned Resource

```typescript
// app/api/projects/[id]/route.ts
import { protectUserApi, apiError, apiSuccess } from "@/lib/api-guard";

export async function GET(req, { params }) {
  const auth = await protectUserApi();
  if (!auth.ok) return apiError(auth.status, auth.message);
  
  const project = await prisma.project.findUnique({
    where: { id: params.id },
  });
  
  // User can access own projects, admins can access all
  if (project.userId !== auth.userId && auth.role !== "ADMIN") {
    return apiError(403, "Access denied");
  }
  
  return apiSuccess(project);
}
```

### Scenario 3: Conditional UI

```typescript
// components/project-card.tsx
"use client";

import { useIsAdmin } from "@/components/auth/role-guard";

export function ProjectCard({ project }) {
  const isAdmin = useIsAdmin();
  
  return (
    <div>
      <h3>{project.name}</h3>
      {isAdmin && <Button>Delete</Button>}
    </div>
  );
}
```

---

## Error Handling

### Redirect on Unauthorized

```typescript
const auth = await requireAdmin();
if (!auth.ok) {
  redirect("/projects"); // Server-side redirect
}
```

### Return Error Response

```typescript
const auth = await protectAdminApi();
if (!auth.ok) {
  return apiError(auth.status, auth.message); // JSON error
}
```

### Conditional Rendering

```typescript
<AdminOnly fallback={<p>Not authorized</p>}>
  <AdminPanel />
</AdminOnly>
```

---

## Middleware Configuration

```typescript
// middleware.ts
export const config = {
  matcher: ["/projects/:path*", "/admin/:path*"],
};
```

Protects:
- `/projects/*` - User routes
- `/admin/*` - Admin routes

---

## NextAuth Types

```typescript
// next-auth.d.ts
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "ADMIN" | "USER";
      status: "ACTIVE" | "PENDING" | "BLOCKED";
    } & DefaultSession["user"];
  }

  interface User {
    role: "ADMIN" | "USER";
    status: "ACTIVE" | "PENDING" | "BLOCKED";
  }
}
```

---

## Database Schema

```prisma
model User {
  id     String  @id @default(cuid())
  email  String  @unique
  role   Role    @default(USER)
  status UserStatus @default(PENDING)
  // ... other fields
}

enum Role {
  ADMIN
  USER
}

enum UserStatus {
  ACTIVE
  PENDING
  BLOCKED
}
```

---

## File Checklist

- ✅ `middleware.ts` - Layer 1: Route protection
- ✅ `lib/admin-guard.ts` - Layer 2: Server-side auth
- ✅ `lib/api-guard.ts` - Layer 3: API protection
- ✅ `lib/role-config.ts` - Route configuration
- ✅ `components/auth/role-guard.tsx` - Layer 4: UI checks
- ✅ `app/admin/layout.tsx` - Admin layout protection
- ✅ `app/api/auth/[...nextauth]/route.ts` - NextAuth config
- ✅ `next-auth.d.ts` - Type definitions

---

## Testing Commands

```bash
# Test middleware protection
curl -H "Cookie: next-auth.session-token=invalid" \
  http://localhost:3000/admin/users

# Test API protection
curl -H "Cookie: next-auth.session-token=invalid" \
  http://localhost:3000/api/admin/users

# Test with valid session
curl -H "Cookie: next-auth.session-token=valid-token" \
  http://localhost:3000/api/admin/users
```

---

## Security Checklist

- ✅ Session validation in middleware
- ✅ User status check (ACTIVE required)
- ✅ Role verification at every layer
- ✅ Admin self-protection logic
- ✅ Session revocation on role change
- ✅ Server-side enforcement mandatory
- ✅ Type-safe implementation
- ✅ Error handling with proper status codes

---

## Common Mistakes to Avoid

❌ **Don't**: Trust client-side role checks for security
✅ **Do**: Always verify role on server/API

❌ **Don't**: Skip middleware protection
✅ **Do**: Use middleware as first line of defense

❌ **Don't**: Forget to check user status
✅ **Do**: Verify status is ACTIVE at every layer

❌ **Don't**: Allow admins to remove their own access
✅ **Do**: Add self-protection logic

❌ **Don't**: Keep old sessions after role change
✅ **Do**: Revoke sessions on role/status change

---

## Production Deployment

```env
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=your-secret-key
DATABASE_URL=postgresql://...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
```

---

## Support Files

- 📖 `RBAC_IMPLEMENTATION.md` - Complete documentation
- 📚 `RBAC_USAGE_EXAMPLES.md` - Detailed examples
- ⚡ `RBAC_QUICK_REFERENCE.md` - This file

---

**Status**: ✅ Production-Grade RBAC Implemented
