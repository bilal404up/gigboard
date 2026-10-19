import { redirect } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { DepartureStrip } from "@/components/order/departure-strip";
import { OrdersTable } from "@/components/order/orders-table";
import { MetricRow } from "@/components/dashboard/stat-plate";
import { createClient } from "@/lib/supabase/server";
import { enrichOrders } from "@/lib/orders";
import { OPEN_STATUSES } from "@/lib/order-status";
import { formatMoney } from "@/lib/utils/format";

export default async function DashboardPage() {
  const sb = createClient();
  const {
    data: { user: authUser },
  } = await sb.auth.getUser();
  if (!authUser) redirect("/login");
  const { data: user } = await sb.from("users").select("*").eq("id", authUser.id).single();
  if (!user) redirect("/login");

  const [{ data: allOrders }, { count: savedGigs }] = await Promise.all([
    sb.from("orders").select("*").eq("buyer_id", user.id).order("created_at", { ascending: false }),
    sb.from("favorites").select("id", { count: "exact", head: true }).eq("user_id", user.id),
  ]);

  const orders = await enrichOrders(sb, allOrders ?? []);
  const open = orders.filter((o) => (OPEN_STATUSES as string[]).includes(o.status));
  const history = orders.filter((o) => !(OPEN_STATUSES as string[]).includes(o.status));
  const held = open.reduce((s, o) => s + Number(o.buyer_total_paid), 0);
  const released = orders.filter((o) => o.status === "completed").reduce((s, o) => s + Number(o.buyer_total_paid), 0);
  const completed = orders.filter((o) => o.status === "completed").length;

  return (
    <>
      <Navbar />
      <main id="main" className="wrap pb-16 pt-10 lg:pt-14">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div className="min-w-0">
            <p className="eyebrow">Buyer</p>
            <h1 className="t-sign mt-3">Your orders and payments</h1>
            <p className="mt-2 text-sm text-ink-2">Signed in as {user.full_name}.</p>
          </div>
          <Button asChild>
            <Link href="/search">Find a freelancer</Link>
          </Button>
        </header>

        <MetricRow
          className="mt-10"
          items={[
            { label: "Held until you approve", value: formatMoney(held), tone: "held", hint: `${open.length} open ${open.length === 1 ? "order" : "orders"}` },
            { label: "Released to sellers", value: formatMoney(released), tone: "go", hint: `${completed} completed` },
            { label: "Saved gigs", value: String(savedGigs ?? 0), href: "/favorites" },
          ]}
        />

        <section aria-labelledby="active-title" className="mt-12">
          <div className="flex items-end justify-between gap-4">
            <h2 id="active-title" className="t-head">
              Active orders
            </h2>
            <span className="num text-sm text-ink-2">{open.length}</span>
          </div>
          {open.length > 0 ? (
            <ul className="mt-4 grid gap-3">
              {open.map((o) => (
                <li key={o.id}>
                  <Link href={`/order/${o.id}`} className="block rounded-[16px] transition-transform duration-200 hover:-translate-y-px">
                    <DepartureStrip orderNumber={o.order_number} title={o.gigTitle} sellerName={o.sellerName} readyBy={o.delivery_due_at} amount={formatMoney(Number(o.buyer_total_paid))} status={o.status} />
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              className="mt-4"
              sign="No orders"
              title="No active orders"
              description="Book a gig and it shows up here, with its payment held until you approve the work."
              action={
                <Button asChild>
                  <Link href="/search">Browse gigs</Link>
                </Button>
              }
            />
          )}
        </section>

        {history.length > 0 ? (
          <section aria-labelledby="history-title" className="mt-12">
            <div className="flex items-end justify-between gap-4">
              <h2 id="history-title" className="t-head">
                History
              </h2>
              <Link href="/orders" className="link text-sm font-semibold">
                All orders
              </Link>
            </div>
            <div className="mt-4">
              <OrdersTable
                caption="Past orders"
                party="seller"
                orders={history.slice(0, 8).map((o) => ({ ...o, amount: Number(o.buyer_total_paid) }))}
              />
            </div>
          </section>
        ) : null}
      </main>
      <Footer variant="app" />
    </>
  );
}
