import { notFound } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { GigCard, type GigCardData } from "@/components/gig/gig-card";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { CategoryBanner } from "@/components/search/category-banner";
import { ResultsSill } from "@/components/search/results-sill";
import { getCategoryRootSlugs } from "@/lib/supabase/category-roots";
import { createClient } from "@/lib/supabase/server";

export const revalidate = 300;

export default async function CategoryPage({ params }: { params: { slug: string } }) {
  const sb = createClient();
  const { data: category } = await sb.from("categories").select("*").eq("slug", params.slug).single();
  if (!category) notFound();

  const { data: subcategories } = await sb
    .from("categories")
    .select("id, name, slug")
    .eq("parent_id", category.id)
    .order("sort_order");

  const { data: gigRows } = await sb
    .from("gigs")
    .select("id, slug, title, thumbnail_url, average_rating, total_reviews, seller_id, category_id")
    .eq("category_id", category.id)
    .eq("status", "active")
    .order("total_orders", { ascending: false })
    .limit(24);

  const sellerIds = Array.from(new Set((gigRows ?? []).map((g: any) => g.seller_id)));
  const gigIds = (gigRows ?? []).map((g: any) => g.id);
  const [{ data: users }, { data: profiles }, { data: packages }] = await Promise.all([
    sellerIds.length > 0
      ? sb.from("public_profiles").select("id, username, full_name, avatar_url").in("id", sellerIds)
      : Promise.resolve({ data: [] as any[] }),
    sellerIds.length > 0
      ? sb.from("public_seller_profiles").select("user_id, seller_level").in("user_id", sellerIds)
      : Promise.resolve({ data: [] as any[] }),
    gigIds.length > 0
      ? sb.from("gig_packages").select("gig_id, price, delivery_days").in("gig_id", gigIds)
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

  const gigs: GigCardData[] = (gigRows ?? []).map((g: any) => {
    const u = userById.get(g.seller_id) as any;
    const p = profileById.get(g.seller_id) as any;
    return {
      id: g.id,
      slug: g.slug,
      title: g.title,
      thumbnail_url: g.thumbnail_url,
      average_rating: g.average_rating || 0,
      total_reviews: g.total_reviews || 0,
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
  });

  return (
    <>
      <Navbar />
      <main id="main">
        <CategoryBanner name={category.name} slug={category.slug} count={gigs.length} description={(category as any).description ?? null} />

        <div className="wrap py-10 lg:py-14">
          {subcategories && subcategories.length > 0 && (
            <nav aria-label="Subcategories" className="mb-8 flex flex-wrap gap-2">
              {subcategories.map((s) => (
                <Link key={s.id} href={`/category/${s.slug}`} className="chip min-h-10 hover:bg-sand focus-visible:outline focus-visible:outline-[2.5px] focus-visible:outline-offset-2 focus-visible:outline-mahogany">
                  {s.name}
                </Link>
              ))}
            </nav>
          )}

          <ResultsSill count={gigs.length} />

          {gigs.length > 0 ? (
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {gigs.map((gig) => (
                <GigCard key={gig.id} gig={gig} />
              ))}
            </div>
          ) : (
            <EmptyState
              className="mt-8"
              title="No gigs here yet"
              description="No active gigs in this category yet. Browse the other categories or search for what you need."
              action={
                <Button asChild variant="cta">
                  <Link href="/search">Browse all gigs</Link>
                </Button>
              }
            />
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
