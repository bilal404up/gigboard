import { RatingGlyph } from "@/components/ui/rating-stars"

type Props = { average: number | null | undefined; total: number | null | undefined; className?: string; compact?: boolean }

/*
 * Ratings are plain text with one small star: "4.9 (53)".
 * A gig with reviews but no recorded average says "No rating yet" instead of "0.0".
 */
export function ReviewSummary({ average, total, className = "", compact = false }: Props) {
  const avg = Number(average ?? 0)
  const n = Number(total ?? 0)
  if (n <= 0 || !(avg > 0)) {
    return <p className={`inline-flex items-center gap-1.5 text-sm text-ink-2 ${className}`}>No rating yet</p>
  }
  const noun = n === 1 ? "review" : "reviews"
  if (compact) {
    return (
      <p className={`inline-flex items-center gap-1.5 text-sm ${className}`} aria-label={`Rated ${avg.toFixed(1)} from ${n} ${noun}`}>
        <RatingGlyph size={12} />
        <span className="num font-medium">{avg.toFixed(1)}</span>
        <span className="num text-ink-2">({n})</span>
      </p>
    )
  }
  return (
    <p className={`inline-flex flex-wrap items-baseline gap-x-2 gap-y-1 ${className}`} aria-label={`Rated ${avg.toFixed(1)} from ${n} ${noun}`}>
      <RatingGlyph size={14} className="self-center" />
      <span className="num text-[1.0625rem] font-medium text-ink">{avg.toFixed(1)}</span>
      <span className="text-sm text-ink-2">
        from <span className="num">{n}</span> {noun}
      </span>
    </p>
  )
}
