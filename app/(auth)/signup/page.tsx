"use client";

import { useState } from "react";
import { Field } from "@/components/ui/field";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ErrorWell } from "@/components/ui/error-well";
import { AuthShell } from "@/components/auth/auth-shell";
import { slugify } from "@/lib/utils/slug-generator";

export default function SignupPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const finalUsername =
      (username && username.trim()) ||
      slugify(fullName).replace(/-/g, "_").slice(0, 30) ||
      `user_${Date.now()}`;

    // Server-side create (skips Supabase's email confirmation + rate limit).
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, fullName, username: finalUsername }),
    });
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      setLoading(false);
      setError(data?.error ?? "Couldn't create your account. Please try again.");
      return;
    }

    // Immediately sign in to establish a session.
    const sb = createClient();
    const { error: signInErr } = await sb.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (signInErr) {
      // The account was created but sign-in failed (rare). Send them to /login.
      router.push(`/login?redirect=/dashboard`);
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <AuthShell
      title="Create account"
      intro="Sample data, no email confirmation. Use a throwaway password."
      footer={
        <>
          Already have an account?{" "}
          <Link href="/login" className="link font-semibold">
            Log in
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="grid gap-4" noValidate>
        <Field label="Full name" htmlFor="fullName">
          <Input id="fullName" name="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} autoComplete="name" required />
        </Field>
        <Field label="Email" htmlFor="email">
          <Input id="email" name="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" inputMode="email" required />
        </Field>
        <Field label="Username" htmlFor="username" hint="Leave it blank and we make one from your name.">
          <Input id="username" name="username" value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" className="field-num" />
        </Field>
        <Field label="Password" htmlFor="password">
          <Input id="password" name="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" required />
        </Field>
        {error ? <ErrorWell title="Could not create your account">{error}</ErrorWell> : null}
        <Button type="submit" variant="cta" size="lg" disabled={loading} className="w-full">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create account"}
        </Button>
      </form>
    </AuthShell>
  );
}
