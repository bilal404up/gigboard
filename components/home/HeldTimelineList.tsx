"use client"

import type { CSSProperties } from "react"
import { FlapText } from "@/components/board/flap-text"
import { useInView } from "@/components/motion/useInView"

export type HeldStop = { word: string; tone?: "held" | "go"; title: string; body: string }

/* The four stops play as one sequence once the list scrolls into view:
   the connector draws, each node fills, each label appears, RELEASED pulses once. */
export function HeldTimelineList({ stops }: { stops: HeldStop[] }) {
  const { ref, inView } = useInView<HTMLOListElement>()
  return (
    <ol ref={ref} className="ht-line" data-in={inView ? "true" : undefined}>
      {stops.map((s, i) => (
        <li key={s.word} className="ht-stop" data-tone={s.tone ?? "neutral"} style={{ ["--i" as string]: i } as CSSProperties}>
          <span className="ht-index num" aria-hidden="true">
            {String(i + 1).padStart(2, "0")}
          </span>
          <span className="ht-node" aria-hidden="true" />
          <FlapText className="ht-label" text={s.word} size="sm" tone={s.tone} />
          <h3 className="ht-title">{s.title}</h3>
          <p className="ht-body">{s.body}</p>
        </li>
      ))}
    </ol>
  )
}
