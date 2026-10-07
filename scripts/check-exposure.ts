/**
 * Checks what the PUBLIC key can read. Run with `npx tsx scripts/check-exposure.ts`.
 * Exits non-zero if private columns are readable by anyone holding the public key.
 */
import { config } from "dotenv";
config({ path: ".env.local" });
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const sb = createClient(url, anon, { auth: { persistSession: false } });

const checks: Array<{ table: string; columns: string; why: string }> = [
  { table: "users", columns: "email,is_admin", why: "emails and admin flags" },
  { table: "seller_profiles", columns: "mock_bank_name,mock_account_last4", why: "bank details" },
];

async function main() {
  let bad = 0;
  for (const c of checks) {
    const { data, error } = await sb.from(c.table).select(c.columns).limit(3);
    const readable = !error && (data?.length ?? 0) > 0;
    console.log(`${readable ? "EXPOSED" : "protected"}: ${c.table} (${c.why})${error ? "  [" + error.message.slice(0, 60) + "]" : readable ? `  ${JSON.stringify(data?.[0])}` : ""}`);
    if (readable) bad++;
  }
  // The views must work for public data and must not contain private columns.
  const pubOk = await sb.from("public_profiles").select("id,username,full_name,avatar_url").limit(1);
  const pubSellerOk = await sb.from("public_seller_profiles").select("user_id,tagline,seller_level,average_rating").limit(1);
  const leakUser = await sb.from("public_profiles").select("email");
  const leakSeller = await sb.from("public_seller_profiles").select("balance_available");
  const results: Array<[string, boolean]> = [
    ["public_profiles returns public fields", !pubOk.error && (pubOk.data?.length ?? 0) > 0],
    ["public_seller_profiles returns public fields", !pubSellerOk.error && (pubSellerOk.data?.length ?? 0) > 0],
    ["public_profiles has no email column", !!leakUser.error],
    ["public_seller_profiles has no balance column", !!leakSeller.error],
  ];
  for (const [name, ok] of results) {
    console.log(`${ok ? "ok" : "FAIL"}: ${name}`);
    if (!ok) bad++;
  }
  process.exit(bad ? 1 : 0);
}
main();
