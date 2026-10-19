import { hash } from '@/components/gig/GigArt'

export type SellerLevel = 'new' | 'level_one' | 'level_two' | 'top_rated'

const LEVEL_LABEL: Record<SellerLevel, string> = {
  new: 'New seller',
  level_one: 'Level one',
  level_two: 'Level two',
  top_rated: 'Top rated',
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

const TINTS = ['#E7E4DC', '#DEDCD4', '#E9E2D3', '#DCE0DA', '#E4DED8', '#D9DCE0']

/* Fallback mark for anyone without a photo: initials in Geist on a warm grey. */
export function SellerMark({ username, level, size = 40, label, className = '' }: MarkProps) {
  const h = hash(username)
  const lvl = normalizeLevel(level)
  const tint = TINTS[h % TINTS.length]
  const initials = username.replace(/[^a-zA-Z0-9]/g, '').slice(0, 2).toUpperCase() || '?'
  const r = size / 2

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={label ?? `${username}, ${LEVEL_LABEL[lvl].toLowerCase()}`} className={`shrink-0 ${className}`}>
      <circle cx={r} cy={r} r={r} fill={tint} />
      <text x={r} y={r} textAnchor="middle" dominantBaseline="central" fontFamily="var(--font-body), system-ui, sans-serif" fontWeight="600" fontSize={size * 0.36} fill="#111113">
        {initials}
      </text>
    </svg>
  )
}

type PlateProps = { level?: string | null; className?: string }

/*
 * Level tag. A new seller gets no tag at all: stored levels can lag behind a seller's real
 * history (the level job runs on a schedule), and a "New" tag next to hundreds of jobs reads
 * as a contradiction. Earned levels show as a quiet tag; top rated is ink.
 */
export function LevelPlate({ level, className = '' }: PlateProps) {
  const lvl = normalizeLevel(level)
  if (lvl === 'new') return null
  const cls = lvl === 'top_rated' ? 'tag tag--ink tag--plain' : 'tag tag--neutral tag--plain'
  return <span className={`${cls} ${className}`}>{LEVEL_LABEL[lvl]}</span>
}
