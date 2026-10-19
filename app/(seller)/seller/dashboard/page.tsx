import { redirect } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { SellerLevelBadge } from "@/components/seller/seller-level-badge";
import { DepartureStrip } from "@/components/order/departure-strip";
import { MetricRow } from "@/components/dashboard/stat-plate";
import { createClient } from "@/lib/supabase/server";
import { enrichOrders } from "@/lib/orders";
import { OPEN_STATUSES } from "@/lib/order-status";
import { formatMoney } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";

export default async function SellerDashboardPage() {
  const sb = createClient();
  const {
    data: { user: au },
  } = await sb.auth.getUser();
  if (!au) redirect("/login");
  const { data: user } = await sb.from("users").select("*").eq("id", au.id).single();
  if (!user?.is_seller) redirect("/become-seller");

  const { data: profile } = await sb.from("seller_profiles").select("*").eq("user_id", user.id).single();
  if (!profile) redirect("/become-seller");

  const [{ count: activeGigs }, { data: allOrders }, { data: withdrawals }] = await Promise.all([
    sb.from("gigs").select("id", { count: "exact", head: true }).eq("seller_id", user.id).eq("status", "active"),
    sb.from("orders").select("*").eq("seller_id", user.id),
    sb.from("withdrawals").select("amount, status").eq("seller_id", user.id),
  ]);

  const orders = await enrichOrders(sb, allOrders ?? []);
  const open = orders
    .filter((o) => (OPEN_STATUSES as string[]).includes(o.status))
    .sort((a, b) => new Date(a.delivery_due_at ?? a.created_at).getTime() - new Date(b.delivery_due_at ?? b.created_at).getTime());
  const held = open.reduce((s, o) => s + Number(o.seller_earnings), 0);
  const released = orders.filter((o) => o.status === "completed").reduce((s, o) => s + Number(o.seller_earnings), 0);
  const paidOut = (withdrawals ?? []).filter((w: any) => w.status === "paid").reduce((s, w: any) => s + Number(w.amount ?? 0), 0);

  const completion = [
    { label: "Add a profile photo", done: Boolean(user.avatar_url), href: "/settings" },
    { label: "Write a tagline", done: Boolean(profile.tagline && profile.tagline.length > 10), href: "/settings" },
    { label: "Write a bio (120+ characters)", done: Boolean(profile.description && profile.description.length >= 120), href: "/settings" },
    { label: "Add 3 or more skills", done: Boolean(profile.skills && profile.skills.length >= 3), href: "/settings" },
    { label: "Publish your first gig", done: (activeGigs ?? 0) > 0, href: "/seller/gigs/create" },
    { label: "Add portfolio items", done: Boolean((profile.portfolio_items as any[] | null)?.length), href: "/settings" },
    { label: "Connect your bank", done: Boolean(profile.stripe_onboarding_complete), href: "/become-seller" },
  ];
  const completedCount = completion.filter((c) => c.done).length;
  const completionPct = Math.round((completedCount / completion.length) * 100);

  return (
    <>
      <Navbar />
      <main id="main" className="wrap pb-16 pt-10 lg:pt-14">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div className="min-w-0">
            <p className="eyebrow">Seller</p>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <h1 className="t-sign">{user.full_name}</h1>
              <SellerLevelBadge level={profile.seller_level} />
            </div>
            <p className="mt-2 text-sm text-ink-2">
              {activeGigs ?? 0} active {(activeGigs ?? 0) === 1 ? "gig" : "gigs"} · {open.length} open {open.length === 1 ? "order" : "orders"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="secondary">
              <Link href="/seller/gigs">Your gigs</Link>
            </Button>
            <Button asChild>
              <Link href="/seller/gigs/create">Create a gig</Link>
            </Button>
          </div>
        </header>

        <section aria-labelledby="departures-title" className="mt-10">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 id="departures-title" className="t-head">
                Today&apos;s departures
              </h2>
              <p className="mt-1 text-sm text-ink-2">Open orders, soonest due first.</p>
            </div>
            <Link href="/seller/orders" className="link text-sm font-semibold">
              All orders
            </Link>
          </div>
          {open.length > 0 ? (
            <ul className="mt-4 grid gap-3">
              {open.slice(0, 6).map((o) => (
                <li key={o.id}>
                  <Link href={`/order/${o.id}`} className="block rounded-[16px] transition-transform duration-200 hover:-translate-y-px">
                    <DepartureStrip orderNumber={o.order_number} title={o.gigTitle} sellerName={o.buyerName ? `For ${o.buyerName}` : null} readyBy={o.delivery_due_at} amount={formatMoney(Number(o.seller_earnings))} status={o.status} />
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState className="mt-4" sign="All clear" title="Nothing due" description="No open orders right now. New bookings appear here, soonest due first." />
          )}
        </section>

        <section aria-labelledby="earnings-title" className="mt-12">
          <div className="flex items-end justify-between gap-4">
            <h2 id="earnings-title" className="t-head">
              Earnings
            </h2>
            <Link href="/seller/earnings" className="link text-sm font-semibold">
              Earnings and payouts
            </Link>
          </div>
          <MetricRow
            className="mt-4"
            items={[
              { label: "Held", value: formatMoney(held), tone: "held", hint: "Buyers have paid. Released when they approve." },
              { label: "Released", value: formatMoney(released), tone: "go", hint: "From approved orders, all time" },
              { label: "Paid out", value: formatMoney(paidOut), hint: "Withdrawn to your bank" },
            ]}
          />
        </section>

        <section aria-labelledby="finish-title" className="panel mt-12 p-5 md:p-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <h2 id="finish-title" className="t-head">
              Profile checklist
            </h2>
            <span className="num text-sm text-ink-2">
              {completedCount} of {completion.length} done
            </span>
          </div>
          <div className="mt-3 h-1.5 overflow-hidden rounded-pill bg-surface-sunk" role="progressbar" aria-valuenow={completionPct} aria-valuemin={0} aria-valuemax={100} aria-label="Profile completion">
            <div className="h-full rounded-pill bg-ink" style={{ width: `${completionPct}%` }} />
          </div>
          <ul className="mt-4 grid gap-1 md:grid-cols-2 md:gap-x-6">
            {completion.map((c) => (
              <li key={c.label}>
                <Link
                  href={c.href}
                  className={cn("flex min-h-11 items-center gap-3 rounded-[8px] px-2 text-sm hover:bg-surface-sunk", c.done ? "text-ink-2" : "text-ink")}
                >
                  <span aria-hidden="true" className={cn("inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full", c.done ? "bg-ink text-white" : "shadow-[inset_0_0_0_1.5px_#C9C6BE]")}>
                    {c.done ? (
                      <svg viewBox="0 0 12 12" width="9" height="9">
                        <path d="M2 6.5l2.5 2.5L10 3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    ) : null}
                  </span>
                  <span>{c.label}</span>
                  <span className="sr-only">{c.done ? ", done" : ", not done"}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </main>
      <Footer variant="app" />
    </>
  );
}
