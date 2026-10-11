import { redirect } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { EarningsLedger } from "@/components/dashboard/earnings-ledger";
import { createClient } from "@/lib/supabase/server";
import { formatMoney, formatDate } from "@/lib/utils/format";

const STATUS_VARIANT: Record<string, "default" | "secondary" | "outline" | "success" | "warning" | "error" | "info"> = {
  pending: "warning",
  processing: "info",
  paid: "success",
  failed: "error",
};

export default async function SellerEarningsPage() {
  const sb = createClient();
  const { data: { user: au } } = await sb.auth.getUser();
  if (!au) redirect("/login");

  const { data: profile } = await sb.from("seller_profiles").select("*").eq("user_id", au.id).single();
  if (!profile) redirect("/become-seller");

  const { data: clearing } = await sb
    .from("orders")
    .select("id, order_number, package_snapshot, seller_earnings, funds_cleared_at, status")
    .eq("seller_id", au.id)
    .eq("status", "completed")
    .eq("funds_cleared", false);

  const { data: withdrawals } = await sb
    .from("withdrawals")
    .select("*")
    .eq("seller_id", au.id)
    .order("requested_at", { ascending: false })
    .limit(10);

  const bankConnected = Boolean(profile.mock_bank_name);

  // keep your existing balance fields here if they differ
  const clearingTotal = (clearing ?? []).reduce((s, o: any) => s + Number(o.seller_earnings ?? 0), 0);
  const available = Number((profile as any).available_balance ?? 0);
  const paidOut = (withdrawals ?? []).filter((w: any) => w.status === "paid").reduce((s, w: any) => s + Number(w.amount ?? 0), 0);

  return (
    <>
      <Navbar />
      <main id="main" className="wrap py-8 lg:py-10">
        <h1 className="t-sign">Earnings</h1>
        <p className="mt-2 text-sm text-ink-muted">Sample data, Stripe test mode. No real money moves.</p>

        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
          <EarningsLedger held={clearingTotal} available={available} paidOut={paidOut} />

          <aside className="tray p-5">
            <p className="t-plate text-ink-muted">Payout account</p>
            {bankConnected ? (
              <p className="mt-2 inline-flex items-center gap-2 font-semibold">
                <span className="lamp lamp--release" aria-hidden="true" />
                {profile.mock_bank_name}
              </p>
            ) : (
              <>
                <p className="mt-2 inline-flex items-center gap-2 font-semibold">
                  <span className="lamp" aria-hidden="true" />
                  No bank connected
                </p>
                <Link href="/become-seller" className="link mt-2 inline-block text-sm font-semibold">
                  Connect your bank
                </Link>
              </>
            )}
          </aside>
        </div>

        <section aria-labelledby="clearing-title" className="mt-10">
          <h2 id="clearing-title" className="t-head">
            Approved, clearing
          </h2>
          {clearing && clearing.length > 0 ? (
            <ul className="mt-4 grid gap-3">
              {clearing.map((o: any) => (
                <li key={o.id} className="tray flex flex-wrap items-center gap-x-4 gap-y-1 p-4">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{(o.package_snapshot as { name?: string } | null)?.name ?? "Order"}</p>
                    <p className="num text-xs text-ink-muted">{o.order_number ?? o.id}</p>
                  </div>
                  {o.funds_cleared_at ? <span className="text-xs text-ink-muted">Clears {formatDate(o.funds_cleared_at)}</span> : null}
                  <span className="num font-bold">{formatMoney(Number(o.seller_earnings))}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-ink-muted">Nothing is clearing right now.</p>
          )}
        </section>

        <section aria-labelledby="withdrawals-title" className="mt-10">
          <h2 id="withdrawals-title" className="t-head">
            Payouts
          </h2>
          {withdrawals && withdrawals.length > 0 ? (
            <div className="tray mt-4 overflow-x-auto">
              <table className="w-full min-w-[32rem] text-left text-sm">
                <thead>
                  <tr className="t-plate text-ink-muted">
                    <th scope="col" className="px-4 py-3 font-bold">Requested</th>
                    <th scope="col" className="px-4 py-3 font-bold">Status</th>
                    <th scope="col" className="px-4 py-3 text-right font-bold">Amount</th>
                  </tr>
                </thead>
                <tbody className="[&_tr+tr]:border-t-2 [&_tr+tr]:border-dotted [&_tr+tr]:border-sand">
                  {withdrawals.map((w: any) => (
                    <tr key={w.id}>
                      <td className="num px-4 py-3">{formatDate(w.requested_at)}</td>
                      <td className="px-4 py-3"><Badge variant={STATUS_VARIANT[w.status] ?? "default"} className="capitalize">{w.status}</Badge></td>
                      <td className="num px-4 py-3 text-right font-bold">{formatMoney(Number(w.amount ?? 0))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState className="mt-4" title="No payouts yet" description="Approved earnings clear first, then you can withdraw them to your bank." />
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
