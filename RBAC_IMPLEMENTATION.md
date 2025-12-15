# 🔐 Production-Grade Role-Based Access Control (RBAC) Implementation

## Overview

This document describes the complete RBAC system implemented across **4 layers** of protection:

1. **Layer 1: Route-level protection (Middleware)**
2. **Layer 2: Server-side page protection**
3. **Layer 3: API-level role-based access control**
4. **Layer 4: UI-level role checks**

---

## Architecture

### User Roles

```typescript
type UserRole = "ADMIN" | "USER";
```

- **ADMIN**: Full access to admin pages and APIs
- **USER**: Access to user pages only

### User Status

```typescript
type UserStatus = "ACTIVE" | "PENDING" | "BLOCKED";
```

- **ACTIVE**: User can access the application
- **PENDING**: User is waiting for admin approval
- **BLOCKED**: User is blocked from accessing the application

---

## Layer 1: Route-Level Protection (Middleware)

**File**: `middleware.ts`

The middleware runs **before** any page renders and enforces:
- Session validation
- User status check (must be ACTIVE)
- Role-based route access

### How It Works

1. Check if route requires authentication
2. Verify session token exists and is not expired
3. Verify user status is ACTIVE
4. For `/admin/*` routes, verify user role is ADMIN
5. Allow or redirect request

### Protected Routes

```typescript
// Public routes (no auth required)
["/", "/login", "/request-access"]

// User routes (any authenticated user)
["/projects", "/projects/:id"]

// Admin routes (ADMIN role only)
["/admin", "/admin/users", "/admin/access-requests"]
```

### Example: Non-admin user tries to access `/admin/users`

```
1. Middleware intercepts request
2. Checks session token → ✅ Valid
3. Checks user status → ✅ ACTIVE
4. Checks route `/admin/users` → Requires ADMIN
5. Checks user role → ❌ USER (not ADMIN)
6. Redirects to `/projects`
```

---

## Layer 2: Server-Side Page Protection

**Files**:
- `app/admin/layout.tsx` - Protects all admin pages
- `lib/admin-guard.ts` - Authorization utilities

### How It Works

Each protected page calls `requireAdmin()` before rendering:

```typescript
// app/admin/users/page.tsx
import { requireAdmin } from "@/lib/admin-guard";
import { redirect } from "next/navigation";

export default async function AdminUsersPage() {
  const auth = await requireAdmin();
  
  if (!auth.ok) {
    redirect("/projects");
  }
  
  // Page content here
}
```

### Authorization Utilities

#### `requireAdmin()`
Requires ADMIN role and ACTIVE status.

```typescript
const auth = await requireAdmin();
if (!auth.ok) {
  // Handle error: auth.status (401|403), auth.message
}
// auth.session available here
```

#### `requireUser()`
Requires any authenticated user with ACTIVE status.

```typescript
const auth = await requireUser();
if (!auth.ok) {
  // Handle error
}
```

#### `requireRole(role)`
Requires specific role.

```typescript
const auth = await requireRole("ADMIN");
if (!auth.ok) {
  // Handle error
}
```

#### `getCurrentUser()`
Get current user session (with status check).

```typescript
const auth = await getCurrentUser();
if (!auth.ok) {
  // Handle error
}
```

---

## Layer 3: API-Level Role-Based Access Control

**Files**:
- `lib/api-guard.ts` - API protection utilities
- `app/api/admin/users/route.ts` - User management API
- `app/api/admin/users/[id]/route.ts` - Update user API
- `app/api/admin/access-requests/route.ts` - Access requests API
- `app/api/admin/access-requests/[id]/route.ts` - Approve/reject API

### How It Works

Each API route calls `protectAdminApi()` at the start:

```typescript
// app/api/admin/users/route.ts
import { protectAdminApi, apiError, apiSuccess } from "@/lib/api-guard";

export async function GET() {
  // 🔐 Layer 3: API protection - require ADMIN role
  const auth = await protectAdminApi();
  if (!auth.ok) {
    return apiError(auth.status, auth.message);
  }
  
  // auth.userId and auth.role available here
  // Fetch data and return
  return apiSuccess(data);
}
```

### API Protection Utilities

#### `protectAdminApi()`
Requires ADMIN role and ACTIVE status.

```typescript
const auth = await protectAdminApi();
if (!auth.ok) {
  return apiError(auth.status, auth.message);
}
// auth: { ok: true, userId: string, role: "ADMIN" }
```

#### `protectUserApi()`
Requires any authenticated user with ACTIVE status.

