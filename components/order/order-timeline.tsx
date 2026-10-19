import type { OrderStatus } from "@/types/database.types"
import { cn } from "@/lib/utils/cn"
import { DrawLine } from "@/components/motion/DrawLine"

type Props = {
  status: OrderStatus
  created: string
  delivered: string | null
  completed: string | null
  cancelled?: string | null
  dueAt?: string | null
  isBuyer?: boolean
}

function stamp(iso: string | null | undefined) {
  if (!iso) return null
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? null : d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

const RANK: Record<OrderStatus, number> = {
  pending_payment: 0,
  active: 1,
  requires_requirements: 1,
  in_progress: 1,
  revision_requested: 1,
  delivered: 2,
  disputed: 2,
  completed: 3,
  cancelled: 1,
}

/* The step that is current right now: held, or released when approved. */
function isCurrent(s: { tone: string }, last: boolean) {
  return s.tone === "held" || (s.tone === "go" && last)
}

/* The order as a vertical timetable: Booked, Held, Delivered, Released, each with its date in mono. */
export function OrderTimeline({ status, created, delivered, completed, cancelled, dueAt, isBuyer = true }: Props) {
  const rank = RANK[status]
  const you = isBuyer ? "you approve" : "the buyer approves"
  type Stop = { key: string; title: string; date: string | null; detail: string; tone: "ink" | "held" | "go" | "stop" | "off" }
  const stops: Stop[] = [
    { key: "booked", title: "Booked", date: stamp(created), detail: "Fixed price and delivery date agreed.", tone: rank >= 0 ? "ink" : "off" },
    {
      key: "held",
      title: "Held",
      date: rank >= 1 ? stamp(created) : null,
      detail: status === "pending_payment" ? "Waiting for payment." : "Payment held by Gigboard.",
      tone: rank >= 1 && status !== "completed" ? "held" : rank >= 1 ? "ink" : "off",
    },
    {
      key: "delivered",
      title: status === "revision_requested" ? "Revision requested" : "Delivered",
      date: stamp(delivered),
      detail: delivered
        ? status === "revision_requested"
          ? "The seller is working on the changes. Payment stays held."
          : isBuyer
            ? "Work delivered. Waiting for your review."
            : "Work delivered. Waiting for the buyer's review."
        : dueAt
          ? `Due ${stamp(dueAt)}.`
          : "Waiting for the seller.",
      tone: delivered ? (rank >= 3 ? "ink" : "held") : "off",
    },
  ]
  if (status === "cancelled") {
    stops.push({ key: "cancelled", title: "Cancelled", date: stamp(cancelled), detail: "The order was cancelled. Nothing was paid out.", tone: "stop" })
  } else if (status === "disputed") {
    stops.push({ key: "disputed", title: "Disputed", date: null, detail: "Payment stays held until Gigboard resolves the dispute.", tone: "stop" })
  } else {
    stops.push({
      key: "released",
      title: "Released",
      date: stamp(completed),
      detail: completed ? "Approved. Payment released to the seller." : `Released when ${you}.`,
      tone: completed ? "go" : "off",
    })
  }

  return (
    <section aria-labelledby="timeline-title" className="panel p-5 md:p-6">
      <h2 id="timeline-title" className="eyebrow">
        Timetable
      </h2>
      <ol className="mt-5 grid">
        {stops.map((s, i) => {
          const last = i === stops.length - 1
          return (
            <li key={s.key} className="relative grid grid-cols-[20px_minmax(0,1fr)] gap-x-4 pb-6 last:pb-0" aria-current={s.tone === "held" || (s.tone === "go" && last) ? "step" : undefined}>
              {!last ? (
                <span aria-hidden="true" className={cn("absolute left-[9px] top-5 h-[calc(100%-12px)] w-px text-[var(--line-strong)]", s.tone === "off" && "text-[var(--line)]")}>
                  <DrawLine direction="y" delay={i * 150} className="h-full" />
                </span>
              ) : null}
              <span
                aria-hidden="true"
                className={cn(
                  "mt-1 h-[11px] w-[11px] justify-self-center rounded-full",
                  s.tone === "ink" && "bg-ink",
                  s.tone === "held" && "bg-held shadow-[0_0_0_3px_#FFF3CC]",
                  s.tone === "go" && "bg-go shadow-[0_0_0_3px_#E2F3E9]",
                  s.tone === "stop" && "bg-stop shadow-[0_0_0_3px_#FCEBE9]",
                  s.tone === "off" && "bg-surface shadow-[inset_0_0_0_1.5px_#C9C6BE]",
                  isCurrent(s, last) && (s.tone === "go" ? "tl-pulse tl-pulse--go" : "tl-pulse tl-pulse--held")
                )}
              />
              <div className="min-w-0">
                <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                  <p className={cn("font-semibold", s.tone === "off" && "text-ink-2")}>{s.title}</p>
                  {s.date ? <span className="num text-xs text-ink-2">{s.date}</span> : null}
                </div>
                <p className="mt-0.5 text-sm text-ink-2">{s.detail}</p>
              </div>
            </li>
          )
        })}
      </ol>
    </section>
  )
}
