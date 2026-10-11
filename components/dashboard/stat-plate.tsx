import type { ReactNode } from "react"
import { cn } from "@/lib/utils/cn"

type Props = {
  label: string
  /** already formatted (formatMoney, counts, percentages) */
  value: string
  hint?: string
  tone?: "laminate" | "brass" | "release"
  icon?: ReactNode
  className?: string
}

/* One figure on a plate. Brass for money held, release for money that has moved, laminate for everything else. */
export function StatPlate({ label, value, hint, tone = "laminate", icon, className = "" }: Props) {
  const skin =
    tone === "brass"
      ? "bg-[linear-gradient(180deg,#E7C978_0%,#C9A24A_55%,#B08A2C_100%)] text-ink shadow-[0_1px_0_#7A5A14,inset_0_1px_0_#E7C978]"
      : tone === "release"
        ? "bg-release text-ink shadow-[0_1px_0_#0B6B40]"
        : "tray text-ink"
  const muted = tone === "laminate" ? "text-ink-muted" : "text-ink/80"
  return (
    <div className={cn("rounded-[10px] p-4", skin, className)}>
      <div className="flex items-center justify-between gap-3">
        <p className={cn("text-xs font-semibold", muted)}>{label}</p>
        {icon ? <span className="[&_svg]:h-4 [&_svg]:w-4" aria-hidden="true">{icon}</span> : null}
      </div>
      <p className="fig-price-xl mt-2 text-ink">{value}</p>
      {hint ? <p className={cn("mt-1 text-xs", muted)}>{hint}</p> : null}
    </div>
  )
}

/* Plates in a row; wraps to two columns at 390px. */
export function StatRow({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={cn("grid grid-cols-2 gap-3 md:grid-cols-4", className)}>{children}</div>
}
