import type { ReactNode } from "react"

export type PinTileTone =
  | "new"
  | "level-one"
  | "level-two"
  | "top-rated"
  | "held"
  | "in-progress"
  | "delivered"
  | "revision"
  | "approved"
  | "cancelled"
  | "demo"

type Props = { tone: PinTileTone; children: ReactNode; className?: string }

/* A 22px plate with two pins. Tones: paper, enamel, brass, release, alarm. Used for seller levels and order status. */
export function PinTile({ tone, children, className = "" }: Props) {
  return (
    <span className={`pin-tile pin-tile--${tone} ${className}`} data-tone={tone}>
      {children}
    </span>
  )
}
