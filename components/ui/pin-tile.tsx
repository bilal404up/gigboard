import { cn } from "@/lib/utils/cn";

export type PinTileTone =
  | "new"
  | "level-one"
  | "level-two"
  | "top-rated"
  | "held"
  | "in-progress"
  | "delivered"
  | "revision"
  | "approved"
  | "cancelled"
  | "demo";

/**
 * Text, background and border for each tone. Every pair is at least 4.5:1:
 * ink on white 17.3, primary on primary-50 10.9, primary-dark on primary-100 11.8,
 * ink on accent 9.5, white on ink 17.3, white on success 5.3, warning on white 5.9,
 * error on white 6.6.
 */
const tones: Record<PinTileTone, { box: string; pin: string }> = {
  new: { box: "bg-white text-ink border-ink", pin: "bg-ink" },
  "level-one": { box: "bg-brand-primary-50 text-brand-primary border-brand-primary-50", pin: "bg-brand-primary" },
  "level-two": { box: "bg-brand-primary-100 text-brand-primary-dark border-brand-primary-100", pin: "bg-brand-primary-dark" },
  "top-rated": { box: "bg-brand-accent text-ink border-brand-accent", pin: "bg-ink" },
  held: { box: "bg-brand-accent text-ink border-brand-accent", pin: "bg-ink" },
  "in-progress": { box: "bg-brand-primary-50 text-brand-primary border-brand-primary-50", pin: "bg-brand-primary" },
  delivered: { box: "bg-ink text-white border-ink", pin: "bg-ink" },
  revision: { box: "bg-white text-warning border-warning", pin: "bg-warning" },
  approved: { box: "bg-success text-white border-success", pin: "bg-success" },
  cancelled: { box: "bg-white text-error border-error", pin: "bg-error" },
  demo: { box: "bg-brand-accent text-ink border-brand-accent", pin: "bg-ink" },
};

interface Props {
  tone: PinTileTone;
  children: React.ReactNode;
  className?: string;
}

/**
 * The identity element: a 22px tile with two short ticks at mid-height on the
 * left and right edges, like the pivot pins of a split-flap letter.
 */
export function PinTile({ tone, children, className }: Props) {
  const t = tones[tone];
  return (
    <span
      className={cn(
        "relative inline-flex h-[22px] items-center rounded-xs border px-2 text-[13px] font-semibold leading-none whitespace-nowrap",
        t.box,
        className
      )}
    >
      <span aria-hidden className={cn("absolute -left-[3px] top-1/2 h-px w-[6px] -translate-y-1/2", t.pin)} />
      <span aria-hidden className={cn("absolute -right-[3px] top-1/2 h-px w-[6px] -translate-y-1/2", t.pin)} />
      {children}
    </span>
  );
}
