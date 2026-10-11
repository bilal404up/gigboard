import { notFound } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { OrderCard } from "@/components/gig/order-card";
import { StickyMobileCTA } from "@/components/gig/sticky-mobile-cta";
import { GigGallery } from "@/components/gig/gig-gallery";
import { GigHeader } from "@/components/gig/gig-header";
import { SellerCard } from "@/components/seller/seller-card";
import { cleanGigHtml } from "@/lib/security/clean-html";
import { getCategoryRootSlugs } from "@/lib/supabase/category-roots";
import { ReviewsSection } from "@/components/gig/reviews-section";
import { createClient } from "@/lib/supabase/server";

export const revalidate = 60;

export default async function GigDetailPage({ params }: { params: { slug: string } }) {
  const sb = createClient();
  const { data: gig } = await sb.from("gigs").select("*").eq("slug", params.slug).single();
  if (!gig || gig.status !== "active") notFound();

  const [{ data: seller }, { data: profile }, { data: packages }, { data: extras }, { data: reviews }, { data: category }] =
    await Promise.all([
      sb.from("public_profiles").select("*").eq("id", gig.seller_id).single(),
      sb.from("public_seller_profiles").select("*").eq("user_id", gig.seller_id).single(),
      sb.from("gig_packages").select("*").eq("gig_id", gig.id).order("price"),
      sb.from("gig_extras").select("*").eq("gig_id", gig.id).eq("is_active", true).order("sort_order"),
      sb.from("reviews").select("*").eq("gig_id", gig.id).order("created_at", { ascending: false }).limit(10),
      sb.from("categories").select("name, slug").eq("id", gig.category_id).single(),
    ]);
  const rootSlugs = await getCategoryRootSlugs();

  if (!seller || !profile || !packages || packages.length === 0) notFound();

  const rootSlug = rootSlugs.get(gig.category_id) ?? null;

  return (
    <>
      <Navbar />
      <main id="main" className="wrap py-8 pb-28 lg:py-12 lg:pb-12">
        {/* two plain grid children: the drawer card is sticky, so nothing above it may carry transform or filter */}
        <div className="grid gap-10 lg:grid-cols-gig lg:items-start">
          <div className="min-w-0">
            <GigHeader
              title={gig.title}
              categoryName={category?.name ?? null}
              categorySlug={category?.slug ?? null}
              seller={{ username: seller.username, full_name: seller.full_name, avatar_url: seller.avatar_url, seller_level: profile.seller_level }}
              averageRating={gig.average_rating ?? 0}
              totalReviews={gig.total_reviews ?? 0}
            />

            <div className="mt-8 overflow-hidden rounded-tray shadow-[0_2px_0_#2E1414,0_10px_0_-4px_#2E1414]">
              {/* keep your existing gallery field here (gig.images or gig.gallery_images) */}
              <GigGallery thumbnail={gig.thumbnail_url} images={(gig as any).images ?? null} title={gig.title} seed={gig.id} category={rootSlug} />
            </div>

            <section aria-labelledby="about-title" className="mt-10">
              <h2 id="about-title" className="t-head">
                About this gig
              </h2>
              <div
                className="prose prose-sm mt-4 max-w-copy text-ink prose-headings:font-display prose-a:text-brass-deep"
                dangerouslySetInnerHTML={{ __html: cleanGigHtml(gig.description ?? "") }}
              />
            </section>

            <section aria-labelledby="seller-title" className="mt-10">
              <h2 id="seller-title" className="t-head mb-4">
                At the window
              </h2>
              <SellerCard
                username={seller.username}
                fullName={seller.full_name}
                avatarUrl={seller.avatar_url}
                level={profile.seller_level}
                rating={profile.average_rating ?? 0}
                totalOrders={profile.total_orders_completed ?? 0}
                tagline={profile.tagline ?? null}
              />
            </section>

            <section aria-labelledby="reviews-title" className="mt-10">
              <h2 id="reviews-title" className="t-head mb-4">
                Reviews
              </h2>
              <ReviewsSection reviews={reviews ?? []} averageRating={gig.average_rating ?? 0} totalReviews={gig.total_reviews ?? 0} />
            </section>
          </div>

          <OrderCard gigId={gig.id} packages={packages} extras={extras ?? []} />
        </div>
      </main>
      <StickyMobileCTA gigId={gig.id} packages={packages} />
      <Footer />
    </>
  );
}
