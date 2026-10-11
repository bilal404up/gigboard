"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { FavoritePin, GigTray, GigTrayHeader, GigTrayRow, GigTrayRowSkeleton, GigTraySkeleton } from "@/components/gig/gig-tray";
import type { SellerLevel } from "@/types/database.types";

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

/** Card form: used for related gigs, favorites, a seller's gigs and category pages. */
export function GigCard({ gig, className, initialFavorited = false }: { gig: GigCardData; className?: string; initialFavorited?: boolean }) {
  const { fav, pending, toggle } = useFavorite(gig.id, initialFavorited);
  const onPin = (e?: React.MouseEvent) => toggle(e as React.MouseEvent);
  return <GigTray gig={gig} className={className} favorite={<FavoritePin active={fav} pending={pending} onClick={onPin} />} />;
}

/** Column headings for the board. Hidden on small screens, where rows stack. */
export function GigBoardHeader() {
  return <GigTrayHeader />;
}

/** Board row form: used for search results and the home page. */
export function GigRow({ gig, initialFavorited = false }: { gig: GigCardData; initialFavorited?: boolean }) {
  const { fav, pending, toggle } = useFavorite(gig.id, initialFavorited);
  const onPin = (e?: React.MouseEvent) => toggle(e as React.MouseEvent);
  return <GigTrayRow gig={gig} favorite={<FavoritePin active={fav} pending={pending} onClick={onPin} />} />;
}

export function GigCardSkeleton() {
  return <GigTraySkeleton />;
}

export function GigRowSkeleton() {
  return <GigTrayRowSkeleton />;
}
