import { RatingStars } from "@/components/ui/rating-stars"

type Props = { average: number; total: number; className?: string; compact?: boolean }

/* Real counts read as "4.9 from 53 reviews". Zero reviews is its own state and never shows a number. */
export function ReviewSummary({ average, total, className = "", compact = false }: Props) {
  if (total <= 0) {
    return (
      <p className={`inline-flex items-center gap-2 text-sm text-ink-muted ${className}`}>
        <span className="lamp" aria-hidden="true" />
        No reviews yet
      </p>
    )
  }
  const noun = total === 1 ? "review" : "reviews"
  if (compact) {
    return (
      <p className={`inline-flex items-center gap-2 text-sm ${className}`} aria-label={`Rated ${average.toFixed(1)} from ${total} ${noun}`}>
        <RatingStars value={average} max={1} size={14} />
        <span className="num font-semibold">{average.toFixed(1)}</span>
        <span className="num text-ink-muted">({total})</span>
      </p>
    )
  }
  return (
    <div className={`flex flex-wrap items-center gap-x-3 gap-y-1 ${className}`}>
      <RatingStars value={average} size={18} />
      <span className="fig-price text-ink">{average.toFixed(1)}</span>
      <span className="num text-sm text-ink-muted">
        from {total} {noun}
      </span>
    </div>
  )
}
