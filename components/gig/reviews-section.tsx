"use client";
import { useState } from "react";
import { RatingStars } from "@/components/ui/rating-stars";
import { ReviewSummary } from "@/components/gig/review-summary";
import { fromNow } from "@/lib/utils/format";
import type { Review } from "@/types/database.types";

/** First names only. Reviews are shown by name and avatar when the page provides them. */
export type Reviewer = { name: string; avatar_url: string | null };

export function ReviewsSection({
  reviews,
  averageRating,
  totalReviews,
  reviewers = {},
}: {
  reviews: Review[];
  averageRating: number;
  totalReviews: number;
  reviewers?: Record<string, Reviewer>;
}) {
  const [visible, setVisible] = useState(5);

  const ratingBuckets = [5, 4, 3, 2, 1].map((star) => {
    const count = reviews.filter((r) => r.overall_rating === star).length;
    const pct = reviews.length ? (count / reviews.length) * 100 : 0;
    return { star, count, pct };
  });

  return (
    <div className="panel p-5 md:p-6">
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <ReviewSummary average={averageRating} total={totalReviews} />
          {totalReviews > 0 && reviews.length === 0 ? (
            <p className="mt-3 max-w-[40ch] text-sm text-ink-2">The score is this gig&apos;s recorded average. The written reviews behind it are not part of the sample data.</p>
          ) : null}
        </div>

        {reviews.length > 0 ? (
          <div>
            <p className="eyebrow mb-3">
              {reviews.length >= totalReviews ? `All ${reviews.length} ${reviews.length === 1 ? "review" : "reviews"}` : `Latest ${reviews.length} of ${totalReviews} reviews`}
            </p>
            <div className="space-y-1.5">
              {ratingBuckets.map((b) => (
                <div key={b.star} className="flex items-center gap-2 text-xs">
                  <span className="num w-5">{b.star}</span>
                  <div className="h-1.5 flex-1 overflow-hidden rounded-pill bg-surface-sunk" aria-hidden="true">
                    <div className="h-full rounded-pill bg-ink" style={{ width: `${b.pct}%` }} />
                  </div>
                  <span className="w-8 text-right tabular-nums text-ink-muted">{b.count}</span>
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
          <p className="mt-5 border-t border-line pt-5 text-sm text-ink-muted">No reviews yet. The first buyer to approve a delivery can leave one.</p>
        )
      ) : (
        <div className="mt-6 space-y-4 border-t border-line pt-6">
          {reviews.slice(0, visible).map((r) => {
            const who = reviewers[(r as any).buyer_id] ?? { name: "Buyer", avatar_url: null };
            return (
              <article key={r.id} className="border-b border-line pb-4 last:border-b-0 last:pb-0">
                <div className="mb-2 flex items-center gap-3">
                  {who.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={who.avatar_url} alt="" width={32} height={32} className="h-8 w-8 rounded-full object-cover" />
                  ) : (
                    <span aria-hidden="true" className="grid h-8 w-8 place-items-center rounded-full bg-laminate-sunk text-xs font-semibold text-ink-muted">
                      {who.name.slice(0, 1)}
                    </span>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{who.name}</p>
                    <p className="text-xs text-ink-muted">{fromNow(r.created_at)}</p>
                  </div>
                  <div className="shrink-0">
                    <RatingStars value={r.overall_rating} size={13} />
                  </div>
                </div>
                <p className="text-sm text-ink">{r.review_text}</p>
                {r.seller_response && (
                  <div className="mt-3 rounded-[8px] bg-laminate-sunk px-4 py-3">
                    <p className="mb-1 text-xs font-semibold text-ink-muted">Seller&apos;s response</p>
                    <p className="text-sm text-ink">{r.seller_response}</p>
                  </div>
                )}
              </article>
            );
          })}
          {visible < reviews.length && (
            <button onClick={() => setVisible(reviews.length)} className="btn-text text-ink">
              Show all {reviews.length} reviews
            </button>
          )}
        </div>
      )}
    </div>
  );
}
