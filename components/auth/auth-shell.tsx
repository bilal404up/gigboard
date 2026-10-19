import Link from "next/link";
import type { ReactNode } from "react";
import { WordMark } from "@/components/layout/wordmark";
import { FlapText } from "@/components/board/flap-text";

type Props = { title: string; intro?: string; children: ReactNode; footer?: ReactNode };

/* Auth pages: the board as a dark side panel on desktop, the form on the right. */
export function AuthShell({ title, intro, children, footer }: Props) {
  return (
    <main id="main" className="grid min-h-dvh lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
      <section className="dark-band flex flex-col justify-between gap-10 px-6 py-8 lg:px-12 lg:py-12">
        <Link href="/" aria-label="Gigboard home" className="inline-block self-start rounded-[4px] text-[#F2EEE3]">
          <WordMark />
        </Link>
        <div className="hidden lg:grid lg:gap-3" aria-label="Fixed price. Fixed date. Paid on approval." role="img">
          <FlapText text="Fixed price" size="lg" label="" />
          <FlapText text="Fixed date" size="lg" label="" />
          <FlapText text="Held" size="lg" tone="held" label="" />
        </div>
        <p className="max-w-[40ch] text-sm text-[#AAA69C]">Hire one freelancer for one defined job. Payment is held until you approve the work. A demo with sample data.</p>
      </section>

      <section className="flex items-start justify-center px-4 py-10 lg:items-center lg:px-12">
        <div className="drawer-card w-full max-w-[26rem] text-ink">
          <h1 className="t-sign">{title}</h1>
          {intro ? <p className="mt-2 text-sm text-ink-2">{intro}</p> : null}
          <div className="mt-6">{children}</div>
          {footer ? <div className="mt-6 border-t border-line pt-5 text-sm text-ink-2">{footer}</div> : null}
        </div>
      </section>
    </main>
  );
}
