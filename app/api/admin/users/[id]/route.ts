// app/api/admin/users/[id]/route.ts
// 🔐 Layer 3: API-level role-based access control
// ADMIN-only endpoint for updating user role/status

import { NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { protectAdminApi, apiError, apiSuccess } from "@/lib/api-guard";

export const runtime = "nodejs";

const updateUserSchema = z
  .object({
    role: z.enum(["ADMIN", "USER"]).optional(),
    status: z.enum(["ACTIVE", "PENDING", "BLOCKED"]).optional(),
  })
  .refine((data) => data.role || data.status, {
    message: "At least one of role or status is required",
  });

// ✅ PATCH /api/admin/users/[id] - Update user role/status (ADMIN only)
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  // 🔐 Layer 3: API protection - require ADMIN role
  const auth = await protectAdminApi();
  if (!auth.ok) {
    return apiError(auth.status, auth.message);
  }

  const { id } = await params;
  const json = await req.json().catch(() => null);
  const parsed = updateUserSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { role, status } = parsed.data;

  // 🔒 Prevent admin from removing their own admin access
  if (id === auth.userId) {
    const nextRole = role ?? auth.role;
    const nextStatus = status ?? "ACTIVE";
    if (nextRole !== "ADMIN" || nextStatus !== "ACTIVE") {
      return apiError(400, "You cannot remove your own admin access.");
    }
  }

  const shouldRevokeSessions = Boolean(role) || (status && status !== "ACTIVE");

  try {
    const updatedUser = await prisma.$transaction(async (tx) => {
      const user = await tx.user.update({
        where: { id },
        data: {
          ...(role ? { role } : {}),
          ...(status ? { status } : {}),
        },
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

      if (shouldRevokeSessions) {
        await tx.session.deleteMany({ where: { userId: id } });
      }

      return user;
    });

    return apiSuccess(updatedUser);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        return apiError(404, "User not found");
      }
    }
    throw error;
  }
}
