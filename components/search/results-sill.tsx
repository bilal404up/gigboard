import type { ReactNode } from "react"

type Props = { count: number; query?: string | null; controls?: ReactNode; className?: string }

/* Results heading on a hairline. Sort and view controls go in the controls slot. */
export function ResultsSill({ count, query, controls, className = "" }: Props) {
  const noun = count === 1 ? "gig" : "gigs"
  return (
    <div className={`flex flex-wrap items-end justify-between gap-4 border-b border-line pb-4 ${className}`}>
      <h1 className="t-head">
        <span className="tabular-nums">{count}</span> {noun}
        {query ? (
          <>
            {" "}
            for &ldquo;{query}&rdquo;
          </>
        ) : null}
      </h1>
      {controls ? <div className="flex flex-wrap items-center gap-2">{controls}</div> : null}
    </div>
  )
}
