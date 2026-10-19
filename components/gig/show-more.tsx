"use client"

import { useRef, useState, type ReactNode } from "react"

/* Reveals the rows that the server rendered with the `hidden` attribute (marked data-more).
   They stay in the HTML, so crawlers see every gig. The button goes once they are shown. */
export function ShowMore({ hiddenCount, children }: { hiddenCount: number; children: ReactNode }) {
  const ref = useRef<HTMLDivElement | null>(null)
  const [open, setOpen] = useState(false)

  const reveal = () => {
    const root = ref.current
    if (!root) return
    const items = Array.from(root.querySelectorAll<HTMLElement>("[data-more]"))
    items.forEach((el) => el.removeAttribute("hidden"))
    setOpen(true)
    const firstRow = items.find((el) => el.tagName === "DIV")?.querySelector<HTMLElement>("a")
    firstRow?.focus({ preventScroll: true })
  }

  return (
    <div ref={ref}>
      {children}
      {hiddenCount > 0 && !open ? (
        <div className="mt-6 flex justify-center">
          <button
            type="button"
            onClick={reveal}
            className="inline-flex min-h-11 items-center rounded-full bg-surface px-5 text-sm font-semibold text-ink shadow-[inset_0_0_0_1px_var(--line-strong)] hover:shadow-[inset_0_0_0_1px_var(--ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
          >
            Show {hiddenCount} more {hiddenCount === 1 ? "gig" : "gigs"}
          </button>
        </div>
      ) : null}
    </div>
  )
}
