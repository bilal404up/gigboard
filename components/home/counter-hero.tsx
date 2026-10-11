import Link from "next/link"
import { Button } from "@/components/ui/button"
import { EscrowDrawer } from "@/components/escrow/EscrowDrawer"

/* The first screen: the headline on the counter, the pass-through playing once on the right. */
export function CounterHero() {
  return (
    <section className="booth" aria-labelledby="hero-title">
      <div className="wrap grid gap-10 py-14 lg:grid-cols-hero lg:items-center lg:gap-14 lg:py-20">
        <div className="max-w-copy">
          <h1 id="hero-title" className="t-sign-xl">
            Held until you say it&apos;s good.
          </h1>
          <p className="mt-6 max-w-[46ch] text-lg leading-[1.5] text-sand">
            Hire one freelancer for one fixed-price job. Your payment goes into the drawer, sits under the glass where you
            both can see it, and slides across only when you approve the work.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild variant="cta" size="lg">
              <Link href="/search">Find a freelancer</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="text-laminate shadow-[inset_0_0_0_1.5px_#EFE9DF] hover:bg-laminate/10 focus-visible:outline-release"
            >
              <Link href="/how-it-works">See how the counter works</Link>
            </Button>
          </div>
          <p className="mt-5 text-sm text-sand">Sample data, Stripe test mode.</p>
        </div>

        {/* bodies under the station captions hide below sm so three columns fit at 390px */}
        <div className="[&_.esc-step_p+p]:hidden sm:[&_.esc-step_p+p]:block">
          <EscrowDrawer state="held" size="xl" play />
        </div>
      </div>
    </section>
  )
}
