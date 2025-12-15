// app/projects/page.tsx

"use client";

import { AppHeader } from "@/components/layout/app-header";
import { ProjectsTable } from "@/components/projects/projects-table";
import { useAuth } from "@/lib/auth-context";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ProjectsPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <AppHeader />
      <main className="container mx-auto px-4 py-8">
        <ProjectsTable />
      </main>
    </div>
  );
}
