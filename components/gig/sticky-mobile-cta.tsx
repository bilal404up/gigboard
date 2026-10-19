"use client";

import Link from "next/link";
import { formatMoney } from "@/lib/utils/format";
import type { GigPackage } from "@/types/database.types";

export function StickyMobileCTA({ gigId, packages }: { gigId: string; packages: GigPackage[] }) {
  if (!packages || packages.length === 0) return null;
  const lowest = packages.reduce((min, p) => (Number(p.price) < Number(min.price) ? p : min), packages[0]);
  const orderUrl = `/checkout?gig=${gigId}&pkg=${lowest.id}`;

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-page/95 pb-[env(safe-area-inset-bottom,0px)] backdrop-blur lg:hidden">
      <div className="wrap flex items-center justify-between gap-3 py-2.5">
        <div className="min-w-0">
          <p className="eyebrow">From</p>
          <p className="num text-lg leading-tight text-ink">{formatMoney(Number(lowest.price))}</p>
        </div>
        <Link
          href={orderUrl}
          className="inline-flex h-11 shrink-0 items-center rounded-[8px] bg-ink px-5 text-sm font-semibold text-white transition-colors hover:bg-[#2A2A2E] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
        >
          Continue
        </Link>
      </div>
    </div>
  );
}
