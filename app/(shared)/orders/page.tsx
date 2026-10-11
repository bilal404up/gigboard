import { redirect } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
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

export const revalidate = 0;

export default async function OrdersPage() {
  const sb = createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect("/login?redirect=/orders");

  const { data: orders } = await sb
    .from("orders")
    .select("*")
    .eq("buyer_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <>
      <Navbar />
      <main id="main" className="wrap py-8 lg:py-10">
        <h1 className="t-sign">Your orders</h1>
        <p className="mt-2 text-sm text-ink-muted">Where each payment is right now.</p>

        {orders && orders.length > 0 ? (
          <ul className="mt-8 grid gap-3">
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
            className="mt-8"
            title="No orders yet"
            description="Hire a freelancer for one job. Your payment waits in the drawer until you approve the work."
            action={
              <Button asChild variant="cta">
                <Link href="/search">Browse gigs</Link>
              </Button>
            }
          />
        )}
      </main>
      <Footer />
    </>
  );
}
