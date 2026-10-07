"use client";
import Link from "next/link";
import Image from "next/image";
import { Heart, Star } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { SellerLevelBadge } from "@/components/seller/seller-level-badge";
import { GigCover } from "@/components/gig/gig-cover";
import { InitialAvatar } from "@/components/ui/initial-avatar";
import type { SellerLevel } from "@/types/database.types";
import { cn } from "@/lib/utils/cn";

export interface GigCardData {
  id: string;
  slug: string;
  title: string;
  thumbnail_url: string | null;
  average_rating: number;
  total_reviews: number;
  starting_price: number;
  /** Root category slug, used to pick the cover style. */
  category_slug?: string | null;
  /** Fastest delivery across the gig's packages. */
  delivery_days?: number | null;
  seller: {
    username: string;
    full_name: string;
    avatar_url: string | null;
    seller_level: SellerLevel;
  };
}

function useFavorite(gigId: string, initial: boolean) {
  const router = useRouter();
  const [fav, setFav] = useState(initial);
  const [pending, setPending] = useState(false);

  async function toggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (pending) return;
    const prev = fav;
    setFav(!prev);
    setPending(true);
    try {
      const res = await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gig_id: gigId }),
      });
      if (res.status === 401) {
        setFav(prev);
        toast.error("Sign in to save gigs", {
          action: { label: "Sign in", onClick: () => router.push("/login?redirect=" + window.location.pathname) },
        });
        return;
      }
      if (!res.ok) {
        setFav(prev);
        toast.error("Could not update favorites");
        return;
      }
      const data = await res.json();
      setFav(Boolean(data.favorited));
    } catch {
      setFav(prev);
      toast.error("Network error. Try again.");
    } finally {
      setPending(false);
    }
  }
  return { fav, pending, toggle };
}

function Cover({ gig, showTag = true }: { gig: GigCardData; showTag?: boolean }) {
  if (gig.thumbnail_url) {
    return (
      <Image
        src={gig.thumbnail_url}
        alt={gig.title}
        fill
        className="object-cover"
        sizes="(min-width: 1024px) 280px, (min-width: 640px) 50vw, 100vw"
      />
    );
  }
  return <GigCover seed={gig.id} category={gig.category_slug} showTag={showTag} />;
}

function HeartButton({ fav, pending, onClick, className }: { fav: boolean; pending: boolean; onClick: (e: React.MouseEvent) => void; className?: string }) {
  return (
    <button
      onClick={onClick}
      disabled={pending}
      className={cn("flex h-8 w-8 items-center justify-center rounded-xs border border-line bg-white hover:border-line-strong", className)}
      aria-label={fav ? "Remove from favorites" : "Save to favorites"}
      aria-pressed={fav}
    >
      <Heart className={cn("h-4 w-4", fav ? "fill-error text-error" : "text-ink-muted")} />
    </button>
  );
}

function Rating({ gig }: { gig: GigCardData }) {
  if (gig.total_reviews <= 0) return <span className="text-[13px] text-ink-subtle">No reviews yet</span>;
  return (
    <span className="num inline-flex items-center gap-1 text-[15px] leading-[22px]">
      <Star className="h-3.5 w-3.5 fill-ink text-ink" aria-hidden />
      {gig.average_rating.toFixed(1)}
      <span className="text-ink-subtle">({gig.total_reviews})</span>
    </span>
  );
}

function money(n: number) {
  return Number.isInteger(n) ? `$${n.toLocaleString("en-US")}` : `$${n.toFixed(2)}`;
}

function days(n: number | null | undefined) {
  if (!n) return "n/a";
  return n === 1 ? "1 day" : `${n} days`;
}

/** Card form: used for related gigs, favorites, a seller's gigs and category pages. */
export function GigCard({ gig, className, initialFavorited = false }: { gig: GigCardData; className?: string; initialFavorited?: boolean }) {
  const { fav, pending, toggle } = useFavorite(gig.id, initialFavorited);
  return (
    <Link
      href={`/gig/${gig.slug}`}
      className={cn("group block overflow-hidden rounded-lg border border-line bg-white hover:border-line-strong", className)}
    >
      <div className="relative aspect-[3/2] overflow-hidden bg-canvas-subtle">
        <Cover gig={gig} />
        <HeartButton fav={fav} pending={pending} onClick={toggle} className="absolute right-2.5 top-2.5" />
      </div>
      <div className="border-t border-ink p-4">
        <div className="mb-2 flex items-center gap-2">
          <InitialAvatar name={gig.seller.full_name} />
          <span className="min-w-0 flex-1 truncate text-[13px] leading-[18px] text-ink-muted">{gig.seller.full_name}</span>
          <SellerLevelBadge level={gig.seller.seller_level} className="shrink-0" />
        </div>
        <p className="mb-2 line-clamp-2 min-h-[48px] text-[17px] font-semibold leading-6 text-ink">{gig.title}</p>
        <Rating gig={gig} />
      </div>
      <div className="num flex items-baseline justify-between border-t border-ink px-4 py-3 text-[15px] leading-[22px]">
        <span>{days(gig.delivery_days)}</span>
        <span>from {money(gig.starting_price)}</span>
      </div>
    </Link>
  );
}

