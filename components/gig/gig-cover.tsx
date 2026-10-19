import { cn } from "@/lib/utils/cn";
import { GigArt, type ArtCategory } from "@/components/gig/GigArt";

export type CoverCategory = "web-development" | "mobile-development" | "design-creative" | "ai-automation" | "digital-marketing" | "business-support";

/** Kept for older imports. */
export const COVER_STYLES: Record<CoverCategory, { bg: string; fg: string; tag: string }> = {
  "web-development": { bg: "#F4F3EF", fg: "#111113", tag: "Web" },
  "mobile-development": { bg: "#F4F3EF", fg: "#111113", tag: "Mobile" },
  "design-creative": { bg: "#F4F3EF", fg: "#111113", tag: "Design" },
  "ai-automation": { bg: "#F4F3EF", fg: "#111113", tag: "AI" },
  "digital-marketing": { bg: "#F4F3EF", fg: "#111113", tag: "Marketing" },
  "business-support": { bg: "#F4F3EF", fg: "#111113", tag: "Business" },
};

const ORDER = Object.keys(COVER_STYLES) as CoverCategory[];

const ART: Record<CoverCategory, ArtCategory> = {
  "web-development": "development",
  "mobile-development": "mobile",
  "design-creative": "design",
  "ai-automation": "ai",
  "digital-marketing": "marketing",
  "business-support": "business",
};

export function coverCategoryFor(slug: string | null | undefined, seed: string): CoverCategory {
  if (slug && slug in COVER_STYLES) return slug as CoverCategory;
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ORDER[(h >>> 0) % ORDER.length];
}

interface Props {
  seed: string;
  category?: string | null;
  className?: string;
  showTag?: boolean;
  text?: string;
  price?: number | null;
  days?: number | null;
}

/** The ticket cover, filling its parent. */
export function GigCover({ seed, category, className, text, price, days }: Props) {
  const cat = coverCategoryFor(category, seed);
  const { tag } = COVER_STYLES[cat];
  return (
    <div className={cn("relative h-full w-full", className)}>
      <GigArt seed={seed} category={ART[cat]} title={`${tag} gig cover`} text={text} price={price} days={days} cover />
    </div>
  );
}
