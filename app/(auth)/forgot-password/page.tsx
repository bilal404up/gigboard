"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Loader2, MailCheck, ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { ErrorWell } from "@/components/ui/error-well";
import { AuthShell } from "@/components/auth/auth-shell";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const sb = createClient();
    const { error: err } = await sb.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/api/auth/callback?next=/settings`,
    });
    setLoading(false);
    if (err) setError(err.message);
    else setSent(true);
  }

  return (
    <AuthShell
      title="Reset your password"
      intro="We will email you a link to set a new one."
      footer={
        <Link href="/login" className="link inline-flex items-center gap-2 font-semibold">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to log in
        </Link>
      }
    >
      {sent ? (
        <div role="status" className="flex items-start gap-3 rounded-[6px] bg-release-tint p-4 text-release-deep">
          <MailCheck className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
          <div className="text-sm">
            <p className="font-semibold">Check your email</p>
            <p className="mt-1">If an account exists for {email}, a reset link is on its way.</p>
          </div>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="grid gap-4" noValidate>
          <Field label="Email" htmlFor="email">
            <Input id="email" name="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" inputMode="email" required />
          </Field>
          {error ? <ErrorWell title="Could not send the link">{error}</ErrorWell> : null}
          <Button type="submit" variant="cta" size="lg" disabled={loading} className="w-full">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send reset link"}
          </Button>
        </form>
      )}
    </AuthShell>
  );
}
