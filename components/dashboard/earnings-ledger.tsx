import { MetricRow } from "@/components/dashboard/stat-plate"
import { formatMoney } from "@/lib/utils/format"

type Props = {
  /** buyers have paid, orders not approved yet */
  held: number
  /** approved by the buyer, still clearing */
  clearing: number
  /** cleared and ready to pay out */
  available: number
  /** already paid out */
  paidOut: number
  className?: string
}

/* The seller's money in four plain numbers: amber while held, green once released. */
export function EarningsLedger({ held, clearing, available, paidOut, className = "" }: Props) {
  return (
    <section aria-labelledby="earnings-title" className={className}>
      <h2 id="earnings-title" className="sr-only">
        Earnings
      </h2>
      <MetricRow
        items={[
          { label: "Held", value: formatMoney(held), tone: "held", hint: "Buyers have paid. Released when they approve." },
          { label: "Released, clearing", value: formatMoney(clearing), tone: "go", hint: "Approved. Clears after the holding period." },
          { label: "Ready to pay out", value: formatMoney(available), tone: "go", hint: "Cleared and yours to withdraw." },
          { label: "Paid out", value: formatMoney(paidOut), hint: "Already transferred." },
        ]}
      />
    </section>
  )
}
