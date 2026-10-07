import type { OrderStatus } from "@/types/database.types";
import { PinTile, type PinTileTone } from "@/components/ui/pin-tile";

const STEPS: { key: string; label: string }[] = [
  { key: "ordered", label: "Ordered" },
  { key: "requires_requirements", label: "Requirements" },
  { key: "in_progress", label: "In progress" },
  { key: "delivered", label: "Delivered" },
  { key: "completed", label: "Approved" },
];

const STATUS_INDEX: Record<OrderStatus, number> = {
  pending_payment: 0,
  active: 1,
  requires_requirements: 1,
  in_progress: 2,
  delivered: 3,
  revision_requested: 2,
  completed: 4,
  cancelled: -1,
  disputed: 3,
};

export function OrderTimeline({
  status,
  delivered,
  completed,
}: {
  status: OrderStatus;
  delivered: string | null;
  completed: string | null;
}) {
  const current = STATUS_INDEX[status];
  const finished = status === "completed";

  const toneFor = (i: number): PinTileTone => {
    if (status === "cancelled") return "cancelled";
    if (i < current || (finished && i === current)) return "approved";
    if (i === current) return status === "revision_requested" ? "revision" : "held";
    return "new";
  };

  return (
    <div className="rounded-lg border border-ink bg-white p-5">
      <ol className="flex flex-wrap items-center gap-y-3" aria-label="Order progress">
        {STEPS.map((step, i) => (
          <li key={step.key} className="flex items-center">
            <PinTile tone={toneFor(i)}>{step.label}</PinTile>
            {i < STEPS.length - 1 && <span aria-hidden className="mx-1 h-px w-6 bg-ink sm:w-10" />}
          </li>
        ))}
      </ol>
      <p className="mt-4 text-[13px] leading-[18px] text-ink-muted">
        {status === "cancelled"
          ? "This order was cancelled."
          : finished
            ? `Approved${completed ? ` on ${new Date(completed).toLocaleDateString("en-US")}` : ""}. The seller has been paid.`
            : delivered
              ? `Delivered on ${new Date(delivered).toLocaleDateString("en-US")}. Approve it or ask for a revision.`
              : "Your payment is held until you approve the work."}
      </p>
    </div>
  );
}
