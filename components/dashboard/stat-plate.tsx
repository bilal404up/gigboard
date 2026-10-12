import type { ReactNode } from "react"
import { cn } from "@/lib/utils/cn"

type Props = {
  label: string
  /** already formatted (formatMoney, counts, percentages) */
  value: string
  hint?: string
  /** kept names: "brass" is money held, "release" is money that has moved, "laminate" is everything else */
  tone?: "laminate" | "brass" | "release"
  icon?: ReactNode
  className?: string
}

/* One figure on a card. Held money gets a green tint, released money gets solid green. */
export function StatPlate({ label, value, hint, tone = "laminate", icon, className = "" }: Props) {
  const skin = tone === "brass" ? "bg-release-tint text-ink shadow-[inset_0_0_0_1px_#9FD3B9]" : tone === "release" ? "bg-release text-ink" : "tray text-ink"
  const muted = tone === "release" ? "text-ink/80" : "text-ink-muted"
  return (
    <div className={cn("rounded-[14px] p-4", skin, className)}>
      <div className="flex items-center justify-between gap-3">
        <p className={cn("text-xs font-semibold", muted)}>{label}</p>
        {icon ? (
          <span className="[&_svg]:h-4 [&_svg]:w-4" aria-hidden="true">
            {icon}
          </span>
        ) : null}
      </div>
      <p className="fig-price-xl mt-2 text-ink">{value}</p>
      {hint ? <p className={cn("mt-1 text-xs", muted)}>{hint}</p> : null}
    </div>
  )
}

/* Cards in a row; wraps to two columns at 390px. */
export function StatRow({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={cn("grid grid-cols-2 gap-3 md:grid-cols-4", className)}>{children}</div>
}
