import Link from "next/link"
import { Button } from "@/components/ui/button"
import { EscrowStrip } from "@/components/home/escrow-strip"

const FAQ = [
  {
    q: "Who holds the money?",
    a: "Gigboard does, from the moment you pay until you approve the work. The seller can see the payment is there but can't withdraw it.",
  },
  {
    q: "Can the seller see that I have paid?",
    a: "Yes. The order shows the payment as held, so the seller knows the money is real before starting.",
  },
  {
    q: "What if the work is not what I asked for?",
    a: "Ask for a revision, up to the number included in the package you chose. If that doesn't settle it, open a dispute from the order page. The payment stays held until it's resolved.",
  },
  {
    q: "What if the work is late?",
    a: "You get a full refund.",
  },
  {
    q: "What if I don't respond after delivery?",
    a: "Three days after delivery, the job approves itself, so sellers are never left waiting.",
  },
  {
    q: "What does it cost?",
    a: "The package price plus a 5.5% service fee, both shown before you pay. Orders under $50 also carry a $2.50 small-order fee, shown on the same receipt.",
  },
]

/* The /how-it-works body: the promise, the three steps, then the plain questions people actually ask. */
export function HowTheCounterWorks() {
  return (
    <main id="main">
      <section className="border-b border-line bg-white" aria-labelledby="hiw-title">
        <div className="wrap py-14 lg:py-20">
          <h1 id="hiw-title" className="t-sign-xl max-w-[18ch]">
            You pay up front. The seller is paid when you approve.
          </h1>
          <p className="mt-6 max-w-[56ch] text-lg leading-[1.55] text-ink-muted">
            Every job works the same way, whatever the price. Gigboard holds your payment the whole time, so neither side has to trust the other first.
          </p>
        </div>
      </section>

      <EscrowStrip />

      <section className="wrap py-14 lg:py-20" aria-labelledby="faq-title">
        <h2 id="faq-title" className="t-sign">
          Common questions
        </h2>
        <div className="mt-8 grid gap-3 lg:max-w-3xl">
          {FAQ.map((item) => (
            <details key={item.q} className="tray group p-0">
              <summary className="flex min-h-[3.5rem] cursor-pointer list-none items-center justify-between gap-4 rounded-[14px] px-5 py-3 font-semibold marker:content-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink [&::-webkit-details-marker]:hidden">
                {item.q}
                <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" className="shrink-0 text-ink-muted transition-transform duration-200 group-open:rotate-45">
                  <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </summary>
              <p className="border-t border-line px-5 py-4 text-ink-muted">{item.a}</p>
            </details>
          ))}
        </div>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg">
            <Link href="/search">Find a freelancer</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/become-seller">Become a seller</Link>
          </Button>
        </div>
      </section>
    </main>
  )
}
