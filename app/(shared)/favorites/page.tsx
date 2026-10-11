import { redirect } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { GigCard, type GigCardData } from "@/components/gig/gig-card";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { getCategoryRootSlugs } from "@/lib/supabase/category-roots";
import { createClient } from "@/lib/supabase/server";

export const revalidate = 0;

export default async function FavoritesPage() {
  const sb = createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect("/login?redirect=/favorites");

  const { data: favRows } = await sb
    .from("favorites")
    .select("gig_id, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const gigIds = (favRows ?? []).map((f) => f.gig_id);

  let gigs: GigCardData[] = [];
  if (gigIds.length > 0) {
    const { data: gigRows } = await sb
      .from("gigs")
      .select("id, slug, title, thumbnail_url, average_rating, total_reviews, seller_id, category_id, status")
      .in("id", gigIds);

    const liveGigs = (gigRows ?? []).filter((g: any) => g.status === "active");
    const sellerIds = Array.from(new Set(liveGigs.map((g: any) => g.seller_id)));
    const liveIds = liveGigs.map((g: any) => g.id);

    const [{ data: users }, { data: profiles }, { data: packages }] = await Promise.all([
      sellerIds.length
        ? sb.from("public_profiles").select("id, username, full_name, avatar_url").in("id", sellerIds)
        : Promise.resolve({ data: [] as any[] }),
      sellerIds.length
        ? sb.from("public_seller_profiles").select("user_id, seller_level").in("user_id", sellerIds)
        : Promise.resolve({ data: [] as any[] }),
      liveIds.length
        ? sb.from("gig_packages").select("gig_id, price, delivery_days").in("gig_id", liveIds)
        : Promise.resolve({ data: [] as any[] }),
    ]);

    const userById = new Map((users ?? []).map((u: any) => [u.id, u]));
    const profileById = new Map((profiles ?? []).map((p: any) => [p.user_id, p]));
    const minPriceByGig = new Map<string, number>();
    const minDeliveryByGig = new Map<string, number>();
    const roots = await getCategoryRootSlugs();
    for (const p of packages ?? []) {
      const cur = minPriceByGig.get((p as any).gig_id);
      const price = Number((p as any).price);
      if (cur == null || price < cur) minPriceByGig.set((p as any).gig_id, price);
      const dd = Number((p as any).delivery_days);
      const cd = minDeliveryByGig.get((p as any).gig_id);
      if (cd == null || dd < cd) minDeliveryByGig.set((p as any).gig_id, dd);
    }

    // Re-sort by original favorite order (most recently saved first)
    const orderIndex = new Map(gigIds.map((id, i) => [id, i]));
    gigs = liveGigs
      .map((g: any) => {
        const u = userById.get(g.seller_id) as any;
        const p = profileById.get(g.seller_id) as any;
        return {
          id: g.id,
          slug: g.slug,
          title: g.title,
          thumbnail_url: g.thumbnail_url,
          average_rating: g.average_rating ?? 0,
          total_reviews: g.total_reviews ?? 0,
          starting_price: minPriceByGig.get(g.id) ?? 0,
        category_slug: roots.get(g.category_id) ?? null,
        delivery_days: minDeliveryByGig.get(g.id) ?? null,
          seller: {
            username: u?.username ?? "seller",
            full_name: u?.full_name ?? "Seller",
            avatar_url: u?.avatar_url ?? null,
            seller_level: p?.seller_level ?? "new_seller",
          },
        };
      })
      .sort((a, b) => (orderIndex.get(a.id) ?? 0) - (orderIndex.get(b.id) ?? 0));
  }

  return (
    <>
      <Navbar />
      <main id="main" className="wrap py-8 lg:py-10">
        <h1 className="t-sign">Saved gigs</h1>
        <p className="num mt-2 text-sm text-ink-muted">
          {gigs.length} {gigs.length === 1 ? "gig" : "gigs"} pinned
        </p>
        {gigs.length > 0 ? (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {gigs.map((gig) => (
              <GigCard key={gig.id} gig={gig} initialFavorited />
            ))}
          </div>
        ) : (
          <EmptyState
            className="mt-8"
            title="Nothing pinned yet"
            description="Press the pin on any gig to keep it here."
            action={
              <Button asChild variant="cta">
                <Link href="/search">Browse gigs</Link>
              </Button>
            }
          />
        )}
      </main>
      <Footer />
    </>
  );
}
