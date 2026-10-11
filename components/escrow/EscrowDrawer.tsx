import type { CSSProperties, ReactNode } from 'react'

export type EscrowState = 'held' | 'delivered' | 'approved' | 'cancelled' | 'disputed'

type Props = {
  state: EscrowState
  /** formatted amount shown on the drawer lid, e.g. "$120.00" */
  amount?: string
  size?: 'sm' | 'md' | 'xl'
  /** hero only, with state "held": the once-only 3.2s sequence, ends on Approved */
  play?: boolean
  captions?: boolean
  /** short line beside the compact object */
  note?: ReactNode
  className?: string
}

const STEPS = [
  { key: 'held', title: 'Held', body: 'Your payment is under the glass. The seller cannot take it out until you approve.' },
  { key: 'delivered', title: 'Delivered', body: 'The work is in the drawer. Check it against the brief.' },
  { key: 'approved', title: 'Approved', body: 'You said it is good, so the drawer slides across to the seller.' },
] as const

const STATUS: Record<EscrowState, { title: string; body: string }> = {
  held: STEPS[0],
  delivered: STEPS[1],
  approved: STEPS[2],
  cancelled: { title: 'Cancelled', body: 'The drawer came back to you. Nothing was paid out.' },
  disputed: { title: 'Disputed', body: 'The drawer stays under the glass until the dispute is resolved.' },
}

/* drawer position, lid travel, parcel visibility and which station lamps are lit, per state */
const POS: Record<EscrowState, { dx: number; sm: number; lid: number; parcel: 0 | 1; lamps: [boolean, boolean, boolean] }> = {
  held: { dx: 320, sm: 120, lid: 0, parcel: 0, lamps: [true, false, false] },
  delivered: { dx: 320, sm: 120, lid: 0, parcel: 1, lamps: [true, true, false] },
  approved: { dx: 520, sm: 200, lid: 64, parcel: 1, lamps: [true, true, true] },
  cancelled: { dx: 120, sm: 40, lid: 0, parcel: 0, lamps: [true, false, false] },
  disputed: { dx: 320, sm: 120, lid: 0, parcel: 1, lamps: [true, true, false] },
}

const GRILLE = [
  [0, 0], [0, -11], [0, 11], [-11, 0], [11, 0], [-8, -8], [8, -8], [-8, 8], [8, 8],
  [0, -22], [0, 22], [-22, 0], [22, 0], [-16, -16], [16, -16], [-16, 16], [16, 16],
]

function label(state: EscrowState, amount?: string) {
  const s = STATUS[state]
  return `Escrow ${s.title.toLowerCase()}${amount ? `, ${amount}` : ''}. ${s.body}`
}