```typescript
const auth = await protectUserApi();
if (!auth.ok) {
  return apiError(auth.status, auth.message);
}
// auth: { ok: true, userId: string, role: "ADMIN" | "USER" }
```

#### `protectApiRoute(role)`
Requires specific role.

```typescript
const auth = await protectApiRoute("ADMIN");
if (!auth.ok) {
  return apiError(auth.status, auth.message);
}
```

#### `apiError(status, message)`
Return JSON error response.

```typescript
return apiError(401, "Unauthorized");
return apiError(403, "Forbidden");
return apiError(404, "Not found");
```

#### `apiSuccess(data, status?)`
Return JSON success response.

```typescript
return apiSuccess(users);
return apiSuccess(user, 201); // with custom status
```

---

## Layer 4: UI-Level Role Checks

**File**: `components/auth/role-guard.tsx`

UI-level checks hide/show content based on user role. **Note**: This is for UX, not security.

### Components

#### `<RoleGuard>`
Conditionally render based on role.

```typescript
import { RoleGuard } from "@/components/auth/role-guard";

<RoleGuard requiredRole="ADMIN" fallback={<p>Not authorized</p>}>
  <AdminPanel />
</RoleGuard>
```

#### `<AdminOnly>`
Shorthand for ADMIN-only content.

```typescript
import { AdminOnly } from "@/components/auth/role-guard";

<AdminOnly fallback={null}>
  <Button>Manage Users</Button>
</AdminOnly>
```

#### `<UserOnly>`
Shorthand for authenticated user content.

```typescript
import { UserOnly } from "@/components/auth/role-guard";

<UserOnly fallback={null}>
  <Button>View Projects</Button>
</UserOnly>
```

### Hooks

#### `useCanAccess(role)`
Check if user can access resource.

```typescript
const canAccess = useCanAccess("ADMIN");
if (canAccess) {
  // Show admin content
}
```

#### `useIsAdmin()`
Check if user is admin.

```typescript
const isAdmin = useIsAdmin();
```

#### `useUserRole()`
Get current user role.

```typescript
const role = useUserRole(); // "ADMIN" | "USER" | null
```

---

## Example: Complete Flow

### Scenario: User tries to access `/admin/users`

#### Step 1: Middleware (Layer 1)
```
Request: GET /admin/users
↓
Middleware checks:
  - Session token exists? ✅
  - Session expired? ❌ (valid)
  - User status ACTIVE? ✅
  - Route is /admin/* ? ✅
  - User role ADMIN? ❌ (USER)
↓
Result: Redirect to /projects
```

#### Step 2: Admin Layout (Layer 2)
```
If middleware allowed request:
↓
Admin layout calls requireAdmin()
  - Session exists? ✅
  - Status ACTIVE? ✅
  - Role ADMIN? ❌ (USER)
↓
Result: Redirect to /projects
```

#### Step 3: API Protection (Layer 3)
```
Request: GET /api/admin/users
↓
API route calls protectAdminApi()
  - Session exists? ✅
  - Status ACTIVE? ✅
  - Role ADMIN? ❌ (USER)
↓
Result: Return 403 Forbidden
```

#### Step 4: UI Checks (Layer 4)
```
Component renders:
↓
<AdminOnly>
  <Button>Manage Users</Button>
</AdminOnly>
↓
useSession() returns role: "USER"
↓
Result: Content not rendered (null fallback)
```

---

## Security Features

### 1. Defense in Depth
Multiple layers ensure even if one is bypassed, others protect:
- Middleware catches route access
- Server-side protects page rendering
- API protects data access
- UI prevents accidental clicks

### 2. Session Validation
- Session token checked in middleware
- Session expiration validated
- User status verified at every layer

### 3. Role Enforcement
- User role checked at every layer
- Cannot bypass with client-side hacks
- Server-side enforcement mandatory

### 4. Admin Self-Protection
Admins cannot remove their own admin access:

```typescript
// app/api/admin/users/[id]/route.ts
if (id === auth.userId) {
  const nextRole = role ?? auth.role;
  const nextStatus = status ?? "ACTIVE";
  if (nextRole !== "ADMIN" || nextStatus !== "ACTIVE") {
    return apiError(400, "You cannot remove your own admin access.");
  }
}
```

### 5. Session Revocation
When user role/status changes, sessions are revoked:

```typescript
// Force re-login after role change
await prisma.session.deleteMany({ where: { userId: id } });
```

---

## Implementation Checklist

