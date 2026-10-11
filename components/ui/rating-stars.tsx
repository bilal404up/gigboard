"use client"

type Props = {
  value: number
  max?: number
  size?: number
  className?: string
  onChange?: (v: number) => void
  interactive?: boolean
}

const STAR = "M8 1.2l2.06 4.3 4.74.6-3.48 3.3.9 4.7L8 11.8l-4.22 2.3.9-4.7L1.2 6.1l4.74-.6z"

/* Brass stars. Partial stars are clipped, so 4.9 reads as 4.9, not as 5 or 4. */
function Star({ fill, size, id }: { fill: number; size: number; id: string }) {
  const w = Math.max(0, Math.min(1, fill)) * 16
  return (
    <svg viewBox="0 0 16 16" width={size} height={size} aria-hidden="true" className="shrink-0">
      <defs>
        <clipPath id={id}>
          <rect x="0" y="0" width={w} height="16" />
        </clipPath>
      </defs>
      <path d={STAR} fill="#B9AFA4" />
      <path d={STAR} fill="#C9A24A" stroke="#7A5A14" strokeWidth="0.6" clipPath={`url(#${id})`} />
    </svg>
  )
}

export function RatingStars({ value, max = 5, size = 16, className, onChange, interactive }: Props) {
  const stars = Array.from({ length: max }, (_, i) => i + 1)
  const base = `star-${Math.round(value * 100)}-${max}-${size}`

  if (interactive) {
    return (
      <div role="group" aria-label={`Rating, ${value} of ${max}`} className={`inline-flex ${className ?? ""}`}>
        {stars.map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange?.(n)}
            aria-label={`${n} ${n === 1 ? "star" : "stars"}`}
            aria-pressed={n === Math.round(value)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-[4px] transition-transform duration-120 hover:-translate-y-px focus-visible:outline focus-visible:outline-[2.5px] focus-visible:outline-offset-2 focus-visible:outline-mahogany"
          >
            <Star fill={n <= value ? 1 : 0} size={Math.max(size, 22)} id={`${base}-i${n}`} />
          </button>
        ))}
      </div>
    )
  }

  return (
    <span role="img" aria-label={`${value} out of ${max} stars`} className={`inline-flex gap-0.5 ${className ?? ""}`}>
      {stars.map((n) => (
        <Star key={n} fill={value - (n - 1)} size={size} id={`${base}-${n}`} />
      ))}
    </span>
  )
}
