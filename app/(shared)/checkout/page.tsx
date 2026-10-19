"use client";

import { Suspense, useEffect, useState } from "react";
import { Field } from "@/components/ui/field";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { calculateOrderPricing, DEFAULT_PLATFORM_SETTINGS } from "@/lib/utils/fee-calculator";
import { formatMoney } from "@/lib/utils/format";
import { gigTitle, plural } from "@/lib/order-status";
import { toast } from "sonner";
import { cn } from "@/lib/utils/cn";
import { isStripeLive } from "@/lib/stripe/browser";
import { StripePaymentForm } from "@/components/checkout/stripe-payment-form";
import type { GigPackage, Gig } from "@/types/database.types";

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="py-16 text-center">
          <Loader2 className="mx-auto h-6 w-6 animate-spin text-ink-2" aria-label="Loading" />
        </div>
      }
    >
      <CheckoutInner />
    </Suspense>
  );
}

function Line({ label, value, muted, bold }: { label: string; value: string; muted?: boolean; bold?: boolean }) {
  return (
    <div className="flex items-baseline gap-3 py-1.5">
      <span className={cn("min-w-0 truncate", muted && "text-ink-2", bold && "font-semibold")}>{label}</span>
      <span aria-hidden="true" className="mb-1 min-w-3 flex-1 border-b border-dashed border-line-strong" />
      <span className={cn("num shrink-0", bold && "text-[1.375rem] leading-none tracking-[-0.03em]")}>{value}</span>
    </div>
  );
}

