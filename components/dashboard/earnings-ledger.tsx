import { EscrowDrawer } from "@/components/escrow/EscrowDrawer"
import { formatMoney } from "@/lib/utils/format"

type Props = {
  /** money in drawers under the glass, orders not yet approved */
  held: number
  /** approved and ready to pay out */
  available: number
  /** already paid out */
  paidOut: number
  className?: string
}

/* The seller's view of the counter: what is still under the glass, what has slid across, what has left the building. */
export function EarningsLedger({ held, available, paidOut, className = "" }: Props) {
  const rows = [
    { key: "held", label: "Held under the glass", body: "Buyers have paid. It moves when they approve.", value: held, lamp: "lamp lamp--on" },
    { key: "available", label: "Approved, ready to pay out", body: "The drawer slid across. This is yours.", value: available, lamp: "lamp lamp--release" },
    { key: "paid", label: "Paid out", body: "Already transferred.", value: paidOut, lamp: "lamp" },
  ]
  return (
    <section aria-labelledby="earnings-title" className={`booth rounded-drawer p-4 md:p-6 ${className}`}>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 id="earnings-title" className="t-head">
          Earnings
        </h2>
        <EscrowDrawer state={available > 0 ? "approved" : "held"} size="sm" amount={formatMoney(held)} />
      </div>
      <dl className="mt-5 grid gap-3">
        {rows.map((r) => (
          <div key={r.key} className="flex flex-wrap items-center gap-x-4 gap-y-1 rounded-[8px] bg-mahogany-deep/60 px-4 py-3">
            <span className={r.lamp} aria-hidden="true" />
            <dt className="min-w-0 flex-1">
              <span className="block font-semibold">{r.label}</span>
              <span className="block text-sm text-sand">{r.body}</span>
            </dt>
            <dd className="fig-price text-laminate">{formatMoney(r.value)}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
