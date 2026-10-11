import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { StatPlate, StatRow } from "@/components/dashboard/stat-plate";
import { createClient } from "@/lib/supabase/server";
import { formatMoney } from "@/lib/utils/format";

export default async function AdminDashboardPage() {
  const sb = createClient();
  const [
    { count: users },
    { count: activeGigs },
    { count: pendingGigs },
    { count: totalOrders },
    { count: openDisputes },
    { data: monthOrders },
  ] = await Promise.all([
    sb.from("users").select("id", { count: "exact", head: true }),
    sb.from("gigs").select("id", { count: "exact", head: true }).eq("status", "active"),
    sb.from("gigs").select("id", { count: "exact", head: true }).eq("status", "pending_approval"),
    sb.from("orders").select("id", { count: "exact", head: true }),
    sb.from("disputes").select("id", { count: "exact", head: true }).eq("status", "open"),
    sb.from("orders").select("platform_commission").gte("created_at", new Date(Date.now() - 30 * 86400000).toISOString()),
  ]);

  const revenue = (monthOrders ?? []).reduce((s, o) => s + Number(o.platform_commission), 0);

  return (
    <>
      <Navbar />
      <main id="main" className="wrap py-8 lg:py-10">
        <h1 className="t-sign">Admin</h1>
        <p className="mt-2 text-sm text-ink-muted">Behind the counter. Sample data, Stripe test mode.</p>

        <StatRow className="mt-8 md:grid-cols-3">
          <StatPlate label="Commission, last 30 days" value={formatMoney(revenue)} tone="brass" />
          <StatPlate label="Open disputes" value={String(openDisputes ?? 0)} hint={(openDisputes ?? 0) > 0 ? "Drawers stuck under the glass" : "Nothing stuck"} />
          <StatPlate label="Gigs awaiting review" value={String(pendingGigs ?? 0)} />
          <StatPlate label="Users" value={String(users ?? 0)} />
          <StatPlate label="Active gigs" value={String(activeGigs ?? 0)} />
          <StatPlate label="Orders, all time" value={String(totalOrders ?? 0)} />
        </StatRow>

        <section aria-labelledby="queues-title" className="mt-10">
          <h2 id="queues-title" className="t-head">
            Queues
          </h2>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {[
              ["/admin/disputes", "Disputes", `${openDisputes ?? 0} open`, (openDisputes ?? 0) > 0],
              ["/admin/gigs/review", "Gig review", `${pendingGigs ?? 0} waiting`, (pendingGigs ?? 0) > 0],
              ["/admin/emails", "Emails", "Outbound log", false],
            ].map(([href, title, body, lit]) => (
              <Link key={String(href)} href={String(href)} className="tray tray--hover flex min-h-11 items-center gap-3 p-4 focus-visible:outline focus-visible:outline-[2.5px] focus-visible:outline-offset-2 focus-visible:outline-mahogany">
                <span className={`lamp shrink-0 ${lit ? "lamp--alarm" : ""}`} aria-hidden="true" />
                <span className="min-w-0">
                  <span className="block font-semibold">{title}</span>
                  <span className="block text-sm text-ink-muted">{body}</span>
                </span>
              </Link>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
