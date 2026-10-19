import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import GigBoard from "@/components/board/GigBoard";
import { toBoardGigs, WINDOWS, CATEGORY_SLUG, windowFor, type WindowNo } from "@/lib/board";
import { HeldTimeline } from "@/components/home/HeldTimeline";
import { CategoryTiles, type CategoryTile } from "@/components/home/CategoryTiles";
import { SellerCards, type SellerCardData } from "@/components/home/SellerCards";
import { TestOrder, BuildNotes } from "@/components/home/BuildProof";
import { getCategoryRootSlugs } from "@/lib/supabase/category-roots";
import { getPlatformSettings } from "@/lib/supabase/settings";
import { paymentMode } from "@/lib/stripe/mode";
import { createClient } from "@/lib/supabase/server";
import "@/components/home/home.css";

export const revalidate = 3600;

const NOS: WindowNo[] = [1, 2, 3, 4, 5, 6];

async function loadHomeData() {
  try {
    const sb = createClient();
    const [{ data: allGigs }, { data: topSellerRows }, settings, roots] = await Promise.all([
      sb
        .from("gigs")
        .select("id, slug, title, average_rating, total_reviews, total_orders, seller_id, category_id")
        .eq("status", "active")
        .order("total_orders", { ascending: false }),
      sb.from("public_seller_profiles").select("user_id, seller_level, average_rating, total_orders_completed, tagline").order("average_rating", { ascending: false }).limit(4),
      getPlatformSettings(),
      getCategoryRootSlugs(),
    ]);

    const gigs = (allGigs ?? []) as any[];
    const gigIds = gigs.map((g) => g.id);
    const sellerIds = Array.from(new Set([...gigs.map((g) => g.seller_id), ...((topSellerRows ?? []) as any[]).map((s) => s.user_id)]));

    const [{ data: users }, { data: profiles }, { data: packages }] = await Promise.all([
      sellerIds.length ? sb.from("public_profiles").select("id, username, full_name, avatar_url").in("id", sellerIds) : Promise.resolve({ data: [] as any[] }),
      sellerIds.length ? sb.from("public_seller_profiles").select("user_id, seller_level, total_orders_completed").in("user_id", sellerIds) : Promise.resolve({ data: [] as any[] }),
      gigIds.length ? sb.from("gig_packages").select("gig_id, price, delivery_days").in("gig_id", gigIds) : Promise.resolve({ data: [] as any[] }),
    ]);

    const userById = new Map((users ?? []).map((u: any) => [u.id, u]));
    const profileById = new Map((profiles ?? []).map((p: any) => [p.user_id, p]));
    const minPrice = new Map<string, number>();
    const minDays = new Map<string, number>();
    for (const p of (packages ?? []) as any[]) {
      const price = Number(p.price);
      const d = Number(p.delivery_days);
      if (!minPrice.has(p.gig_id) || price < minPrice.get(p.gig_id)!) minPrice.set(p.gig_id, price);
      if (!minDays.has(p.gig_id) || d < minDays.get(p.gig_id)!) minDays.set(p.gig_id, d);
    }

    // Categories: real counts of active gigs and the lowest package price, per root category.
    const byCat = new Map<WindowNo, { count: number; from: number | null }>();
    for (const g of gigs) {
      const no = windowFor(roots.get(g.category_id) ?? "business");
      const cur = byCat.get(no) ?? { count: 0, from: null };
      const p = minPrice.get(g.id);
      cur.count += 1;
      if (p != null && (cur.from == null || p < cur.from)) cur.from = Math.round(p);
      byCat.set(no, cur);
    }
    const categories: CategoryTile[] = NOS.map((no) => ({ slug: CATEGORY_SLUG[no], name: WINDOWS[no], count: byCat.get(no)?.count ?? 0, from: byCat.get(no)?.from ?? null }));

    // The board: the 24 most-booked gigs.
    const board = gigs.slice(0, 24).map((g) => {
      const u = userById.get(g.seller_id) as any;
      const prof = profileById.get(g.seller_id) as any;
      return {
        slug: g.slug,
        title: g.title,
        category: roots.get(g.category_id) ?? "business",
        price: minPrice.get(g.id) ?? 0,
        deliveryDays: minDays.get(g.id) ?? 3,
        sellerName: u?.full_name ?? "Seller",
        sellerJobsDone: prof ? Number(prof.total_orders_completed ?? 0) : undefined,
        rating: g.average_rating,
        reviews: g.total_reviews,
      };
    });

    const sellers: SellerCardData[] = ((topSellerRows ?? []) as any[]).map((s) => {
      const u = userById.get(s.user_id) as any;
      const theirs = gigs.filter((g) => g.seller_id === s.user_id);
      const prices = theirs.map((g) => minPrice.get(g.id)).filter((p): p is number => p != null);
      return {
        username: u?.username ?? s.user_id,
        fullName: u?.full_name ?? "Seller",
        avatarUrl: u?.avatar_url ?? null,
        level: s.seller_level,
        rating: Number(s.average_rating ?? 0),
        jobs: Number(s.total_orders_completed ?? 0),
        gigs: theirs.length,
        from: prices.length ? Math.round(Math.min(...prices)) : null,
        tagline: s.tagline ?? null,
      };
    });

    return { board, categories, sellers, activeGigs: gigs.length, autoCompleteDays: parseInt(settings.auto_complete_days, 10) || 3 };
  } catch {
    return { board: [], categories: [] as CategoryTile[], sellers: [] as SellerCardData[], activeGigs: 0, autoCompleteDays: 3 };
  }
}

export default async function HomePage() {
  const data = await loadHomeData();
  const demo = process.env.NEXT_PUBLIC_DEMO_MODE === "true";
  const mode = paymentMode();
  const boardGigs = toBoardGigs(data.board);
  const cheapest = boardGigs.length ? boardGigs.reduce((a, b) => (b.price < a.price ? b : a)) : null;

  return (
    <>
      <Navbar />
      <main id="main">
        <div className="gb-hero">
          <GigBoard gigs={boardGigs} openCount={data.activeGigs} searchAction="/search" howHref="#how-held-payment-works" />
        </div>
        <HeldTimeline autoCompleteDays={data.autoCompleteDays} />
        <CategoryTiles categories={data.categories} />
        <SellerCards sellers={data.sellers} />
        {demo && cheapest && <TestOrder gig={{ title: cheapest.title, href: cheapest.href, price: cheapest.price }} mode={mode} />}
        <BuildNotes mode={mode} />
      </main>
      <Footer />
    </>
  );
}
