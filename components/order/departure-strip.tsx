"use client"

import { useEffect, useState } from "react"
import { statusInfo } from "@/lib/order-status"
import { cn } from "@/lib/utils/cn"

type Props = {
  orderId?: string
  orderNumber?: string | null
  title: string
  sellerName?: string | null
  /** ISO date the work is due, or null when not set yet */
  readyBy?: string | null
  /** pre-formatted amount, e.g. "$63.30" */
  amount: string
  status: string
  className?: string
}

function shortDate(iso?: string | null) {
  if (!iso) return null
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return null
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" }).toUpperCase()
}

/*
 * One line of the departure board, for a single order:
 * GB-01000 · Logo that still reads at 16px · Mara Kade · Ready OCT 21 · $63.30 · HELD
 * If the status changed since this browser last saw the order, the status word flips once (240ms).
 */
export function DepartureStrip({ orderId, orderNumber, title, sellerName, readyBy, amount, status, className }: Props) {
  const s = statusInfo(status)
  const [flip, setFlip] = useState(false)
  const ready = shortDate(readyBy)

  useEffect(() => {
    if (!orderId) return
    const key = `gb:order-status:${orderId}`
    try {
      const prev = sessionStorage.getItem(key)
      sessionStorage.setItem(key, status)
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
      if (prev && prev !== status && !reduced) {
        setFlip(true)
        const t = window.setTimeout(() => setFlip(false), 400)
        return () => window.clearTimeout(t)
      }
    } catch {
      /* storage unavailable: no flip */
    }
  }, [orderId, status])

  const tone = s.tone === "neutral" ? undefined : s.tone
  const spoken = [orderNumber && `Order ${orderNumber}`, title, sellerName && `by ${sellerName}`, ready && `ready by ${ready}`, amount, s.label]
    .filter(Boolean)
    .join(", ")

  return (
    <div className={cn("departure board-panel", className)} role="group" aria-label={spoken}>
      <div className="departure-row" aria-hidden="true">
        {orderNumber ? <span className="departure-no">{orderNumber}</span> : null}
        <span className="departure-title">{title}</span>
        <span className="departure-facts">
          {sellerName ? <span className="departure-meta">{sellerName}</span> : null}
          <span className="departure-meta departure-mono">{ready ? `Ready ${ready}` : "Ready date not set"}</span>
          <span className="departure-mono departure-amount">{amount}</span>
        </span>
        <span className={cn("departure-status", flip && "is-flipping")}>
          {s.board.split(" ").map((w, i) => (
            <span key={i} className="ft-word">
              {Array.from(w).map((ch, j) => (
                <span key={j} className="ft-cell" data-tone={tone}>
                  {ch}
                </span>
              ))}
            </span>
          ))}
        </span>
      </div>
    </div>
  )
}
