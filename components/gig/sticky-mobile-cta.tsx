"use client";

import Link from "next/link";
import { formatMoney } from "@/lib/utils/format";
import type { GigPackage } from "@/types/database.types";

export function StickyMobileCTA({
  gigId,
  packages,
}: {
  gigId: string;
  packages: GigPackage[];
}) {
  if (!packages || packages.length === 0) return null;
  const lowest = packages.reduce((min, p) => (Number(p.price) < Number(min.price) ? p : min), packages[0]);
  const orderUrl = `/checkout?gig=${gigId}&pkg=${lowest.id}`;

  return (
    // sits on top of the demo bar in demo mode, on the viewport edge otherwise
    <div className="booth booth--plain fixed inset-x-0 bottom-0 z-30 shadow-[0_-4px_0_#7A5A14] lg:hidden [body[data-demo]_&]:bottom-[var(--demo-h)]">
      <div className="wrap flex items-center justify-between gap-3 py-2.5">
        <div className="min-w-0">
          <p className="t-plate text-sand">From</p>
          <p className="num text-lg font-bold leading-tight text-laminate">{formatMoney(Number(lowest.price))}</p>
        </div>
        <Link
          href={orderUrl}
          className="inline-flex h-11 shrink-0 items-center rounded-[4px] bg-[linear-gradient(180deg,#E7C978_0%,#C9A24A_55%,#B08A2C_100%)] px-5 text-sm font-semibold text-ink shadow-[0_2px_0_#7A5A14,inset_0_1px_0_#E7C978] focus-visible:outline focus-visible:outline-[2.5px] focus-visible:outline-offset-2 focus-visible:outline-release active:translate-y-px"
        >
          Continue
        </Link>
      </div>
    </div>
  );
}
