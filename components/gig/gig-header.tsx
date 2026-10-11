import Link from "next/link"
import { ReviewSummary } from "@/components/gig/review-summary"
import { SellerMark, LevelPlate } from "@/components/seller/SellerMark"
import type { SellerLevel } from "@/types/database.types"

type Props = {
  title: string
  categoryName?: string | null
  categorySlug?: string | null
  seller: { username: string; full_name: string; avatar_url: string | null; seller_level: SellerLevel }
  averageRating: number
  totalReviews: number
  className?: string
}

/* Title and seller line for the gig page. Reviews use real counts; zero reviews is its own state. */
export function GigHeader({ title, categoryName, categorySlug, seller, averageRating, totalReviews, className = "" }: Props) {
  return (
    <header className={className}>
      <nav aria-label="Breadcrumb" className="text-sm text-ink-muted">
        <ol className="flex flex-wrap items-center gap-2">
          <li>
            <Link href="/" className="link">
              Home
            </Link>
          </li>
          {categoryName && categorySlug ? (
            <>
              <li aria-hidden="true">/</li>
              <li>
                <Link href={`/category/${categorySlug}`} className="link">
                  {categoryName}
                </Link>
              </li>
            </>
          ) : null}
        </ol>
      </nav>

      <h1 className="t-sign mt-3 max-w-[24ch]">{title}</h1>

      <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3">
        <Link href={`/seller/${seller.username}`} className="group inline-flex items-center gap-3 rounded-[6px] focus-visible:outline focus-visible:outline-[2.5px] focus-visible:outline-offset-2 focus-visible:outline-mahogany">
          {seller.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={seller.avatar_url} alt="" width={40} height={40} className="h-10 w-10 rounded-[22%] object-cover" />
          ) : (
            <SellerMark username={seller.username} level={seller.seller_level} size={40} />
          )}
          <span className="font-semibold underline decoration-transparent decoration-[1.5px] underline-offset-[3px] group-hover:decoration-current">
            {seller.full_name}
          </span>
        </Link>
        <LevelPlate level={seller.seller_level} />
        <ReviewSummary average={averageRating} total={totalReviews} />
      </div>
    </header>
  )
}
