import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(_req: NextRequest) {
  // All admin protection is handled server-side in app/admin/layout.tsx
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
