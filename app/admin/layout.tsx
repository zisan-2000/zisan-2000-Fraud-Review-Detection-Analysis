// app/admin/layout.tsx
// 🔐 Layer 2: Server-side page protection for admin routes
// This runs on the server before the page renders

import type React from "react";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin-guard";
import { AppHeader } from "@/components/layout/app-header";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // ✅ Server-side authorization check
  // This is a second layer of defense (middleware is the first)
  const auth = await requireAdmin();

  if (!auth.ok) {
    // Not authorized - redirect to projects
    redirect("/projects");
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <AppHeader />
      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
