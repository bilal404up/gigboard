import { redirect } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { SellerMark } from "@/components/seller/SellerMark";
import { StatPlate, StatRow } from "@/components/dashboard/stat-plate";
import { createClient } from "@/lib/supabase/server";
import { formatMoney, formatDate } from "@/lib/utils/format";

const STATUS_VARIANT: Record<string, "default" | "secondary" | "outline" | "success" | "warning" | "error" | "info"> = {
  pending_payment: "warning",
  active: "info",
  in_progress: "info",
  requires_requirements: "warning",
  delivered: "info",
  revision_requested: "warning",
  completed: "success",
  cancelled: "error",
  disputed: "error",
};

export default async function DashboardPage() {
  const sb = createClient();
  const { data: { user: authUser } } = await sb.auth.getUser();
  if (!authUser) redirect("/login");
  const { data: user } = await sb.from("users").select("*").eq("id", authUser.id).single();
  if (!user) redirect("/login");

  const [{ count: activeOrders }, { count: pendingReviews }, { data: spentRows }, { count: savedGigs }, { data: orders }] =
    await Promise.all([
      sb.from("orders").select("id", { count: "exact", head: true }).eq("buyer_id", user.id).in("status", ["active", "in_progress", "requires_requirements", "delivered", "revision_requested"]),
      sb.from("orders").select("id", { count: "exact", head: true }).eq("buyer_id", user.id).eq("status", "completed"),
      sb.from("orders").select("buyer_total_paid").eq("buyer_id", user.id).eq("status", "completed"),
      sb.from("favorites").select("id", { count: "exact", head: true }).eq("user_id", user.id),
      sb.from("orders").select("*").eq("buyer_id", user.id).order("created_at", { ascending: false }).limit(6),
    ]);

  const totalSpent = (spentRows ?? []).reduce((sum, o) => sum + Number(o.buyer_total_paid), 0);

  return (
    <>
      <Navbar />
      <main id="main" className="wrap py-8 lg:py-10">
        <header className="flex flex-wrap items-center gap-4">
          <SellerMark username={user.username ?? user.id} label={user.full_name} size={56} />
          <div className="min-w-0 flex-1">
            <h1 className="t-sign truncate">{user.full_name}</h1>
            <p className="mt-1 text-sm text-ink-muted">Your side of the counter.</p>
          </div>
          <Button asChild variant="cta">
            <Link href="/search">Find a freelancer</Link>
          </Button>
        </header>

        <StatRow className="mt-8">
          <StatPlate label="Active orders" value={String(activeOrders ?? 0)} tone={(activeOrders ?? 0) > 0 ? "brass" : "laminate"} hint="Held under the glass" />
          <StatPlate label="Completed orders" value={String(pendingReviews ?? 0)} />
          <StatPlate label="Total spent" value={formatMoney(totalSpent)} hint="Approved and paid out" />
          <StatPlate label="Saved gigs" value={String(savedGigs ?? 0)} />
        </StatRow>

        <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-start">
          <section aria-labelledby="recent-title">
            <div className="flex items-end justify-between gap-4">
              <h2 id="recent-title" className="t-head">
                Recent orders
              </h2>
              <Link href="/orders" className="link text-sm font-semibold">
                All orders
              </Link>
            </div>
            {orders && orders.length > 0 ? (
              <ul className="mt-4 grid gap-3">
                {orders.map((o: any) => (
                  <li key={o.id}>
                    <Link href={`/order/${o.id}`} className="tray tray--hover flex flex-wrap items-center gap-x-4 gap-y-2 p-4 focus-visible:outline focus-visible:outline-[2.5px] focus-visible:outline-offset-2 focus-visible:outline-mahogany">
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold">{(o.package_snapshot as { name?: string } | null)?.name ?? "Order"}</p>
                        <p className="num mt-0.5 text-xs text-ink-muted">
                          {o.order_number ?? o.id} · placed {formatDate(o.created_at)}
                        </p>
                      </div>
                      <Badge variant={STATUS_VARIANT[o.status] ?? "default"} className="capitalize">{String(o.status).replace(/_/g, " ")}</Badge>
                      <span className="num font-bold">{formatMoney(Number(o.buyer_total_paid))}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState
                className="mt-4"
                title="Nothing in the drawer yet"
                description="Hire a freelancer for one job and your order will show up here with its money held."
                action={
                  <Button asChild variant="cta">
                    <Link href="/search">Browse gigs</Link>
                  </Button>
                }
              />
            )}
          </section>

          <aside className="grid gap-3">
            <QuickLink href="/messages" title="Messages" body="Talk to your sellers" />
            <QuickLink href="/favorites" title="Saved gigs" body="Gigs you pinned" />
            <QuickLink href="/settings" title="Settings" body="Name, bio, notifications" />
          </aside>
        </div>
      </main>
      <Footer />
    </>
  );
}

function QuickLink({ href, title, body }: { href: string; title: string; body: string }) {
  return (
    <Link href={href} className="tray tray--hover flex min-h-11 items-center gap-3 p-4 focus-visible:outline focus-visible:outline-[2.5px] focus-visible:outline-offset-2 focus-visible:outline-mahogany">
      <span className="lamp lamp--on shrink-0" aria-hidden="true" />
      <span className="min-w-0">
        <span className="block font-semibold">{title}</span>
        <span className="block text-sm text-ink-muted">{body}</span>
      </span>
    </Link>
  );
}
