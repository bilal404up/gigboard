/* Typographic cover for a gig: the gig's own words on a quiet category tint, with a small category mark.
   Every gig gets a different cover because the words differ. Exports are unchanged. */

export type ArtCategory = 'design' | 'writing' | 'development' | 'mobile' | 'ai' | 'video' | 'audio' | 'marketing' | 'business' | 'other'

type Props = {
  seed: string
  category?: string | null
  className?: string
  title?: string
  cover?: boolean
  /** Words to print on the cover. Defaults to words taken from a slug-style seed. */
  text?: string
}

const TINT: Record<ArtCategory, string> = {
  development: '#E9EEF5',
  mobile: '#E7EFF2',
  design: '#F1EBF3',
  ai: '#ECF2EA',
  marketing: '#F5ECE7',
  business: '#EDEEF0',
  writing: '#F2EFE6',
  video: '#EEEAF4',
  audio: '#E9F0EF',
  other: '#EDEEF0',
}

const NAME: Record<ArtCategory, string> = {
  development: 'Web development',
  mobile: 'Mobile',
  design: 'Design',
  ai: 'AI and automation',
  marketing: 'Marketing',
  business: 'Business support',
  writing: 'Writing',
  video: 'Video',
  audio: 'Audio',
  other: 'Gig',
}

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

/** "i-will-design-a-logo-that-still-reads-at-16px-fb6n" becomes "Design a logo that still reads at 16px". */
function coverText(seed: string): string | null {
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-/i.test(seed)) return null // a uuid, not a slug
  if (!/^[a-z0-9]+(?:-[a-z0-9]+){2,}$/.test(seed)) return null
  let parts = seed.split('-')
  if (parts[0] === 'i' && parts[1] === 'will') parts = parts.slice(2)
  if (parts.length >= 3 && parts[parts.length - 1].length === 4) parts = parts.slice(0, -1)
  const s = parts.join(' ')
  return s ? s[0].toUpperCase() + s.slice(1) : null
}

function Glyph({ category, rot, fg }: { category: ArtCategory; rot: number; fg: string }) {
  const solid = { fill: fg, stroke: 'none' as const }
  const line = { fill: 'none' as const, stroke: fg, strokeWidth: 14, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }
  const g = (() => {
    switch (category) {
      case 'design':
        return (
          <>
            <circle cx="-40" cy="10" r="52" {...solid} opacity="0.9" />
            <circle cx="30" cy="-20" r="52" {...solid} opacity="0.55" />
          </>
        )
      case 'writing':
        return (
          <>
            <rect x="-90" y="-62" width="180" height="22" rx="11" {...solid} />
            <rect x="-90" y="-18" width="130" height="22" rx="11" {...solid} />
            <rect x="-90" y="26" width="160" height="22" rx="11" {...solid} />
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
          </>
        )
      case 'audio':
        return (
          <>
            <path d="M-60 -70 A100 100 0 0 1 -60 70" {...line} />
            <path d="M-20 -46 A62 62 0 0 1 -20 46" {...line} />
            <path d="M20 -22 A30 30 0 0 1 20 22" {...line} />
          </>
        )
      case 'marketing':
        return (
          <>
            <rect x="-104" y="26" width="44" height="48" rx="6" {...solid} />
            <rect x="-48" y="-8" width="44" height="82" rx="6" {...solid} />
            <rect x="8" y="-42" width="44" height="116" rx="6" {...solid} />
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
        return <path d="M0 -84 L84 0 L0 84 L-84 0 Z" {...solid} />
    }
  })()
  return <g transform={`rotate(${rot})`}>{g}</g>
}

export function GigArt({ seed, category, className = '', title, cover = false, text }: Props) {
  const cat = categoryOf(category)
  const words = text ?? coverText(seed)
  const rot = [-6, 0, 6][hash(seed) % 3]

  return (
    <div
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      className={`relative w-full overflow-hidden [container-type:inline-size] ${cover ? 'h-full' : 'aspect-[4/3]'} ${className}`}
      style={{ background: TINT[cat] }}
    >
      <svg viewBox="-120 -120 240 240" className="absolute right-[7%] top-[9%] w-[22%]" aria-hidden="true" focusable="false">
        <Glyph category={cat} rot={rot} fg="#121417" />
      </svg>
      {words ? (
        <>
          <span className="absolute left-[7%] top-[9%] max-w-[60%] truncate text-[length:max(9px,4.6cqw)] font-semibold text-[#565B63]">{NAME[cat]}</span>
          <span className="absolute bottom-[8%] left-[7%] right-[7%] line-clamp-3 text-[length:max(10px,8.4cqw)] font-bold leading-[1.05] tracking-[-0.02em] text-[#121417]">
            {words}
          </span>
        </>
      ) : (
        <span className="absolute bottom-[9%] left-[7%] right-[7%] text-[length:max(14px,11cqw)] font-bold leading-none tracking-[-0.03em] text-[#121417]">{NAME[cat]}</span>
      )}
    </div>
  )
}
