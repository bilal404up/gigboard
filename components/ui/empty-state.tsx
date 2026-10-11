import type { ReactNode } from "react"

type Props = { icon?: ReactNode; title: string; description?: string; action?: ReactNode; className?: string }

/* A closed window: a dark sign with the lamp off, then what to do next. */
export function EmptyState({ icon, title, description, action, className = "" }: Props) {
  return (
    <div className={`tray grid justify-items-center gap-4 px-6 py-10 text-center ${className}`}>
      <div className="sign relative flex h-16 w-24 items-center justify-center text-laminate" aria-hidden="true">
        <span className="lamp absolute left-3 top-3" />
        {icon ? <span className="[&_svg]:h-7 [&_svg]:w-7">{icon}</span> : <span className="grille scale-75" />}
      </div>
      <div className="grid gap-1.5">
        <p className="t-head">{title}</p>
        {description ? <p className="mx-auto max-w-[40ch] text-sm leading-[1.45] text-ink-muted">{description}</p> : null}
      </div>
      {action ? <div className="mt-1">{action}</div> : null}
    </div>
  )
}
