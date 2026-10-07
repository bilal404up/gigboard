import { NextResponse, type NextRequest } from "next/server";
import { isCronAuthorized } from "@/lib/security/cron-auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  if (!isCronAuthorized(request.headers.get("authorization"))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const sb = createAdminClient();
  const { count } = await sb
    .from("custom_offers")
    .update({ status: "expired" })
    .eq("status", "pending")
    .lt("expires_at", new Date().toISOString());
  return NextResponse.json({ expired: count ?? 0 });
}
