// app/api/admin/access-requests/[id]/route.ts
// 🔐 Layer 3: API-level role-based access control
// ADMIN-only endpoints for approving/rejecting access requests

import { NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { protectAdminApi, apiError, apiSuccess } from "@/lib/api-guard";
import {
  buildAccessApprovedEmail,
  buildAccessRejectedEmail,
  safeSendEmail,
} from "@/lib/mailer";

export const runtime = "nodejs";

const actionSchema = z.object({
  action: z.enum(["APPROVE", "REJECT"]),
});

const accessRequestSelect = {
  id: true,
  email: true,
  name: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  reviewedAt: true,
  reviewedBy: { select: { id: true, email: true, name: true } },
} as const;

async function rejectAccessRequest(id: string, reviewerId: string) {
  const reviewedAt = new Date();
  return prisma.$transaction(async (tx) => {
    const updateResult = await tx.accessRequest.updateMany({
      where: { id, status: "PENDING" },
      data: {
        status: "REJECTED",
        reviewedAt,
        reviewedById: reviewerId,
      },
    });

    const request = await tx.accessRequest.findUnique({
      where: { id },
      select: accessRequestSelect,
    });

    if (!request) {
      throw new Error("NOT_FOUND");
    }

    return { request, changed: updateResult.count > 0 };
  });
}

async function approveAccessRequest(id: string, reviewerId: string) {
  const reviewedAt = new Date();
  return prisma.$transaction(async (tx) => {
    const updateResult = await tx.accessRequest.updateMany({
      where: { id, status: "PENDING" },
      data: {
        status: "APPROVED",
        reviewedAt,
        reviewedById: reviewerId,
      },
    });

    const request = await tx.accessRequest.findUnique({
      where: { id },
      select: accessRequestSelect,
    });

    if (!request) {
      throw new Error("NOT_FOUND");
    }

    if (request.status !== "APPROVED") {
      return { request, changed: false };
    }

    const existingUser = await tx.user.findUnique({
      where: { email: request.email },
      select: { id: true, status: true, name: true },
    });

    if (existingUser?.status === "BLOCKED") {
      throw new Error("BLOCKED_USER");
    }

    let userId = existingUser?.id;
    if (!existingUser) {
      const user = await tx.user.create({
        data: {
          email: request.email,
          name: request.name,
          role: "USER",
          status: "ACTIVE",
        },
        select: { id: true },
      });
      userId = user.id;
    } else {
      await tx.user.update({
        where: { id: existingUser.id },
        data: {
          status: "ACTIVE",
          ...(existingUser.name ? {} : request.name ? { name: request.name } : {}),
        },
      });
    }

    if (userId) {
      await tx.session.deleteMany({ where: { userId } });
    }

    return { request, changed: updateResult.count > 0 };
  });
}

// ✅ PATCH /api/admin/access-requests/[id] - Approve/Reject request (ADMIN only)
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
  const parsed = actionSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  try {
    const result =
      parsed.data.action === "REJECT"
        ? await rejectAccessRequest(id, auth.userId)
        : await approveAccessRequest(id, auth.userId);

    if (result.changed) {
      if (result.request.status === "APPROVED") {
        const msg = buildAccessApprovedEmail({
          email: result.request.email,
          name: result.request.name ?? undefined,
        });
        await safeSendEmail({
          to: result.request.email,
          subject: msg.subject,
          html: msg.html,
          text: msg.text,
        });
      } else if (result.request.status === "REJECTED") {
        const msg = buildAccessRejectedEmail({
          email: result.request.email,
          name: result.request.name ?? undefined,
        });
        await safeSendEmail({
          to: result.request.email,
          subject: msg.subject,
          html: msg.html,
          text: msg.text,
        });
      }
    }

    return apiSuccess(result.request);
  } catch (error) {
    if (error instanceof Error && error.message === "BLOCKED_USER") {
      return apiError(400, "User is blocked; unblock from User Management instead.");
    }
    if (error instanceof Error && error.message === "NOT_FOUND") {
      return apiError(404, "Request not found");
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        return apiError(404, "Request not found");
      }
    }
    throw error;
  }
}

// ✅ POST /api/admin/access-requests/[id] - Approve request (ADMIN only)
export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  // 🔐 Layer 3: API protection - require ADMIN role
  const auth = await protectAdminApi();
  if (!auth.ok) {
    return apiError(auth.status, auth.message);
  }

  const { id } = await params;

  try {
    const result = await approveAccessRequest(id, auth.userId);
    if (result.changed && result.request.status === "APPROVED") {
      const msg = buildAccessApprovedEmail({
        email: result.request.email,
        name: result.request.name ?? undefined,
      });
      await safeSendEmail({
        to: result.request.email,
        subject: msg.subject,
        html: msg.html,
        text: msg.text,
      });
    }
    return apiSuccess(result.request);
  } catch (error) {
    if (error instanceof Error && error.message === "BLOCKED_USER") {
      return apiError(400, "User is blocked; unblock from User Management instead.");
    }
    if (error instanceof Error && error.message === "NOT_FOUND") {
      return apiError(404, "Request not found");
    }
    throw error;
  }
}

// ✅ DELETE /api/admin/access-requests/[id] - Reject request (ADMIN only)
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  // 🔐 Layer 3: API protection - require ADMIN role
  const auth = await protectAdminApi();
  if (!auth.ok) {
    return apiError(auth.status, auth.message);
  }

  const { id } = await params;

  try {
    const result = await rejectAccessRequest(id, auth.userId);
    if (result.changed && result.request.status === "REJECTED") {
      const msg = buildAccessRejectedEmail({
        email: result.request.email,
        name: result.request.name ?? undefined,
      });
      await safeSendEmail({
        to: result.request.email,
        subject: msg.subject,
        html: msg.html,
        text: msg.text,
      });
    }
    return apiSuccess(result.request);
  } catch (error) {
    if (error instanceof Error && error.message === "NOT_FOUND") {
      return apiError(404, "Request not found");
    }
    throw error;
  }
}
