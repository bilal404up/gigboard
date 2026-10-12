import { cn } from "@/lib/utils/cn";
import { GigArt, type ArtCategory } from "@/components/gig/GigArt";

export type CoverCategory = "web-development" | "mobile-development" | "design-creative" | "ai-automation" | "digital-marketing" | "business-support";

/** Kept for the pages that import it. Values match GigArt's quiet category tints. */
export const COVER_STYLES: Record<CoverCategory, { bg: string; fg: string; tag: string }> = {
  "web-development": { bg: "#E9EEF5", fg: "#121417", tag: "Web" },
  "mobile-development": { bg: "#E7EFF2", fg: "#121417", tag: "Mobile" },
  "design-creative": { bg: "#F1EBF3", fg: "#121417", tag: "Design" },
  "ai-automation": { bg: "#ECF2EA", fg: "#121417", tag: "AI" },
  "digital-marketing": { bg: "#F5ECE7", fg: "#121417", tag: "Marketing" },
  "business-support": { bg: "#EDEEF0", fg: "#121417", tag: "Business" },
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
  return ORDER[hash(seed) % ORDER.length];
}

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

interface Props {
  seed: string;
  category?: string | null;
  className?: string;
  /** Kept for compatibility. The cover already names its category, so no extra tag is drawn. */
  showTag?: boolean;
  /** Words printed on the cover, usually the gig title. */
  text?: string;
}

/** A typographic cover. Fills its parent like the old cover did. */
export function GigCover({ seed, category, className, text }: Props) {
  const cat = coverCategoryFor(category, seed);
  const { tag } = COVER_STYLES[cat];
  return (
    <div className={cn("relative h-full w-full", className)}>
      <GigArt seed={seed} category={ART[cat]} title={`${tag} gig cover`} text={text} cover />
    </div>
  );
}
