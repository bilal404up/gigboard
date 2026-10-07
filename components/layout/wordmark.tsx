import { cn } from "@/lib/utils/cn";

/** The logo mark is the pinned tile: an ink square with two pins at mid-height. */
export function WordMark({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2 text-[20px] font-semibold leading-none text-ink", className)}>
      <span aria-hidden className="relative inline-block h-5 w-5 rounded-xs bg-ink">
        <span className="absolute -left-[3px] top-1/2 h-px w-[6px] bg-ink" />
        <span className="absolute -right-[3px] top-1/2 h-px w-[6px] bg-ink" />
        <span className="absolute left-1/2 top-1/2 h-[2px] w-2 -translate-x-1/2 -translate-y-1/2 bg-white" />
      </span>
      gigboard
    </span>
  );
}
