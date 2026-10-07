import { notFound } from "next/navigation";
import { PinTile, type PinTileTone } from "@/components/ui/pin-tile";

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
