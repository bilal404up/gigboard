/*
 * Board adapter (loop 2).
 * The board reads the site's own sample gigs, so the board, the windows
 * and every count share one source. Map your gig type to BoardSource once
 * (see the app/page.tsx step), then pass toBoardGigs(...) to <GigBoard />.
 *
 * Flap rules: board title max 18, short title max 11, seller name max 9,
 * price under $1,000. Derived text that loses words is reported in the
 * terminal as [board] warnings. Fix those in BOARD_TEXT_OVERRIDES.
 */

export type WindowNo = 1 | 2 | 3 | 4 | 5 | 6;

export const WINDOWS: Record<WindowNo, string> = {
  1: "Web development",
  2: "Mobile development",
  3: "Design and creative",
  4: "AI and automation",
  5: "Digital marketing",
  6: "Business support",
};

export type BoardSource = {
  slug: string;
  title: string;
  /** Category name or slug, for example "Design & Creative" or "design-creative" */
  category: string;
  /** Whole dollars. Convert from cents before passing. */
  price: number;
  deliveryDays: number;
  sellerName: string;
  /** Completed orders, if your data has them. Otherwise a stable fake number is used. */
  sellerJobsDone?: number;
  tags?: string[];
  /** Gig rating, 0 when not rated yet. Drives the board's Rating column. */
  rating?: number;
  reviews?: number;
};

export type BoardTone = "open" | "queue" | "away";

export type BoardGig = {
  id: string;
  href: string;
  title: string;
  board: string;
  short: string;
  window: WindowNo;
  windowName: string;
  seller: string;
  sellerBoard: string;
  done: number;
  ready: string;
  price: number;
  days: number;
  priceText: string;
  statusWide: string;
  statusCompact: string;
  tone: BoardTone;
  label: string;
  hay: string;
};

/* Hand-set flap text, keyed by gig slug. Everything else is derived. */
export const BOARD_TEXT_OVERRIDES: Record<string, { board?: string; short?: string; seller?: string }> = {
  "i-will-design-a-logo-that-still-reads-at-16px-fb6n": { board: "LOGO AT 16PX", short: "LOGO 16PX" },
  "i-will-create-a-brand-guide-with-colors-fonts-and-rules-u36u": { board: "BRAND GUIDE", short: "BRAND GUIDE" },
  "i-will-transcribe-and-summarize-your-meetings-t7pv": { board: "MEETING NOTES", short: "MTG NOTES" },
  "i-will-set-up-a-clean-spreadsheet-and-weekly-report-for-your-business-lwae": { board: "WEEKLY REPORT", short: "WEEKLY RPT" },
  "i-will-research-and-list-100-qualified-leads-for-you-5obr": { board: "100 LEADS", short: "100 LEADS" },
  "i-will-manage-your-inbox-and-calendar-for-a-week-e098": { board: "INBOX & CALENDAR", short: "INBOX WEEK" },
  "i-will-turn-your-figma-design-into-a-fast-react-site-1683": { board: "FIGMA TO REACT", short: "FIGMA REACT" },
  "i-will-make-your-website-work-as-an-installable-app-6hoe": { board: "SITE AS AN APP", short: "SITE TO APP" },
  "i-will-build-your-landing-page-in-nextjs-in-three-days-qu4m": { board: "NEXT.JS LANDING", short: "LANDING PG" },
  "i-will-build-a-flutter-app-with-a-firebase-backend-b4he": { board: "FLUTTER APP", short: "FLUTTER APP" },
  "i-will-add-openai-features-to-your-existing-app-an70": { board: "OPENAI FEATURES", short: "AI FEATURES" },
  "i-will-build-a-react-native-app-for-ios-and-android-14q4": { board: "REACT NATIVE APP", short: "NATIVE APP" },
  "i-will-fix-crashes-and-slow-screens-in-your-mobile-app-wxj1": { board: "APP CRASH FIX", short: "CRASH FIX" },
  "i-will-connect-your-forms-sheets-and-email-with-zapier-6zo4": { board: "ZAPIER SETUP", short: "ZAPIER" },
  "i-will-automate-your-invoice-emails-with-a-small-script-2ain": { board: "INVOICE EMAILS", short: "INVOICE BOT" },
  "i-will-build-a-support-chatbot-that-answers-from-your-faq-cm0g": { board: "FAQ CHATBOT", short: "FAQ CHATBOT" },
  "i-will-write-and-schedule-a-30-day-content-calendar-yokj": { board: "CONTENT CALENDAR", short: "CONTENT CAL" },
  "i-will-audit-your-site-and-fix-the-top-ten-seo-problems-d6bz": { board: "SEO AUDIT & FIX", short: "SEO AUDIT" },
  "i-will-set-up-and-tune-your-first-google-ads-campaign-ntis": { board: "GOOGLE ADS SETUP", short: "GOOGLE ADS" },
  "i-will-build-a-wordpress-site-for-your-small-business-qu1q": { board: "WORDPRESS SITE", short: "WP SITE" },
  "i-will-set-up-a-webflow-site-you-can-edit-yourself-npno": { board: "WEBFLOW SITE", short: "WEBFLOW" },
  "i-will-design-email-newsletter-templates-that-render-everywhere-lyiq": { board: "EMAIL TEMPLATES", short: "NEWSLETTER" },
  "i-will-draw-a-set-of-icons-for-your-app-or-site-1ye6": { board: "ICON SET", short: "ICON SET" },
  "i-will-design-a-month-of-social-media-posts-5zz5": { board: "SOCIAL POSTS", short: "SOCIAL SET" },
};

