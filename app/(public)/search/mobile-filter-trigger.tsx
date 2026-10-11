"use client";

import { SlidersHorizontal } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export function MobileFilterTrigger({
  activeCount,
  children,
}: {
  activeCount: number;
  children: React.ReactNode;
}) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <button
          type="button"
          className="inline-flex h-11 items-center gap-2 rounded-[4px] px-3 text-sm font-semibold text-ink shadow-[inset_0_0_0_1.5px_#4B2320] transition-colors hover:bg-laminate-sunk focus-visible:outline focus-visible:outline-[2.5px] focus-visible:outline-offset-2 focus-visible:outline-mahogany lg:hidden"
          aria-label="Open filters"
        >
          <SlidersHorizontal className="h-4 w-4 text-brass-deep" />
          Filters
          {activeCount > 0 && <span className="plate t-plate min-h-5 px-1.5">{activeCount}</span>}
        </button>
      </SheetTrigger>
      <SheetContent side="left" className="gap-0 p-0">
        <div className="booth booth--plain flex h-14 items-center px-5">
          <h2 className="t-head">Filters</h2>
        </div>
        <div className="overflow-y-auto p-5">{children}</div>
      </SheetContent>
    </Sheet>
  );
}
