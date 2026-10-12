import Link from "next/link"
import { SellerMark, LevelPlate } from "@/components/seller/SellerMark"
import { RatingStars } from "@/components/ui/rating-stars"
import type { SellerLevel } from "@/types/database.types"

type Props = {
  username: string
  fullName: string
  avatarUrl: string | null
  level: SellerLevel
  rating: number
  totalOrders: number
  tagline?: string | null
}

export function SellerCard({ username, fullName, avatarUrl, level, rating, totalOrders, tagline }: Props) {
  const hasRating = rating > 0
  return (
    <div className="tray p-5">
      <div className="flex items-start gap-4">
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={avatarUrl} alt="" width={56} height={56} className="h-14 w-14 shrink-0 rounded-full object-cover" />
        ) : (
          <SellerMark username={username} level={level} size={56} />
        )}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <Link href={`/seller/${username}`} className="t-head link truncate decoration-transparent hover:decoration-current">
              {fullName}
            </Link>
            <LevelPlate level={level} />
          </div>
          <p className="mt-0.5 text-sm text-ink-muted">@{username}</p>
          {tagline ? <p className="mt-2 text-sm text-ink">{tagline}</p> : null}
        </div>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-line pt-4">
        <div>
          <dt className="text-xs font-semibold text-ink-muted">Rating</dt>
          <dd className="mt-1 flex items-center gap-2">
            {hasRating ? (
              <>
                <RatingStars value={rating} size={14} />
                <span className="text-sm tabular-nums">{rating.toFixed(1)}</span>
              </>
            ) : (
              <span className="text-sm text-ink-muted">Not rated yet</span>
            )}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-semibold text-ink-muted">Orders completed</dt>
          <dd className="mt-1 text-sm tabular-nums">{totalOrders}</dd>
        </div>
      </dl>
    </div>
  )
}
