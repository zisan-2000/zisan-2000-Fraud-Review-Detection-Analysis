"use client";

import { useMemo, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type RequestStatus = "PENDING" | "APPROVED" | "REJECTED";

type Reviewer = {
  id: string;
  email: string;
  name: string | null;
};

export type AccessRequestRow = {
  id: string;
  email: string;
  name: string | null;
  status: RequestStatus;
  createdAt: string;
  updatedAt: string;
  reviewedAt: string | null;
  reviewedBy: Reviewer | null;
};

function statusBadgeVariant(
  status: RequestStatus,
): "default" | "outline" | "destructive" {
  if (status === "APPROVED") return "default";
  if (status === "PENDING") return "outline";
  return "destructive";
}

export function AccessRequestsManagement({
  initialRequests,
  statusFilter = "PENDING",
}: {
  initialRequests: AccessRequestRow[];
  statusFilter?: RequestStatus | "ALL";
}) {
  const [requests, setRequests] = useState<AccessRequestRow[]>(initialRequests);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const sorted = useMemo(() => {
    return [...requests].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }, [requests]);

  async function refresh() {
    const res = await fetch(
      `/api/admin/access-requests?status=${encodeURIComponent(statusFilter)}`,
    );
    const json = (await res.json().catch(() => null)) as unknown;
    if (!res.ok) {
      const message =
        typeof json === "object" && json && "error" in json
          ? String((json as { error: unknown }).error)
          : "Failed to load requests";
      throw new Error(message);
    }
    setRequests(json as AccessRequestRow[]);
  }

  async function act(id: string, action: "APPROVE" | "REJECT") {
    setError(null);
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/access-requests/${id}`, {
        method: action === "APPROVE" ? "POST" : "DELETE",
      });
      const json = (await res.json().catch(() => null)) as unknown;
      if (!res.ok) {
        const message =
          typeof json === "object" && json && "error" in json
            ? String((json as { error: unknown }).error)
            : "Action failed";
        throw new Error(message);
      }
      const updated = json as AccessRequestRow;
      setRequests((prev) => {
        if (statusFilter === "PENDING") {
          return prev.filter((r) => r.id !== updated.id);
        }
        return prev.map((r) => (r.id === updated.id ? updated : r));
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Action failed");
      await refresh().catch(() => {});
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Access Requests</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Review and approve requests to allow Google sign-in.
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Action failed</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Submitted</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-muted-foreground p-6 text-center">
                  {statusFilter === "PENDING" ? "No pending requests." : "No access requests."}
                </TableCell>
              </TableRow>
            ) : (
              sorted.map((r) => {
                const isBusy = busyId === r.id;
                const submitted = new Date(r.createdAt).toLocaleString();
                return (
                  <TableRow key={r.id}>
                    <TableCell className="py-3 font-medium">{r.email}</TableCell>
                    <TableCell className="py-3">{r.name ?? "—"}</TableCell>
                    <TableCell className="py-3">
                      <div className="flex flex-col gap-1">
                        <Badge variant={statusBadgeVariant(r.status)}>{r.status}</Badge>
                        {r.reviewedAt && r.reviewedBy && (
                          <div className="text-muted-foreground text-xs">
                            Reviewed by {r.reviewedBy.email}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="py-3">{submitted}</TableCell>
                    <TableCell className="py-3">
                      <div className="flex items-center justify-end gap-2">
                        {r.status === "PENDING" ? (
                          <>
                            <Button
                              size="sm"
                              disabled={isBusy}
                              onClick={() => void act(r.id, "APPROVE")}
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              disabled={isBusy}
                              onClick={() => void act(r.id, "REJECT")}
                            >
                              Reject
                            </Button>
                          </>
                        ) : (
                          <Button size="sm" variant="outline" disabled>
                            No actions
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
