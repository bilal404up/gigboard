import Link from "next/link";
import type { ReactNode } from "react";
import { WordMark } from "@/components/layout/wordmark";
import { EscrowDrawer } from "@/components/escrow/EscrowDrawer";

type Props = { title: string; intro?: string; children: ReactNode; footer?: ReactNode };

/* Auth pages: the counter on the left, the form on a drawer pulled out on the right. */
export function AuthShell({ title, intro, children, footer }: Props) {
  return (
    <main id="main" className="grid min-h-dvh lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
      <section className="booth booth--deep flex flex-col justify-between gap-10 px-6 py-8 lg:px-12 lg:py-12">
        <Link href="/" aria-label="Gigboard home" className="inline-block self-start rounded-[4px] focus-visible:outline focus-visible:outline-[2.5px] focus-visible:outline-offset-4 focus-visible:outline-release">
          <WordMark />
        </Link>
        <div className="hidden lg:block">
          <EscrowDrawer state="held" size="md" />
        </div>
        <p className="max-w-[40ch] text-sm text-sand">
          Hire one freelancer for one defined job. Payment is held until you approve the work. Sample data, Stripe test mode.
        </p>
      </section>

      <section className="flex items-start justify-center px-4 py-10 lg:items-center lg:px-12">
        <div className="drawer-card w-full max-w-[26rem] text-ink">
          <h1 className="t-sign">{title}</h1>
          {intro ? <p className="mt-2 text-sm text-ink-muted">{intro}</p> : null}
          <div className="mt-6">{children}</div>
          {footer ? <div className="mt-6 border-t-2 border-dotted border-sand pt-5 text-sm text-ink-muted">{footer}</div> : null}
        </div>
      </section>
    </main>
  );
}
