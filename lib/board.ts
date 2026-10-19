/*
 * Departure board adapter.
 * The board reads the site's own active gigs. Map each gig to a BoardSource once
 * (see app/page.tsx), then pass toBoardGigs(...) to <GigBoard />.
 *
 * Columns: Gig (two flap lines) / Seller / Ready by / Price / Status, plus the rating as plain text.
 * Flap rules: each title line max TITLE_LINE characters, seller max SELLER_MAX, price under $10,000.
 */

export type WindowNo = 1 | 2 | 3 | 4 | 5 | 6;

/** Category names, in board order. (The type keeps its old name for older imports.) */
export const WINDOWS: Record<WindowNo, string> = {
  1: "Web development",
  2: "Mobile development",
  3: "Design and creative",
  4: "AI and automation",
  5: "Digital marketing",
  6: "Business support",
};

export const CATEGORY_SHORT: Record<WindowNo, string> = { 1: "Web", 2: "Mobile", 3: "Design", 4: "AI", 5: "Marketing", 6: "Business" };

export const CATEGORY_SLUG: Record<WindowNo, string> = {
  1: "web-development",
  2: "mobile-development",
  3: "design-creative",
  4: "ai-automation",
  5: "digital-marketing",
  6: "business-support",
};

export const TITLE_LINE = 24;
export const SELLER_MAX = 11;

export type BoardSource = {
  slug: string;
  title: string;
  /** Category name or slug, for example "Design & Creative" or "design-creative" */
  category: string;
  /** Whole dollars. */
  price: number;
  deliveryDays: number;
  sellerName: string;
  /** Completed orders for the seller, when known. */
  sellerJobsDone?: number;
  tags?: string[];
  /** Gig rating, 0 or null when not rated yet. */
  rating?: number | null;
  reviews?: number | null;
};

export type BoardGig = {
  id: string;
  href: string;
  /** Display title, "Design a logo..." */
  title: string;
  /** Two flap lines for the title. The second can be empty. */
  lines: [string, string];
  window: WindowNo;
  windowName: string;
  seller: string;
  sellerBoard: string;
  done: number | null;
  days: number;
  price: number;
  priceText: string;
  /** "4.9 (53)", or null when there is no rating yet */
  ratingText: string | null;
  status: string;
  label: string;
  hay: string;
};

const gigHref = (slug: string) => `/gig/${slug}`;

/* Categories ------------------------------------------------------------ */

function norm(s: string) {
  return s.toLowerCase().replace(/&/g, "and").replace(/[^a-z]/g, "");
}

const WINDOW_BY_CATEGORY: Record<string, WindowNo> = {
  webdevelopment: 1,
  web: 1,
  mobiledevelopment: 2,
  mobileapps: 2,
  mobile: 2,
  designandcreative: 3,
  designcreative: 3,
  design: 3,
  aiandautomation: 4,
  aiautomation: 4,
  ai: 4,
  digitalmarketing: 5,
  marketing: 5,
  businesssupport: 6,
  business: 6,
  support: 6,
};

export function windowFor(category: string): WindowNo {
  const key = norm(category);
  const exact = WINDOW_BY_CATEGORY[key];
  if (exact) return exact;
  if (key.includes("web")) return 1;
  if (key.includes("mobile") || key.includes("app")) return 2;
  if (key.includes("design")) return 3;
  if (key.includes("automation") || key.startsWith("ai")) return 4;
  if (key.includes("marketing")) return 5;
  return 6;
}

/* Flap text ------------------------------------------------------------- */

/** Characters the flap drum can show. Anything else becomes a space. */
export const DRUM = " ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789$&.,'/:-";

function clean(s: string) {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toUpperCase()
    .split("")
    .map((c) => (DRUM.includes(c) ? c : " "))
    .join("")
    .replace(/\s+/g, " ")
    .trim();
}

/** "I will design a logo..." becomes "Design a logo..." for display. */
export function displayTitle(t: string) {
  const s = t.replace(/^\s*i\s+will\s+/i, "").trim();
  return s ? s[0].toUpperCase() + s.slice(1) : t;
}

function wrap(words: string[], width: number): string[] {
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    const next = cur ? `${cur} ${w}` : w;
    if (next.length <= width) cur = next;
    else {
      if (cur) lines.push(cur);
      cur = w.length > width ? w.slice(0, width) : w;
    }
  }
  if (cur) lines.push(cur);
  return lines;
}

const SOFT = new Set(["A", "AN", "THE", "YOUR", "FOR", "YOU", "OF", "THAT", "WITH", "TO"]);

