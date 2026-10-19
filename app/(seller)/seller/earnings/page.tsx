import { redirect } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { EarningsLedger } from "@/components/dashboard/earnings-ledger";
import { createClient } from "@/lib/supabase/server";
import { enrichOrders } from "@/lib/orders";
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
    .select("id, order_number, package_snapshot, seller_earnings, funds_cleared_at, status, gig_id, buyer_id, seller_id")
    .eq("seller_id", au.id)
    .eq("status", "completed")
    .eq("funds_cleared", false);

  const { data: openOrders } = await sb
    .from("orders")
    .select("seller_earnings")
    .eq("seller_id", au.id)
    .in("status", ["active", "requires_requirements", "in_progress", "delivered", "revision_requested", "disputed"]);
  const heldTotal = (openOrders ?? []).reduce((s, o: any) => s + Number(o.seller_earnings ?? 0), 0);
  const clearingRows = await enrichOrders(sb, (clearing ?? []).map((o: any) => ({ ...o })));

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
      <main id="main" className="wrap pb-16 pt-10 lg:pt-14">
        <p className="eyebrow">Seller</p>
        <h1 className="t-sign mt-3">Earnings</h1>
        <p className="mt-2 text-sm text-ink-2">Sample data. No real money moves.</p>

        <div className="mt-8 grid gap-6">
          <EarningsLedger held={heldTotal} clearing={clearingTotal} available={available} paidOut={paidOut} />

          <aside className="panel flex flex-wrap items-center justify-between gap-3 p-5">
            <p className="eyebrow">Payout account</p>
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
          {clearingRows.length > 0 ? (
            <ul className="mt-4 grid gap-3">
              {clearingRows.map((o: any) => (
                <li key={o.id} className="panel flex flex-wrap items-center gap-x-4 gap-y-1 p-4">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{o.gigTitle}</p>
                    <p className="num text-xs text-ink-2">{o.order_number ?? o.id}</p>
                  </div>
                  {o.funds_cleared_at ? <span className="text-xs text-ink-2">Clears {formatDate(o.funds_cleared_at)}</span> : null}
                  <span className="tag tag--go">Released</span>
                  <span className="num">{formatMoney(Number(o.seller_earnings))}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-ink-2">Nothing is clearing right now.</p>
          )}
        </section>

        <section aria-labelledby="withdrawals-title" className="mt-10">
          <h2 id="withdrawals-title" className="t-head">
            Payouts
          </h2>
          {withdrawals && withdrawals.length > 0 ? (
            <div className="panel mt-4 overflow-x-auto">
              <table className="data-table min-w-[32rem]">
                <thead>
                  <tr>
                    <th scope="col">Requested</th>
                    <th scope="col">Status</th>
                    <th scope="col" className="text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="[&_tr+tr]:border-t [&_tr+tr]:border-line">
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
            <EmptyState className="mt-4" sign="No payouts" title="No payouts yet" description="Approved earnings clear first, then you can withdraw them to your bank." />
          )}
        </section>
      </main>
      <Footer variant="app" />
    </>
  );
}
