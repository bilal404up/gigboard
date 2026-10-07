import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { DEMO_ACCOUNTS, isDemoMode, isDemoRole } from "@/lib/demo";

/**
 * Demo mode only: sign in as one of the sample accounts (buyer, seller or admin).
 * Every guard runs before any session work, and a deployment without DEMO_MODE=true
 * answers 404 as if the route did not exist.
 */
export async function POST(request: NextRequest) {
  if (!isDemoMode()) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const origin = request.headers.get("origin");
  const host = request.headers.get("host");
  if (!origin || !host || new URL(origin).host !== host) {
    return NextResponse.json({ error: "Cross-site request refused" }, { status: 403 });
  }

  let role: unknown;
  try {
    role = (await request.json())?.role;
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  if (!isDemoRole(role)) return NextResponse.json({ error: "Unknown role" }, { status: 400 });

  const password = process.env.DEMO_PASSWORD;
  if (!password) return NextResponse.json({ error: "Demo accounts are not configured" }, { status: 500 });

  const account = DEMO_ACCOUNTS[role];
  const sb = createClient();
  await sb.auth.signOut();
  const { error } = await sb.auth.signInWithPassword({ email: account.email, password });
  if (error) return NextResponse.json({ error: "Could not sign in to the sample account" }, { status: 502 });

  return NextResponse.json({ ok: true, redirect: account.home });
}
