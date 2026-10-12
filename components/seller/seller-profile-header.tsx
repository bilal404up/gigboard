import type { ReactNode } from "react"
import { SellerMark, LevelPlate } from "@/components/seller/SellerMark"
import { ReviewSummary } from "@/components/gig/review-summary"
import type { SellerLevel } from "@/types/database.types"

type Props = {
  username: string
  fullName: string
  avatarUrl: string | null
  level: SellerLevel
  rating: number
  totalReviews: number
  totalOrders: number
  tagline?: string | null
  /** ISO date; shown as "Selling since Mar 2025" */
  memberSince?: string | null
  /** contact or follow controls from the page */
  action?: ReactNode
}

function since(iso?: string | null) {
  if (!iso) return null
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? null : d.toLocaleDateString("en-US", { month: "short", year: "numeric" })
}

/* The seller's profile header: face, name and tagline, then the facts on one line. */
export function SellerProfileHeader({ username, fullName, avatarUrl, level, rating, totalReviews, totalOrders, tagline, memberSince, action }: Props) {
  const joined = since(memberSince)
  return (
    <header className="border-b border-line bg-white">
      <div className="wrap flex flex-wrap items-center gap-5 py-10 lg:py-14">
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={avatarUrl} alt="" width={96} height={96} className="h-20 w-20 shrink-0 rounded-full object-cover ring-1 ring-line lg:h-24 lg:w-24" />
        ) : (
          <SellerMark username={username} level={level} size={96} className="h-20 w-20 lg:h-24 lg:w-24" />
        )}
        <div className="min-w-0 flex-1">
          <h1 className="t-sign truncate">{fullName}</h1>
          <p className="mt-1 text-ink-muted">@{username}</p>
          {tagline ? <p className="mt-2 max-w-[60ch] text-ink">{tagline}</p> : null}
        </div>
        {action ? <div className="flex items-center gap-2">{action}</div> : null}
      </div>
      <div className="wrap">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-line py-4">
          <LevelPlate level={level} />
          <ReviewSummary average={rating} total={totalReviews} />
          <p className="text-sm tabular-nums text-ink-muted">
            {totalOrders} {totalOrders === 1 ? "order" : "orders"} completed
          </p>
          {joined ? <p className="text-sm text-ink-muted">Selling since {joined}</p> : null}
        </div>
      </div>
    </header>
  )
}
