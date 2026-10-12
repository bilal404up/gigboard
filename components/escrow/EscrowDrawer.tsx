import type { CSSProperties, ReactNode } from 'react'

export type EscrowState = 'held' | 'delivered' | 'approved' | 'cancelled' | 'disputed'

type Props = {
  state: EscrowState
  /** formatted amount shown on the tray lid, e.g. "$120.00" */
  amount?: string
  size?: 'sm' | 'md' | 'xl'
  /** hero only, with state "held": the once-only 3.2s sequence, ends on Approved */
  play?: boolean
  captions?: boolean
  /** short line beside the compact version */
  note?: ReactNode
  className?: string
}

const STEPS = [
  { key: 'held', title: 'Held', body: 'Your payment is held by Gigboard. The seller can see it but cannot take it until you approve.' },
  { key: 'delivered', title: 'Delivered', body: 'The work has arrived. Check it against your brief.' },
  { key: 'approved', title: 'Approved', body: 'You said it is good, so the payment was released to the seller.' },
] as const

const STATUS: Record<EscrowState, { title: string; body: string }> = {
  held: STEPS[0],
  delivered: STEPS[1],
  approved: STEPS[2],
  cancelled: { title: 'Cancelled', body: 'The payment came back to you. Nothing was paid out.' },
  disputed: { title: 'Disputed', body: 'The payment stays held until the dispute is resolved.' },
}

/* tray position, lid travel, parcel visibility and which station dots are lit, per state */
const POS: Record<EscrowState, { dx: number; sm: number; lid: number; parcel: 0 | 1; lamps: [boolean, boolean, boolean] }> = {
  held: { dx: 320, sm: 120, lid: 0, parcel: 0, lamps: [true, false, false] },
  delivered: { dx: 320, sm: 120, lid: 0, parcel: 1, lamps: [true, true, false] },
  approved: { dx: 520, sm: 200, lid: 64, parcel: 1, lamps: [true, true, true] },
  cancelled: { dx: 120, sm: 40, lid: 0, parcel: 0, lamps: [true, false, false] },
  disputed: { dx: 320, sm: 120, lid: 0, parcel: 1, lamps: [true, true, false] },
}

const C = {
  panel: '#F7F7F4',
  zone: '#EEF7F2',
  zoneEdge: '#9FD3B9',
  zoneInk: '#0C5C37',
  track: '#DCDDE0',
  off: '#C5C8CD',
  ink: '#121417',
  muted: '#565B63',
  white: '#FFFFFF',
  lit: '#2BB673',
  tint: '#E5F2EA',
  alarm: '#B42318',
}

const FONT: CSSProperties = { fontFamily: 'var(--font-body), system-ui, sans-serif' }

function label(state: EscrowState, amount?: string) {
  const s = STATUS[state]
  return `Payment ${s.title.toLowerCase()}${amount ? `, ${amount}` : ''}. ${s.body}`
}

function dot(i: number, disputed: boolean) {
  if (i === 2) return C.lit
  if (disputed && i === 1) return C.alarm
  return C.ink
}

