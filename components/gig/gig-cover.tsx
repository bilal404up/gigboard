import { cn } from "@/lib/utils/cn";
import { GigArt, type ArtCategory } from "@/components/gig/GigArt";

export type CoverCategory =
  | "web-development"
  | "mobile-development"
  | "design-creative"
  | "ai-automation"
  | "digital-marketing"
  | "business-support";

/** Kept for the pages that import it. The cover itself is now drawn by GigArt. */
export const COVER_STYLES: Record<CoverCategory, { bg: string; fg: string; tag: string }> = {
  "web-development": { bg: "#0E5E57", fg: "#EFE9DF", tag: "Web" },
  "mobile-development": { bg: "#2D4FA8", fg: "#EFE9DF", tag: "Mobile" },
  "design-creative": { bg: "#6A2C70", fg: "#EFE9DF", tag: "Design" },
  "ai-automation": { bg: "#D9A531", fg: "#2E1414", tag: "AI" },
  "digital-marketing": { bg: "#C8331F", fg: "#EFE9DF", tag: "Marketing" },
  "business-support": { bg: "#4B2320", fg: "#C9A24A", tag: "Business" },
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
  /** Hide the category tag on very small covers. */
  showTag?: boolean;
}

/** An enamel sign built in code, seeded by the gig id. Fills its parent like the old cover did. */
export function GigCover({ seed, category, className, showTag = true }: Props) {
  const cat = coverCategoryFor(category, seed);
  const { tag } = COVER_STYLES[cat];
  return (
    <div className={cn("relative h-full w-full", className)}>
      <GigArt seed={seed} category={ART[cat]} title={`${tag} gig cover`} cover />
      {showTag && <span className="plate plate--enamel t-plate absolute left-2.5 top-2.5 min-h-6 px-2">{tag}</span>}
    </div>
  );
}
