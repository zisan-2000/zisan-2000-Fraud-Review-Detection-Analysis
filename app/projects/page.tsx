// app/projects/page.tsx

"use client";

import { AppHeader } from "@/components/layout/app-header";
import { ProjectsTable } from "@/components/projects/projects-table";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function ProjectsPage() {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [router, status]);

  if (status !== "authenticated") {
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
