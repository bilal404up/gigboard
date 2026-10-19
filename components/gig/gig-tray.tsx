import Link from "next/link"
import type { ReactNode } from "react"
import type { GigCardData } from "@/components/gig/gig-card"
import { GigArt } from "@/components/gig/GigArt"
import { ReviewSummary } from "@/components/gig/review-summary"
import { SellerMark, LevelPlate } from "@/components/seller/SellerMark"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils/cn"
import { gigTitle } from "@/lib/order-status"

function Face({ seller, size }: { seller: GigCardData["seller"]; size: number }) {
  if (!seller.avatar_url) return <SellerMark username={seller.username} level={seller.seller_level} size={size} label={seller.full_name} />
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={seller.avatar_url} alt="" width={size} height={size} className="shrink-0 rounded-full object-cover" style={{ width: size, height: size }} />
}

type TrayProps = { gig: GigCardData; favorite?: ReactNode; className?: string }

function delivery(days?: number | null) {
  if (!days) return null
  return `${days} ${days === 1 ? "day" : "days"}`
}

function Art({ gig, className = "", thumb = false }: { gig: GigCardData; className?: string; thumb?: boolean }) {
  if (gig.thumbnail_url) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={gig.thumbnail_url} alt="" className={cn("block aspect-[4/3] w-full object-cover", className)} />
  }
  return (
    <GigArt
      seed={gig.slug}
      category={gig.category_slug ?? undefined}
      className={className}
      text={gigTitle(gig.title)}
      price={gig.starting_price}
      days={gig.delivery_days}
      variant={thumb ? "thumb" : "cover"}
    />
  )
}

/* Grid card: ticket cover, seller line, title, rating and price. */
export function GigTray({ gig, favorite, className = "" }: TrayProps) {
  return (
    <article className={cn("tray tray--hover flex flex-col overflow-hidden focus-within:[outline:2px_solid_#111113] focus-within:outline-offset-2", className)}>
      <div className="tray-art">
        <Art gig={gig} />
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-center gap-2.5">
          <Face seller={gig.seller} size={24} />
          <span className="min-w-0 truncate text-sm text-ink-2">{gig.seller.full_name}</span>
          <LevelPlate level={gig.seller.seller_level} className="ml-auto shrink-0" />
        </div>
        <h3 className="text-[0.9375rem] font-semibold leading-snug">
          <Link href={`/gig/${gig.slug}`} className="line-clamp-2 outline-none after:absolute after:inset-0 after:content-['']">
            {gigTitle(gig.title)}
          </Link>
        </h3>
        <div className="mt-auto flex items-center justify-between gap-3 border-t border-line pt-3">
          <ReviewSummary average={gig.average_rating} total={gig.total_reviews} compact />
          <div className="flex items-center gap-1">
            <span className="num text-sm">from ${Math.round(gig.starting_price)}</span>
            {favorite ? <span className="relative z-10 -mr-2">{favorite}</span> : null}
          </div>
        </div>
      </div>
    </article>
  )
}

const ROW = "grid items-center gap-4 md:grid-cols-[5.5rem_minmax(0,1fr)_7.5rem_6rem_6rem_auto]"

/* Column headings for the board view. */
export function GigTrayHeader() {
  return (
    <div className={cn(ROW, "hidden border-b border-line px-4 pb-3 md:grid")} aria-hidden="true">
      <span className="eyebrow">Gig</span>
      <span />
      <span className="eyebrow">Rating</span>
      <span className="eyebrow">Ready in</span>
      <span className="eyebrow text-right">From</span>
      <span className="w-11" />
    </div>
  )
}

/* Board row: dense, one line per gig. On phones it stacks into two lines. */
export function GigTrayRow({ gig, favorite }: TrayProps) {
  return (
    <article className={cn("group relative border-b border-line px-2 py-3 transition-colors duration-150 hover:bg-surface md:px-4", ROW, "grid-cols-[4.5rem_minmax(0,1fr)_auto] focus-within:bg-surface")}>
      <div className="overflow-hidden rounded-[6px]">
        <Art gig={gig} thumb />
      </div>
      <div className="min-w-0">
        <h3 className="text-[0.9375rem] font-semibold leading-snug">
          <Link href={`/gig/${gig.slug}`} className="line-clamp-2 outline-none after:absolute after:inset-0 after:content-[''] focus-visible:underline">
            {gigTitle(gig.title)}
          </Link>
        </h3>
        <div className="mt-1 flex items-center gap-2 text-sm text-ink-2">
          <Face seller={gig.seller} size={18} />
          <span className="truncate">{gig.seller.full_name}</span>
          <LevelPlate level={gig.seller.seller_level} className="hidden sm:inline-flex" />
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 md:hidden">
          <ReviewSummary average={gig.average_rating} total={gig.total_reviews} compact />
          {delivery(gig.delivery_days) ? <span className="num text-xs text-ink-2">{delivery(gig.delivery_days)}</span> : null}
          <span className="num text-sm">from ${Math.round(gig.starting_price)}</span>
        </div>
      </div>
      <div className="hidden md:block">
        <ReviewSummary average={gig.average_rating} total={gig.total_reviews} compact />
      </div>
      <div className="num hidden text-sm text-ink-2 md:block">{delivery(gig.delivery_days) ?? " "}</div>
      <div className="num hidden text-right text-[0.9375rem] md:block">${Math.round(gig.starting_price)}</div>
      <div className="relative z-10 justify-self-end">{favorite}</div>
    </article>
  )
}

export function GigTraySkeleton() {
  return (
    <div className="tray flex flex-col overflow-hidden" aria-hidden="true">
      <Skeleton className="aspect-[4/3] w-full rounded-none" />
      <div className="flex flex-col gap-3 p-4">
        <div className="flex items-center gap-2.5">
          <Skeleton className="h-6 w-6 rounded-full" />
          <Skeleton className="h-4 w-28" />
        </div>
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-3/4" />
        <div className="flex justify-between border-t border-line pt-3">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>
    </div>
  )
}

export function GigTrayRowSkeleton() {
  return (
    <div className={cn("border-b border-line px-2 py-3 md:px-4", ROW, "grid-cols-[4.5rem_minmax(0,1fr)_auto]")} aria-hidden="true">
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

/* The favourite control: a heart with a label for screen readers and a tooltip. */
export function FavoritePin({ active, pending = false, onClick, className = "" }: PinProps) {
  const label = active ? "Saved to favourites" : "Save to favourites"
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      aria-pressed={active}
      aria-label={label}
      title={label}
      className={cn(
        "relative z-10 inline-flex h-11 w-11 items-center justify-center rounded-full text-ink-2 transition-colors duration-150 hover:bg-surface-sunk hover:text-ink",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:opacity-60",
        active && "text-ink",
        className
      )}
    >
      <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true">
        <path
          d="M10 16.5s-6.5-3.9-6.5-8.4A3.6 3.6 0 0 1 10 6a3.6 3.6 0 0 1 6.5 2.1c0 4.5-6.5 8.4-6.5 8.4z"
          fill={active ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  )
}
