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
  /** ISO date; shown as "At the counter since Mar 2025" */
  memberSince?: string | null
  /** contact or follow controls from the page */
  action?: ReactNode
}

function since(iso?: string | null) {
  if (!iso) return null
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? null : d.toLocaleDateString("en-US", { month: "short", year: "numeric" })
}

/* The seller's window: the lit sign on the booth, the details on a tray pulled onto the counter below it. */
export function SellerProfileHeader({ username, fullName, avatarUrl, level, rating, totalReviews, totalOrders, tagline, memberSince, action }: Props) {
  const joined = since(memberSince)
  return (
    <header>
      <div className="booth">
        <div className="wrap flex items-end gap-6 pb-14 pt-10 lg:pt-14">
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarUrl} alt="" width={112} height={112} className="h-24 w-24 rounded-[22%] object-cover shadow-[0_0_0_3px_#C9A24A] lg:h-28 lg:w-28" />
          ) : (
            <SellerMark username={username} level={level} size={112} className="h-24 w-24 lg:h-28 lg:w-28" />
          )}
          <div className="min-w-0 pb-1">
            <h1 className="t-sign truncate">{fullName}</h1>
            <p className="num mt-1 text-sand">@{username}</p>
          </div>
        </div>
      </div>

      <div className="wrap">
        <div className="tray -mt-8 flex flex-wrap items-center gap-x-6 gap-y-4 p-5">
          <LevelPlate level={level} />
          <ReviewSummary average={rating} total={totalReviews} />
          <p className="num text-sm text-ink-muted">
            {totalOrders} {totalOrders === 1 ? "order" : "orders"} completed
          </p>
          {joined ? <p className="text-sm text-ink-muted">At the counter since {joined}</p> : null}
          {action ? <div className="ml-auto flex items-center gap-2">{action}</div> : null}
          {tagline ? <p className="basis-full text-ink">{tagline}</p> : null}
        </div>
      </div>
    </header>
  )
}
