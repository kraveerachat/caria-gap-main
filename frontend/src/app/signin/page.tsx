"use client";

/**
 * Sign-in page (Roadmap Phase 2). Real NextAuth login, additive to the existing
 * mock gateway. SUT Student-ID uses the Credentials provider, which validates
 * against the FastAPI /auth/verify-student endpoint. OAuth buttons render only
 * for providers that are actually configured (Google/Facebook env creds present).
 */

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getProviders, signIn, signOut, useSession } from "next-auth/react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type ProviderInfo = { id: string; name: string; type: string };

export default function SignInPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [oauth, setOauth] = useState<ProviderInfo[]>([]);
  const [studentId, setStudentId] = useState("");
  const [name, setName] = useState("");
  const [program, setProgram] = useState("DT");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getProviders().then((p) => {
      if (!p) return;
      setOauth(Object.values(p).filter((x) => x.type === "oauth") as ProviderInfo[]);
    });
  }, []);

  async function handleStudentLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const res = await signIn("sut-student", {
      redirect: false,
      student_id: studentId,
      name,
      program,
    });
    setSubmitting(false);
    if (res?.error) {
      setError("That SUT Student ID was not recognized. Check the ID and try again.");
    }
  }

  if (status === "authenticated" && session?.user) {
    return (
      <main className="flex min-h-screen items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>You are signed in</CardTitle>
            <CardDescription>
              {session.user.name ?? session.user.email}
              {session.user.role ? ` · ${session.user.role}` : ""}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <Button onClick={() => router.push("/dashboard")}>Go to dashboard</Button>
            <Button variant="outline" onClick={() => signOut({ redirect: false })}>
              Sign out
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Sign in to SUT-CARIA</CardTitle>
          <CardDescription>
            Students sign in with their SUT Student ID. Guests can keep exploring
            without an account.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <form onSubmit={handleStudentLogin} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="student_id">SUT Student ID</Label>
              <Input
                id="student_id"
                placeholder="B6312345"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                autoComplete="username"
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="name">Name (optional)</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="program">Program</Label>
              <Input
                id="program"
                value={program}
                onChange={(e) => setProgram(e.target.value)}
                placeholder="DT"
              />
            </div>
            {error ? (
              <p className="text-sm text-red-500" role="alert">
                {error}
              </p>
            ) : null}
            <Button type="submit" disabled={submitting}>
              {submitting ? "Signing in…" : "Sign in with Student ID"}
            </Button>
          </form>

          {oauth.length > 0 ? (
            <>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="h-px flex-1 bg-border" />
                or
                <span className="h-px flex-1 bg-border" />
              </div>
              <div className="flex flex-col gap-2">
                {oauth.map((p) => (
                  <Button
                    key={p.id}
                    variant="outline"
                    onClick={() => signIn(p.id, { callbackUrl: "/dashboard" })}
                  >
                    Continue with {p.name}
                  </Button>
                ))}
              </div>
            </>
          ) : null}
        </CardContent>
      </Card>
    </main>
  );
}
