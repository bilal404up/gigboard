/* Generative enamel sign for a gig. The field colour is fixed per category, the pattern and glyph pose come from the seed. */

export type ArtCategory = 'design' | 'writing' | 'development' | 'mobile' | 'ai' | 'video' | 'audio' | 'marketing' | 'business' | 'other'

type Props = { seed: string; category?: string | null; className?: string; title?: string; cover?: boolean }

const LAM = '#EFE9DF'
const DEEP = '#2E1414'
const BRASS = '#C9A24A'

const FIELD: Record<ArtCategory, { bg: string; fg: string; shadow: string }> = {
  development: { bg: '#0E5E57', fg: LAM, shadow: DEEP },
  mobile: { bg: '#2D4FA8', fg: LAM, shadow: DEEP },
  design: { bg: '#6A2C70', fg: LAM, shadow: DEEP },
  ai: { bg: '#D9A531', fg: DEEP, shadow: '#7A5A14' },
  marketing: { bg: '#C8331F', fg: LAM, shadow: DEEP },
  business: { bg: '#4B2320', fg: BRASS, shadow: '#120707' },
  writing: { bg: '#0E5E57', fg: LAM, shadow: DEEP },
  video: { bg: '#6A2C70', fg: LAM, shadow: DEEP },
  audio: { bg: '#2D4FA8', fg: LAM, shadow: DEEP },
  other: { bg: '#0E5E57', fg: LAM, shadow: DEEP },
}

const PATTERNS = ['stripes', 'dots', 'checks', 'rules'] as const

export function hash(s: string) {
  let h = 0x811c9dc5
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 0x01000193) >>> 0
  }
  return h
}

export function categoryOf(raw?: string | null): ArtCategory {
  const c = (raw ?? '').toLowerCase()
  if (/mobile|ios|android|\bapp/.test(c)) return 'mobile'
  if (/\bai\b|automation|bot|machine|gpt|llm/.test(c)) return 'ai'
  if (/design|logo|brand|illustr|creative|\bui|\bux/.test(c)) return 'design'
  if (/writ|copy|edit|translat|content/.test(c)) return 'writing'
  if (/video|motion|anim|film/.test(c)) return 'video'
  if (/audio|music|voice|sound|podcast/.test(c)) return 'audio'
  if (/market|seo|ads|social|growth/.test(c)) return 'marketing'
  if (/business|finance|legal|consult|data|admin|support/.test(c)) return 'business'
  if (/dev|code|web|software|program/.test(c)) return 'development'
  return 'other'
}