/**
 * Splits a title into two flap lines without losing meaning where possible:
 * the full title first, then without the leading verb, then without small words,
 * and only as a last resort cut with "...".
 */
export function titleLines(title: string, width = TITLE_LINE): [string, string] {
  const words = clean(displayTitle(title)).split(" ").filter(Boolean);
  const tries = [words, words.slice(1), words.filter((w, i) => i === 0 || !SOFT.has(w)), words.slice(1).filter((w) => !SOFT.has(w))];
  for (const t of tries) {
    if (!t.length) continue;
    const lines = wrap(t, width);
    if (lines.length <= 2) return [lines[0] ?? "", lines[1] ?? ""];
  }
  const lines = wrap(words, width);
  const second = lines[1].length > width - 3 ? lines[1].slice(0, width - 3).trimEnd() : lines[1];
  return [lines[0], `${second}...`];
}

function sellerBoardName(name: string) {
  const parts = clean(name).replace(/[^A-Z ]/g, " ").split(/\s+/).filter(Boolean);
  if (!parts.length) return "";
  const full = parts.join(" ");
  if (full.length <= SELLER_MAX) return full;
  const initialLast = `${parts[0][0]}. ${parts[parts.length - 1]}`;
  if (initialLast.length <= SELLER_MAX) return initialLast;
  return parts[0].slice(0, SELLER_MAX);
}

const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

/** The date the work is due if booked on `from`: "OCT 21". Orders count calendar days. */
export function readyBy(days: number, from: Date = new Date()) {
  const d = new Date(from.getFullYear(), from.getMonth(), from.getDate() + days);
  return `${MONTHS[d.getMonth()]} ${d.getDate()}`;
}

export function readyBySpoken(days: number, from: Date = new Date()) {
  const d = new Date(from.getFullYear(), from.getMonth(), from.getDate() + days);
  return d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
}

function toBoard(src: BoardSource): BoardGig {
  const title = displayTitle(src.title);
  const window = windowFor(src.category);
  const windowName = WINDOWS[window];
  const days = Math.max(1, Math.round(src.deliveryDays));
  const price = Math.round(src.price);
  const rating = src.rating && src.rating > 0 ? Math.round(src.rating * 10) / 10 : 0;
  const reviews = Number(src.reviews ?? 0);
  const ratingText = rating > 0 && reviews > 0 ? `${rating.toFixed(1)} (${reviews})` : null;
  const priceSpoken = `$${price.toLocaleString("en-US")}`;
  const ratingSpoken = ratingText ? `Rated ${rating.toFixed(1)} from ${reviews} ${reviews === 1 ? "review" : "reviews"}` : "No rating yet";

  return {
    id: src.slug,
    href: gigHref(src.slug),
    title,
    lines: titleLines(src.title),
    window,
    windowName,
    seller: src.sellerName,
    sellerBoard: sellerBoardName(src.sellerName),
    done: src.sellerJobsDone ?? null,
    days,
    price,
    priceText: price >= 10000 ? "$10K+" : `$${price}`,
    ratingText,
    status: "BOOKING",
    label: `${title}, by ${src.sellerName}. ${windowName}. Ready ${days} ${days === 1 ? "day" : "days"} after booking. From ${priceSpoken}. ${ratingSpoken}. Open for booking.`,
    hay: [src.title, title, src.category, windowName, src.sellerName, ...(src.tags ?? [])].join(" ").toLowerCase(),
  };
}

/**
 * Orders the board so one seller never fills it: at most two of any six consecutive rows
 * belong to the same seller, when the data allows it.
 */
export function spreadBySeller<T extends { seller: string }>(items: T[], perWindow = 2, windowSize = 6): T[] {
  const rest = [...items];
  const out: T[] = [];
  while (rest.length) {
    const recent = out.slice(-(windowSize - 1));
    let idx = rest.findIndex((g) => recent.filter((r) => r.seller === g.seller).length < perWindow);
    if (idx < 0) idx = 0;
    out.push(rest.splice(idx, 1)[0]);
  }
  return out;
}

export function toBoardGigs(sources: BoardSource[]): BoardGig[] {
  return spreadBySeller(sources.map(toBoard));
}

export function countBoard(gigs: BoardGig[]) {
  const byWindow = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 } as Record<WindowNo, number>;
  for (const g of gigs) byWindow[g.window]++;
  return { gigs: gigs.length, sellers: new Set(gigs.map((g) => g.seller)).size, byWindow };
}
