"use client"

import { useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react"
import { cn } from "@/lib/utils/cn"
import { formatMoney } from "@/lib/utils/format"
import type { GigPackage } from "@/types/database.types"

type PackageType = GigPackage["package_type"]

type Props = {
  packages: GigPackage[]
  selected: PackageType
  onSelect: (type: PackageType) => void
  /** running total in dollars */
  total: number
  action: ReactNode
  extras?: ReactNode
  receipt?: ReactNode
  className?: string
}

const NAME: Record<PackageType, string> = { basic: "Basic", standard: "Standard", premium: "Premium" }

/*
 * The booking card, in the timetable style: package tabs, "Ready by" computed from the
 * delivery days, the price in mono, the held-payment rule in one line, and an ink button.
 * Keep it a direct child of the page grid so sticky works.
 */
export function PackageDrawer({ packages, selected, onSelect, total, action, extras, receipt, className = "" }: Props) {
  const uid = useId()
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([])
  const active = packages.filter((p) => p.is_active !== false)
  const current = active.find((p) => p.package_type === selected) ?? active[0]
  const tabbed = active.length > 1

  // Computed after load in the visitor's own time zone, so the server never guesses the date.
  const [today, setToday] = useState<Date | null>(null)
  useEffect(() => setToday(new Date()), [])
  const days = current?.delivery_days ?? 0
  const readyBy = today && current ? new Date(today.getFullYear(), today.getMonth(), today.getDate() + days).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }) : null

  function onKey(e: KeyboardEvent<HTMLDivElement>) {
    const i = active.findIndex((p) => p.package_type === current?.package_type)
    let n = -1
    if (e.key === "ArrowRight") n = (i + 1) % active.length
    else if (e.key === "ArrowLeft") n = (i - 1 + active.length) % active.length
    else if (e.key === "Home") n = 0
    else if (e.key === "End") n = active.length - 1
    if (n < 0) return
    e.preventDefault()
    onSelect(active[n].package_type)
    tabRefs.current[n]?.focus()
  }

  return (
    <aside className={cn("drawer-card lg:sticky lg:top-[calc(var(--header-h)+1.5rem)]", className)} aria-label="Packages and price">
      {tabbed ? (
        <div role="tablist" aria-label="Packages" className="tabs" onKeyDown={onKey}>
          {active.map((p, i) => {
            const on = p.package_type === current?.package_type
            return (
              <button
                key={p.id}
                ref={(el) => {
                  tabRefs.current[i] = el
                }}
                type="button"
                role="tab"
                id={`${uid}-tab-${p.package_type}`}
                aria-selected={on}
                aria-controls={`${uid}-panel`}
                tabIndex={on ? 0 : -1}
                onClick={() => onSelect(p.package_type)}
                className="tab"
              >
                {NAME[p.package_type] ?? p.package_type}
              </button>
            )
          })}
        </div>
      ) : null}

      {current ? (
        <div id={`${uid}-panel`} role={tabbed ? "tabpanel" : undefined} aria-labelledby={tabbed ? `${uid}-tab-${current.package_type}` : undefined} className={tabbed ? "mt-5" : undefined}>
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-[1.0625rem] font-semibold">{current.name}</p>
              {current.description ? <p className="mt-1 text-sm text-ink-2">{current.description}</p> : null}
            </div>
            <span className="num shrink-0 text-[1.5rem] leading-none tracking-[-0.03em]">{formatMoney(Number(current.price))}</span>
          </div>

          <dl className="mt-5 grid grid-cols-2 gap-px overflow-hidden rounded-[10px] bg-line text-sm shadow-[0_0_0_1px_#E2E0DA]">
            <div className="bg-surface p-3">
              <dt className="eyebrow">Ready by</dt>
              <dd className="num mt-1.5 text-[0.9375rem]">{readyBy ?? `${days} ${days === 1 ? "day" : "days"}`}</dd>
              <dd className="mt-0.5 text-xs text-ink-2">
                {days} {days === 1 ? "day" : "days"} after booking
              </dd>
            </div>
            <div className="bg-surface p-3">
              <dt className="eyebrow">Revisions</dt>
              <dd className="num mt-1.5 text-[0.9375rem]">{current.revisions === -1 ? "Unlimited" : current.revisions}</dd>
              <dd className="mt-0.5 text-xs text-ink-2">before you approve</dd>
            </div>
          </dl>

          {current.features?.length ? (
            <ul className="mt-5 grid gap-2 text-sm">
              {current.features.map((f, i) => (
                <li key={`${f.name}-${i}`} className={cn("flex items-start gap-2.5", !f.included && "text-ink-2")}>
                  <span aria-hidden="true" className={cn("mt-[3px] inline-flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full", f.included ? "bg-ink text-white" : "shadow-[inset_0_0_0_1px_#C9C6BE]")}>
                    {f.included ? (
                      <svg viewBox="0 0 12 12" width="8" height="8">
                        <path d="M2 6.5l2.5 2.5L10 3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    ) : null}
                  </span>
                  <span className={cn(!f.included && "line-through decoration-line-strong")}>
                    {f.name}
                    <span className="sr-only">{f.included ? ", included" : ", not included"}</span>
                  </span>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}

      {extras ? <div className="mt-5 border-t border-line pt-4">{extras}</div> : null}
      {receipt ? <div className="mt-5 border-t border-line pt-4">{receipt}</div> : null}

      <div className="mt-5 flex items-start gap-3 rounded-[10px] bg-held-bg/60 p-3">
        <span className="tag tag--held mt-px shrink-0">Held</span>
        <p className="text-sm leading-[1.45] text-ink">
          <span className="num">{formatMoney(total)}</span> is held by Gigboard until you approve the work.
        </p>
      </div>

      <div className="mt-4">{action}</div>
    </aside>
  )
}
