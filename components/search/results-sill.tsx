import type { ReactNode } from "react"

type Props = { count: number; query?: string | null; controls?: ReactNode; className?: string }

/* Results heading on a brass sill. Your sort and view controls go in the controls slot. */
export function ResultsSill({ count, query, controls, className = "" }: Props) {
  const noun = count === 1 ? "gig" : "gigs"
  return (
    <div className={`flex flex-wrap items-end justify-between gap-4 bg-[linear-gradient(180deg,#E7C978,#C9A24A_40%,#7A5A14)] bg-[length:100%_4px] bg-bottom bg-no-repeat pb-4 ${className}`}>
      <h1 className="t-head">
        <span className="num">{count}</span> {noun}
        {query ? (
          <>
            {" "}
            for <span className="font-display">&ldquo;{query}&rdquo;</span>
          </>
        ) : null}
      </h1>
      {controls ? <div className="flex flex-wrap items-center gap-2">{controls}</div> : null}
    </div>
  )
}
