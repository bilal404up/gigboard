import { redirect } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { OrdersTable } from "@/components/order/orders-table";
import { createClient } from "@/lib/supabase/server";
import { enrichOrders } from "@/lib/orders";

export const revalidate = 0;

export default async function OrdersPage() {
  const sb = createClient();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) redirect("/login?redirect=/orders");

  const { data } = await sb.from("orders").select("*").eq("buyer_id", user.id).order("created_at", { ascending: false });
  const orders = await enrichOrders(sb, data ?? []);

  return (
    <>
      <Navbar />
      <main id="main" className="wrap pb-16 pt-10 lg:pt-14">
        <p className="eyebrow">Buyer</p>
        <h1 className="t-sign mt-3">Your orders</h1>
        <p className="mt-2 text-sm text-ink-2">Where each payment is right now. Amber is held, green is released.</p>

        <div className="mt-8">
          {orders.length > 0 ? (
            <OrdersTable caption="Your orders" party="seller" orders={orders.map((o) => ({ ...o, amount: Number(o.buyer_total_paid) }))} />
          ) : (
            <EmptyState
              sign="No orders"
              title="No orders yet"
              description="Hire a freelancer for one job. Your payment is held until you approve the work."
              action={
                <Button asChild>
                  <Link href="/search">Browse gigs</Link>
                </Button>
              }
            />
          )}
        </div>
      </main>
      <Footer variant="app" />
    </>
  );
}
