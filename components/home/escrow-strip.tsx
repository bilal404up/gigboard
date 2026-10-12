import { EscrowDrawer } from "@/components/escrow/EscrowDrawer"

const STATIONS = [
  { state: "held", title: "Held", body: "You pay, and Gigboard holds the money. The seller can see it's there but can't take it." },
  { state: "delivered", title: "Delivered", body: "The seller delivers the work. You check it against your brief, and can ask for a revision." },
  { state: "approved", title: "Approved", body: "You approve the work. Only then is the payment released to the seller." },
] as const

/* The payment flow as three states side by side. Rendered normally: no scroll-linked reveal, so nothing is ever hidden. */
export function EscrowStrip({ className = "" }: { className?: string }) {
  return (
    <section aria-labelledby="escrow-title" className={`border-b border-line bg-laminate ${className}`}>
      <div className="wrap py-14 lg:py-20">
        <div className="max-w-copy">
          <h2 id="escrow-title" className="t-sign">
            Your money is held until you say the work is good.
          </h2>
          <p className="mt-4 max-w-[52ch] text-ink-muted">Everything else on Gigboard exists to make these three steps obvious.</p>
        </div>

        <ol className="mt-10 grid gap-5 lg:grid-cols-3">
          {STATIONS.map((s, i) => (
            <li key={s.state} className="tray p-4">
              <EscrowDrawer state={s.state} size="md" captions={false} />
              <p className="t-head mt-4">
                <span className="mr-2 tabular-nums text-ink-muted">{i + 1}</span>
                {s.title}
              </p>
              <p className="mt-2 text-sm leading-[1.55] text-ink-muted">{s.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
