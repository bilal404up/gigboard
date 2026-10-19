import { redirect } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { EmptyState } from "@/components/ui/empty-state";
import { OrdersTable } from "@/components/order/orders-table";
import { createClient } from "@/lib/supabase/server";
import { enrichOrders } from "@/lib/orders";

export default async function SellerOrdersPage() {
  const sb = createClient();
  const {
    data: { user: au },
  } = await sb.auth.getUser();
  if (!au) redirect("/login");

  const { data } = await sb.from("orders").select("*").eq("seller_id", au.id).order("created_at", { ascending: false });
  const orders = await enrichOrders(sb, data ?? []);

  return (
    <>
      <Navbar />
      <main id="main" className="wrap pb-16 pt-10 lg:pt-14">
        <p className="eyebrow">Seller</p>
        <h1 className="t-sign mt-3">Orders</h1>
        <p className="mt-2 text-sm text-ink-2">Every order for your gigs. Your earnings are shown; the payment is held until the buyer approves.</p>

        <div className="mt-8">
          {orders.length > 0 ? (
            <OrdersTable caption="Orders for your gigs" party="buyer" due orders={orders.map((o) => ({ ...o, amount: Number(o.seller_earnings) }))} />
          ) : (
            <EmptyState sign="No orders" title="No orders yet" description="When a buyer books one of your gigs, the order shows up here with its payment held." />
          )}
        </div>
      </main>
      <Footer variant="app" />
    </>
  );
}
