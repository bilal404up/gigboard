import { EscrowDrawer, type EscrowState } from "@/components/escrow/EscrowDrawer"
import { PinTile, type PinTileTone } from "@/components/ui/pin-tile"
import type { OrderStatus } from "@/types/database.types"

type Props = { status: OrderStatus; delivered: string | null; completed: string | null }

const STATE: Record<OrderStatus, EscrowState> = {
  pending_payment: "held",
  active: "held",
  requires_requirements: "held",
  in_progress: "held",
  delivered: "delivered",
  revision_requested: "delivered",
  completed: "approved",
  cancelled: "cancelled",
  disputed: "disputed",
}

const TONE: Record<OrderStatus, PinTileTone> = {
  pending_payment: "held",
  active: "held",
  requires_requirements: "held",
  in_progress: "in-progress",
  delivered: "delivered",
  revision_requested: "revision",
  completed: "approved",
  cancelled: "cancelled",
  disputed: "cancelled",
}

const LABEL: Record<OrderStatus, string> = {
  pending_payment: "Waiting for payment",
  active: "Held",
  requires_requirements: "Held, waiting for your brief",
  in_progress: "Held, work in progress",
  delivered: "Delivered",
  revision_requested: "Revision requested",
  completed: "Approved",
  cancelled: "Cancelled",
  disputed: "Disputed",
}

const RANK: Record<EscrowState, number> = { held: 0, delivered: 1, approved: 2, cancelled: -1, disputed: -1 }

function day(iso: string | null) {
  if (!iso) return null
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? null : d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

/* The order's place at the counter: the drawer at full size, then the three stations with their dates. */
export function OrderTimeline({ status, delivered, completed }: Props) {
  const state = STATE[status]
  const rank = RANK[state]
  const stations: { key: EscrowState; title: string; date: string | null; detail: string }[] = [
    { key: "held", title: "Held", date: null, detail: "Payment is under the glass." },
    { key: "delivered", title: "Delivered", date: day(delivered), detail: delivered ? "Work is in the drawer." : "Waiting for the seller." },
    { key: "approved", title: "Approved", date: day(completed), detail: completed ? "The drawer slid across to the seller." : "Waiting for your approval." },
  ]

  return (
    <section aria-label="Order progress" className="booth rounded-drawer p-4 md:p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="t-head">Where your money is</p>
        <PinTile tone={TONE[status]}>{LABEL[status]}</PinTile>
      </div>

      <EscrowDrawer state={state} size="xl" captions={false} />

      <ol className="mt-5 grid gap-3 sm:grid-cols-3" aria-label="Escrow steps">
        {stations.map((s, i) => {
          const done = rank >= i
          const current = state === s.key
          return (
            <li
              key={s.key}
              aria-current={current ? "step" : undefined}
              className={`rounded-[6px] border-t-[3px] pt-3 ${
                current ? (s.key === "approved" ? "border-release" : "border-brass") : done ? "border-brass-deep" : "border-laminate/20"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <p className={`t-plate ${done ? "text-laminate" : "text-sand"}`}>{s.title}</p>
                {s.date ? <span className="num text-xs text-sand">{s.date}</span> : null}
              </div>
              <p className={`mt-1 text-sm ${done ? "text-laminate" : "text-sand"}`}>{s.detail}</p>
            </li>
          )
        })}
      </ol>
    </section>
  )
}
