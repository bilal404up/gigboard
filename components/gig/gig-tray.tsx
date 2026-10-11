import Link from "next/link"
import type { ReactNode } from "react"
import type { GigCardData } from "@/components/gig/gig-card"
import { GigArt } from "@/components/gig/GigArt"
import { ReviewSummary } from "@/components/gig/review-summary"
import { SellerMark, LevelPlate } from "@/components/seller/SellerMark"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils/cn"
import { formatMoney } from "@/lib/utils/format"

type TrayProps = { gig: GigCardData; favorite?: ReactNode; className?: string }

function delivery(days?: number | null) {
  if (!days) return null
  return `${days} day${days === 1 ? "" : "s"}`
}

function Art({ gig, className = "" }: { gig: GigCardData; className?: string }) {
  if (gig.thumbnail_url) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={gig.thumbnail_url} alt="" className={cn("block aspect-[4/3] w-full object-cover", className)} />
  }
  return <GigArt seed={gig.slug} category={gig.category_slug ?? undefined} className={className} />
}

/* Grid card: enamel art, lit seller mark, price on a brass plate that slides up on hover and keyboard focus. */
export function GigTray({ gig, favorite, className = "" }: TrayProps) {
  return (
    <article
      className={cn(
        "tray tray--hover flex flex-col focus-within:[outline:2.5px_solid_#4B2320] focus-within:outline-offset-2",
        className
      )}
    >
      <div className="tray-art">
        <Art gig={gig} />
        {favorite ? <div className="absolute right-3 top-3 z-10">{favorite}</div> : null}
        <div className="tray-plate" aria-hidden="true">
          <span className="text-xs font-semibold">Held until you approve</span>
          <span className="num text-sm font-bold">From {formatMoney(gig.starting_price)}</span>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-center gap-2.5">
          <SellerMark username={gig.seller.username} level={gig.seller.seller_level} size={28} />
          <span className="truncate text-sm font-semibold">{gig.seller.full_name}</span>
          <LevelPlate level={gig.seller.seller_level} className="ml-auto min-h-6 shrink-0 px-2" />
        </div>

        <h3 className="text-base font-semibold leading-snug">
          <Link href={`/gig/${gig.slug}`} className="line-clamp-2 outline-none after:absolute after:inset-0 after:content-['']">
            {gig.title}
          </Link>
        </h3>

        <div className="mt-auto flex flex-wrap items-center justify-between gap-x-3 gap-y-1 border-t-2 border-dotted border-sand pt-3">
          <ReviewSummary average={gig.average_rating} total={gig.total_reviews} compact />
          <div className="flex items-baseline gap-2">
            {delivery(gig.delivery_days) ? <span className="num text-xs text-ink-muted">{delivery(gig.delivery_days)}</span> : null}
            <span className="num text-sm font-bold">From {formatMoney(gig.starting_price)}</span>
          </div>
        </div>
      </div>
    </article>
  )
}

const ROW = "grid items-center gap-4 md:grid-cols-[6rem_minmax(0,1fr)_9rem_6rem_7rem_3rem]"

/* Column headings for list mode. Sentence case, on a brass sill. */
export function GigTrayHeader() {
  return (
    <div className={cn(ROW, "hidden bg-[linear-gradient(180deg,#E7C978,#C9A24A_40%,#7A5A14)] bg-[length:100%_4px] bg-bottom bg-no-repeat px-3 pb-3 text-xs font-semibold text-ink-muted md:grid")} aria-hidden="true">
      <span>Gig</span>
      <span />
      <span>Rating</span>
      <span>Delivery</span>
      <span className="text-right">Price</span>
      <span />
    </div>
  )
}