/** Column headings for the board. Hidden on small screens, where rows stack. */
export function GigBoardHeader() {
  return (
    <div className="num hidden grid-cols-[72px_minmax(0,1fr)_150px_132px_96px_112px_32px] items-center gap-4 border-b-2 border-ink px-4 py-2 text-[13px] leading-[18px] text-ink-muted md:grid">
      <span className="sr-only">Cover</span>
      <span className="col-start-2">Gig</span>
      <span>Level</span>
      <span>Rating</span>
      <span>Delivery</span>
      <span className="text-right">From</span>
      <span className="sr-only">Save</span>
    </div>
  );
}

/** Board row form: used for search results and the home page. */
export function GigRow({ gig, initialFavorited = false }: { gig: GigCardData; initialFavorited?: boolean }) {
  const { fav, pending, toggle } = useFavorite(gig.id, initialFavorited);
  return (
    <Link
      href={`/gig/${gig.slug}`}
      className="group grid grid-cols-[56px_minmax(0,1fr)_32px] items-center gap-x-4 gap-y-1 border-b border-ink px-4 py-3 hover:bg-canvas-subtle md:grid-cols-[72px_minmax(0,1fr)_150px_132px_96px_112px_32px]"
    >
      <div className="relative row-span-2 aspect-[3/2] overflow-hidden md:row-span-1">
        <Cover gig={gig} showTag={false} />
      </div>
      <div className="min-w-0">
        <p className="line-clamp-2 text-[15px] font-semibold leading-[22px] text-ink">{gig.title}</p>
        <p className="mt-0.5 flex items-center gap-2 text-[13px] leading-[18px] text-ink-muted">
          <InitialAvatar name={gig.seller.full_name} size={20} />
          <span className="truncate">{gig.seller.full_name}</span>
        </p>
      </div>
      <HeartButton fav={fav} pending={pending} onClick={toggle} className="md:order-last" />
      <div className="col-start-2 col-end-4 flex flex-wrap items-center gap-x-4 gap-y-1 md:contents">
        <span className="md:col-auto"><SellerLevelBadge level={gig.seller.seller_level} /></span>
        <Rating gig={gig} />
        <span className="num text-[15px] leading-[22px]">{days(gig.delivery_days)}</span>
        <span className="num whitespace-nowrap text-[15px] font-medium leading-[22px] md:text-right">from {money(gig.starting_price)}</span>
      </div>
    </Link>
  );
}

export function GigCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-lg border border-line bg-white">
      <div className="aspect-[3/2] skeleton" />
      <div className="space-y-3 border-t border-ink p-4">
        <div className="h-3 w-2/3 skeleton rounded-xs" />
        <div className="space-y-1.5">
          <div className="h-4 skeleton rounded-xs" />
          <div className="h-4 w-3/4 skeleton rounded-xs" />
        </div>
        <div className="h-3 w-1/3 skeleton rounded-xs" />
      </div>
      <div className="flex justify-between border-t border-ink px-4 py-3">
        <div className="h-4 w-14 skeleton rounded-xs" />
        <div className="h-4 w-20 skeleton rounded-xs" />
      </div>
    </div>
  );
}

export function GigRowSkeleton() {
  return (
    <div className="grid grid-cols-[56px_minmax(0,1fr)] items-center gap-4 border-b border-ink px-4 py-3 md:grid-cols-[72px_minmax(0,1fr)_150px_132px_96px_112px_32px]">
      <div className="aspect-[3/2] skeleton" />
      <div className="space-y-1.5">
        <div className="h-4 skeleton rounded-xs" />
        <div className="h-3 w-1/3 skeleton rounded-xs" />
      </div>
    </div>
  );
}
