// next-auth.d.ts

import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "ADMIN" | "USER";
      status: "ACTIVE" | "PENDING" | "BLOCKED";
    } & DefaultSession["user"];
  }

  interface User {
    role: "ADMIN" | "USER";
    status: "ACTIVE" | "PENDING" | "BLOCKED";
  }
}
