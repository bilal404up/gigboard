import type { ReactNode } from "react"
import { FlapText } from "@/components/board/flap-text"

type Props = {
  /** kept for older callers; the flap sign replaces icons */
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
  /** Words on the small flap sign. Defaults to the title. */
  sign?: string
  className?: string
}

/* A small departure-board sign, one line of help, one action. */
export function EmptyState({ title, description, action, sign, className = "" }: Props) {
  const words = (sign ?? title).replace(/[^a-zA-Z0-9 ]/g, "").split(/\s+/).slice(0, 3).join(" ")
  return (
    <div className={`panel grid justify-items-start gap-4 px-6 py-8 md:px-8 md:py-10 ${className}`}>
      <FlapText text={words} size="sm" label={title} />
      <div className="grid gap-1.5">
        <p className="text-[1.0625rem] font-semibold">{title}</p>
        {description ? <p className="max-w-[52ch] text-sm leading-[1.5] text-ink-2">{description}</p> : null}
      </div>
      {action ? <div>{action}</div> : null}
    </div>
  )
}
