// lib/mailer.ts

import "server-only";

import { Resend } from "resend";

let cachedResend: Resend | null = null;

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function getOptionalEnv(name: string): string | undefined {
  const value = process.env[name];
  return value && value.length > 0 ? value : undefined;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function getAppUrl(): string {
  const base =
    getOptionalEnv("APP_URL") ??
    getOptionalEnv("NEXTAUTH_URL") ??
    "http://localhost:3000";
  return base.replace(/\/+$/, "");
}

function buildUrl(path: string): string {
  const base = getAppUrl();
  return new URL(path, `${base}/`).toString();
}

type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

function getResendClient(): Resend {
  if (cachedResend) return cachedResend;
  cachedResend = new Resend(requireEnv("RESEND_API_KEY"));
  return cachedResend;
}

export async function sendEmail({ to, subject, html, text }: SendEmailInput) {
  const from =
    getOptionalEnv("RESEND_FROM") ?? "Review Fraud <onboarding@resend.dev>";

  const resend = getResendClient();

  await resend.emails.send({
    from,
    to,
    subject,
    html,
    ...(text ? { text } : {}),
  });
}

export async function safeSendEmail(input: SendEmailInput) {
  try {
    await sendEmail(input);
  } catch (error) {
    console.error("Email send failed", {
      to: input.to,
      subject: input.subject,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

export function buildRequestReceivedEmail(params: {
  email: string;
  name?: string;
}): { subject: string; html: string; text: string } {
  const safeName = params.name ? escapeHtml(params.name) : "";
  const greeting = safeName ? `Hi ${safeName},` : "Hi,";
  const subject = "Access request received";
  const html = `
    <div style="font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial;">
      <p>${greeting}</p>
      <p>Your access request has been received. An admin will review it shortly.</p>
      <p style="color:#6b7280;font-size:12px">Requested for: ${escapeHtml(
        params.email
      )}</p>
    </div>
  `.trim();
  const text = `${greeting}\n\nYour access request has been received. An admin will review it shortly.\n\nRequested for: ${params.email}`;
  return { subject, html, text };
}

export function buildAdminNewRequestEmail(params: {
  email: string;
  name?: string;
}): { subject: string; html: string; text: string } {
  const subject = "New access request";
  const reviewUrl = buildUrl("/admin/access-requests");
  const safeEmail = escapeHtml(params.email);
  const safeName = params.name ? escapeHtml(params.name) : "—";
  const html = `
    <div style="font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial;">
      <p>New access request received:</p>
      <p><strong>Email:</strong> ${safeEmail}</p>
      <p><strong>Name:</strong> ${safeName}</p>
      <p><a href="${reviewUrl}">Review requests</a></p>
    </div>
  `.trim();
  const text = `New access request received:\n\nEmail: ${params.email}\nName: ${
    params.name ?? "—"
  }\n\nReview: ${reviewUrl}`;
  return { subject, html, text };
}

export function buildAccessApprovedEmail(params: {
  email: string;
  name?: string;
}): { subject: string; html: string; text: string } {
  const signInUrl = buildUrl("/login");
  const safeName = params.name ? escapeHtml(params.name) : "";
  const greeting = safeName ? `Hi ${safeName},` : "Hi,";
  const subject = "Access approved";
  const html = `
    <div style="font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial;">
      <p>${greeting}</p>
      <p>Your access has been approved. You can now sign in using Google.</p>
      <p><a href="${signInUrl}">Sign in</a></p>
    </div>
  `.trim();
  const text = `${greeting}\n\nYour access has been approved. You can now sign in using Google.\n\nSign in: ${signInUrl}`;
  return { subject, html, text };
}

export function buildAccessRejectedEmail(params: {
  email: string;
  name?: string;
}): { subject: string; html: string; text: string } {
  const safeName = params.name ? escapeHtml(params.name) : "";
  const greeting = safeName ? `Hi ${safeName},` : "Hi,";
  const subject = "Access request update";
  const adminEmail = getOptionalEnv("ADMIN_NOTIFY_EMAIL");
  const contactLine = adminEmail
    ? `If you believe this is a mistake, contact: ${escapeHtml(adminEmail)}`
    : "If you believe this is a mistake, please contact the administrator.";
  const html = `
    <div style="font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial;">
      <p>${greeting}</p>
      <p>Your access request was not approved at this time.</p>
      <p>${contactLine}</p>
    </div>
  `.trim();
  const text = `${greeting}\n\nYour access request was not approved at this time.\n\n${
    adminEmail
      ? `If you believe this is a mistake, contact: ${adminEmail}`
      : "If you believe this is a mistake, please contact the administrator."
  }`;
  return { subject, html, text };
}
