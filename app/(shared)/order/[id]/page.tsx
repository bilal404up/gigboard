import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SellerMark } from "@/components/seller/SellerMark";
import { OrderTimeline } from "@/components/order/order-timeline";
import { OrderActions } from "@/components/order/order-actions";
import { createClient } from "@/lib/supabase/server";
import { formatMoney, formatDateTime } from "@/lib/utils/format";

const STATUS_VARIANT: Record<string, "default" | "secondary" | "outline" | "success" | "warning" | "error" | "info"> = {
  pending_payment: "warning",
  active: "info",
  requires_requirements: "warning",
  in_progress: "info",
  delivered: "info",
  revision_requested: "warning",
  completed: "success",
  cancelled: "error",
  disputed: "error",
};

export default async function OrderDetailPage({ params }: { params: { id: string } }) {
  const sb = createClient();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) redirect(`/login?redirect=/order/${params.id}`);

  const { data: order } = await sb.from("orders").select("*").eq("id", params.id).single();
  if (!order || (order.buyer_id !== user.id && order.seller_id !== user.id)) notFound();

  const isBuyer = order.buyer_id === user.id;
  const otherId = isBuyer ? order.seller_id : order.buyer_id;
  const { data: other } = await sb.from("public_profiles").select("full_name, username, avatar_url").eq("id", otherId).single();

  const packageName = (order.package_snapshot as { name?: string } | null)?.name ?? "Order";
  const statusLabel = String(order.status).replace(/_/g, " ");

  return (
    <>
      <Navbar />
      <main id="main" className="wrap py-8 lg:py-12">
        <Link href={isBuyer ? "/orders" : "/seller/orders"} className="link text-sm">
          Back to orders
        </Link>

        <header className="mt-4 flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm tabular-nums text-ink-muted">Order {order.order_number ?? order.id}</p>
            <h1 className="t-sign mt-1">{packageName}</h1>
            <p className="mt-2 text-sm text-ink-muted">Placed {formatDateTime(order.created_at)}</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge variant={STATUS_VARIANT[order.status] ?? "default"} className="capitalize">
              {statusLabel}
            </Badge>
            <p className="fig-price text-ink">{formatMoney(Number(isBuyer ? order.buyer_total_paid : order.seller_earnings))}</p>
          </div>
        </header>

        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
          <div className="grid gap-6">
            {/* keep your existing timestamp fields here */}
            <OrderTimeline status={order.status} delivered={order.delivered_at ?? null} completed={order.completed_at ?? null} />
            <OrderActions order={order} isBuyer={isBuyer} />
          </div>

          <aside className="tray p-5" aria-label={isBuyer ? "Seller" : "Buyer"}>
            <p className="text-xs font-semibold text-ink-muted">{isBuyer ? "Seller" : "Buyer"}</p>
            <div className="mt-3 flex items-center gap-3">
              <Avatar className="h-12 w-12 ring-1 ring-line">
                {other?.avatar_url && <AvatarImage src={other.avatar_url} />}
                <AvatarFallback className="bg-transparent p-0">
                  <SellerMark username={other?.username ?? "user"} label={other?.full_name ?? "User"} size={48} />
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate font-semibold">{other?.full_name ?? "User"}</p>
                {other?.username ? <p className="truncate text-sm text-ink-muted">@{other.username}</p> : null}
              </div>
            </div>
            <Button asChild variant="outline" className="mt-4 w-full">
              <Link href="/messages">Message</Link>
            </Button>
          </aside>
        </div>
      </main>
      <Footer />
    </>
  );
}
