import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { GigRow, GigBoardHeader, type GigCardData } from "@/components/gig/gig-card";
import { getCategoryRootSlugs } from "@/lib/supabase/category-roots";
import { SellerCard } from "@/components/seller/seller-card";
import { PinTile } from "@/components/ui/pin-tile";
import { COVER_STYLES, type CoverCategory } from "@/components/gig/gig-cover";
import { SearchAutocomplete } from "@/components/search/search-autocomplete";
import { createClient } from "@/lib/supabase/server";

export const revalidate = 3600;

type FeaturedGig = GigCardData;

type TopSeller = {
  username: string;
  full_name: string;
  avatar_url: string | null;
  seller_level: "new_seller" | "level_one" | "level_two" | "top_rated";
  rating: number;
  total_orders: number;
  tagline: string | null;
};

async function loadHomeData() {
  try {
    const sb = createClient();
    const [{ data: parentCategories }, { count: activeGigs }, { count: verifiedSellers }] = await Promise.all([
      sb.from("categories").select("*").is("parent_id", null).order("sort_order"),
      sb.from("gigs").select("id", { count: "exact", head: true }).eq("status", "active"),
      sb.from("public_profiles").select("id", { count: "exact", head: true }).eq("is_seller", true),
    ]);

    const { data: gigRows } = await sb
      .from("gigs")
      .select("id, slug, title, thumbnail_url, average_rating, total_reviews, seller_id, category_id")
      .eq("status", "active")
      .order("total_orders", { ascending: false })
      .limit(8);

    const { data: topSellerRows } = await sb
      .from("public_seller_profiles")
      .select("user_id, seller_level, average_rating, total_orders_completed, tagline")
      .order("average_rating", { ascending: false })
      .limit(4);

    const sellerIdsForGigs = Array.from(new Set((gigRows ?? []).map((g: any) => g.seller_id)));
    const sellerIdsForTop = (topSellerRows ?? []).map((s: any) => s.user_id);
    const allSellerIds = Array.from(new Set([...sellerIdsForGigs, ...sellerIdsForTop]));
    const gigIds = (gigRows ?? []).map((g: any) => g.id);

    const [{ data: users }, { data: profiles }, { data: packages }] = await Promise.all([
      allSellerIds.length > 0
        ? sb.from("public_profiles").select("id, username, full_name, avatar_url").in("id", allSellerIds)
        : Promise.resolve({ data: [] as any[] }),
      sellerIdsForGigs.length > 0
        ? sb.from("public_seller_profiles").select("user_id, seller_level").in("user_id", sellerIdsForGigs)
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

    const featuredGigs: FeaturedGig[] = (gigRows ?? []).map((g: any) => {
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
    });

    const topSellers: TopSeller[] = (topSellerRows ?? []).map((s: any) => {
      const u = userById.get(s.user_id) as any;
      return {
        username: u?.username ?? s.user_id,
        full_name: u?.full_name ?? "Top Seller",
        avatar_url: u?.avatar_url ?? null,
        seller_level: s.seller_level,
        rating: s.average_rating ?? 0,
        total_orders: s.total_orders_completed ?? 0,
        tagline: s.tagline ?? null,
      };
    });

    return {
      categories: parentCategories ?? [],
      activeGigs: activeGigs ?? 0,
      verifiedSellers: verifiedSellers ?? 0,
      featuredGigs,
      topSellers,
    };
  } catch {
    return { categories: [], activeGigs: 0, verifiedSellers: 0, featuredGigs: [], topSellers: [] };
  }
}

const EXAMPLES: [string, string][] = [
  ["Logo", "logo"],
  ["Landing page", "landing page"],
  ["Bug fix", "bug fix"],
  ["Translation", "translation"],
  ["Video edit", "video edit"],
];

export default async function HomePage() {
  const data = await loadHomeData();

  return (
    <>
      <Navbar />
      <main>
        <section className="border-b border-ink">
          <div className="mx-auto max-w-[1200px] px-4 pb-14 pt-16 sm:px-6 sm:pt-24">
            <div className="max-w-[900px]">
              <h1 className="text-[32px] leading-[38px] sm:text-[56px] sm:leading-[60px]">
                Small jobs. Fixed prices. Money held until you say it&apos;s done.
              </h1>
              <p className="mt-5 max-w-[56ch] text-[17px] leading-6 text-ink-muted">
                Hire one freelancer for one defined job. Pay into escrow. Approve the work, then they are paid.
              </p>
              <div className="mt-8 max-w-[640px]">
                <SearchAutocomplete size="lg" placeholder="What do you need done?" />
              </div>
              <p className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-[15px] leading-[22px]">
                {EXAMPLES.map(([label, q]) => (
                  <Link key={q} href={`/search?q=${encodeURIComponent(q)}`} className="underline underline-offset-4 hover:decoration-2">
                    {label}
                  </Link>
                ))}
              </p>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[1200px] px-4 py-14 sm:px-6">
          <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-[24px] leading-[30px]">On the board now</h2>
            <p className="num text-[13px] leading-[18px] text-ink-muted">
              {data.featuredGigs.length > 0
                ? `Showing ${data.featuredGigs.length} of ${data.activeGigs} gigs, sorted by orders`
                : "No gigs yet"}
            </p>
          </div>
          {data.featuredGigs.length === 0 ? (
            <div className="border-y-2 border-ink py-12">
              <p className="text-[24px] leading-[30px]">Nothing is on the board yet.</p>
              <p className="mt-2 text-[15px] leading-[22px] text-ink-muted">Gigs appear here as soon as sellers publish them.</p>
              <Link href="/become-seller" className="btn-secondary mt-5">Create a gig</Link>
            </div>
          ) : (
            <div className="border-t-2 border-ink">
              <GigBoardHeader />
              {data.featuredGigs.map((g) => (
                <GigRow key={g.id} gig={g} />
              ))}
            </div>
          )}
          <p className="mt-4 text-[15px] leading-[22px]">
            <Link href="/search" className="underline underline-offset-4 hover:decoration-2">See every gig</Link>
          </p>
        </section>

        <section className="border-t border-ink bg-canvas-subtle">
          <div className="mx-auto grid max-w-[1200px] gap-10 px-4 py-14 sm:px-6 md:grid-cols-2">
            <div>
              <h2 className="mb-4 text-[24px] leading-[30px]">How your money moves</h2>
              <ul className="space-y-4">
                <li className="flex items-start gap-4">
                  <span className="w-24 shrink-0"><PinTile tone="held">Held</PinTile></span>
                  <p className="text-[15px] leading-[22px]">You pay when you order. Gigboard holds the money. The seller cannot touch it yet.</p>
                </li>
                <li className="flex items-start gap-4">
                  <span className="w-24 shrink-0"><PinTile tone="delivered">Delivered</PinTile></span>
                  <p className="text-[15px] leading-[22px]">The seller sends the work by the delivery date. You can ask for a revision.</p>
                </li>
                <li className="flex items-start gap-4">
                  <span className="w-24 shrink-0"><PinTile tone="approved">Approved</PinTile></span>
                  <p className="text-[15px] leading-[22px]">You approve the work, and only then does the seller get paid.</p>
                </li>
              </ul>
            </div>
            <div>
              <h2 className="mb-4 text-[24px] leading-[30px]">Browse by category</h2>
              <ul className="divide-y divide-ink border-y border-ink">
                {data.categories.map((c: any) => {
                  const style = COVER_STYLES[c.slug as CoverCategory];
                  return (
                    <li key={c.id}>
                      <Link href={`/category/${c.slug}`} className="flex items-center gap-3 py-3 text-[15px] leading-[22px] hover:bg-white">
                        <span aria-hidden className="h-3 w-3 shrink-0" style={{ background: style?.bg ?? "#151A2B" }} />
                        <span>{c.name}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </section>

        {data.topSellers.length > 0 && (
          <section className="mx-auto max-w-[1200px] px-4 py-14 sm:px-6">
            <h2 className="mb-4 text-[24px] leading-[30px]">Top sellers</h2>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {data.topSellers.map((s) => (
                <SellerCard
                  key={s.username}
                  username={s.username}
                  fullName={s.full_name}
                  avatarUrl={s.avatar_url}
                  level={s.seller_level}
                  rating={s.rating}
                  totalOrders={s.total_orders}
                  tagline={s.tagline}
                />
              ))}
            </div>
          </section>
        )}

        <section className="border-t-2 border-ink">
          <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-4 px-4 py-10 sm:px-6">
            <div>
              <h2 className="text-[24px] leading-[30px]">Sell what you already do well</h2>
              <p className="mt-1 text-[15px] leading-[22px] text-ink-muted">Publish a gig with three packages and set your own prices.</p>
            </div>
            <Link href="/become-seller" className="btn-cta">Create a gig</Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
