"use client";

import { Suspense, useEffect, useState } from "react";
import { Field } from "@/components/ui/field";
import { useSearchParams, useRouter } from "next/navigation";
import { Lock, Loader2, Info, ShieldCheck, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { EscrowDrawer } from "@/components/escrow/EscrowDrawer";
import { createClient } from "@/lib/supabase/client";
import { calculateOrderPricing, DEFAULT_PLATFORM_SETTINGS } from "@/lib/utils/fee-calculator";
import { formatMoney } from "@/lib/utils/format";
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
          <Loader2 className="mx-auto h-6 w-6 animate-spin text-ink-faint" />
        </div>
      }
    >
      <CheckoutInner />
    </Suspense>
  );
}

function Line({ label, value, muted, bold }: { label: string; value: string; muted?: boolean; bold?: boolean }) {
  return (
    <div className="flex items-baseline gap-2 py-1">
      <span className={cn("min-w-0 truncate", muted && "text-ink-muted", bold && "font-semibold")}>{label}</span>
      <span aria-hidden="true" className="mb-1 min-w-3 flex-1 border-b-2 border-dotted border-sand" />
      <span className={cn("num shrink-0", bold && "fig-price")}>{value}</span>
    </div>
  );
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
          .in(
            "id",
            extrasParam ? extrasParam.split(",").filter(Boolean) : ["00000000-0000-0000-0000-000000000000"]
          ),
      ]);
      setGig(g as Gig);
      setPkg(p as GigPackage);
      setExtras(ex ?? []);
    })();
  }, [gigId, pkgId, extrasParam]);

  // Decide flow + create PaymentIntent once we have order context
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
          // Server says Stripe isn't configured, fall back gracefully
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
        <main className="wrap py-16 text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-ink-faint" />
        </main>
        <Footer />
      </>
    );
  }

  const extrasTotal = extras.reduce((s, e) => s + Number(e.price), 0);
  const pricing = calculateOrderPricing(Number(pkg.price), extrasTotal, DEFAULT_PLATFORM_SETTINGS);

  return (
    <>
      <Navbar />
      <main id="main" className="wrap py-8 lg:py-10">
        <Link href={`/gig/${gig.slug}`} className="link inline-flex min-h-11 items-center gap-1 text-sm">
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          Back to gig
        </Link>

        <h1 className="t-sign mt-3">Secure checkout</h1>
        <p className="mt-2 max-w-[52ch] text-sm text-ink-muted">
          Review your order, then complete payment to release the brief to your seller.
        </p>

        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-start lg:gap-8">
          <section className="space-y-5">
            {useStripeFlow ? (
              <div className="tray flex items-start gap-3 p-4">
                <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-brass-deep" aria-hidden="true" />
                <div className="text-sm">
                  <p className="mb-0.5 font-semibold text-ink">Test mode payment</p>
                  <p className="leading-relaxed text-ink-muted">
                    Use <code className="num rounded-[3px] bg-laminate-sunk px-1.5 py-0.5 text-xs">4242 4242 4242 4242</code>,
                    any future expiry, any CVC.
                  </p>
                </div>
              </div>
            ) : (
              <div className="tray flex items-start gap-3 p-4">
                <Info className="mt-0.5 h-5 w-5 shrink-0 text-brass-deep" aria-hidden="true" />
                <div className="text-sm">
                  <p className="mb-0.5 font-semibold text-ink">Demo mode, no real charge</p>
                  <p className="leading-relaxed text-ink-muted">
                    Stripe isn&apos;t configured in this environment. Fill in any card details to
                    simulate placing the order.
                  </p>
                </div>
              </div>
            )}

            <div className="drawer-card">
              <h2 className="t-head mb-5">Payment details</h2>
              {useStripeFlow ? (
                intent ? (
                  <StripePaymentForm
                    clientSecret={intent.clientSecret}
                    orderId={intent.orderId}
                    totalCents={Math.round(pricing.buyerTotalPaid * 100)}
                  />
                ) : intentLoading ? (
                  <div className="py-10 text-center">
                    <Loader2 className="mx-auto h-6 w-6 animate-spin text-ink-faint" />
                    <p className="mt-2 text-sm text-ink-muted">Preparing secure payment…</p>
                  </div>
                ) : intentError ? (
                  <div className="well-error">
                    <p className="font-semibold">Couldn&apos;t start payment</p>
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
                    toast.success("Order placed!");
                    router.push(`/order/${data.order.id}/requirements`);
                  }}
                />
              )}
            </div>
          </section>

          <aside className="drawer-card lg:sticky lg:top-[calc(var(--header-h)+1rem)] lg:self-start">
            <h2 className="t-head">Order summary</h2>
            <p className="mt-2 line-clamp-2 text-sm font-semibold text-ink">{gig.title}</p>
            <dl className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-muted">
              <div><dt className="sr-only">Package</dt><dd>{pkg.name}</dd></div>
              <div className="num"><dt className="sr-only">Delivery</dt><dd>{pkg.delivery_days} days</dd></div>
              <div className="num"><dt className="sr-only">Revisions</dt><dd>{pkg.revisions === -1 ? "Unlimited" : pkg.revisions} revisions</dd></div>
            </dl>

            <div className="mt-4 border-t-2 border-dotted border-sand pt-3 text-sm">
              <Line label="Package" value={formatMoney(Number(pkg.price))} muted />
              {extras.map((e) => (
                <Line key={e.id} label={`+ ${e.title}`} value={formatMoney(Number(e.price))} muted />
              ))}
              <Line label="Service fee" value={formatMoney(pricing.buyerServiceFee)} muted />
              {pricing.buyerSmallOrderFee > 0 && <Line label="Small order fee" value={formatMoney(pricing.buyerSmallOrderFee)} muted />}
              <div className="mt-2 border-t-2 border-dotted border-sand pt-2">
                <Line label="Total" value={formatMoney(pricing.buyerTotalPaid)} bold />
              </div>
            </div>

            <div className="mt-5 rounded-[8px] bg-mahogany-deep p-3">
              <EscrowDrawer
                state="held"
                size="sm"
                amount={formatMoney(pricing.buyerTotalPaid)}
                note={<span className="text-laminate">Goes under the glass when you pay. Moves only when you approve.</span>}
              />
            </div>
          </aside>
        </div>
      </main>
      <Footer />
    </>
  );
}

