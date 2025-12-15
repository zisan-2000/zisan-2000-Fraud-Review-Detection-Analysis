// components/auth/request-access-card.tsx

"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type ApiResponse =
  | { success: true; message?: string }
  | { error: string; details?: unknown };

export function RequestAccessCard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { status } = useSession();

  const reason = (searchParams.get("reason") ?? "").toLowerCase();
  const initialEmail = searchParams.get("email") ?? "";
  const initialName = searchParams.get("name") ?? "";

  const [email, setEmail] = useState(initialEmail);
  const [name, setName] = useState(initialName);
  const [isLoading, setIsLoading] = useState(false);
  const [doneMessage, setDoneMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/projects");
    }
  }, [router, status]);

  const banner = useMemo(() => {
    if (reason === "pending") {
      return {
        title: "Pending approval",
        description: "Your account is already pending admin approval.",
      };
    }
    if (reason === "blocked") {
      return {
        title: "Account blocked",
        description: "Your account is blocked. Please contact an admin.",
      };
    }
    return null;
  }, [reason]);

  const canSubmit = banner?.title !== "Account blocked";

  async function submitRequest(event: React.FormEvent) {
    event.preventDefault();
    if (!canSubmit) return;

    setError(null);
    setIsLoading(true);
    try {
      const res = await fetch("/api/request-access", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, name }),
      });

      const json = (await res.json().catch(() => null)) as ApiResponse | null;

      if (!res.ok) {
        const message = json && "error" in json ? json.error : "Request failed";
        throw new Error(message);
      }

      const message =
        json && "success" in json && json.message
          ? json.message
          : "Access request submitted. An admin will review it.";

      setDoneMessage(message);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Request failed");
    } finally {
      setIsLoading(false);
    }
  }

  if (doneMessage) {
    return (
      <Card className="w-full max-w-md p-8 shadow-lg">
        <div className="space-y-4">
          <h1 className="text-2xl font-bold tracking-tight">
            Request submitted
          </h1>
          <p className="text-muted-foreground text-sm">{doneMessage}</p>
          <Button asChild className="w-full">
            <Link href="/login">Back to login</Link>
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md p-8 shadow-lg">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Request Access</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Submit your details. An admin will approve access.
          </p>
        </div>

        {banner && (
          <Alert>
            <AlertTitle>{banner.title}</AlertTitle>
            <AlertDescription>{banner.description}</AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertTitle>Could not submit</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={submitRequest} className="space-y-4">
          <div className="space-y-1">
            <div className="text-sm font-medium">Email</div>
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              required
              disabled={isLoading || reason === "pending"}
              autoComplete="email"
            />
          </div>

          <div className="space-y-1">
            <div className="text-sm font-medium">Name (optional)</div>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              disabled={isLoading || !canSubmit}
              autoComplete="name"
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || !canSubmit}
          >
            {isLoading ? "Submitting..." : "Submit request"}
          </Button>

          <Button asChild variant="outline" className="w-full">
            <Link href="/login">Back</Link>
          </Button>
        </form>
      </div>
    </Card>
  );
}
