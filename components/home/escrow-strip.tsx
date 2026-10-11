import { EscrowDrawer } from "@/components/escrow/EscrowDrawer"

const STATIONS = [
  { state: "held", title: "Held", body: "You pay into the drawer. It stops under the glass, where the seller can see it but cannot reach it." },
  { state: "delivered", title: "Delivered", body: "The seller puts the work in the drawer. You check it against the brief, and can ask for a revision." },
  { state: "approved", title: "Approved", body: "You say it is good. Only then does the drawer slide across and the seller get paid." },
] as const

/* The escrow flow as a feature, three states side by side. Arrives station by station on scroll where supported. */
export function EscrowStrip({ className = "" }: { className?: string }) {
  return (
    <section aria-labelledby="escrow-title" className={`booth booth--deep ${className}`}>
      <div className="wrap py-14 lg:py-20">
        <div className="max-w-copy">
          <h2 id="escrow-title" className="t-sign">
            Your money is held until you say the work is good.
          </h2>
          <p className="mt-4 max-w-[52ch] text-sand">That is the whole idea. Everything else on Gigboard exists to make those three steps obvious.</p>
        </div>

        <ol className="mt-10 grid gap-6 lg:grid-cols-3">
          {STATIONS.map((s, i) => (
            <li
              key={s.state}
              className="slide-on-view rounded-drawer bg-mahogany p-4 shadow-[inset_0_0_0_1.5px_rgba(201,162,74,0.45)]"
              style={{ "--view-start": `entry ${i * 10}%`, "--view-end": `entry ${55 + i * 10}%` } as React.CSSProperties}
            >
              <EscrowDrawer state={s.state} size="md" captions={false} />
              <p className="t-head mt-4 text-laminate">
                <span className="num mr-2 text-sand">{i + 1}</span>
                {s.title}
              </p>
              <p className="mt-2 text-sm text-sand">{s.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
