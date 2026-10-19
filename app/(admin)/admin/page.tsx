import Link from "next/link";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { StatPlate, StatRow } from "@/components/dashboard/stat-plate";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatMoney } from "@/lib/utils/format";

/*
 * Orders and disputes are only readable by their participants under RLS, so the signed-in
 * admin used to see "0 orders". After confirming the viewer is an admin (middleware checks
 * too), the platform-wide counts are read with the server-only service client. Read-only.
 */
export default async function AdminDashboardPage() {
  const sb = createClient();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) notFound();
  const { data: me } = await sb.from("users").select("is_admin").eq("id", user.id).single();
  if (!me?.is_admin) notFound();

  const db = createAdminClient();
  const [{ count: users }, { count: activeGigs }, { count: pendingGigs }, { count: totalOrders }, { count: heldOrders }, { count: openDisputes }, { count: emails }, { data: monthOrders }] =
    await Promise.all([
      db.from("users").select("id", { count: "exact", head: true }),
      db.from("gigs").select("id", { count: "exact", head: true }).eq("status", "active"),
      db.from("gigs").select("id", { count: "exact", head: true }).eq("status", "pending_approval"),
      db.from("orders").select("id", { count: "exact", head: true }),
      db.from("orders").select("id", { count: "exact", head: true }).in("status", ["active", "requires_requirements", "in_progress", "delivered", "revision_requested"]),
      db.from("disputes").select("id", { count: "exact", head: true }).eq("status", "open"),
      db.from("email_logs").select("id", { count: "exact", head: true }),
      db.from("orders").select("platform_commission").eq("status", "completed").gte("created_at", new Date(Date.now() - 30 * 86400000).toISOString()),
    ]);

  const revenue = (monthOrders ?? []).reduce((s, o: any) => s + Number(o.platform_commission), 0);
  const queues = [
    { href: "/admin/disputes", title: "Disputes", count: openDisputes ?? 0, body: (openDisputes ?? 0) > 0 ? "Waiting for a decision" : "No open disputes", alert: (openDisputes ?? 0) > 0 },
    { href: "/admin/gigs/review", title: "Gig review", count: pendingGigs ?? 0, body: (pendingGigs ?? 0) > 0 ? "Gigs waiting to go live" : "Nothing waiting", alert: false },
    { href: "/admin/emails", title: "Emails", count: emails ?? 0, body: "Outbound log (logged, not sent)", alert: false },
  ];

  return (
    <>
      <Navbar />
      <main id="main" className="wrap pb-16 pt-10 lg:pt-14">
        <p className="eyebrow">Admin</p>
        <h1 className="t-sign mt-3">Platform overview</h1>
        <p className="mt-2 text-sm text-ink-2">Sample data.</p>

        <section aria-labelledby="queues-title" className="mt-10">
          <h2 id="queues-title" className="t-head">
            Queues
          </h2>
          <ul className="mt-4 grid gap-3 md:grid-cols-3">
            {queues.map((q) => (
              <li key={q.href}>
                <Link href={q.href} className="tray tray--hover flex h-full items-start justify-between gap-4 p-5">
                  <span className="min-w-0">
                    <span className="block font-semibold">{q.title}</span>
                    <span className="mt-1 block text-sm text-ink-2">{q.body}</span>
                  </span>
                  <span className={`num shrink-0 rounded-[8px] px-2.5 py-1 text-[1.25rem] leading-none ${q.alert ? "bg-stop-bg text-stop" : "bg-surface-sunk text-ink"}`}>{q.count}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="metrics-title" className="mt-12">
          <h2 id="metrics-title" className="t-head">
            Metrics
          </h2>
          <StatRow className="mt-4 md:grid-cols-3 lg:grid-cols-6">
            <StatPlate label="Orders, all time" value={String(totalOrders ?? 0)} />
            <StatPlate label="Payments held now" value={String(heldOrders ?? 0)} tone="held" hint="Open orders" />
            <StatPlate label="Commission, 30 days" value={formatMoney(revenue)} hint="Completed orders" />
            <StatPlate label="Active gigs" value={String(activeGigs ?? 0)} />
            <StatPlate label="Awaiting review" value={String(pendingGigs ?? 0)} />
            <StatPlate label="Users" value={String(users ?? 0)} />
          </StatRow>
        </section>
      </main>
      <Footer variant="app" />
    </>
  );
}