export function EscrowDrawer({ state, amount, size = 'md', play = false, captions = true, note, className = '' }: Props) {
  const pos = POS[state]
  const disputed = state === 'disputed'
  const current = state === 'held' || state === 'delivered' || state === 'approved' ? state : null
  const vars = { '--dx': size === 'sm' ? pos.sm : pos.dx, '--lid': pos.lid, '--parcel': pos.parcel } as CSSProperties
  const on = (i: number) => (pos.lamps[i] ? 'true' : 'false')

  if (size === 'sm') {
    return (
      <div className={`escrow escrow--sm flex items-center gap-3 ${className}`} data-state={state} style={vars}>
        <svg viewBox="0 0 240 56" role="img" aria-label={label(state, amount)} className="esc-svg shrink-0" style={{ width: 150 }}>
          <defs>
            <linearGradient id="esc-brass-sm" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor="#E7C978" />
              <stop offset="1" stopColor="#7A5A14" />
            </linearGradient>
          </defs>
          <rect x="0" y="0" width="240" height="56" rx="8" fill="var(--c-mahogany-deep)" />
          <rect x="88" y="6" width="64" height="26" rx="5" fill="none" stroke="var(--c-laminate)" strokeOpacity="0.3" strokeWidth="1.5" />
          <rect x="12" y="40" width="216" height="5" rx="2" fill="url(#esc-brass-sm)" />
          {[40, 120, 200].map((x, i) => (
            <g key={x}>
              <circle cx={x} cy="50" r="2.5" fill="var(--c-brass-deep)" />
              <circle cx={x} cy="50" r="2.5" fill={i === 2 ? 'var(--c-release)' : disputed && i === 1 ? 'var(--c-alarm)' : 'var(--c-brass-light)'} className="esc-lit" data-on={on(i)} />
            </g>
          ))}
          <g className="esc-drawer">
            <rect x="-26" y="22" width="52" height="18" rx="4" fill="var(--c-mahogany)" stroke="var(--c-brass-deep)" strokeWidth="1.5" />
            <rect x="-18" y="26" width="26" height="9" rx="1.5" fill="var(--c-laminate)" />
            <rect x="-18" y="29" width="26" height="2" fill="var(--c-release)" />
            <g className="esc-parcel">
              <rect x="-24" y="12" width="20" height="12" rx="2" fill="var(--c-laminate-raised)" />
              <path d="M-24 14l10 6 10-6" fill="none" stroke="var(--c-mahogany-deep)" strokeWidth="1.2" />
            </g>
            <rect className="esc-lid" x="-28" y="19" width="56" height="4" rx="2" fill="url(#esc-brass-sm)" />
          </g>
        </svg>
        {note ? <div className="t-small min-w-0">{note}</div> : null}
      </div>
    )
  }

  return (
    <div className={`escrow ${play && state === 'held' ? 'escrow--play' : ''} ${className}`} data-state={state} style={vars}>
      <svg viewBox="0 0 640 250" role="img" aria-label={label(state, amount)} className="esc-svg">
        <defs>
          <linearGradient id="esc-brass" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#E7C978" />
            <stop offset="0.45" stopColor="#C9A24A" />
            <stop offset="1" stopColor="#7A5A14" />
          </linearGradient>
          <linearGradient id="esc-wall" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#2E1414" />
            <stop offset="1" stopColor="#1F0D0D" />
          </linearGradient>
        </defs>

        <rect x="0" y="0" width="640" height="250" rx="18" fill="url(#esc-wall)" />

        <g>
          <rect x="214" y="16" width="212" height="100" rx="10" fill="none" stroke="var(--c-laminate)" strokeOpacity="0.32" strokeWidth="2" />
          <path d="M236 106 L286 26" stroke="var(--c-laminate)" strokeOpacity="0.22" strokeWidth="3" strokeLinecap="round" />
          <path d="M256 110 L306 30" stroke="var(--c-laminate)" strokeOpacity="0.1" strokeWidth="9" strokeLinecap="round" />
          {GRILLE.map(([dx, dy]) => (
            <circle key={`${dx}${dy}`} cx={320 + dx} cy={62 + dy} r="2.6" fill="#120707" />
          ))}
        </g>

        <g fill="var(--c-sand)" fontFamily="var(--font-body), system-ui, sans-serif" fontSize="13" fontWeight="600" textAnchor="middle">
          <text x="120" y="236">You</text>
          <text x="320" y="236">Under the glass</text>
          <text x="520" y="236">Seller</text>
        </g>

        <rect x="24" y="190" width="592" height="12" rx="4" fill="url(#esc-brass)" />
        <rect x="24" y="202" width="592" height="5" rx="2" fill="var(--c-brass-deep)" />

        {[120, 320, 520].map((x, i) => {
          const alarm = disputed && i === 1
          const colour = i === 2 ? 'var(--c-release)' : alarm ? 'var(--c-alarm)' : 'var(--c-brass-light)'
          return (
            <g key={x}>
              <circle cx={x} cy="214" r="5" fill="var(--c-brass-deep)" />
              <circle cx={x} cy="214" r="5" fill={colour} className={`esc-lit esc-lit-${i + 1}`} data-on={on(i)} />
              {i === 2 || alarm ? <circle cx={x} cy="214" r="9" fill={colour} opacity="0.25" className={`esc-lit esc-lit-${i + 1}`} data-on={on(i)} /> : null}
            </g>
          )
        })}

        <g className="esc-drawer">
          <rect x="-80" y="122" width="160" height="68" rx="9" fill="var(--c-mahogany)" stroke="var(--c-brass-deep)" strokeWidth="2" />
          <rect x="-80" y="122" width="160" height="68" rx="9" fill="none" stroke="var(--c-brass-light)" strokeOpacity="0.25" strokeWidth="1" />
          <g className="esc-notes">
            <rect x="8" y="150" width="58" height="28" rx="3" fill="var(--c-laminate-sunk)" />
            <rect x="12" y="146" width="58" height="28" rx="3" fill="var(--c-laminate)" />
            <rect x="12" y="156" width="58" height="6" fill="var(--c-release)" opacity="0.9" />
            <circle cx="41" cy="159" r="5" fill="var(--c-laminate)" />
          </g>
          <g className="esc-parcel">
            <rect x="-66" y="146" width="62" height="34" rx="3" fill="var(--c-laminate-raised)" />
            <path d="M-66 150 L-35 170 L-4 150" fill="none" stroke="var(--c-mahogany-deep)" strokeWidth="2" strokeLinejoin="round" />
            <rect x="-66" y="146" width="62" height="34" rx="3" fill="none" stroke="var(--c-mahogany-deep)" strokeOpacity="0.5" strokeWidth="1" />
          </g>
          <g className="esc-lid">
            <rect x="-82" y="112" width="164" height="18" rx="4" fill="url(#esc-brass)" />
            <text x="0" y="125" textAnchor="middle" fill="var(--c-ink)" fontFamily="var(--font-mono), ui-monospace, monospace" fontSize="13" fontWeight="700">
              {amount ?? 'Held'}
            </text>
          </g>
          <rect x="-20" y="180" width="40" height="6" rx="3" fill="url(#esc-brass)" />
        </g>
      </svg>

      {captions ? (
        <>
          <ol className="esc-steps list-none p-0 m-0" aria-label="Escrow steps">
            {STEPS.map((s) => (
              <li key={s.key} className="esc-step" aria-current={s.key === current ? 'step' : undefined}>
                <p className="t-plate">{s.title}</p>
                {size === 'xl' ? <p className="t-small mt-1 max-w-[26ch]">{s.body}</p> : null}
              </li>
            ))}
          </ol>
          {!current ? (
            <p className={`mt-3 inline-flex items-center gap-2 text-sm ${disputed ? 'text-laminate' : 'text-sand'}`}>
              <span className={`lamp ${disputed ? 'lamp--alarm' : ''}`} aria-hidden="true" />
              <span className="font-semibold">{STATUS[state].title}.</span> {STATUS[state].body}
            </p>
          ) : null}
        </>
      ) : null}
    </div>
  )
}
