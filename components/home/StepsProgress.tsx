"use client"

import { useEffect, useRef, type ReactNode } from "react"

/* An ordered list whose progress line fills as each item crosses the middle of the viewport.
   Items are server-rendered children; this only sets data-reached on each <li> and a
   --reached count on the list. Once reached, an item stays reached. */
export function StepsProgress({ className, children }: { className?: string; children: ReactNode }) {
  const ref = useRef<HTMLOListElement | null>(null)

  useEffect(() => {
    const list = ref.current
    if (!list) return
    const items = Array.from(list.querySelectorAll<HTMLElement>(":scope > li"))
    list.style.setProperty("--total", String(items.length))
    let count = 0
    const mark = (el: HTMLElement) => {
      if (el.hasAttribute("data-reached")) return
      el.setAttribute("data-reached", "true")
      count += 1
      list.style.setProperty("--reached", String(count))
    }
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (reduce || !("IntersectionObserver" in window)) {
      items.forEach(mark)
      return
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            mark(e.target as HTMLElement)
            io.unobserve(e.target)
          }
        })
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 },
    )
    items.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])

  return (
    <ol ref={ref} className={className}>
      {children}
    </ol>
  )
}