function shortDate(days: number) {
  const t = new Date();
  return new Date(t.getFullYear(), t.getMonth(), t.getDate() + days).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

function CheckoutInner() {
  const router = useRouter();
  const search = useSearchParams();
  const gigId = search.get("gig");
  const pkgId = search.get("pkg");
  const extrasParam = search.get("extras") || "";

  const [gig, setGig] = useState<Gig | null>(null);
  const [pkg, setPkg] = useState<GigPackage | null>(null);
  const [extras, setExtras] = useState<any[]>([]);
  const [intent, setIntent] = useState<{ clientSecret: string; orderId: string } | null>(null);
  const [intentLoading, setIntentLoading] = useState(false);
  const [intentError, setIntentError] = useState<string | null>(null);
  const [useStripeFlow, setUseStripeFlow] = useState<boolean>(false);

  useEffect(() => {
    if (!gigId || !pkgId) return;
    const sb = createClient();
    (async () => {
      const [{ data: g }, { data: p }, { data: ex }] = await Promise.all([
        sb.from("gigs").select("*").eq("id", gigId).single(),
        sb.from("gig_packages").select("*").eq("id", pkgId).single(),
        sb
          .from("gig_extras")
          .select("*")
          .in("id", extrasParam ? extrasParam.split(",").filter(Boolean) : ["00000000-0000-0000-0000-000000000000"]),
      ]);
      setGig(g as Gig);
      setPkg(p as GigPackage);
      setExtras(ex ?? []);
    })();
  }, [gigId, pkgId, extrasParam]);

  // Decide the flow and create a PaymentIntent once the order context is known
  useEffect(() => {
    if (!gig || !pkg || intent || intentLoading) return;
    if (!isStripeLive()) {
      setUseStripeFlow(false);
      return;
    }
    (async () => {
      setIntentLoading(true);
      setIntentError(null);
      try {
        const res = await fetch("/api/payments/create-intent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            gig_id: gigId,
            package_id: pkgId,
            selected_extras: extras.map((e) => ({ id: e.id, title: e.title, price: Number(e.price) })),
          }),
        });
        if (res.status === 503) {
          // The server says Stripe is not configured: fall back to the demo checkout
          setUseStripeFlow(false);
          return;
        }
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to start payment");
        setIntent({ clientSecret: data.clientSecret, orderId: data.orderId });
        setUseStripeFlow(true);
      } catch (e: any) {
        setIntentError(e.message);
        setUseStripeFlow(false);
      } finally {
        setIntentLoading(false);
      }
    })();
  }, [gig, pkg, extras, gigId, pkgId, intent, intentLoading]);

  if (!gig || !pkg) {
    return (
      <>
        <Navbar />
        <main id="main" className="wrap py-16 text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-ink-2" aria-label="Loading your order" />
        </main>
        <Footer variant="app" />
      </>
    );
  }

  const extrasTotal = extras.reduce((s, e) => s + Number(e.price), 0);
  const pricing = calculateOrderPricing(Number(pkg.price), extrasTotal, DEFAULT_PLATFORM_SETTINGS);
  const revisions = pkg.revisions === -1 ? "Unlimited revisions" : plural(pkg.revisions, "revision");

  return (
    <>
      <Navbar />
      <main id="main" className="wrap pb-16 pt-8 lg:pt-10">
        <Link href={`/gig/${gig.slug}`} className="link inline-flex min-h-11 items-center gap-1 text-sm">
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          Back to gig
        </Link>

        <p className="eyebrow mt-4">Step 1 of 2 · Pay, then send your brief</p>
        <h1 className="t-sign mt-3">Checkout</h1>

        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_26rem] lg:items-start lg:gap-10">
          <section className="space-y-5">
            {useStripeFlow ? (
              <div className="rounded-[12px] bg-held-bg p-4 shadow-[inset_0_0_0_1px_#F0D98A]">
                <p className="text-sm font-semibold text-ink">Demo payments</p>
                <p className="mt-1 text-sm leading-relaxed text-ink">
                  Use <span className="num rounded-[4px] bg-surface px-1.5 py-0.5 text-xs">4242 4242 4242 4242</span>, any future expiry and any CVC. No real money moves.
                </p>
              </div>
            ) : (
              <div className="rounded-[12px] bg-held-bg p-4 shadow-[inset_0_0_0_1px_#F0D98A]" role="note">
                <p className="text-sm font-semibold text-ink">Demo payment</p>
                <p className="mt-1 text-sm leading-relaxed text-ink">
                  No card is charged here and the card details are not sent anywhere. Enter any details to place the order and see the held-payment flow.
                </p>
              </div>
            )}

            <div className="drawer-card">
              <h2 className="t-head mb-5">Payment details</h2>
              {useStripeFlow ? (
                intent ? (
                  <StripePaymentForm clientSecret={intent.clientSecret} orderId={intent.orderId} totalCents={Math.round(pricing.buyerTotalPaid * 100)} />
                ) : intentLoading ? (
                  <div className="py-10 text-center">
                    <Loader2 className="mx-auto h-6 w-6 animate-spin text-ink-2" aria-hidden="true" />
                    <p className="mt-2 text-sm text-ink-2">Preparing the payment form</p>
                  </div>
                ) : intentError ? (
                  <div className="well-error">
                    <p className="font-semibold">Could not start the payment</p>
                    <p className="mt-1 text-xs">{intentError}</p>
                  </div>
                ) : null
              ) : (
                <DemoCardForm
                  totalPaid={pricing.buyerTotalPaid}
                  onPlaceOrder={async () => {
                    const res = await fetch("/api/orders", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        gig_id: gigId,
                        package_id: pkgId,
                        selected_extras: extras.map((e) => ({ id: e.id, title: e.title, price: Number(e.price) })),
                      }),
                    });
                    const data = await res.json();
                    if (!res.ok) throw new Error(data.error || "Failed to place order");
                    toast.success("Order placed. Your payment is held.");
                    router.push(`/order/${data.order.id}/requirements`);
                  }}
                />
              )}
            </div>
          </section>

          {/* the order summary, printed like a ticket */}
          <aside className="ticket lg:sticky lg:top-[calc(var(--header-h)+1.5rem)] lg:self-start" aria-labelledby="summary-title">
            <div className="ticket-head">
              <span className="eyebrow !text-[#B8B4AA]">Order summary</span>
              <span className="tag tag--held">Held on payment</span>
            </div>
            <div className="ticket-body">
              <h2 id="summary-title" className="text-[1.0625rem] font-semibold leading-snug">
                {gigTitle(gig.title)}
              </h2>
              <dl className="mt-4 grid grid-cols-3 gap-3 text-sm">
                <div>
                  <dt className="eyebrow">Package</dt>
                  <dd className="mt-1">{pkg.name}</dd>
                </div>
                <div>
                  <dt className="eyebrow">Ready by</dt>
                  <dd className="num mt-1" suppressHydrationWarning>
                    {shortDate(pkg.delivery_days)}
                  </dd>
                  <dd className="text-xs text-ink-2">{plural(pkg.delivery_days, "day")}</dd>
                </div>
                <div>
                  <dt className="eyebrow">Revisions</dt>
                  <dd className="mt-1">{revisions}</dd>
                </div>
              </dl>
            </div>
            <div className="ticket-tear" aria-hidden="true" />
            <div className="ticket-body text-sm">
              <Line label="Package" value={formatMoney(Number(pkg.price))} muted />
              {extras.map((e) => (
                <Line key={e.id} label={`+ ${e.title}`} value={formatMoney(Number(e.price))} muted />
              ))}
              <Line label="Service fee" value={formatMoney(pricing.buyerServiceFee)} muted />
              {pricing.buyerSmallOrderFee > 0 && <Line label="Small order fee" value={formatMoney(pricing.buyerSmallOrderFee)} muted />}
              <div className="mt-2 border-t border-line pt-2">
                <Line label="Total" value={formatMoney(pricing.buyerTotalPaid)} bold />
              </div>
              <p className="mt-4 text-sm leading-[1.5] text-ink-2">Held when you pay. Released to the seller only when you approve the work.</p>
            </div>
          </aside>
        </div>
      </main>
      <Footer variant="app" />
    </>
  );
}