export function EscrowDrawer({ state, amount, size = 'md', play = false, captions = true, note, className = '' }: Props) {
  const pos = POS[state]
  const disputed = state === 'disputed'
  const current = state === 'held' || state === 'delivered' || state === 'approved' ? state : null
  const vars = { '--dx': size === 'sm' ? pos.sm : pos.dx, '--lid': pos.lid, '--parcel': pos.parcel } as CSSProperties
  const on = (i: number) => (pos.lamps[i] ? 'true' : 'false')

  if (size === 'sm') {
    return (
      <div className={`escrow escrow--sm flex items-center gap-3 text-ink ${className}`} data-state={state} style={vars}>
        <svg viewBox="0 0 240 56" role="img" aria-label={label(state, amount)} className="esc-svg shrink-0" style={{ width: 150 }}>
          <rect x="0" y="0" width="240" height="56" rx="8" fill={C.panel} />
          <rect x="88" y="6" width="64" height="36" rx="6" fill={C.zone} stroke={C.zoneEdge} strokeWidth="1.2" strokeDasharray="4 3" />
          <rect x="12" y="42" width="216" height="3" rx="1.5" fill={C.track} />
          {[40, 120, 200].map((x, i) => (
            <g key={x}>
              <circle cx={x} cy="50" r="2.5" fill={C.off} />
              <circle cx={x} cy="50" r="2.5" fill={dot(i, disputed)} className="esc-lit" data-on={on(i)} />
            </g>
          ))}
          <g className="esc-drawer">
            <rect x="-26" y="22" width="52" height="18" rx="4" fill={C.white} stroke={C.off} strokeWidth="1.2" />
            <rect x="-18" y="26" width="26" height="9" rx="1.5" fill={C.tint} stroke={C.lit} strokeWidth="0.8" />
            <rect x="-18" y="29" width="26" height="2" fill={C.lit} />
            <g className="esc-parcel">
              <rect x="-24" y="12" width="20" height="12" rx="2" fill={C.white} stroke={C.ink} strokeWidth="1" />
              <path d="M-24 14l10 6 10-6" fill="none" stroke={C.ink} strokeWidth="1" />
            </g>
            <rect className="esc-lid" x="-28" y="19" width="56" height="4" rx="2" fill={C.ink} />
          </g>
        </svg>
        {note ? <div className="t-small min-w-0">{note}</div> : null}
      </div>
    )
  }

  return (
    <div className={`escrow text-ink ${play && state === 'held' ? 'escrow--play' : ''} ${className}`} data-state={state} style={vars}>
      <svg viewBox="0 0 640 250" role="img" aria-label={label(state, amount)} className="esc-svg">
        <rect x="0" y="0" width="640" height="250" rx="16" fill={C.panel} />

        <rect x="214" y="16" width="212" height="170" rx="12" fill={C.zone} stroke={C.zoneEdge} strokeWidth="1.5" strokeDasharray="6 5" />
        <text x="320" y="40" textAnchor="middle" fill={C.zoneInk} fontSize="13" fontWeight="600" style={FONT}>
          Held by Gigboard
        </text>

        <g fill={C.muted} fontSize="13" fontWeight="600" textAnchor="middle" style={FONT}>
          <text x="120" y="236">You</text>
          <text x="320" y="236">Held</text>
          <text x="520" y="236">Seller</text>
        </g>

        <rect x="24" y="190" width="592" height="4" rx="2" fill={C.track} />

        {[120, 320, 520].map((x, i) => {
          const colour = dot(i, disputed)
          const glow = i === 2 || (disputed && i === 1)
          return (
            <g key={x}>
              <circle cx={x} cy="212" r="5" fill={C.off} />
              <circle cx={x} cy="212" r="5" fill={colour} className={`esc-lit esc-lit-${i + 1}`} data-on={on(i)} />
              {glow ? <circle cx={x} cy="212" r="9" fill={colour} opacity="0.2" className={`esc-lit esc-lit-${i + 1}`} data-on={on(i)} /> : null}
            </g>
          )
        })}

        <g className="esc-drawer">
          <rect x="-80" y="122" width="160" height="68" rx="10" fill={C.white} stroke={C.off} strokeWidth="1.5" />
          <g className="esc-notes">
            <rect x="8" y="146" width="58" height="30" rx="4" fill={C.tint} stroke={C.lit} strokeWidth="1.5" />
            <rect x="8" y="156" width="58" height="6" fill={C.lit} />
          </g>
          <g className="esc-parcel">
            <rect x="-66" y="146" width="62" height="34" rx="3" fill={C.white} stroke={C.ink} strokeWidth="1.5" />
            <path d="M-66 150 L-35 170 L-4 150" fill="none" stroke={C.ink} strokeWidth="1.5" strokeLinejoin="round" />
          </g>
          <g className="esc-lid">
            <rect x="-82" y="112" width="164" height="18" rx="5" fill={C.ink} />
            <text x="0" y="125" textAnchor="middle" fill={C.white} fontSize="13" fontWeight="700" style={{ ...FONT, fontVariantNumeric: 'tabular-nums' }}>
              {amount ?? 'Held'}
            </text>
          </g>
          <rect x="-20" y="181" width="40" height="5" rx="2.5" fill={C.off} />
        </g>
      </svg>

      {captions ? (
        <>
          <ol className="esc-steps m-0 list-none p-0" aria-label="Payment steps">
            {STEPS.map((s) => (
              <li key={s.key} className="esc-step" aria-current={s.key === current ? 'step' : undefined}>
                <p className="t-plate">{s.title}</p>
                {size === 'xl' ? <p className="t-small mt-1 max-w-[26ch]">{s.body}</p> : null}
              </li>
            ))}
          </ol>
          {!current ? (
            <p className={`mt-3 inline-flex items-center gap-2 text-sm ${disputed ? 'text-alarm' : 'text-ink-muted'}`}>
              <span className={`lamp ${disputed ? 'lamp--alarm' : ''}`} aria-hidden="true" />
              <span className="font-semibold">{STATUS[state].title}.</span> {STATUS[state].body}
            </p>
          ) : null}
        </>
      ) : null}
    </div>
  )
}
