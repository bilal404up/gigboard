import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { GigArt } from "@/components/gig/GigArt";
import { createClient } from "@/lib/supabase/server";

const STATUS_VARIANT: Record<string, "default" | "secondary" | "outline" | "success" | "warning" | "error" | "info"> = {
  active: "success",
  pending_approval: "warning",
  paused: "secondary",
  draft: "secondary",
  rejected: "error",
};

export default async function SellerGigsPage() {
  const sb = createClient();
  const { data: { user: au } } = await sb.auth.getUser();
  if (!au) redirect("/login");

  const { data: gigs } = await sb
    .from("gigs")
    .select("id, slug, title, status, thumbnail_url, total_orders, impressions, clicks, average_rating")
    .eq("seller_id", au.id)
    .order("created_at", { ascending: false });

  return (
    <>
      <Navbar />
      <main id="main" className="wrap py-8 lg:py-10">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="t-sign">Your gigs</h1>
            <p className="mt-2 text-sm text-ink-muted">What is on the board at your window.</p>
          </div>
          <Button asChild variant="cta">
            <Link href="/seller/gigs/create">Create a gig</Link>
          </Button>
        </header>

        {gigs && gigs.length > 0 ? (
          <ul className="mt-8 grid gap-3">
            {gigs.map((g: any) => (
              <li key={g.id} className="tray grid grid-cols-[5rem_minmax(0,1fr)] items-center gap-4 p-3 md:grid-cols-[6rem_minmax(0,1fr)_auto]">
                <div className="relative aspect-[4/3] overflow-hidden rounded-[6px] bg-laminate-sunk">
                  {g.thumbnail_url ? <Image src={g.thumbnail_url} alt="" fill className="object-cover" sizes="96px" /> : <GigArt seed={g.id} cover />}
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link href={`/gig/${g.slug}`} className="link truncate font-semibold decoration-transparent hover:decoration-current">
                      {g.title}
                    </Link>
                    <Badge variant={STATUS_VARIANT[g.status] ?? "default"} className="capitalize">{String(g.status).replace(/_/g, " ")}</Badge>
                  </div>
                  <dl className="num mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-muted">
                    <div><dt className="inline">Impressions </dt><dd className="inline text-ink">{g.impressions ?? 0}</dd></div>
                    <div><dt className="inline">Clicks </dt><dd className="inline text-ink">{g.clicks ?? 0}</dd></div>
                    <div><dt className="inline">Orders </dt><dd className="inline text-ink">{g.total_orders ?? 0}</dd></div>
                    <div><dt className="inline">Rating </dt><dd className="inline text-ink">{Number(g.average_rating) > 0 ? Number(g.average_rating).toFixed(1) : "none"}</dd></div>
                  </dl>
                </div>
                <Button asChild variant="outline" size="sm" className="col-start-2 justify-self-start md:col-start-3">
                  <Link href={`/gig/${g.slug}`}>View</Link>
                </Button>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState
            className="mt-8"
            title="Nothing on the board yet"
            description="Publish your first gig: three packages, a price each, a delivery time. Buyers pay into the drawer and you get paid when they approve."
            action={
              <Button asChild variant="cta">
                <Link href="/seller/gigs/create">Create a gig</Link>
              </Button>
            }
          />
        )}
      </main>
      <Footer />
    </>
  );
}
