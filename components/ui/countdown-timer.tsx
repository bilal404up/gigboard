"use client"

import { useEffect, useMemo, useState } from "react"
import { cn } from "@/lib/utils/cn"

type Props = { to: string | Date; className?: string; prefix?: string }

function remaining(target: Date) {
  const ms = target.getTime() - Date.now()
  if (ms <= 0) return null
  return {
    d: Math.floor(ms / 86_400_000),
    h: Math.floor(ms / 3_600_000) % 24,
    m: Math.floor(ms / 60_000) % 60,
    s: Math.floor(ms / 1_000) % 60,
  }
}

const two = (n: number) => String(n).padStart(2, "0")

/* Counts down once a second. Under a day it shows seconds; past the date it says "Due now". */
export function CountdownTimer({ to, className, prefix }: Props) {
  const target = useMemo(() => new Date(to), [to])
  const [r, setR] = useState(() => remaining(target))

  useEffect(() => {
    setR(remaining(target))
    const id = setInterval(() => setR(remaining(target)), 1000)
    return () => clearInterval(id)
  }, [target])

  const text = !r ? "Due now" : r.d > 0 ? `${r.d}d ${two(r.h)}h ${two(r.m)}m` : `${two(r.h)}:${two(r.m)}:${two(r.s)}`

  return (
    <span className={cn("inline-flex items-baseline gap-2", className)}>
      {prefix ? <span className="text-sm text-ink-muted">{prefix}</span> : null}
      <time dateTime={target.toISOString()} className={cn("num", !r && "text-alarm")} suppressHydrationWarning>
        {text}
      </time>
    </span>
  )
}
