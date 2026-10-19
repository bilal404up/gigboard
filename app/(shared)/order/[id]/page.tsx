import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { SellerMark } from "@/components/seller/SellerMark";
import { OrderTimeline } from "@/components/order/order-timeline";
import { OrderActions } from "@/components/order/order-actions";
import { DepartureStrip } from "@/components/order/departure-strip";
import { StatusTag } from "@/components/order/status-tag";
import { createClient } from "@/lib/supabase/server";
import { enrichOrders } from "@/lib/orders";
import { statusInfo, plural } from "@/lib/order-status";
import { formatMoney, formatDateTime } from "@/lib/utils/format";

export default async function OrderDetailPage({ params }: { params: { id: string } }) {
  const sb = createClient();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) redirect(`/login?redirect=/order/${params.id}`);

  const { data: raw } = await sb.from("orders").select("*").eq("id", params.id).single();
  if (!raw || (raw.buyer_id !== user.id && raw.seller_id !== user.id)) notFound();
  const [order] = await enrichOrders(sb, [raw]);

  const isBuyer = order.buyer_id === user.id;
  const otherId = isBuyer ? order.seller_id : order.buyer_id;
  const { data: other } = await sb.from("public_profiles").select("full_name, username, avatar_url").eq("id", otherId).single();

  const amount = Number(isBuyer ? order.buyer_total_paid : order.seller_earnings);
  const info = statusInfo(order.status);

  return (
    <>
      <Navbar />
      <main id="main" className="wrap pb-16 pt-8 lg:pt-10">
        <Link href={isBuyer ? "/orders" : "/seller/orders"} className="link inline-flex min-h-11 items-center text-sm">
          Back to orders
        </Link>

        <header className="mt-3 flex flex-wrap items-end justify-between gap-4">
          <div className="min-w-0">
            <p className="eyebrow">
              Order <span className="num normal-case">{order.order_number ?? order.id}</span> · Placed {formatDateTime(order.created_at)}
            </p>
            <h1 className="t-sign mt-3 max-w-[24ch]">{order.gigTitle}</h1>
            {order.packageName ? <p className="mt-2 text-sm text-ink-2">{order.packageName} package</p> : null}
          </div>
          <StatusTag status={order.status} />
        </header>

        <DepartureStrip
          className="mt-8"
          orderId={order.id}
          orderNumber={order.order_number}
          title={order.gigTitle}
          sellerName={order.sellerName}
          readyBy={order.delivery_due_at}
          amount={formatMoney(Number(order.buyer_total_paid))}
          status={order.status}
        />

        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start lg:gap-8">
          <div className="grid gap-6">
            <OrderTimeline
              status={order.status}
              created={order.created_at}
              delivered={order.delivered_at ?? null}
              completed={order.completed_at ?? null}
              cancelled={order.cancelled_at ?? null}
              dueAt={order.delivery_due_at}
              isBuyer={isBuyer}
            />

            <section className="panel p-5 md:p-6" aria-labelledby="money-title">
              <h2 id="money-title" className="eyebrow">
                {isBuyer ? "What you paid" : "What you earn"}
              </h2>
              <dl className="mt-4 grid gap-4 sm:grid-cols-3">
                <div>
                  <dt className="text-sm text-ink-2">{isBuyer ? "Total paid" : "Your earnings"}</dt>
                  <dd className="num mt-1 text-[1.375rem] tracking-[-0.03em]">{formatMoney(amount)}</dd>
                </div>
                <div>
                  <dt className="text-sm text-ink-2">Where it is</dt>
                  <dd className="mt-1.5">
                    <span className={`tag tag--${info.tone}`}>{info.label}</span>
                  </dd>
                  <dd className="mt-1 text-xs text-ink-2">{info.money}</dd>
                </div>
                <div>
                  <dt className="text-sm text-ink-2">Package</dt>
                  <dd className="mt-1 text-sm">
                    {plural(order.delivery_days, "day")} · {order.revisions_allowed === -1 ? "unlimited revisions" : plural(order.revisions_allowed, "revision")}
                  </dd>
                </div>
              </dl>
            </section>
          </div>

          <div className="grid gap-6 lg:sticky lg:top-[calc(var(--header-h)+1.5rem)]">
            <OrderActions order={order} isBuyer={isBuyer} />

            <aside className="panel p-5" aria-label={isBuyer ? "Seller" : "Buyer"}>
              <p className="eyebrow">{isBuyer ? "Seller" : "Buyer"}</p>
              <div className="mt-3 flex items-center gap-3">
                <Avatar className="h-11 w-11 rounded-full">
                  {other?.avatar_url && <AvatarImage src={other.avatar_url} />}
                  <AvatarFallback className="bg-transparent p-0">
                    <SellerMark username={other?.username ?? "user"} label={other?.full_name ?? "User"} size={44} />
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="truncate font-semibold">{other?.full_name ?? "User"}</p>
                  {other?.username ? <p className="truncate text-sm text-ink-2">@{other.username}</p> : null}
                </div>
              </div>
              <Button asChild variant="secondary" className="mt-4 w-full">
                <Link href="/messages">Message</Link>
              </Button>
            </aside>
          </div>
        </div>
      </main>
      <Footer variant="app" />
    </>
  );
}
