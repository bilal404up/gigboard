import { notFound } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { RatingStars } from "@/components/ui/rating-stars";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { GigCard, type GigCardData } from "@/components/gig/gig-card";
import { EmptyState } from "@/components/ui/empty-state";
import { SellerProfileHeader } from "@/components/seller/seller-profile-header";
import { SellerMark } from "@/components/seller/SellerMark";
import { getCategoryRootSlugs } from "@/lib/supabase/category-roots";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { fromNow } from "@/lib/utils/format";

export const revalidate = 120;

export default async function SellerProfilePage({ params }: { params: { username: string } }) {
  const sb = createClient();
  const { data: user } = await sb.from("public_profiles").select("*").eq("username", params.username).single();
  if (!user || !user.is_seller) notFound();

  const [{ data: profile }, { data: gigs }, { data: reviews }] = await Promise.all([
    sb.from("public_seller_profiles").select("*").eq("user_id", user.id).single(),
    sb.from("gigs").select("id, slug, title, thumbnail_url, average_rating, total_reviews, category_id").eq("seller_id", user.id).eq("status", "active"),
    sb.from("reviews").select("*").eq("seller_id", user.id).order("created_at", { ascending: false }).limit(10),
  ]);

  if (!profile) notFound();

  // Real starting price and delivery time per gig (this page used to show a fixed $50).
  const gigIdList = (gigs ?? []).map((g: any) => g.id);
  const { data: pkgRows } = gigIdList.length
    ? await sb.from("gig_packages").select("gig_id, price, delivery_days").in("gig_id", gigIdList)
    : { data: [] as any[] };
  const minPrice = new Map<string, number>();
  const minDays = new Map<string, number>();
  for (const r of (pkgRows ?? []) as any[]) {
    const price = Number(r.price);
    const d = Number(r.delivery_days);
    if (!minPrice.has(r.gig_id) || price < minPrice.get(r.gig_id)!) minPrice.set(r.gig_id, price);
    if (!minDays.has(r.gig_id) || d < minDays.get(r.gig_id)!) minDays.set(r.gig_id, d);
  }
  const roots = await getCategoryRootSlugs();

  const memberSince = new Date(user.created_at).getFullYear();
  const isVerified = (profile as any).is_verified ?? false;

  const cards: GigCardData[] = (gigs ?? []).map((g: any) => ({
    id: g.id,
    slug: g.slug,
    title: g.title,
    thumbnail_url: g.thumbnail_url,
    average_rating: g.average_rating ?? 0,
    total_reviews: g.total_reviews ?? 0,
    starting_price: minPrice.get(g.id) ?? 0,
    category_slug: roots.get(g.category_id) ?? null,
    delivery_days: minDays.get(g.id) ?? null,
    seller: { username: user.username, full_name: user.full_name, avatar_url: user.avatar_url, seller_level: profile.seller_level },
  }));
  const skills: string[] = Array.isArray((profile as any).skills) ? (profile as any).skills : [];

  return (
    <>
      <Navbar />
      <main id="main">
        <SellerProfileHeader
          username={user.username}
          fullName={user.full_name}
          avatarUrl={user.avatar_url}
          level={profile.seller_level}
          rating={profile.average_rating ?? 0}
          totalReviews={(profile as any).total_reviews ?? reviews?.length ?? 0}
          totalOrders={profile.total_orders_completed ?? 0}
          tagline={profile.tagline}
          memberSince={user.created_at}
          action={
            <Button asChild variant="cta">
              <Link href="/messages">Message</Link>
            </Button>
          }
        />

        <div className="wrap py-10">
          <Tabs defaultValue="gigs">
            <TabsList>
              <TabsTrigger value="gigs">Gigs ({cards.length})</TabsTrigger>
              <TabsTrigger value="about">About</TabsTrigger>
              <TabsTrigger value="reviews">Reviews ({reviews?.length ?? 0})</TabsTrigger>
            </TabsList>

            <TabsContent value="gigs">
              {cards.length > 0 ? (
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {cards.map((g) => (
                    <GigCard key={g.id} gig={g} />
                  ))}
                </div>
              ) : (
                <EmptyState title="No gigs at this window yet" description="This seller has not published a gig." />
              )}
            </TabsContent>

            <TabsContent value="about">
              <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
                <div className="tray p-5">
                  <h2 className="t-head">About</h2>
                  <p className="mt-3 max-w-copy whitespace-pre-line text-ink">{(profile as any).description ?? "This seller has not written a bio yet."}</p>
                </div>
                <aside className="grid gap-3 self-start">
                  <div className="tray p-5">
                    <p className="t-plate text-ink-muted">At the counter since</p>
                    <p className="num mt-1 font-semibold">{memberSince}</p>
                    {isVerified ? (
                      <p className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-release-deep">
                        <span className="lamp lamp--release" aria-hidden="true" />
                        Verified seller
                      </p>
                    ) : null}
                  </div>
                  {skills.length > 0 ? (
                    <div className="tray p-5">
                      <p className="t-plate text-ink-muted">Skills</p>
                      <ul className="mt-2 flex flex-wrap gap-2">
                        {skills.map((s) => (
                          <li key={s} className="chip">{s}</li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </aside>
              </div>
            </TabsContent>

            <TabsContent value="reviews">
              {reviews && reviews.length > 0 ? (
                <ul className="grid gap-3">
                  {reviews.map((r: any) => (
                    <li key={r.id} className="tray p-5">
                      <div className="flex items-center gap-3">
                        <SellerMark username={r.buyer_id ?? r.id} label="Buyer" size={32} />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold">Buyer</p>
                          <p className="text-xs text-ink-muted">{fromNow(r.created_at)}</p>
                        </div>
                        <RatingStars value={r.overall_rating} size={13} />
                      </div>
                      <p className="mt-3 text-sm">{r.review_text}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyState title="No reviews yet" description="Reviews appear after a buyer approves a delivery." />
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </>
  );
}
