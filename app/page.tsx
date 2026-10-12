import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { type GigCardData } from "@/components/gig/gig-card";
import { getCategoryRootSlugs } from "@/lib/supabase/category-roots";
import GigBoard from "@/components/board/GigBoard";
import { toBoardGigs } from "@/lib/board";
import WindowsFacade from "@/components/home/WindowsFacade";
import SellerRoster from "@/components/home/SellerRoster";
import CounterStory from "@/components/home/CounterStory";
import { TestOrder, BuildNotes } from "@/components/home/BuildProof";
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
      .limit(24);

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
        ? sb.from("public_seller_profiles").select("user_id, seller_level, total_orders_completed").in("user_id", sellerIdsForGigs)
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

    // Real completed-order counts, so the board and the seller list show the same number.
    const jobsByUsername: Record<string, number> = {};
    for (const id of sellerIdsForGigs) {
      const u = userById.get(id) as any;
      const p = profileById.get(id) as any;
      if (u?.username && p) jobsByUsername[u.username] = Number(p.total_orders_completed ?? 0);
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
      jobsByUsername,
    };
  } catch {
    return { categories: [], activeGigs: 0, verifiedSellers: 0, featuredGigs: [], topSellers: [], jobsByUsername: {} as Record<string, number> };
  }
}

export default async function HomePage() {
  const data = await loadHomeData();
  const demo = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

  const boardGigs = toBoardGigs(
    data.featuredGigs.map((g) => ({
      slug: g.slug,
      title: g.title,
      category: g.category_slug ?? "business",
      price: g.starting_price,
      deliveryDays: g.delivery_days ?? 3,
      sellerName: g.seller.full_name,
      sellerJobsDone: data.jobsByUsername[g.seller.username],
      rating: g.average_rating,
      reviews: g.total_reviews,
    }))
  );
  const storyGig = boardGigs.find((g) => g.window === 3) ?? boardGigs[0];
  const cheapest = boardGigs.length ? boardGigs.reduce((a, b) => (b.price < a.price ? b : a)) : null;

  return (
    <>
      <Navbar />
      <main id="main">
        <div className="gb-hero">
          <GigBoard gigs={boardGigs} searchAction="/search" howHref="#how-the-counter-works" />
        </div>

        {storyGig && (
          <CounterStory title={storyGig.title} price={storyGig.price} days={storyGig.days} sellerName={storyGig.seller} />
        )}

        {demo && cheapest && <TestOrder gig={{ title: cheapest.title, href: cheapest.href, price: cheapest.price }} />}

        <WindowsFacade gigs={boardGigs} />

        <SellerRoster
          gigs={boardGigs}
          sellers={data.topSellers.map((s) => ({
            username: s.username,
            fullName: s.full_name,
            avatarUrl: s.avatar_url,
            level: s.seller_level,
            rating: s.rating,
            totalOrders: s.total_orders,
            tagline: s.tagline,
          }))}
        />

        <BuildNotes />
      </main>
      <Footer />
    </>
  );
}
