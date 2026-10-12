"use client"

import { useId, useRef, type KeyboardEvent, type ReactNode } from "react"
import { EscrowDrawer } from "@/components/escrow/EscrowDrawer"
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
  /** the buy button and anything else that posts; keeps its own handlers */
  action: ReactNode
  extras?: ReactNode
  receipt?: ReactNode
  className?: string
}

const NAME: Record<PackageType, string> = { basic: "Basic", standard: "Standard", premium: "Premium" }

/* The buy box. Keep it a direct child of the page grid: no transformed ancestor, so sticky works. */
export function PackageDrawer({ packages, selected, onSelect, total, action, extras, receipt, className = "" }: Props) {
  const uid = useId()
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([])
  const active = packages.filter((p) => p.is_active !== false)
  const current = active.find((p) => p.package_type === selected) ?? active[0]
  const tabbed = active.length > 1

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
    <aside className={cn("drawer-card lg:sticky lg:top-[calc(var(--header-h)+1rem)]", className)} aria-label="Packages and price">
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
        <div
          id={`${uid}-panel`}
          role={tabbed ? "tabpanel" : undefined}
          aria-labelledby={tabbed ? `${uid}-tab-${current.package_type}` : undefined}
          className={tabbed ? "mt-5" : undefined}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="t-head">{current.name}</p>
              {current.description ? <p className="mt-1 text-sm text-ink-muted">{current.description}</p> : null}
            </div>
            <span className="shrink-0 text-xl font-bold tabular-nums">{formatMoney(Number(current.price))}</span>
          </div>

          <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-line pt-4 text-sm">
            <div>
              <dt className="text-xs font-semibold text-ink-muted">Delivery</dt>
              <dd className="mt-0.5 tabular-nums">
                {current.delivery_days} {current.delivery_days === 1 ? "day" : "days"}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold text-ink-muted">Revisions</dt>
              <dd className="mt-0.5 tabular-nums">{current.revisions === -1 ? "Unlimited" : current.revisions}</dd>
            </div>
          </dl>

          {current.features?.length ? (
            <ul className="mt-4 grid gap-1.5 text-sm">
              {current.features.map((f, i) => (
                <li key={`${f.name}-${i}`} className={cn("flex items-start gap-2", !f.included && "text-ink-muted")}>
                  <span
                    aria-hidden="true"
                    className={cn("mt-1 inline-flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full", f.included ? "bg-release-tint text-release-deep" : "bg-laminate-sunk")}
                  >
                    {f.included ? (
                      <svg viewBox="0 0 12 12" width="9" height="9">
                        <path d="M2 6.5l2.5 2.5L10 3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    ) : null}
                  </span>
                  <span>
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

      <div className="mt-5 rounded-[12px] p-3 shadow-[inset_0_0_0_1px_#E3E4E6]">
        <EscrowDrawer
          state="held"
          size="sm"
          amount={formatMoney(total)}
          note={
            <>
              <span className="font-semibold text-ink">Held by Gigboard.</span> <span className="text-ink-muted">Paid out only when you approve the work.</span>
            </>
          }
        />
      </div>

      <div className="mt-4">{action}</div>
    </aside>
  )
}
