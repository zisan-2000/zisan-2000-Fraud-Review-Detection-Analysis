// app/admin/access-requests/page.tsx
// 🔐 Layer 2: Server-side page protection
// This page is protected by both middleware and admin layout

import { prisma } from "@/lib/prisma";
import {
  AccessRequestsManagement,
  type AccessRequestRow,
} from "@/components/admin/access-requests-management";

export const dynamic = "force-dynamic";

export default async function AdminAccessRequestsPage() {
  // ✅ Note: Authorization is already checked by:
  // 1. middleware.ts (Layer 1: Route-level)
  // 2. app/admin/layout.tsx (Layer 2: Server-side page protection)
  // This page is only rendered if user is ADMIN

  const requests = await prisma.accessRequest.findMany({
    where: { status: "PENDING" },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      email: true,
      name: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      reviewedAt: true,
      reviewedBy: {
        select: { id: true, email: true, name: true },
      },
    },
  });

  const initialRequests: AccessRequestRow[] = requests.map((r) => ({
    ...r,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
    reviewedAt: r.reviewedAt ? r.reviewedAt.toISOString() : null,
    reviewedBy: r.reviewedBy ?? null,
  }));

  return (
    <AccessRequestsManagement
      initialRequests={initialRequests}
      statusFilter="PENDING"
    />
  );
}
