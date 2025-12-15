// app/admin/users/page.tsx
// 🔐 Layer 2: Server-side page protection
// This page is protected by both middleware and admin layout

import { prisma } from "@/lib/prisma";
import { UserManagement } from "@/components/admin/user-management";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  // ✅ Note: Authorization is already checked by:
  // 1. middleware.ts (Layer 1: Route-level)
  // 2. app/admin/layout.tsx (Layer 2: Server-side page protection)
  // This page is only rendered if user is ADMIN

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  const initialUsers = users.map((u) => ({
    ...u,
    createdAt: u.createdAt.toISOString(),
    updatedAt: u.updatedAt.toISOString(),
  }));

  return <UserManagement initialUsers={initialUsers} />;
}

