import Link from "next/link"
import { Button } from "@/components/ui/button"
import { HeldTimeline } from "@/components/home/HeldTimeline"

const FAQ = [
  {
    q: "Who holds the money?",
    a: "Gigboard does, from the moment you pay until you approve the work. The seller can see the payment is there but cannot withdraw it.",
  },
  {
    q: "Can the seller see that I have paid?",
    a: "Yes. The order shows the payment as held, so the seller knows the money is there before starting.",
  },
  {
    q: "What if the work is not what I asked for?",
    a: "Ask for a revision, up to the number included in the package you chose. The payment stays held while you do. For a dispute, use the order page; a person from Gigboard reviews it.",
  },
  {
    q: "What if I don't respond after delivery?",
    a: "After delivery, the order approves itself if you do not reply within the number of days set on the platform (3 by default). The seller is then paid.",
  },
  {
    q: "What does it cost?",
    a: "The package price plus a 5.5% service fee, both shown before you pay. Orders under $50 also carry a $2.50 small-order fee, shown on the same receipt.",
  },
]

/* The /how-it-works body: the promise, the four steps, then the questions people ask. */
export function HowTheCounterWorks() {
  return (
    <main id="main">
      <section className="wrap pb-6 pt-14 lg:pt-20">
        <p className="eyebrow">How it works</p>
        <h1 className="t-sign-xl mt-4 max-w-[18ch]">Fixed price. Fixed date. Paid when you approve.</h1>
        <p className="mt-6 max-w-[56ch] text-[1.0625rem] leading-[1.55] text-ink-2">
          Every order works the same way, whatever the price. Gigboard holds your payment the whole time, so neither side has to trust the other first.
        </p>
      </section>

      <HeldTimeline />

      <section className="home-section home-section--rule" aria-labelledby="faq-title">
        <div className="wrap">
          <h2 id="faq-title" className="t-sign">
            Common questions
          </h2>
          <div className="mt-8 grid gap-2 lg:max-w-3xl">
            {FAQ.map((item) => (
              <details key={item.q} className="panel group">
                <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 px-5 py-3 font-semibold marker:content-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink [&::-webkit-details-marker]:hidden">
                  {item.q}
                  <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" className="shrink-0 text-ink-2 transition-transform duration-200 group-open:rotate-45">
                    <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                  </svg>
                </summary>
                <p className="border-t border-line px-5 py-4 text-ink-2">{item.a}</p>
              </details>
            ))}
          </div>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/search">Find a freelancer</Link>
            </Button>
            <Button asChild variant="secondary" size="lg">
              <Link href="/become-seller">Become a seller</Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  )
}
