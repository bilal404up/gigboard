import Link from "next/link";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { EmptyState } from "@/components/ui/empty-state";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatDate, formatMoney } from "@/lib/utils/format";

const TONE: Record<string, string> = {
  open: "tag tag--stop",
  in_review: "tag tag--held",
  resolved_buyer: "tag tag--neutral",
  resolved_seller: "tag tag--neutral",
  cancelled: "tag tag--neutral",
};

/* Disputes are participant-only under RLS, so the admin list is read with the server-only client after an admin check. Read-only. */
export default async function AdminDisputesPage() {
  const sb = createClient();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) notFound();
  const { data: me } = await sb.from("users").select("is_admin").eq("id", user.id).single();
  if (!me?.is_admin) notFound();

  const { data } = await createAdminClient()
    .from("disputes")
    .select("*, orders(order_number, buyer_id, seller_id, buyer_total_paid)")
    .order("created_at", { ascending: false });

  return (
    <>
      <Navbar />
      <main id="main" className="wrap pb-16 pt-10 lg:pt-14">
        <p className="eyebrow">
          <Link href="/admin" className="link">
            Admin
          </Link>
        </p>
        <h1 className="t-sign mt-3">Disputes</h1>
        <p className="mt-2 text-sm text-ink-2">
          <span className="num">{data?.length ?? 0}</span> total, most recent first. Payment stays held while a dispute is open.
        </p>

        <div className="mt-8">
          {!data || data.length === 0 ? (
            <EmptyState sign="All clear" title="No disputes" description="Disputes on orders appear here with the amount that is held." />
          ) : (
            <ul className="panel divide-y divide-line overflow-hidden">
              {data.map((d: any) => (
                <li key={d.id}>
                  <Link href={`/order/${d.order_id}`} className="grid gap-1 px-5 py-4 transition-colors hover:bg-[#FAF9F6] md:grid-cols-[minmax(0,1fr)_auto] md:items-center md:gap-6">
                    <span className="min-w-0">
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="num text-xs text-ink-2">{d.orders?.order_number}</span>
                        <span className={TONE[d.status] ?? "tag tag--neutral"}>{String(d.status).replace(/_/g, " ")}</span>
                      </span>
                      <span className="mt-1 block font-semibold first-letter:uppercase">{String(d.reason).replace(/_/g, " ")}</span>
                      <span className="mt-0.5 block text-sm text-ink-2 line-clamp-2">{d.description}</span>
                    </span>
                    <span className="text-left md:text-right">
                      {d.orders?.buyer_total_paid != null ? <span className="num block">{formatMoney(Number(d.orders.buyer_total_paid))}</span> : null}
                      <span className="block text-xs text-ink-2">Opened {formatDate(d.created_at)}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
      <Footer variant="app" />
    </>
  );
}