function Glyph({ category, rot, fg }: { category: ArtCategory; rot: number; fg: string }) {
  const solid = { fill: fg, stroke: 'none' as const }
  const line = { fill: 'none' as const, stroke: fg, strokeWidth: 14, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }
  const g = (() => {
    switch (category) {
      case 'design':
        return (
          <>
            <circle cx="-40" cy="10" r="52" {...solid} opacity="0.92" />
            <circle cx="30" cy="-20" r="52" {...solid} opacity="0.92" />
            <circle cx="10" cy="46" r="34" fill="rgba(0,0,0,0.35)" />
          </>
        )
      case 'writing':
        return (
          <>
            <rect x="-90" y="-62" width="180" height="22" rx="11" {...solid} />
            <rect x="-90" y="-18" width="130" height="22" rx="11" {...solid} />
            <rect x="-90" y="26" width="160" height="22" rx="11" {...solid} />
            <circle cx="70" cy="37" r="14" {...solid} />
          </>
        )
      case 'development':
        return (
          <>
            <path d="M-50 -60 L-100 0 L-50 60" {...line} />
            <path d="M50 -60 L100 0 L50 60" {...line} />
            <path d="M18 -70 L-18 70" {...line} />
          </>
        )
      case 'mobile':
        return (
          <>
            <rect x="-52" y="-92" width="104" height="184" rx="24" fill="none" stroke={fg} strokeWidth="12" />
            <rect x="-34" y="-62" width="68" height="104" rx="6" {...solid} opacity="0.9" />
            <circle cx="0" cy="66" r="9" {...solid} />
          </>
        )
      case 'ai':
        return (
          <>
            <path d="M-70 -40 L0 -70 L70 -30 M0 -70 L-40 50 M-70 -40 L-40 50 L50 60 L70 -30" fill="none" stroke={fg} strokeWidth="8" strokeLinejoin="round" />
            {[
              [-70, -40],
              [0, -70],
              [70, -30],
              [-40, 50],
              [50, 60],
            ].map(([x, y]) => (
              <circle key={`${x}${y}`} cx={x} cy={y} r="17" {...solid} />
            ))}
          </>
        )
      case 'video':
        return (
          <>
            <rect x="-100" y="-66" width="150" height="132" rx="20" {...solid} />
            <path d="M58 -40 L106 -66 L106 66 L58 40 Z" {...solid} />
            <path d="M-34 -16 L-6 0 L-34 16 Z" fill="rgba(0,0,0,0.45)" />
          </>
        )
      case 'audio':
        return (
          <>
            <path d="M-60 -70 A100 100 0 0 1 -60 70" {...line} />
            <path d="M-20 -46 A62 62 0 0 1 -20 46" {...line} />
            <path d="M20 -22 A30 30 0 0 1 20 22" {...line} />
            <circle cx="-96" cy="0" r="16" {...solid} />
          </>
        )
      case 'marketing':
        return (
          <>
            <rect x="-104" y="26" width="44" height="48" rx="6" {...solid} />
            <rect x="-48" y="-8" width="44" height="82" rx="6" {...solid} />
            <rect x="8" y="-42" width="44" height="116" rx="6" {...solid} />
            <circle cx="86" cy="-56" r="18" {...solid} />
          </>
        )
      case 'business':
        return (
          <>
            <circle cx="0" cy="0" r="78" fill="none" stroke={fg} strokeWidth="18" />
            <rect x="-42" y="-10" width="84" height="20" rx="10" {...solid} />
          </>
        )
      default:
        return (
          <>
            <path d="M0 -84 L84 0 L0 84 L-84 0 Z" {...solid} />
            <circle cx="0" cy="0" r="22" fill="rgba(0,0,0,0.4)" />
          </>
        )
    }
  })()
  return <g transform={`rotate(${rot})`}>{g}</g>
}

export function GigArt({ seed, category, className = '', title, cover = false }: Props) {
  const h = hash(seed)
  const cat = categoryOf(category)
  const { bg, fg, shadow } = FIELD[cat]
  const pattern = PATTERNS[(h >>> 4) % PATTERNS.length]
  const angle = [0, 45, 90, 135][(h >>> 8) % 4]
  const rot = [-8, -4, 0, 4, 8][(h >>> 12) % 5]
  const ox = 180 + ((h >>> 16) % 80)
  const oy = 140 + ((h >>> 20) % 40)
  const pid = `art-${h.toString(36)}`

  return (
    <svg
      viewBox="0 0 400 300"
      preserveAspectRatio={cover ? 'xMidYMid slice' : 'xMidYMid meet'}
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : 'true'}
      focusable="false"
      className={`block w-full ${cover ? 'h-full' : 'h-auto'} ${className}`}
    >
      <defs>
        <pattern id={pid} width="24" height="24" patternUnits="userSpaceOnUse" patternTransform={`rotate(${angle})`}>
          {pattern === 'stripes' ? <rect x="0" y="0" width="24" height="9" fill={fg} /> : null}
          {pattern === 'dots' ? <circle cx="12" cy="12" r="4" fill={fg} /> : null}
          {pattern === 'checks' ? (
            <>
              <rect x="0" y="0" width="12" height="12" fill={fg} />
              <rect x="12" y="12" width="12" height="12" fill={fg} />
            </>
          ) : null}
          {pattern === 'rules' ? <rect x="0" y="0" width="24" height="2.5" fill={fg} /> : null}
        </pattern>
      </defs>
      <rect x="0" y="0" width="400" height="300" rx="10" fill={bg} />
      <rect x="0" y="0" width="400" height="300" rx="10" fill={`url(#${pid})`} opacity="0.12" />
      <rect x="8" y="8" width="384" height="284" rx="7" fill="none" stroke={fg} strokeOpacity="0.5" strokeWidth="2" />
      <g transform={`translate(${ox + 6} ${oy + 8})`} opacity="0.35">
        <Glyph category={cat} rot={rot} fg={shadow} />
      </g>
      <g transform={`translate(${ox} ${oy})`}>
        <Glyph category={cat} rot={rot} fg={fg} />
      </g>
    </svg>
  )
}