function DemoCardForm({ totalPaid, onPlaceOrder }: { totalPaid: number; onPlaceOrder: () => Promise<void> }) {
  const [card, setCard] = useState("");
  const [exp, setExp] = useState("");
  const [cvc, setCvc] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState(false);

  const errors = {
    card: card.length !== 16 ? "Card number must be 16 digits" : "",
    exp: !/^\d{2}\/\d{2}$/.test(exp) ? "Use MM/YY format" : "",
    cvc: cvc.length < 3 ? "CVC must be 3 or 4 digits" : "",
    name: name.trim().length < 2 ? "Required" : "",
  };
  const valid = !errors.card && !errors.exp && !errors.cvc && !errors.name;

  function fmtExpiry(v: string) {
    const digits = v.replace(/\D/g, "").slice(0, 4);
    if (digits.length < 3) return digits;
    return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  }
  function fmtCard(v: string) {
    return v.replace(/\D/g, "").slice(0, 16);
  }

  async function submit() {
    setTouched(true);
    if (!valid) {
      toast.error("Please fill in all card details.");
      return;
    }
    setLoading(true);
    try {
      await onPlaceOrder();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="space-y-4">
        <Field label="Cardholder name" error={touched ? errors.name : ""}>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Any name" autoComplete="off" />
        </Field>
        <Field label="Card number" error={touched ? errors.card : ""}>
          <Input value={card.replace(/(\d{4})(?=\d)/g, "$1 ")} onChange={(e) => setCard(fmtCard(e.target.value))} placeholder="Any 16 digits" inputMode="numeric" autoComplete="off" />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Expiry" error={touched ? errors.exp : ""}>
            <Input value={exp} onChange={(e) => setExp(fmtExpiry(e.target.value))} placeholder="MM/YY" inputMode="numeric" autoComplete="off" />
          </Field>
          <Field label="CVC" error={touched ? errors.cvc : ""}>
            <Input value={cvc} onChange={(e) => setCvc(e.target.value.replace(/\D/g, "").slice(0, 4))} placeholder="123" inputMode="numeric" autoComplete="off" />
          </Field>
        </div>
      </div>

      <p className="mt-5 text-sm text-ink-2">This is a demo checkout. The details above stay in this page and are never sent or saved.</p>

      <Button type="button" size="lg" onClick={submit} disabled={loading} className="mt-5 w-full">
        {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-label="Placing order" /> : <>Pay {formatMoney(totalPaid)}</>}
      </Button>
    </>
  );
}
