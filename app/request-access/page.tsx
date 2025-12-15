// app/request-access/page.tsx

import { Suspense } from "react";
import { RequestAccessCard } from "@/components/auth/request-access-card";

export default function RequestAccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-slate-50 to-gray-100">
      <Suspense fallback={null}>
        <RequestAccessCard />
      </Suspense>
    </div>
  );
}
