"use client";

import { useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Role = "ADMIN" | "USER";
type UserStatus = "ACTIVE" | "PENDING" | "BLOCKED";

type AdminUserRow = {
  id: string;
  email: string;
  name: string | null;
  role: Role;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
};

function roleBadgeVariant(role: Role): "default" | "secondary" {
  return role === "ADMIN" ? "default" : "secondary";
}

function statusBadgeVariant(status: UserStatus): "default" | "outline" | "destructive" {
  if (status === "ACTIVE") return "default";
  if (status === "PENDING") return "outline";
  return "destructive";
}

export function UserManagement({ initialUsers }: { initialUsers: AdminUserRow[] }) {
  const { data: session } = useSession();
  const currentUserId = session?.user?.id;

  const [users, setUsers] = useState<AdminUserRow[]>(initialUsers);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("USER");
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [busyUserId, setBusyUserId] = useState<string | null>(null);

  const sortedUsers = useMemo(() => {
    return [...users].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }, [users]);

  async function refreshUsers() {
    const res = await fetch("/api/admin/users");
    const json = (await res.json().catch(() => null)) as unknown;
    if (!res.ok) {
      const message =
        typeof json === "object" && json && "error" in json
          ? String((json as { error: unknown }).error)
          : "Failed to load users";
      throw new Error(message);
    }
    setUsers(json as AdminUserRow[]);
  }

  async function handleCreateUser(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setIsCreating(true);

    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, role }),
      });

      const json = (await res.json().catch(() => null)) as unknown;
      if (!res.ok) {
        const message =
          typeof json === "object" && json && "error" in json
            ? String((json as { error: unknown }).error)
            : "Failed to create user";
        throw new Error(message);
      }

      setEmail("");
      setRole("USER");
      setUsers((prev) => {
        const created = json as AdminUserRow;
        const withoutDupes = prev.filter((u) => u.id !== created.id);
        return [created, ...withoutDupes];
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create user");
    } finally {
      setIsCreating(false);
    }
  }

  async function updateUser(userId: string, body: { role?: Role; status?: UserStatus }) {
    setError(null);
    setBusyUserId(userId);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = (await res.json().catch(() => null)) as unknown;
      if (!res.ok) {
        const message =
          typeof json === "object" && json && "error" in json
            ? String((json as { error: unknown }).error)
            : "Failed to update user";
        throw new Error(message);
      }
      const updated = json as AdminUserRow;
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update user");
      await refreshUsers().catch(() => {});
    } finally {
      setBusyUserId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Admin-only allow-list for Google sign-in.
          </p>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Action failed</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card className="p-4">
        <form
          onSubmit={handleCreateUser}
          className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_12rem_10rem]"
        >
          <div className="space-y-1">
            <div className="text-sm font-medium">Email</div>
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@company.com"
              autoComplete="off"
              required
              disabled={isCreating}
            />
          </div>

          <div className="space-y-1">
            <div className="text-sm font-medium">Role</div>
            <Select
              value={role}
              onValueChange={(value) => setRole(value as Role)}
              disabled={isCreating}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USER">USER</SelectItem>
                <SelectItem value="ADMIN">ADMIN</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-end">
            <Button
              type="submit"
              className="w-full"
              disabled={isCreating}
            >
              {isCreating ? "Adding..." : "Add user"}
            </Button>
          </div>
        </form>
      </Card>

      <Card className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-muted-foreground p-6 text-center">
                  No users found.
                </TableCell>
              </TableRow>
            ) : (
              sortedUsers.map((u) => {
                const isBusy = busyUserId === u.id;
                const isSelf = currentUserId === u.id;
                const canBlock = u.status === "ACTIVE" && !isSelf;
                const canDemote = u.role === "ADMIN" && !isSelf;

                return (
                  <TableRow key={u.id}>
                    <TableCell className="py-3">
                      <div className="flex flex-col">
                        <div className="font-medium">{u.email}</div>
                        {u.name && (
                          <div className="text-muted-foreground text-xs">{u.name}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={roleBadgeVariant(u.role)}>{u.role}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusBadgeVariant(u.status)}>{u.status}</Badge>
                    </TableCell>
                    <TableCell className="py-3">
                      <div className="flex items-center justify-end gap-2">
                        {u.status === "ACTIVE" ? (
                          <Button
                            size="sm"
                            variant="destructive"
                            disabled={isBusy || !canBlock}
                            onClick={() => void updateUser(u.id, { status: "BLOCKED" })}
                          >
                            Block
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            className="bg-blue-600 text-white hover:bg-blue-700"
                            disabled={isBusy}
                            onClick={() => void updateUser(u.id, { status: "ACTIVE" })}
                          >
                            Activate
                          </Button>
                        )}

                        {u.role === "ADMIN" ? (
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-blue-600 text-blue-600 hover:bg-blue-50"
                            disabled={isBusy || !canDemote}
                            onClick={() => void updateUser(u.id, { role: "USER" })}
                          >
                            Make user
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-blue-600 text-blue-600 hover:bg-blue-50"
                            disabled={isBusy}
                            onClick={() => void updateUser(u.id, { role: "ADMIN" })}
                          >
                            Make admin
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
