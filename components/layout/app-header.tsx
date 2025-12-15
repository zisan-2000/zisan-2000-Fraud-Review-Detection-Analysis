"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";

import {
  Shield,
  Users,
  Inbox,
  UserCircle,
  ShieldCheck,
  Settings,
  LogOut,
  ChevronDown,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AdminOnly } from "@/components/auth/role-guard";

export function AppHeader() {
  const { data: session } = useSession();
  const user = session?.user;

  const getUserInitials = () => {
    if (!user?.name) return "U";
    return user.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="bg-white border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* 🔷 Logo */}
          <Link href="/projects" className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-blue-600" />
            <span className="text-xl font-bold">Review Fraud</span>
          </Link>

          {/* 🔷 Right Section */}
          <div className="flex items-center gap-3">
            {/* 🛡️ Admin-only buttons */}
            <AdminOnly>
              <Button asChild variant="outline" size="sm">
                <Link href="/admin/users">
                  <Users className="w-4 h-4 mr-2" />
                  Users
                </Link>
              </Button>

              <Button asChild variant="outline" size="sm">
                <Link href="/admin/access-requests">
                  <Inbox className="w-4 h-4 mr-2" />
                  Requests
                </Link>
              </Button>
            </AdminOnly>

            {/* 👤 User Menu */}
            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-2 px-2 data-[state=open]:bg-muted"
                  >
                    <Avatar className="w-8 h-8">
                      <AvatarImage
                        src={user.image ?? ""}
                        alt={user.name ?? "User"}
                      />
                      <AvatarFallback className="bg-muted text-muted-foreground">
                        <UserCircle className="w-5 h-5" />
                      </AvatarFallback>
                    </Avatar>

                    <span className="hidden md:inline text-sm font-medium">
                      {user.name}
                    </span>

                    <ChevronDown className="hidden md:block w-4 h-4 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-64">
                  {/* 👤 Identity */}
                  <DropdownMenuLabel className="p-3">
                    <div className="flex items-start gap-3">
                      <UserCircle className="w-9 h-9 text-muted-foreground" />

                      <div className="flex flex-col">
                        <p className="text-sm font-semibold">{user.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {user.email}
                        </p>

                        <div className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-blue-600">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          Role: {user.role}
                        </div>
                      </div>
                    </div>
                  </DropdownMenuLabel>

                  <DropdownMenuSeparator />

                  {/* ⚙️ Actions */}
                  <DropdownMenuItem className="gap-2">
                    <Settings className="w-4 h-4 text-muted-foreground" />
                    Profile Settings
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  {/* 🚪 Logout */}
                  <DropdownMenuItem
                    onClick={() => void signOut({ callbackUrl: "/login" })}
                    className="gap-2 text-red-600 focus:text-red-600"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
