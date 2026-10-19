import { cn } from "@/lib/utils/cn"

/* A single flap holding the G, then the name in Archivo Expanded. */
export function WordMark({ className }: { className?: string }) {
  return (
    <span className={cn("wordmark inline-flex items-center gap-2.5", className)}>
      <span aria-hidden="true" className="wordmark-flap">
        G
      </span>
      <span className="wordmark-name">Gigboard</span>
    </span>
  )
}
