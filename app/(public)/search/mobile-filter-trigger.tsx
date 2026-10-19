"use client";

import { SlidersHorizontal } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export function MobileFilterTrigger({ activeCount, children }: { activeCount: number; children: React.ReactNode }) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <button
          type="button"
          className="inline-flex h-11 items-center gap-2 rounded-full bg-surface px-4 text-sm font-medium text-ink shadow-[inset_0_0_0_1px_#C9C6BE] transition-shadow hover:shadow-[inset_0_0_0_1px_#111113] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink lg:hidden"
        >
          <SlidersHorizontal className="h-4 w-4 text-ink-2" aria-hidden="true" />
          Filters
          {activeCount > 0 && <span className="inline-grid h-5 min-w-5 place-items-center rounded-full bg-ink px-1.5 font-mono text-xs tabular-nums text-white">{activeCount}</span>}
        </button>
      </SheetTrigger>
      <SheetContent side="left" className="gap-0 bg-surface p-0">
        <div className="flex h-14 items-center border-b border-line px-5">
          <h2 className="t-head">Filters</h2>
        </div>
        <div className="overflow-y-auto p-5">{children}</div>
      </SheetContent>
    </Sheet>
  );
}
