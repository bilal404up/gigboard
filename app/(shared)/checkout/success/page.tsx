"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { DepartureStrip } from "@/components/order/departure-strip";
import { createClient } from "@/lib/supabase/client";
import { formatMoney } from "@/lib/utils/format";
import { gigTitle } from "@/lib/order-status";

type Summary = { id: string; number: string | null; title: string; seller: string | null; due: string | null; amount: number; status: string };

function SuccessInner() {
  const search = useSearchParams();
  const orderId = search.get("order");
  const [order, setOrder] = useState<Summary | null>(null);

  useEffect(() => {
    if (!orderId) return;
    const sb = createClient();
    (async () => {
      const { data: o } = await sb.from("orders").select("id, order_number, gig_id, seller_id, delivery_due_at, buyer_total_paid, status, package_snapshot").eq("id", orderId).single();
      if (!o) return;
      const [{ data: g }, { data: s }] = await Promise.all([
        sb.from("gigs").select("title").eq("id", o.gig_id).single(),
        sb.from("public_profiles").select("full_name").eq("id", o.seller_id).single(),
      ]);
      setOrder({
        id: o.id,
        number: o.order_number,
        title: g?.title ? gigTitle(g.title) : ((o.package_snapshot as { name?: string } | null)?.name ?? "Your order"),
        seller: s?.full_name ?? null,
        due: o.delivery_due_at,
        amount: Number(o.buyer_total_paid),
        status: o.status,
      });
    })();
  }, [orderId]);

  return (
    <>
      <Navbar />
      <main id="main" className="wrap pb-20 pt-12 lg:pt-20">
        <p className="eyebrow">Payment received</p>
        <h1 className="t-sign-xl mt-4 max-w-[16ch]">Payment held.</h1>
        <p className="mt-5 max-w-[48ch] text-[1.0625rem] leading-[1.55] text-ink-2">
          It stays with Gigboard until you approve the delivery. Nothing reaches the seller before that.
        </p>

        <div className="mt-10 max-w-5xl">
          {order ? (
            <DepartureStrip orderId={order.id} orderNumber={order.number} title={order.title} sellerName={order.seller} readyBy={order.due} amount={formatMoney(order.amount)} status={order.status === "pending_payment" ? "active" : order.status} />
          ) : (
            <div className="departure h-[76px]" aria-hidden="true" />
          )}
        </div>

        <div className="mt-10 grid max-w-5xl gap-6 border-t border-line pt-8 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
          <div>
            <p className="font-semibold">Next: send your brief</p>
            <p className="mt-1 text-sm text-ink-2">The seller starts once they have your requirements. The delivery date counts from the order.</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            {orderId ? (
              <Button asChild size="lg">
                <Link href={`/order/${orderId}`}>View your order</Link>
              </Button>
            ) : null}
            <Button asChild variant="secondary" size="lg">
              <Link href="/search">Browse more gigs</Link>
            </Button>
          </div>
        </div>
      </main>
      <Footer variant="app" />
    </>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={null}>
      <SuccessInner />
    </Suspense>
  );
}
