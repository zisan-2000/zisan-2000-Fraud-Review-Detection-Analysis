// app/api/admin/users/route.ts
// 🔐 Layer 3: API-level role-based access control
// ADMIN-only endpoints for user management

import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { protectAdminApi, apiError, apiSuccess } from "@/lib/api-guard";

export const runtime = "nodejs";

const createUserSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  role: z.enum(["ADMIN", "USER"]).optional(),
});

// ✅ GET /api/admin/users - List all users (ADMIN only)
export async function GET() {
  // 🔐 Layer 3: API protection - require ADMIN role
  const auth = await protectAdminApi();
  if (!auth.ok) {
    return apiError(auth.status, auth.message);
  }

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

  return apiSuccess(users);
}

// ✅ POST /api/admin/users - Create or get user (ADMIN only)
export async function POST(req: Request) {
  // 🔐 Layer 3: API protection - require ADMIN role
  const auth = await protectAdminApi();
  if (!auth.ok) {
    return apiError(auth.status, auth.message);
  }

  const json = await req.json().catch(() => null);
  const parsed = createUserSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const email = parsed.data.email;
  const role = parsed.data.role ?? "USER";

  const existingUser = await prisma.user.findUnique({
    where: { email },
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

  if (existingUser) {
    return apiSuccess(existingUser);
  }

  const user = await prisma.user.create({
    data: {
      email,
      role,
      status: "PENDING",
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

  return apiSuccess(user, 201);
}
