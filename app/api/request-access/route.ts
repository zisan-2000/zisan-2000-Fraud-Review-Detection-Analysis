// app/api/request-access/route.ts

import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import {
  buildAdminNewRequestEmail,
  buildRequestReceivedEmail,
  safeSendEmail,
} from "@/lib/mailer";

export const runtime = "nodejs";

const requestAccessSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  name: z
    .string()
    .trim()
    .max(100)
    .optional()
    .transform((value) => (value && value.length > 0 ? value : undefined)),
});

function getAllowedEmailDomains(): string[] {
  return (process.env.ACCESS_REQUEST_ALLOWED_EMAIL_DOMAINS ?? "")
    .split(",")
    .map((d) => d.trim().toLowerCase())
    .filter(Boolean);
}

function isAllowedEmailDomain(email: string): boolean {
  const allowedDomains = getAllowedEmailDomains();
  if (allowedDomains.length === 0) return true;
  const domain = email.split("@")[1]?.toLowerCase();
  return !!domain && allowedDomains.includes(domain);
}

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = requestAccessSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { email, name } = parsed.data;

  if (!isAllowedEmailDomain(email)) {
    return NextResponse.json(
      { error: "Email domain is not allowed for access requests." },
      { status: 403 }
    );
  }

  const existingUser = await prisma.user.findUnique({
    where: { email },
    select: { status: true },
  });

  if (existingUser) {
    if (existingUser.status === "ACTIVE") {
      return NextResponse.json(
        { error: "Access already approved. Please sign in." },
        { status: 409 }
      );
    }
    if (existingUser.status === "BLOCKED") {
      return NextResponse.json(
        { error: "Account is blocked. Please contact an admin." },
        { status: 403 }
      );
    }
    return NextResponse.json(
      { success: true, message: "Your account is pending admin approval." },
      { status: 202 }
    );
  }

  const existingRequest = await prisma.accessRequest.findUnique({
    where: { email },
    select: { id: true, status: true, updatedAt: true, name: true },
  });

  const now = Date.now();
  const cooldownMs = 10 * 60 * 1000;

  const nameChanged = Boolean(name) && name !== existingRequest?.name;
  const isInCooldown =
    existingRequest?.status === "PENDING" &&
    now - existingRequest.updatedAt.getTime() < cooldownMs;

  const shouldNotify =
    !existingRequest ||
    existingRequest.status !== "PENDING" ||
    (!isInCooldown && existingRequest.status === "PENDING");

  const shouldWrite =
    !existingRequest ||
    existingRequest.status !== "PENDING" ||
    nameChanged ||
    (!isInCooldown && existingRequest.status === "PENDING");

  const accessRequest = await (async () => {
    const select = {
      id: true,
      email: true,
      name: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    } as const;

    if (!existingRequest) {
      return prisma.accessRequest.create({
        data: { email, name, status: "PENDING" },
        select,
      });
    }

    if (!shouldWrite) {
      return prisma.accessRequest.findUniqueOrThrow({
        where: { email },
        select,
      });
    }

    return prisma.accessRequest.update({
      where: { email },
      data: {
        ...(name ? { name } : {}),
        status: "PENDING",
        reviewedAt: null,
        reviewedById: null,
      },
      select,
    });
  })();

  if (shouldNotify) {
    const emails: Promise<void>[] = [];

    const userEmail = buildRequestReceivedEmail({ email, name });
    emails.push(
      safeSendEmail({
        to: email,
        subject: userEmail.subject,
        html: userEmail.html,
        text: userEmail.text,
      })
    );

    const adminEmail = process.env.ADMIN_NOTIFY_EMAIL;
    if (adminEmail) {
      const adminMsg = buildAdminNewRequestEmail({ email, name });
      emails.push(
        safeSendEmail({
          to: adminEmail,
          subject: adminMsg.subject,
          html: adminMsg.html,
          text: adminMsg.text,
        })
      );
    }

    await Promise.all(emails);
  }

  const status = !existingRequest ? 201 : shouldWrite ? 200 : 202;
  return NextResponse.json(
    { success: true, request: accessRequest },
    { status }
  );
}
