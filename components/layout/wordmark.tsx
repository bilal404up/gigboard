import { cn } from "@/lib/utils/cn"

/* Painted sign lettering with the open lamp. */
export function WordMark({ className }: { className?: string }) {
  return (
    <span className={cn("wordmark inline-flex items-center gap-2", className)}>
      <span className="lamp lamp--release h-2.5 w-2.5" aria-hidden="true" />
      Gigboard
    </span>
  )
}
