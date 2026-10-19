import { HeldTimelineList, type HeldStop } from "./HeldTimelineList"

type Props = { autoCompleteDays?: number }

/*
 * How held payment works: four timetable stops on one line. Each stop carries the real rule
 * from the order workflow (lib/utils/order-workflow.ts), nothing more.
 */
export function HeldTimeline({ autoCompleteDays = 3 }: Props) {
  const days = `${autoCompleteDays} ${autoCompleteDays === 1 ? "day" : "days"}`
  const stops: HeldStop[] = [
    { word: "BOOKED", tone: undefined, title: "You book a fixed price", body: "Pick a package. The price, the delivery days and the revisions are fixed before you pay." },
    { word: "HELD", tone: "held" as const, title: "Gigboard holds the payment", body: "The seller sees the payment is there and starts work, but cannot take it." },
    { word: "DELIVERED", tone: "held" as const, title: "The work arrives", body: "Check it against your brief. Ask for a revision if it is not right. The money stays held." },
    {
      word: "RELEASED",
      tone: "go" as const,
      title: "You approve, the seller is paid",
      body: `Approving releases the payment. If you do not reply within ${days} of delivery, the order approves itself.`,
    },
  ]
  return (
    <section id="how-held-payment-works" className="home-section" aria-labelledby="ht-title">
      <div className="wrap">
        <div className="home-head">
          <p className="eyebrow">The rule</p>
          <h2 id="ht-title" className="t-sign">
            How held payment works
          </h2>
          <p className="home-lead">Every order follows the same four steps.</p>
        </div>
        <HeldTimelineList stops={stops} />
      </div>
    </section>
  )
}