- ✅ Middleware with role checks
- ✅ NextAuth callbacks with JWT token role injection
- ✅ Server-side authorization utilities
- ✅ Admin layout with server-side protection
- ✅ API route protection utilities
- ✅ UI-level role guard components
- ✅ Role-based route configuration
- ✅ Admin self-protection logic
- ✅ Session revocation on role change
- ✅ Email notifications for access decisions

---

## Testing RBAC

### Test 1: Middleware Protection
```bash
# Try to access admin page as USER
curl -H "Cookie: next-auth.session-token=..." http://localhost:3000/admin/users
# Expected: Redirect to /projects
```

### Test 2: API Protection
```bash
# Try to call admin API as USER
curl -H "Cookie: next-auth.session-token=..." http://localhost:3000/api/admin/users
# Expected: 403 Forbidden
```

### Test 3: UI Hiding
```typescript
// Admin buttons should not render for USER
// Check browser DevTools - no admin buttons in DOM
```

### Test 4: Admin Self-Protection
```bash
# Try to remove own admin access
curl -X PATCH \
  -H "Cookie: next-auth.session-token=..." \
  -H "Content-Type: application/json" \
  -d '{"role": "USER"}' \
  http://localhost:3000/api/admin/users/[admin-id]
# Expected: 400 Bad Request - "You cannot remove your own admin access."
```

---

## File Structure

```
lib/
├── admin-guard.ts          # Server-side authorization utilities
├── api-guard.ts            # API-level protection utilities
└── role-config.ts          # Role-based route configuration

components/
└── auth/
    └── role-guard.tsx      # UI-level role check components

app/
├── middleware.ts           # Layer 1: Route-level protection
├── admin/
│   ├── layout.tsx          # Layer 2: Server-side page protection
│   ├── users/
│   │   └── page.tsx
│   └── access-requests/
│       └── page.tsx
└── api/
    └── admin/
        ├── users/
        │   ├── route.ts    # Layer 3: API protection
        │   └── [id]/route.ts
        └── access-requests/
            ├── route.ts    # Layer 3: API protection
            └── [id]/route.ts
```

---

## NextAuth Configuration

**File**: `app/api/auth/[...nextauth]/route.ts`

Key callbacks:

### signIn Callback
Verifies user is in allowlist and ACTIVE:

```typescript
async signIn({ user }) {
  const dbUser = await prisma.user.findUnique({
    where: { email: user.email },
    select: { status: true, role: true },
  });
  
  if (!dbUser || dbUser.status !== "ACTIVE") {
    return `/request-access?email=${user.email}`;
  }
  
  return true;
}
```

### JWT Callback
Injects role & status into JWT token:

```typescript
async jwt({ token, user }) {
  if (user) {
    token.role = user.role;
    token.status = user.status;
  }
  return token;
}
```

### Session Callback
Attaches role & status to session:

```typescript
async session({ session, user }) {
  session.user.role = user.role;
  session.user.status = user.status;
  return session;
}
```

---

## Production Deployment

### Environment Variables
```env
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=your-secret-key
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-secret
DATABASE_URL=postgresql://...
```

### Security Headers
Add to `next.config.mjs`:

```javascript
async headers() {
  return [
    {
      source: "/:path*",
      headers: [
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "X-Frame-Options", value: "DENY" },
        { key: "X-XSS-Protection", value: "1; mode=block" },
      ],
    },
  ];
}
```

### Session Security
- Session strategy: `database` (not JWT)
- Session maxAge: 30 days
- Session updateAge: 24 hours
- HTTPS only in production
- Secure cookies enabled

---

## Troubleshooting

### Issue: User can't access admin page
1. Check middleware matcher includes `/admin/*`
2. Verify user role is ADMIN in database
3. Verify user status is ACTIVE
4. Check session is not expired

### Issue: API returns 403 Forbidden
1. Verify user role is ADMIN
2. Check user status is ACTIVE
3. Verify session token is valid
4. Check NextAuth callbacks are correct

### Issue: Admin buttons showing for non-admin users
1. Check `<AdminOnly>` component is used
2. Verify `useSession()` returns correct role
3. Check browser cache (hard refresh)
4. Verify NextAuth session callback

---

## Summary

This production-grade RBAC system provides:

✅ **4-layer protection** - Middleware, server-side, API, UI
✅ **Defense in depth** - Multiple layers catch unauthorized access
✅ **Session validation** - Token, expiration, status checked
✅ **Role enforcement** - Server-side mandatory
✅ **Admin self-protection** - Can't remove own access
✅ **Session revocation** - Force re-login on role change
✅ **Type-safe** - Full TypeScript support
✅ **Production-ready** - Enterprise-grade security

**Result**: Real production-grade authentication + authorization system ✨
