import Link from "next/link"
import type { ReactNode } from "react"
import { cn } from "@/lib/utils/cn"

type Tone = "held" | "go" | "neutral"

type Props = {
  label: string
  /** already formatted (formatMoney, counts, percentages) */
  value: string
  hint?: string
  /** older names: "brass" is money held, "release" is money that has moved, "laminate" is everything else */
  tone?: "laminate" | "brass" | "release" | Tone
  icon?: ReactNode
  className?: string
}

function toTone(t: Props["tone"]): Tone {
  if (t === "brass" || t === "held") return "held"
  if (t === "release" || t === "go") return "go"
  return "neutral"
}

/* One figure as a plain row cell: label, mono number, a small tone dot. No fills. */
export function StatPlate({ label, value, hint, tone = "laminate", className = "" }: Props) {
  const t = toTone(tone)
  return (
    <div className={cn("min-w-0 bg-surface p-4 md:p-5", className)}>
      <p className="flex items-center gap-2 text-sm text-ink-2">
        {t !== "neutral" ? <span aria-hidden="true" className={cn("h-2 w-2 shrink-0 rounded-full", t === "held" ? "bg-held" : "bg-go")} /> : null}
        <span className="truncate">{label}</span>
      </p>
      <p className="num mt-2 text-[1.625rem] leading-none tracking-[-0.03em] text-ink md:text-[2rem]">{value}</p>
      {hint ? <p className="mt-2 text-xs text-ink-2">{hint}</p> : null}
    </div>
  )
}

/* Cells joined by hairlines in one row; two columns at 390px. */
export function StatRow({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={cn("grid grid-cols-2 gap-px overflow-hidden rounded-[12px] bg-line shadow-[0_0_0_1px_#E2E0DA] md:grid-cols-4", className)}>{children}</div>
}

export type Metric = { label: string; value: string; hint?: string; tone?: Tone; href?: string }

/* A row of plain numbers. Amber dot for held money, green dot for released money. */
export function MetricRow({ items, className = "" }: { items: Metric[]; className?: string }) {
  const cols = items.length >= 4 ? "md:grid-cols-4" : items.length === 3 ? "md:grid-cols-3" : "md:grid-cols-2"
  return (
    <dl className={cn("grid grid-cols-1 gap-px overflow-hidden rounded-[12px] bg-line shadow-[0_0_0_1px_#E2E0DA] sm:grid-cols-2", cols, className)}>
      {items.map((m) => {
        const body = (
          <>
            <dt className="flex items-center gap-2 text-sm text-ink-2">
              {m.tone && m.tone !== "neutral" ? <span aria-hidden="true" className={cn("h-2 w-2 shrink-0 rounded-full", m.tone === "held" ? "bg-held" : "bg-go")} /> : null}
              {m.label}
            </dt>
            <dd className="num mt-2 text-[1.75rem] leading-none tracking-[-0.03em] text-ink md:text-[2.125rem]">{m.value}</dd>
            {m.hint ? <dd className="mt-2 text-xs text-ink-2">{m.hint}</dd> : null}
          </>
        )
        return m.href ? (
          <div key={m.label} className="relative bg-surface p-5 transition-colors hover:bg-[#FAF9F6]">
            {body}
            <Link href={m.href} className="absolute inset-0 rounded-[2px] focus-visible:outline-offset-[-3px]" aria-label={`${m.label}: ${m.value}`} />
          </div>
        ) : (
          <div key={m.label} className="bg-surface p-5">
            {body}
          </div>
        )
      })}
    </dl>
  )
}