const gigHref = (slug: string) => `/gig/${slug}`;

/* Windows --------------------------------------------------------------- */

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

function windowFor(category: string, warn: (m: string) => void): WindowNo {
  const key = norm(category);
  const exact = WINDOW_BY_CATEGORY[key];
  if (exact) return exact;
  if (key.includes("web")) return 1;
  if (key.includes("mobile") || key.includes("app")) return 2;
  if (key.includes("design")) return 3;
  if (key.includes("automation") || key.startsWith("ai")) return 4;
  if (key.includes("marketing")) return 5;
  warn(`category "${category}" matches no window, using 6`);
  return 6;
}

/* Flap text ------------------------------------------------------------- */

const FLAP_TEXT = /^[A-Z0-9 $&.,'\/:-]*$/;

const STOP = new Set([
  "I", "WILL", "A", "AN", "THE", "FOR", "YOUR", "YOU", "WITH", "AND", "OF",
  "TO", "IN", "ON", "FROM", "MY", "OUR", "BE", "AS", "THAT", "THIS", "ANY", "&",
]);

const SHORTER: Record<string, string> = {
  DEVELOPMENT: "DEV",
  DEVELOPER: "DEV",
  WEBSITE: "SITE",
  APPLICATION: "APP",
  MARKETING: "MKTG",
  MANAGEMENT: "MGMT",
  PROFESSIONAL: "PRO",
  WORDPRESS: "WP",
  TRANSLATION: "TRANSLATE",
  AUTOMATION: "AUTOMATE",
  PRESENTATION: "DECK",
};

/* The seed adds a random 4-character suffix to every slug, so a re-seed changes it.
   Matching on the slug without the suffix keeps the hand-set flap text working. */
const baseSlug = (slug: string) => slug.replace(/-[a-z0-9]{4}$/, "");
const OVERRIDES_BY_TITLE: Record<string, { board?: string; short?: string; seller?: string }> = Object.fromEntries(
  Object.entries(BOARD_TEXT_OVERRIDES).map(([k, v]) => [baseSlug(k), v])
);

function clean(s: string) {
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();
}

function titleWords(title: string) {
  return clean(title)
    .replace(/[^A-Z0-9$& ]/g, " ")
    .split(/\s+/)
    .filter((w) => w && !STOP.has(w));
}

function fitWords(ws: string[], max: number) {
  let text = "";
  let used = 0;
  for (const w of ws) {
    const next = text ? `${text} ${w}` : w;
    if (next.length > max) break;
    text = next;
    used++;
  }
  if (!text && ws[0]) return { text: ws[0].slice(0, max), cut: true };
  return { text, cut: used < ws.length };
}

function sellerBoardName(name: string) {
  const parts = clean(name).replace(/[^A-Z ]/g, " ").split(/\s+/).filter(Boolean);
  if (!parts.length) return "";
  if (parts.length === 1) return parts[0].slice(0, 9);
  const initialLast = `${parts[0][0]}. ${parts[parts.length - 1]}`;
  if (initialLast.length <= 9) return initialLast;
  if (parts[0].length <= 9) return parts[0];
  return initialLast.slice(0, 9);
}

function readyText(days: number) {
  if (days <= 9) return `${days} ${days === 1 ? "DAY" : "DAYS"}`;
  const weeks = Math.ceil(days / 7);
  return `${weeks} ${weeks === 1 ? "WK" : "WKS"}`;
}

/* Stable fake numbers: the same gig always gets the same status. */
function hash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/* "I will design a logo..." becomes "Design a logo..." for display. */
function displayTitle(t: string) {
  const s = t.replace(/^\s*i\s+will\s+/i, "").trim();
  return s ? s[0].toUpperCase() + s.slice(1) : t;
}

function toBoard(src: BoardSource): BoardGig {
  const title = displayTitle(src.title);
  const issues: string[] = [];
  const warn = (m: string) => issues.push(m);
  const o = BOARD_TEXT_OVERRIDES[src.slug] ?? OVERRIDES_BY_TITLE[baseSlug(src.slug)] ?? {};

  const window = windowFor(src.category, warn);
  const windowName = WINDOWS[window];

  const ws = titleWords(src.title);
  const wide = o.board ? { text: o.board, cut: false } : fitWords(ws, 18);
  const compact = o.short
    ? { text: o.short, cut: false }
    : fitWords(ws.map((w) => SHORTER[w] ?? w), 11);
  if (wide.cut) warn(`board title "${wide.text}" drops words`);
  if (compact.cut) warn(`short title "${compact.text}" drops words`);

  const sellerBoard = o.seller ?? sellerBoardName(src.sellerName);
  const days = Math.max(1, Math.round(src.deliveryDays));
  const price = Math.round(src.price);
  if (price >= 1000) warn("price needs more than four flap characters");

  // The last column shows the gig's real rating. 4.8 and up is lit; unrated gigs say NEW.
  const rating = src.rating && src.rating > 0 ? Math.round(src.rating * 10) / 10 : 0;
  const tone: BoardTone = rating === 0 ? "away" : rating >= 4.8 ? "open" : "queue";
  const statusWide = rating ? rating.toFixed(1) : "NEW";
  const statusCompact = statusWide;
  const spoken = rating ? `Rated ${statusWide}${src.reviews ? ` from ${src.reviews} reviews` : ""}` : "Not rated yet";

  const done = src.sellerJobsDone ?? 8 + (hash(src.sellerName) % 52);
  const dayWords = `${days} ${days === 1 ? "day" : "days"}`;
  const priceSpoken = `$${price.toLocaleString("en-US")}`;

  if (process.env.NODE_ENV !== "production") {
    const checks: [string, string, number][] = [
      ["board", wide.text, 18],
      ["short", compact.text, 11],
      ["seller", sellerBoard, 9],
    ];
    for (const [field, text, max] of checks) {
      if (text.length > max || !FLAP_TEXT.test(text)) warn(`${field} text "${text}" breaks the flap rules`);
    }
    if (issues.length) console.warn(`[board] ${src.slug}: ${issues.join("; ")}`);
  }

  return {
    id: src.slug,
    href: gigHref(src.slug),
    title,
    board: wide.text,
    short: compact.text,
    window,
    windowName,
    seller: src.sellerName,
    sellerBoard,
    done,
    ready: readyText(days),
    price,
    days,
    priceText: price >= 1000 ? "$1K+" : `$${price}`,
    statusWide,
    statusCompact,
    tone,
    label: `${title} by ${src.sellerName}, ${done} jobs done. Window ${window}, ${windowName}. Ready in ${dayWords}. ${priceSpoken}. ${spoken}.`,
    hay: [src.title, title, src.category, windowName, src.sellerName, ...(src.tags ?? [])]
      .join(" ")
      .toLowerCase(),
  };
}

export function toBoardGigs(sources: BoardSource[]): BoardGig[] {
  return sources.map(toBoard);
}

export function countBoard(gigs: BoardGig[]) {
  const byWindow = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 } as Record<WindowNo, number>;
  for (const g of gigs) byWindow[g.window]++;
  return { gigs: gigs.length, sellers: new Set(gigs.map((g) => g.seller)).size, byWindow };
}