function DemoCardForm({
  totalPaid,
  onPlaceOrder,
}: {
  totalPaid: number;
  onPlaceOrder: () => Promise<void>;
}) {
  const [card, setCard] = useState("");
  const [exp, setExp] = useState("");
  const [cvc, setCvc] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState(false);

  const errors = {
    card: card.length !== 16 ? "Card number must be 16 digits" : "",
    exp: !/^\d{2}\/\d{2}$/.test(exp) ? "Use MM/YY format" : "",
    cvc: cvc.length < 3 ? "CVC must be 3–4 digits" : "",
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
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="As shown on card" autoComplete="cc-name" />
        </Field>

        <Field label="Card number" error={touched ? errors.card : ""}>
          <div className="relative">
            <Input
              value={card.replace(/(\d{4})(?=\d)/g, "$1 ")}
              onChange={(e) => setCard(fmtCard(e.target.value))}
              placeholder="1234 5678 9012 3456"
              inputMode="numeric"
              autoComplete="cc-number"
              className="pr-14"
            />
            <Lock className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brass-deep" aria-hidden="true" />
          </div>
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Expiry" error={touched ? errors.exp : ""}>
            <Input value={exp} onChange={(e) => setExp(fmtExpiry(e.target.value))} placeholder="MM/YY" inputMode="numeric" autoComplete="cc-exp" />
          </Field>
          <Field label="CVC" error={touched ? errors.cvc : ""}>
            <Input value={cvc} onChange={(e) => setCvc(e.target.value.replace(/\D/g, "").slice(0, 4))} placeholder="123" inputMode="numeric" autoComplete="cc-csc" />
          </Field>
        </div>
      </div>

      <div className="mt-5 flex items-start gap-2 text-xs text-ink-muted">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-brass-deep" aria-hidden="true" />
        <p>
          Your payment is held in escrow by Gigboard until you approve the delivery.
          Card details are not saved.
        </p>
      </div>

      <Button type="button" variant="cta" size="lg" onClick={submit} disabled={loading} className="mt-5 w-full">
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <>
            <Lock className="h-4 w-4" aria-hidden="true" />
            Pay {formatMoney(totalPaid)}
          </>
        )}
      </Button>
    </>
  );
}
