import Link from "next/link"
import { Button } from "@/components/ui/button"
import { EscrowStrip } from "@/components/home/escrow-strip"

const FAQ = [
  {
    q: "Who holds the money?",
    a: "Gigboard does, in escrow, from the moment you pay until the moment you approve. The seller cannot withdraw it, and nothing moves without your approval.",
  },
  {
    q: "Can the seller see that I have paid?",
    a: "Yes. The payment sits under the glass where both of you can see it. The seller knows the money is real before starting the work.",
  },
  {
    q: "What if the work is not what I asked for?",
    a: "Ask for a revision, within the number of revisions printed on the package you chose. If that does not settle it, open a dispute from the order page and the drawer stays under the glass until it is resolved.",
  },
  {
    q: "What does it cost?",
    a: "The package price plus a Service fee (5.5%), both printed on the receipt before you pay. Some small orders also carry a Small-order fee, shown on the same receipt.",
  },
]

/* The /how-it-works body: the three stations, then the plain questions people actually ask. */
export function HowTheCounterWorks() {
  return (
    <>
      <section className="booth" aria-labelledby="hiw-title">
        <div className="wrap max-w-copy py-14 lg:py-20">
          <h1 id="hiw-title" className="t-sign-xl">
            One drawer. Three stops.
          </h1>
          <p className="mt-6 text-lg leading-[1.5] text-sand">
            Gigboard is a counter with a glass window and a sliding drawer. Every job on it works the same way, whatever the
            price.
          </p>
        </div>
      </section>

      <EscrowStrip />

      <section className="wrap py-14 lg:py-20" aria-labelledby="faq-title">
        <h2 id="faq-title" className="t-sign">
          Questions at the window
        </h2>
        <div className="mt-8 grid gap-3 lg:max-w-3xl">
          {FAQ.map((item) => (
            <details key={item.q} className="tray group p-0 open:shadow-[0_1px_0_#D5CBBD,0_10px_0_-4px_#E4DCCF]">
              <summary className="flex min-h-[3.5rem] cursor-pointer list-none items-center justify-between gap-4 px-5 py-3 font-semibold marker:content-none focus-visible:outline focus-visible:outline-[2.5px] focus-visible:outline-offset-2 focus-visible:outline-mahogany [&::-webkit-details-marker]:hidden">
                {item.q}
                <span aria-hidden="true" className="lamp shrink-0 group-open:bg-brass-light" />
              </summary>
              <p className="border-t-2 border-dotted border-sand px-5 py-4 text-ink-muted">{item.a}</p>
            </details>
          ))}
        </div>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Button asChild variant="cta" size="lg">
            <Link href="/search">Find a freelancer</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/signup">Open a window as a seller</Link>
          </Button>
        </div>
      </section>
    </>
  )
}
