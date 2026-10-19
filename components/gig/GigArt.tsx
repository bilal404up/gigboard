/*
 * Ticket-style gig cover, drawn in code (no photos).
 * A dark flap band carries the category and the price in mono, the title sits below in
 * Archivo Expanded on the page colour, and a thin category rule runs along the band.
 * Thumbnails show only the category and price, never shrunken title text.
 */

export type ArtCategory = 'design' | 'writing' | 'development' | 'mobile' | 'ai' | 'video' | 'audio' | 'marketing' | 'business' | 'other'

type Props = {
  seed: string
  category?: string | null
  className?: string
  /** accessible name; when omitted the cover is decorative */
  title?: string
  /** fill the parent instead of keeping 4:3 */
  cover?: boolean
  /** words printed on the cover, usually the gig title */
  text?: string
  /** starting price in dollars, shown in the band */
  price?: number | null
  /** fastest delivery in days */
  days?: number | null
  /** "thumb": category and price only */
  variant?: 'cover' | 'thumb'
}

/* Category rules: muted, so amber, green and red stay reserved for money. */
const RULE: Record<ArtCategory, string> = {
  development: '#4A6489',
  mobile: '#6A5F96',
  design: '#9A5873',
  ai: '#3F7380',
  marketing: '#A4593A',
  business: '#776B5E',
  writing: '#7A6A3A',
  video: '#5D5A8C',
  audio: '#3F7380',
  other: '#776B5E',
}

const NAME: Record<ArtCategory, string> = {
  development: 'Web',
  mobile: 'Mobile',
  design: 'Design',
  ai: 'AI',
  marketing: 'Marketing',
  business: 'Business',
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
  if (/\bai\b|^ai|automation|bot|machine|gpt|llm/.test(c)) return 'ai'
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
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-/i.test(seed)) return null
  if (!/^[a-z0-9]+(?:-[a-z0-9]+){2,}$/.test(seed)) return null
  let parts = seed.split('-')
  if (parts[0] === 'i' && parts[1] === 'will') parts = parts.slice(2)
  if (parts.length >= 3 && parts[parts.length - 1].length === 4) parts = parts.slice(0, -1)
  const s = parts.join(' ')
  return s ? s[0].toUpperCase() + s.slice(1) : null
}

function Cells({ text }: { text: string }) {
  return (
    <span className="ga-cells" aria-hidden="true">
      {Array.from(text.toUpperCase()).map((ch, i) =>
        ch === ' ' ? <span key={i} className="ga-gap" /> : (
          <span key={i} className="ga-cell">
            {ch}
          </span>
        )
      )}
    </span>
  )
}

export function GigArt({ seed, category, className = '', title, cover = false, text, price, days, variant = 'cover' }: Props) {
  const cat = categoryOf(category)
  const words = variant === 'thumb' ? null : (text ?? coverText(seed))
  const priceText = typeof price === 'number' && price > 0 ? `$${Math.round(price)}` : null

  return (
    <div
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      className={`ga ${variant === 'thumb' ? 'ga--thumb' : ''} ${cover ? 'h-full' : 'aspect-[4/3]'} ${className}`}
      style={{ ['--ga-rule' as string]: RULE[cat] }}
    >
      <div className="ga-band">
        <Cells text={NAME[cat]} />
        {priceText ? <span className="ga-price">{variant === 'thumb' ? priceText : `From ${priceText}`}</span> : null}
      </div>
      <div className="ga-body">
        {words ? <span className="ga-title">{words}</span> : <span className="ga-title ga-title--cat">{NAME[cat]}</span>}
        {variant !== 'thumb' && typeof days === 'number' && days > 0 ? (
          <span className="ga-meta">
            Ready in {days} {days === 1 ? 'day' : 'days'}
          </span>
        ) : null}
      </div>
    </div>
  )
}
