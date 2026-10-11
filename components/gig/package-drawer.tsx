"use client"

import type { ReactNode } from "react"
import { EscrowDrawer } from "@/components/escrow/EscrowDrawer"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { cn } from "@/lib/utils/cn"
import { formatMoney } from "@/lib/utils/format"
import type { GigPackage } from "@/types/database.types"

type PackageType = GigPackage["package_type"]

type Props = {
  packages: GigPackage[]
  selected: PackageType
  onSelect: (type: PackageType) => void
  /** running total in dollars, shown on the drawer lid */
  total: number
  /** the buy button and anything else that posts; keeps its own handlers */
  action: ReactNode
  extras?: ReactNode
  receipt?: ReactNode
  className?: string
}

const NAME: Record<PackageType, string> = { basic: "Basic", standard: "Standard", premium: "Premium" }

/* The buy box as a drawer pulled out of the counter. Keep it a direct child of the page grid: no transformed ancestor. */
export function PackageDrawer({ packages, selected, onSelect, total, action, extras, receipt, className = "" }: Props) {
  const active = packages.filter((p) => p.is_active !== false)
  const current = active.find((p) => p.package_type === selected) ?? active[0]

  return (
    <aside className={cn("drawer-card lg:sticky lg:top-[calc(var(--header-h)+1rem)]", className)} aria-label="Packages and price">
      <Tabs value={current?.package_type ?? selected} onValueChange={(v) => onSelect(v as PackageType)}>
        <TabsList className="w-full [&>button]:flex-1">
          {active.map((p) => (
            <TabsTrigger key={p.id} value={p.package_type}>
              {NAME[p.package_type] ?? p.package_type}
            </TabsTrigger>
          ))}
        </TabsList>

        {active.map((p) => (
          <TabsContent key={p.id} value={p.package_type} className="mt-5">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="t-head">{p.name}</p>
                {p.description ? <p className="mt-1 text-sm text-ink-muted">{p.description}</p> : null}
              </div>
              <span className="plate shrink-0">
                <span className="num text-base font-bold">{formatMoney(Number(p.price))}</span>
              </span>
            </div>

            <dl className="mt-4 grid grid-cols-2 gap-3 border-t-2 border-dotted border-sand pt-4 text-sm">
              <div>
                <dt className="text-xs font-semibold text-ink-muted">Delivery</dt>
                <dd className="num mt-0.5">
                  {p.delivery_days} {p.delivery_days === 1 ? "day" : "days"}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold text-ink-muted">Revisions</dt>
                <dd className="num mt-0.5">{p.revisions === -1 ? "Unlimited" : p.revisions}</dd>
              </div>
            </dl>

            {p.features?.length ? (
              <ul className="mt-4 grid gap-1.5 text-sm">
                {p.features.map((f, i) => (
                  <li key={`${f.name}-${i}`} className={cn("flex items-start gap-2", !f.included && "text-ink-muted")}>
                    <span
                      aria-hidden="true"
                      className={cn("mt-1 inline-flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-[3px]", f.included ? "bg-brass text-ink" : "bg-laminate-sunk")}
                    >
                      {f.included ? (
                        <svg viewBox="0 0 12 12" width="10" height="10">
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
          </TabsContent>
        ))}
      </Tabs>

      {extras ? <div className="mt-5 border-t-2 border-dotted border-sand pt-4">{extras}</div> : null}
      {receipt ? <div className="mt-5 border-t-2 border-dotted border-sand pt-4">{receipt}</div> : null}

      <div className="mt-5 rounded-[8px] bg-mahogany-deep p-3">
        <EscrowDrawer
          state="held"
          size="sm"
          amount={formatMoney(total)}
          note={
            <span className="text-laminate">
              <span className="font-semibold">Held until you approve.</span> Paid out only when you say the work is good.
            </span>
          }
        />
      </div>

      <div className="mt-4">{action}</div>
    </aside>
  )
}
