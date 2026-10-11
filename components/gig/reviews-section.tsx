"use client";
import { useState } from "react";
import { RatingStars } from "@/components/ui/rating-stars";
import { ReviewSummary } from "@/components/gig/review-summary";
import { SellerMark } from "@/components/seller/SellerMark";
import { fromNow } from "@/lib/utils/format";
import type { Review } from "@/types/database.types";

export function ReviewsSection({
  reviews,
  averageRating,
  totalReviews,
}: {
  reviews: Review[];
  averageRating: number;
  totalReviews: number;
}) {
  const [visible, setVisible] = useState(5);

  const ratingBuckets = [5, 4, 3, 2, 1].map((star) => {
    const count = reviews.filter((r) => r.overall_rating === star).length;
    const pct = reviews.length ? (count / reviews.length) * 100 : 0;
    return { star, count, pct };
  });

  return (
    <div className="tray p-5 md:p-6">
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <ReviewSummary average={averageRating} total={totalReviews} />
          {totalReviews > 0 && reviews.length === 0 ? (
            <p className="mt-3 max-w-[40ch] text-sm text-ink-muted">
              The score is this gig&apos;s recorded average. Individual reviews are not available yet.
            </p>
          ) : null}
        </div>

        {/* the breakdown counts only the reviews loaded here, so it is labelled that way */}
        {reviews.length > 0 ? (
          <div>
            <p className="t-plate mb-2 text-ink-muted">Breakdown of {reviews.length} loaded</p>
            <div className="space-y-1.5">
              {ratingBuckets.map((b) => (
                <div key={b.star} className="flex items-center gap-2 text-xs">
                  <span className="num w-5">{b.star}</span>
                  <div className="h-2.5 flex-1 overflow-hidden rounded-pill bg-laminate-sunk" aria-hidden="true">
                    <div className="h-full rounded-pill bg-[linear-gradient(180deg,#E7C978,#C9A24A_60%,#B08A2C)]" style={{ width: `${b.pct}%` }} />
                  </div>
                  <span className="num w-8 text-right text-ink-muted">{b.count}</span>
                  <span className="sr-only">
                    {b.count} {b.count === 1 ? "review" : "reviews"} with {b.star} stars
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      {reviews.length === 0 ? (
        totalReviews > 0 ? null : (
          <p className="mt-5 border-t-2 border-dotted border-sand pt-5 text-sm text-ink-muted">
            No reviews yet. The first buyer to approve a delivery can leave one.
          </p>
        )
      ) : (
        <div className="mt-6 space-y-4 border-t-2 border-dotted border-sand pt-6">
          {reviews.slice(0, visible).map((r) => (
            <article key={r.id} className="border-b-2 border-dotted border-sand pb-4 last:border-b-0 last:pb-0">
              <div className="mb-2 flex items-center gap-3">
                <SellerMark username={(r as any).buyer_id ?? r.id} label="Buyer" size={32} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">Buyer</p>
                  <p className="text-xs text-ink-muted">{fromNow(r.created_at)}</p>
                </div>
                <div className="shrink-0">
                  <RatingStars value={r.overall_rating} size={13} />
                </div>
              </div>
              <p className="text-sm text-ink">{r.review_text}</p>
              {r.seller_response && (
                <div className="mt-3 rounded-[6px] bg-laminate-sunk px-4 py-3">
                  <p className="mb-1 text-xs font-semibold text-ink-muted">Seller&apos;s response</p>
                  <p className="text-sm text-ink">{r.seller_response}</p>
                </div>
              )}
            </article>
          ))}
          {visible < reviews.length && (
            <button onClick={() => setVisible(reviews.length)} className="btn-text text-brass-deep">
              Show all {reviews.length} reviews
            </button>
          )}
        </div>
      )}
    </div>
  );
}
