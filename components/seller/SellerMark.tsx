import { hash } from '@/components/gig/GigArt'

export type SellerLevel = 'new' | 'level_one' | 'level_two' | 'top_rated'

const LIGHTS = ['#E7C978', '#F7F3EA', '#F2B8A2', '#9FE3C4']

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

/* A lit window sign: nine lamps, some on, in the seller's own light. The frame says the level. */
export function SellerMark({ username, level, size = 40, label, className = '' }: MarkProps) {
  const h = hash(username)
  const lvl = normalizeLevel(level)
  const light = LIGHTS[h % LIGHTS.length]
  let bits = (h >>> 3) & 0x1ff
  if ((bits & (bits - 1)) === 0 || bits === 0x1ff) bits ^= 0x0a5
  const pad = size * 0.16
  const step = (size - pad * 2) / 3
  const r = step * 0.3
  const ring =
    lvl === 'top_rated' ? { stroke: '#C9A24A', width: 2.5 }
    : lvl === 'level_two' ? { stroke: '#C9A24A', width: 2 }
    : lvl === 'level_one' ? { stroke: '#0E5E57', width: 2 }
    : { stroke: 'rgba(239, 233, 223, 0.5)', width: 1.5 }

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      role="img"
      aria-label={label ?? `${username}, ${LEVEL_LABEL[lvl]} seller`}
      className={`shrink-0 ${className}`}
    >
      <rect x="0" y="0" width={size} height={size} rx={size * 0.22} fill="#2E1414" />
      <rect x={ring.width / 2} y={ring.width / 2} width={size - ring.width} height={size - ring.width} rx={size * 0.22 - ring.width / 2} fill="none" stroke={ring.stroke} strokeWidth={ring.width} />
      {Array.from({ length: 9 }, (_, i) => {
        const on = (bits >> i) & 1
        const cx = pad + step * (i % 3) + step / 2
        const cy = pad + step * Math.floor(i / 3) + step / 2
        return <circle key={i} cx={cx} cy={cy} r={r} fill={on ? light : 'rgba(255, 255, 255, 0.12)'} />
      })}
      {lvl === 'top_rated' ? <circle cx={size - size * 0.16} cy={size * 0.16} r={size * 0.09} fill="#1FC77A" stroke="#2E1414" strokeWidth="1.5" /> : null}
    </svg>
  )
}

type PlateProps = { level?: string | null; className?: string }

/* Level as a plate material: paper, enamel, brass, brass with the open lamp. */
export function LevelPlate({ level, className = '' }: PlateProps) {
  const lvl = normalizeLevel(level)
  const cls = lvl === 'level_one' ? 'plate plate--enamel' : lvl === 'new' ? 'plate plate--paper' : 'plate'
  return (
    <span className={`${cls} t-plate ${className}`}>
      {lvl === 'top_rated' ? <span className="lamp lamp--release" aria-hidden="true" /> : null}
      {LEVEL_LABEL[lvl]}
    </span>
  )
}