/* List row: a shallow tray. On small screens the columns stack into two lines. */
export function GigTrayRow({ gig, favorite }: TrayProps) {
  return (
    <article className={cn("tray tray--hover relative p-3 focus-within:[outline:2.5px_solid_#4B2320] focus-within:outline-offset-2", ROW, "grid-cols-[6rem_minmax(0,1fr)_3rem]")}>
      <Art gig={gig} className="rounded-[6px]" />
      <div className="min-w-0">
        <h3 className="text-base font-semibold leading-snug">
          <Link href={`/gig/${gig.slug}`} className="line-clamp-2 outline-none after:absolute after:inset-0 after:content-['']">
            {gig.title}
          </Link>
        </h3>
        <div className="mt-1.5 flex items-center gap-2 text-sm text-ink-muted">
          <SellerMark username={gig.seller.username} level={gig.seller.seller_level} size={20} />
          <span className="truncate">{gig.seller.full_name}</span>
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 md:hidden">
          <ReviewSummary average={gig.average_rating} total={gig.total_reviews} compact />
          {delivery(gig.delivery_days) ? <span className="num text-xs text-ink-muted">{delivery(gig.delivery_days)}</span> : null}
          <span className="num text-sm font-bold">From {formatMoney(gig.starting_price)}</span>
        </div>
      </div>
      <div className="hidden md:block">
        <ReviewSummary average={gig.average_rating} total={gig.total_reviews} compact />
      </div>
      <div className="num hidden text-sm text-ink-muted md:block">{delivery(gig.delivery_days) ?? "\u00a0"}</div>
      <div className="num hidden text-right text-sm font-bold md:block">From {formatMoney(gig.starting_price)}</div>
      <div className="relative z-10 justify-self-end">{favorite}</div>
    </article>
  )
}

export function GigTraySkeleton() {
  return (
    <div className="tray flex flex-col" aria-hidden="true">
      <Skeleton className="aspect-[4/3] w-full rounded-b-none rounded-t-[10px]" />
      <div className="flex flex-col gap-3 p-4">
        <div className="flex items-center gap-2.5">
          <Skeleton className="h-7 w-7 rounded-[22%]" />
          <Skeleton className="h-4 w-28" />
        </div>
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-3/4" />
        <div className="flex justify-between border-t-2 border-dotted border-sand pt-3">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>
    </div>
  )
}

export function GigTrayRowSkeleton() {
  return (
    <div className={cn("tray p-3", ROW, "grid-cols-[6rem_minmax(0,1fr)_3rem]")} aria-hidden="true">
      <Skeleton className="aspect-[4/3] w-full rounded-[6px]" />
      <div className="grid gap-2">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-32" />
      </div>
      <Skeleton className="hidden h-4 w-20 md:block" />
      <Skeleton className="hidden h-4 w-12 md:block" />
      <Skeleton className="hidden h-4 w-16 justify-self-end md:block" />
      <Skeleton className="h-11 w-11 rounded-pill" />
    </div>
  )
}

type PinProps = { active: boolean; pending?: boolean; onClick: () => void; className?: string }

/* The favourite control: a push pin. Pinned gigs get a brass head. Your hook drives it. */
export function FavoritePin({ active, pending = false, onClick, className = "" }: PinProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      aria-pressed={active}
      aria-label={active ? "Saved to favourites" : "Save to favourites"}
      className={cn(
        "relative z-10 inline-flex h-11 w-11 items-center justify-center rounded-pill bg-laminate-raised text-ink shadow-[0_1px_0_#D5CBBD,0_4px_0_-2px_#E4DCCF] transition-transform duration-120 ease-out",
        "hover:-translate-y-px focus-visible:outline focus-visible:outline-[2.5px] focus-visible:outline-offset-2 focus-visible:outline-mahogany disabled:opacity-60",
        className
      )}
    >
      <svg viewBox="0 0 20 20" width="20" height="20" aria-hidden="true">
        <circle cx="10" cy="6.5" r="4.5" fill={active ? "#C9A24A" : "none"} stroke={active ? "#7A5A14" : "currentColor"} strokeWidth="1.8" />
        <path d="M6.5 10.5h7l-1 2.5h-5z" fill={active ? "#7A5A14" : "none"} stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M10 13v5.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    </button>
  )
}
