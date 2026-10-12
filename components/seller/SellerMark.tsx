import { hash } from '@/components/gig/GigArt'

export type SellerLevel = 'new' | 'level_one' | 'level_two' | 'top_rated'

const LEVEL_LABEL: Record<SellerLevel, string> = {
  new: 'New',
  level_one: 'Level One',
  level_two: 'Level Two',
  top_rated: 'Top Rated',
}

/* accepts the data's "new_seller", "level_one", "level_two", "top_rated" and any spelling of them */
export function normalizeLevel(raw?: string | null): SellerLevel {
  const c = (raw ?? '').toLowerCase()
  if (c.includes('top')) return 'top_rated'
  if (c.includes('two') || c.includes('2')) return 'level_two'
  if (c.includes('one') || c.includes('1')) return 'level_one'
  return 'new'
}

type MarkProps = {
  username: string
  level?: string | null
  size?: number
  /** accessible name; defaults to "username, Level seller". Pass a plain name for buyers. */
  label?: string
  className?: string
}

const TINTS = ['#E9EEF5', '#ECF2EA', '#F1EBF3', '#F2EFE6', '#F5ECE7', '#E7EFF2']

/* Fallback mark for anyone without a photo: initials on a quiet tint. Top rated gets the green dot. */
export function SellerMark({ username, level, size = 40, label, className = '' }: MarkProps) {
  const h = hash(username)
  const lvl = normalizeLevel(level)
  const tint = TINTS[h % TINTS.length]
  const initials = username.replace(/[^a-zA-Z0-9]/g, '').slice(0, 2).toUpperCase() || '?'
  const r = size / 2

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={label ?? `${username}, ${LEVEL_LABEL[lvl]} seller`} className={`shrink-0 ${className}`}>
      <circle cx={r} cy={r} r={r} fill={tint} />
      <text x={r} y={r} textAnchor="middle" dominantBaseline="central" fontFamily="var(--font-body), system-ui, sans-serif" fontWeight="600" fontSize={size * 0.36} fill="#121417">
        {initials}
      </text>
      {lvl === 'top_rated' ? <circle cx={size - size * 0.16} cy={size * 0.16} r={size * 0.1} fill="#2BB673" stroke="#FFFFFF" strokeWidth="1.5" /> : null}
    </svg>
  )
}

type PlateProps = { level?: string | null; className?: string }

/* Level pill. Top rated is the only one in green. */
export function LevelPlate({ level, className = '' }: PlateProps) {
  const lvl = normalizeLevel(level)
  const cls = lvl === 'top_rated' ? 'plate plate--release' : lvl === 'new' ? 'plate plate--paper' : 'plate'
  return (
    <span className={`${cls} t-plate ${className}`}>
      {lvl === 'top_rated' ? <span className="lamp lamp--release" aria-hidden="true" /> : null}
      {LEVEL_LABEL[lvl]}
    </span>
  )
}
