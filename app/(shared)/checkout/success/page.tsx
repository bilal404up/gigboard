"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { EscrowDrawer } from "@/components/escrow/EscrowDrawer";

function SuccessInner() {
  const search = useSearchParams();
  const orderId = search.get("order");

  return (
    <>
      <Navbar />
      <main id="main">
        <section className="booth">
          <div className="wrap grid gap-10 py-14 lg:grid-cols-hero lg:items-center lg:py-20">
            <div className="max-w-copy">
              <p className="t-plate inline-flex items-center gap-2 text-brass-light">
                <span className="lamp lamp--on" aria-hidden="true" />
                Payment received
              </p>
              <h1 className="t-sign-xl mt-4">Your payment is in the drawer.</h1>
              <p className="mt-6 max-w-[46ch] text-lg leading-[1.5] text-sand">
                It stays under the glass until you approve the delivery. Nothing moves to the seller before that.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                {orderId ? (
                  <Button asChild variant="cta" size="lg">
                    <Link href={`/order/${orderId}`}>View your order</Link>
                  </Button>
                ) : null}
                <Button asChild variant="outline" size="lg" className="text-laminate shadow-[inset_0_0_0_1.5px_#EFE9DF] hover:bg-laminate/10 focus-visible:outline-release">
                  <Link href="/search">Browse more gigs</Link>
                </Button>
              </div>
            </div>
            <div className="[&_.esc-step_p+p]:hidden sm:[&_.esc-step_p+p]:block">
              <EscrowDrawer state="held" size="xl" />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={null}>
      <SuccessInner />
    </Suspense>
  );
}
