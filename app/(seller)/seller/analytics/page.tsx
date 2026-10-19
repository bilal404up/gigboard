import { redirect } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { EmptyState } from "@/components/ui/empty-state";
import { StatPlate, StatRow } from "@/components/dashboard/stat-plate";
import { createClient } from "@/lib/supabase/server";
import { AnalyticsChart } from "@/components/seller/analytics-chart";
import { formatMoney } from "@/lib/utils/format";

export default async function SellerAnalyticsPage() {
  const sb = createClient();
  const { data: { user: au } } = await sb.auth.getUser();
  if (!au) redirect("/login");

  const since = new Date(Date.now() - 30 * 86400000);
  const { data: orders } = await sb
    .from("orders")
    .select("seller_earnings, created_at")
    .eq("seller_id", au.id)
    .gte("created_at", since.toISOString());

  const dailyMap = new Map<string, number>();
  for (let i = 0; i < 30; i++) {
    const d = new Date(Date.now() - i * 86400000).toISOString().split("T")[0];
    dailyMap.set(d, 0);
  }
  (orders ?? []).forEach((o) => {
    const d = o.created_at.split("T")[0];
    dailyMap.set(d, (dailyMap.get(d) ?? 0) + Number(o.seller_earnings));
  });
  const chartData = Array.from(dailyMap.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, earnings]) => ({ date: date.slice(5), earnings }));

  const total30 = chartData.reduce((s, d) => s + d.earnings, 0);

  const { data: gigs } = await sb
    .from("gigs")
    .select("id, title, impressions, clicks, total_orders, average_rating")
    .eq("seller_id", au.id)
    .order("total_orders", { ascending: false });

  const totals = (gigs ?? []).reduce(
    (acc, g: any) => ({ impressions: acc.impressions + Number(g.impressions ?? 0), clicks: acc.clicks + Number(g.clicks ?? 0), orders: acc.orders + Number(g.total_orders ?? 0) }),
    { impressions: 0, clicks: 0, orders: 0 }
  );

  return (
    <>
      <Navbar />
      <main id="main" className="wrap py-8 lg:py-10">
        <h1 className="t-sign">Analytics</h1>
        <p className="mt-2 text-sm text-ink-muted">Last 30 days at your window.</p>

        <StatRow className="mt-8">
          <StatPlate label="Earnings, last 30 days" value={formatMoney(total30)} tone={total30 > 0 ? "release" : "laminate"} />
          <StatPlate label="Impressions" value={String(totals.impressions)} />
          <StatPlate label="Clicks" value={String(totals.clicks)} />
          <StatPlate label="Orders" value={String(totals.orders)} />
        </StatRow>

        <section aria-labelledby="chart-title" className="tray mt-8 p-5">
          <h2 id="chart-title" className="t-head">
            Daily earnings
          </h2>
          <div className="mt-4">
            {/* keep your existing AnalyticsChart props if they differ */}
            <AnalyticsChart data={chartData} />
          </div>
        </section>

        <section aria-labelledby="gigs-title" className="mt-8">
          <h2 id="gigs-title" className="t-head">
            Gig by gig
          </h2>
          {gigs && gigs.length > 0 ? (
            <div className="tray mt-4 overflow-x-auto">
              <table className="w-full min-w-[40rem] text-left text-sm">
                <thead>
                  <tr className="t-plate text-ink-muted">
                    <th scope="col" className="px-4 py-3 font-bold">Gig</th>
                    <th scope="col" className="px-4 py-3 text-right font-bold">Impressions</th>
                    <th scope="col" className="px-4 py-3 text-right font-bold">Clicks</th>
                    <th scope="col" className="px-4 py-3 text-right font-bold">Orders</th>
                    <th scope="col" className="px-4 py-3 text-right font-bold">Rating</th>
                  </tr>
                </thead>
                <tbody className="[&_tr+tr]:border-t [&_tr+tr]:border-line">
                  {gigs.map((g: any) => (
                    <tr key={g.id}>
                      <td className="px-4 py-3 font-semibold">{g.title}</td>
                      <td className="num px-4 py-3 text-right">{g.impressions ?? 0}</td>
                      <td className="num px-4 py-3 text-right">{g.clicks ?? 0}</td>
                      <td className="num px-4 py-3 text-right">{g.total_orders ?? 0}</td>
                      <td className="num px-4 py-3 text-right">{Number(g.average_rating) > 0 ? Number(g.average_rating).toFixed(1) : "Not rated"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState className="mt-4" title="No gigs on the board" description="Publish a gig and its views, clicks and orders will show up here." action={<Link href="/seller/gigs/create" className="btn btn-brass">Create a gig</Link>} />
          )}
        </section>
      </main>
      <Footer variant="app" />
    </>
  );
}
