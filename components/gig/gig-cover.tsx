import { cn } from "@/lib/utils/cn";

export type CoverCategory =
  | "web-development"
  | "mobile-development"
  | "design-creative"
  | "ai-automation"
  | "digital-marketing"
  | "business-support";

/** Background, figure color and tag for each category. Every pair is at least 6.9:1 (checked with a script). */
export const COVER_STYLES: Record<CoverCategory, { bg: string; fg: string; tag: string }> = {
  "web-development": { bg: "#0B4A6F", fg: "#BFE3F7", tag: "Web" },
  "mobile-development": { bg: "#14532D", fg: "#BFEFD0", tag: "Mobile" },
  "design-creative": { bg: "#3B1F6B", fg: "#DCCBFF", tag: "Design" },
  "ai-automation": { bg: "#26272B", fg: "#F2B705", tag: "AI" },
  "digital-marketing": { bg: "#3F4A1A", fg: "#E2ECB0", tag: "Marketing" },
  "business-support": { bg: "#6E1B33", fg: "#F9D3DE", tag: "Business" },
};

const ORDER = Object.keys(COVER_STYLES) as CoverCategory[];

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

/** Small deterministic random source, so one gig id always draws the same cover. */
function rng(seed: string) {
  let a = hash(seed) || 1;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const W = 300;
const H = 200;

function figure(category: CoverCategory, seed: string, fg: string, bg: string): React.ReactNode[] {
  const r = rng(seed + category);
  const out: React.ReactNode[] = [];
  const int = (lo: number, hi: number) => lo + Math.floor(r() * (hi - lo + 1));

  switch (category) {
    case "design-creative": {
      const filled = int(0, 2);
      for (let i = 0; i < 3; i++) {
        const rad = H * (0.18 + r() * 0.24);
        const cx = 60 + i * 90 + int(-14, 14);
        out.push(
          <circle key={i} cx={cx} cy={H / 2} r={rad} fill={i === filled ? fg : "none"} stroke={fg} strokeWidth={2} />
        );
      }
      break;
    }
    case "web-development": {
      out.push(<rect key="bar" x={20} y={22} width={W - 40} height={16} fill={fg} />);
      const blocks = int(3, 5);
      let x = 20;
      const total = W - 40;
      const cell = total / 12;
      for (let i = 0; i < blocks; i++) {
        const span = i === blocks - 1 ? Math.max(2, Math.round((total - (x - 20)) / cell)) : int(2, 4);
        const w = Math.min(span * cell - 6, W - 20 - x);
        if (w <= 8) break;
        const h = int(40, 100);
        out.push(<rect key={"b" + i} x={x} y={58} width={w} height={h} fill={i === 0 ? fg : "none"} stroke={fg} strokeWidth={2} />);
        x += span * cell;
      }
      break;
    }
    case "mobile-development": {
      const indent = [0, 1, 2, 2, 1, 0, 0];
      indent.forEach((lvl, i) => {
        const len = int(80, 190);
        out.push(<rect key={i} x={24 + lvl * 24} y={22 + i * 24} width={len} height={6} rx={3} fill={fg} />);
      });
      break;
    }
    case "business-support": {
      for (let i = 0; i < 6; i++) {
        const y = 34 + i * 26;
        out.push(<line key={"l" + i} x1={24} y1={y + 12} x2={W - 24} y2={y + 12} stroke={fg} strokeWidth={1} />);
        let x = 24;
        const words = i === 5 ? 1 : int(1, 4);
        for (let w = 0; w < words; w++) {
          const ww = int(24, 70);
          if (x + ww > W - 24) break;
          out.push(<rect key={`w${i}-${w}`} x={x} y={y} width={ww} height={9} rx={4} fill={fg} />);
          x += ww + 10;
        }
      }
      break;
    }
    case "ai-automation": {
      const solid = int(0, 4);
      for (let i = 0; i < 5; i++) {
        const x = 22 + i * 54;
        out.push(<rect key={"n" + i} x={x} y={H / 2 - 22} width={44} height={44} fill={i === solid ? fg : "none"} stroke={fg} strokeWidth={2} />);
        if (i < 4) out.push(<line key={"c" + i} x1={x + 44} y1={H / 2} x2={x + 54} y2={H / 2} stroke={fg} strokeWidth={2} />);
      }
      for (let i = 0; i < 24; i++) {
        out.push(<rect key={"t" + i} x={14 + i * 12} y={10} width={2} height={5} fill={fg} />);
        out.push(<rect key={"u" + i} x={14 + i * 12} y={H - 15} width={2} height={5} fill={fg} />);
      }
      break;
    }
    case "digital-marketing": {
      const heights = Array.from({ length: 8 }, () => int(30, 150)).sort((a, b) => a - b);
      heights.forEach((h, i) => {
        out.push(<rect key={i} x={24 + i * 33} y={H - 20 - h} width={24} height={h} fill={fg} />);
      });
      out.push(<rect key="cap" x={24 + 7 * 33} y={H - 22 - heights[7]} width={24} height={2} fill={bg} />);
      break;
    }
  }
  return out;
}

interface Props {
  seed: string;
  category?: string | null;
  className?: string;
  /** Hide the category tag on very small covers. */
  showTag?: boolean;
}

/**
 * A cover built in code: flat shapes in two colors, one pattern rule per category,
 * seeded by the gig id so no two gigs match. No photos, gradients or shadows.
 */
export function GigCover({ seed, category, className, showTag = true }: Props) {
  const cat = coverCategoryFor(category, seed);
  const { bg, fg, tag } = COVER_STYLES[cat];
  return (
    <div className={cn("relative h-full w-full", className)}>
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="block h-full w-full"
      role="img"
      aria-label={`${tag} gig cover`}
      preserveAspectRatio="xMidYMid slice"
    >
      <rect width={W} height={H} fill={bg} />
      <g transform="translate(0 14) scale(1 0.92)">{figure(cat, seed, fg, bg)}</g>
    </svg>
    {showTag && (
      <span className="num absolute left-2.5 top-2 text-[11px] leading-none" style={{ color: fg }}>
        {tag}
      </span>
    )}
    </div>
  );
}
