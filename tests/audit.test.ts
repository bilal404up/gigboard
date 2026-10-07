import { test } from "node:test";
import assert from "node:assert/strict";
import { NextRequest } from "next/server";

process.env.NEXT_PUBLIC_SUPABASE_URL = "http://127.0.0.1:9";
process.env.SUPABASE_SERVICE_ROLE_KEY = "dummy";
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "dummy";

const cronRoutes = ["auto-complete-orders", "clear-funds", "expire-custom-offers", "update-seller-levels"];

for (const name of cronRoutes) {
  test(`cron ${name}: refuses "Bearer undefined" when CRON_SECRET is unset`, async () => {
    delete process.env.CRON_SECRET;
    const mod = await import(`../app/api/cron/${name}/route`);
    const req = new NextRequest(`http://localhost/api/cron/${name}`, { headers: { authorization: "Bearer undefined" } });
    let status = 0;
    try { status = (await mod.GET(req)).status; } catch { status = 500; }
    assert.equal(status, 401);
  });

  test(`cron ${name}: refuses an empty bearer when CRON_SECRET is empty`, async () => {
    process.env.CRON_SECRET = "";
    const mod = await import(`../app/api/cron/${name}/route`);
    const req = new NextRequest(`http://localhost/api/cron/${name}`, { headers: { authorization: "Bearer " } });
    let status = 0;
    try { status = (await mod.GET(req)).status; } catch { status = 500; }
    assert.equal(status, 401);
  });
}

test("webhook: in production a missing secret is an error, not a silent 200", async () => {
  delete process.env.STRIPE_WEBHOOK_SECRET;
  (process.env as Record<string, string>).NODE_ENV = "production";
  const mod = await import("../app/api/payments/webhook/route");
  const res = await mod.POST(new NextRequest("http://localhost/api/payments/webhook", { method: "POST", body: "{}" }));
  assert.equal(res.status, 500);
});

test("webhook: outside production the demo fallback still works", async () => {
  delete process.env.STRIPE_WEBHOOK_SECRET;
  (process.env as Record<string, string>).NODE_ENV = "development";
  const mod = await import("../app/api/payments/webhook/route");
  const res = await mod.POST(new NextRequest("http://localhost/api/payments/webhook", { method: "POST", body: "{}" }));
  assert.equal(res.status, 200);
});

test("safeNextPath: only same-site paths survive", async () => {
  const { safeNextPath } = await import("../lib/security/safe-next");
  const origin = "http://localhost:3000";
  for (const bad of ["@evil.example", "//evil.example", "/\\evil.example", "https://evil.example", "javascript:alert(1)", "/ok\r\nLocation: x", ""]) {
    assert.equal(safeNextPath(bad), "/dashboard", `should reject ${JSON.stringify(bad)}`);
  }
  for (const good of ["/dashboard", "/orders/12?tab=chat", "/"]) {
    assert.equal(safeNextPath(good), good);
    assert.equal(new URL(`${origin}${safeNextPath(good)}`).origin, origin);
  }
  assert.equal(safeNextPath(null), "/dashboard");
});

// ---- demo mode switch route ----
async function demoPost(body: unknown, headers: Record<string, string> = { origin: "http://localhost", host: "localhost" }) {
  const mod = await import("../app/api/demo/switch/route");
  return mod.POST(
    new NextRequest("http://localhost/api/demo/switch", { method: "POST", headers, body: typeof body === "string" ? body : JSON.stringify(body) })
  );
}

test("demo switch: answers 404 when DEMO_MODE is off", async () => {
  delete process.env.DEMO_MODE;
  process.env.DEMO_PASSWORD = "a-long-demo-password";
  assert.equal((await demoPost({ role: "admin" })).status, 404);
  process.env.DEMO_MODE = "yes";
  assert.equal((await demoPost({ role: "admin" })).status, 404, "only the exact value true turns it on");
});

test("demo switch: refuses cross-site and missing origin", async () => {
  process.env.DEMO_MODE = "true";
  process.env.DEMO_PASSWORD = "a-long-demo-password";
  assert.equal((await demoPost({ role: "admin" }, { origin: "https://evil.example", host: "localhost" })).status, 403);
  assert.equal((await demoPost({ role: "admin" }, { host: "localhost" })).status, 403);
});

test("demo switch: rejects unknown roles and bad bodies", async () => {
  process.env.DEMO_MODE = "true";
  process.env.DEMO_PASSWORD = "a-long-demo-password";
  assert.equal((await demoPost({ role: "root" })).status, 400);
  assert.equal((await demoPost({ role: "constructor" })).status, 400);
  assert.equal((await demoPost("not json")).status, 400);
});

test("demo switch: refuses when no demo password is configured", async () => {
  process.env.DEMO_MODE = "true";
  delete process.env.DEMO_PASSWORD;
  assert.equal((await demoPost({ role: "buyer" })).status, 500);
});

// ---- stored XSS in gig descriptions ----
test("cleanGigHtml: strips scripts, handlers and unsafe links but keeps formatting", async () => {
  const { cleanGigHtml } = await import("../lib/security/clean-html");
  const dirty =
    '<p onclick="steal()">Hello <strong>there</strong></p><script>alert(1)</script><img src=x onerror=alert(1)>' +
    '<a href="javascript:alert(1)">bad</a><a href="https://example.com" onmouseover="x()">ok</a><iframe src="https://evil.example"></iframe>' +
    "<ul><li>one</li></ul><style>body{display:none}</style>";
  const out = cleanGigHtml(dirty);
  for (const bad of ["<script", "onerror", "onclick", "onmouseover", "javascript:", "<iframe", "<img", "<style"]) {
    assert.ok(!out.toLowerCase().includes(bad), `output still contains ${bad}: ${out}`);
  }
  for (const good of ["<strong>there</strong>", "<li>one</li>", 'href="https://example.com"']) {
    assert.ok(out.includes(good), `output lost ${good}: ${out}`);
  }
  assert.equal(cleanGigHtml(null as unknown as string), "");
});
