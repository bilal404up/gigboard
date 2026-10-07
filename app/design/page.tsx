import { notFound } from "next/navigation";
import { PinTile, type PinTileTone } from "@/components/ui/pin-tile";
import { GigRow, GigCard, GigBoardHeader, type GigCardData } from "@/components/gig/gig-card";
import { COVER_STYLES } from "@/components/gig/gig-cover";
import { OrderTimeline } from "@/components/order/order-timeline";
import { OrderCard } from "@/components/gig/order-card";
import type { GigPackage, GigExtra } from "@/types/database.types";

export const metadata = { title: "Design tokens" };

const tones: PinTileTone[] = [
  "new", "level-one", "level-two", "top-rated", "held", "in-progress", "delivered", "revision", "approved", "cancelled",
];

const swatches: [string, string][] = [
  ["brand-primary", "bg-brand-primary"], ["brand-primary-dark", "bg-brand-primary-dark"], ["brand-primary-50", "bg-brand-primary-50"],
  ["brand-primary-100", "bg-brand-primary-100"], ["brand-accent", "bg-brand-accent"], ["brand-accent-50", "bg-brand-accent-50"],
  ["canvas-subtle", "bg-canvas-subtle"], ["canvas-board", "bg-canvas-board"], ["ink", "bg-ink"], ["ink-muted", "bg-ink-muted"],
  ["ink-subtle", "bg-ink-subtle"], ["line", "bg-line"], ["success", "bg-success"], ["warning", "bg-warning"], ["error", "bg-error"],
];


const levels = ["top_rated", "level_two", "level_one", "new_seller"] as const;
const titles = [
  "I will design a logo that still reads at 16px",
  "I will build your landing page in Next.js in three days",
  "I will fix your React app and add a test that proves it",
  "I will automate your invoice emails with a small script",
  "I will plan and write a 30-day content calendar",
  "I will set up a clean spreadsheet and weekly report for your business",
];
const names = ["Mara Kade", "Isha Rao", "Tomas Webb", "Lena Ortiz", "Sam Okafor", "Priya Nair"];
const cats = Object.keys(COVER_STYLES);
const sample: GigCardData[] = Array.from({ length: 12 }, (_, i) => ({
  id: `sample-gig-${i}`,
  slug: `sample-${i}`,
  title: titles[i % titles.length],
  thumbnail_url: null,
  average_rating: i % 5 === 4 ? 0 : 4.5 + ((i * 7) % 5) / 10,
  total_reviews: i % 5 === 4 ? 0 : 20 + i * 17,
  starting_price: 25 + ((i * 35) % 220),
  category_slug: cats[i % cats.length],
  delivery_days: 1 + (i % 6),
  seller: { username: `s${i}`, full_name: names[i % names.length], avatar_url: null, seller_level: levels[i % 4] },
}));


const pkgs: GigPackage[] = [
  { id: "p1", gig_id: "g", package_type: "basic", name: "One logo", description: "One concept, two rounds of changes.", price: 60, delivery_days: 3, revisions: 2, features: [{ name: "PNG and SVG files", included: true }, { name: "Source file", included: false }], is_active: true },
  { id: "p2", gig_id: "g", package_type: "standard", name: "Logo and colors", description: "Three concepts and a color guide.", price: 120, delivery_days: 4, revisions: 4, features: [{ name: "PNG and SVG files", included: true }, { name: "Source file", included: true }], is_active: true },
  { id: "p3", gig_id: "g", package_type: "premium", name: "Full identity", description: "Logo, colors, fonts and a one-page guide.", price: 260, delivery_days: 7, revisions: 6, features: [{ name: "PNG and SVG files", included: true }, { name: "Source file", included: true }], is_active: true },
];
const extrasSample: GigExtra[] = [{ id: "e1", gig_id: "g", title: "Fast delivery", description: null, price: 25, delivery_days_added: -1, sort_order: 1, is_active: true }];

/** Development-only page for checking the design tokens. Not served in production. */
export default function DesignPage() {
  if (process.env.NODE_ENV === "production") notFound();
  return (
    <main className="mx-auto max-w-[1200px] px-6 py-12 space-y-12">
      <section className="space-y-3">
        <h1 className="text-[32px] leading-[38px]">Small jobs. Fixed prices.</h1>
        <p className="text-[15px] leading-[22px] text-ink-muted max-w-[60ch]">
          Hire one freelancer for one defined job. Pay into escrow. Approve the work, then they are paid.
        </p>
        <p className="num text-[24px] leading-[28px]">$120 &nbsp; 3 days &nbsp; 4.9 (212)</p>
      </section>

      <section className="space-y-3">
        <h2 className="text-[20px] leading-[28px]">Pinned tiles</h2>
        <div className="flex flex-wrap gap-4">
          {tones.map((t) => (
            <PinTile key={t} tone={t}>{t.replace("-", " ")}</PinTile>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-[20px] leading-[28px]">Buttons and input</h2>
        <div className="flex flex-wrap items-center gap-3">
          <button className="btn-primary">Search</button>
          <button className="btn-cta">Pay $120 into escrow</button>
          <button className="btn-secondary">Message Mara</button>
          <button className="btn-ghost">Cancel</button>
        </div>
        <input className="input-base max-w-sm" placeholder="What do you need done?" />
      </section>


      <section className="space-y-3">
        <h2 className="text-[20px] leading-[28px]">Board</h2>
        <div className="border-t-2 border-ink">
          <GigBoardHeader />
          {sample.slice(0, 6).map((g) => <GigRow key={g.id} gig={g} />)}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-[20px] leading-[28px]">Cards</h2>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {sample.slice(6, 12).map((g) => <GigCard key={g.id} gig={g} />)}
        </div>
      </section>


      <section className="space-y-3">
        <h2 className="text-[20px] leading-[28px]">Order progress and package panel</h2>
        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
          <div className="space-y-4">
            <OrderTimeline status="in_progress" delivered={null} completed={null} />
            <OrderTimeline status="delivered" delivered="2026-10-05" completed={null} />
            <OrderTimeline status="completed" delivered="2026-10-05" completed="2026-10-06" />
            <OrderTimeline status="cancelled" delivered={null} completed={null} />
          </div>
          <OrderCard gigId="g" packages={pkgs} extras={extrasSample} />
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-[20px] leading-[28px]">Colors</h2>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
          {swatches.map(([name, cls]) => (
            <div key={name} className="space-y-1">
              <div className={`${cls} h-12 rounded-xs border border-line`} />
              <p className="text-[13px] leading-[18px] text-ink-muted">{name}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
