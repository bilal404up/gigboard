import { statusInfo } from "@/lib/order-status"
import { cn } from "@/lib/utils/cn"

/* A small status pill. Amber while money is held, green once released, red for a dispute. */
export function StatusTag({ status, className }: { status: string; className?: string }) {
  const s = statusInfo(status)
  return <span className={cn("tag", `tag--${s.tone}`, className)}>{s.label}</span>
}
