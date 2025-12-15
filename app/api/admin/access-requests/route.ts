// app/api/admin/access-requests/route.ts
// 🔐 Layer 3: API-level role-based access control
// ADMIN-only endpoints for access request management

import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { protectAdminApi, apiError, apiSuccess } from "@/lib/api-guard";

export const runtime = "nodejs";

const statusSchema = z.enum(["PENDING", "APPROVED", "REJECTED", "ALL"]);

// ✅ GET /api/admin/access-requests - List access requests (ADMIN only)
export async function GET(req: Request) {
  // 🔐 Layer 3: API protection - require ADMIN role
  const auth = await protectAdminApi();
  if (!auth.ok) {
    return apiError(auth.status, auth.message);
  }

  const url = new URL(req.url);
  const rawStatus = (url.searchParams.get("status") ?? "PENDING").toUpperCase();
  const parsedStatus = statusSchema.safeParse(rawStatus);
  if (!parsedStatus.success) {
    return apiError(400, "Invalid status filter");
  }

  const status = parsedStatus.data;
  const where = status === "ALL" ? undefined : { status };

  const requests = await prisma.accessRequest.findMany({
    ...(where ? { where } : {}),
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

  return apiSuccess(requests);
}
