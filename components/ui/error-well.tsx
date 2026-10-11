import type { ReactNode } from "react"

type Props = { title: string; children?: ReactNode; action?: ReactNode; className?: string }

/* Errors say what happened and what to do. No apology, no vagueness. */
export function ErrorWell({ title, children, action, className = "" }: Props) {
  return (
    <div role="alert" className={`well-error ${className}`}>
      <p className="font-semibold">{title}</p>
      {children ? <div className="mt-1 text-alarm/90">{children}</div> : null}
      {action ? <div className="mt-3">{action}</div> : null}
    </div>
  )
}
