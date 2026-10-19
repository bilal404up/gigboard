import type { Config } from 'tailwindcss'

/*
 * Gigboard "Timetable" tokens.
 * Colour carries meaning: amber (held) is money held by Gigboard, green (go) is money released
 * to a seller, red (stop) is a problem, ink is every action. Nothing else is coloured.
 * The old names (mahogany, laminate, brass, ...) remain as aliases so older markup still
 * compiles; they point at the new values.
 */
const C = {
  page: '#F4F3EF',
  surface: '#FFFFFF',
  sunk: '#ECEAE4',
  line: '#E2E0DA',
  lineStrong: '#C9C6BE',
  ink: '#111113',
  ink2: '#5A5A60',
  ink3: '#8B8B91',
  board: '#0E0E0F',
  flap: '#1B1C1F',
  seam: '#2A2B2F',
  flapText: '#F2EEE3',
  held: '#F5B700',
  heldInk: '#7A5600',
  heldBg: '#FFF3CC',
  go: '#1E9E5A',
  goInk: '#0F5C34',
  goBg: '#E2F3E9',
  stopInk: '#B42318',
  stopBg: '#FCEBE9',
}

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        page: C.page,
        surface: { DEFAULT: C.surface, sunk: C.sunk },
        ink: { DEFAULT: C.ink, 2: C.ink2, 3: C.ink3, muted: C.ink2, subtle: C.ink2, faint: C.lineStrong },
        line: { DEFAULT: C.line, subtle: C.sunk, strong: C.lineStrong },
        board: { DEFAULT: C.board, flap: C.flap, seam: C.seam, text: C.flapText },
        held: { DEFAULT: C.held, ink: C.heldInk, bg: C.heldBg },
        go: { DEFAULT: C.go, ink: C.goInk, bg: C.goBg },
        stop: { DEFAULT: C.stopInk, ink: C.stopInk, bg: C.stopBg },

        // Aliases for older markup
        mahogany: { DEFAULT: C.ink, raised: C.flap, deep: C.board },
        laminate: { DEFAULT: C.page, raised: C.surface, sunk: C.sunk },
        sand: { DEFAULT: C.line, light: C.sunk },
        brass: { DEFAULT: C.goBg, deep: C.goInk, light: C.flapText, tint: C.goBg },
        release: { DEFAULT: C.go, deep: C.goInk, tint: C.goBg },
        alarm: { DEFAULT: C.stopInk, tint: C.stopBg },
        brand: {
          primary: C.ink,
          'primary-dark': C.ink,
          'primary-50': C.sunk,
          'primary-100': C.line,
          accent: C.goInk,
          'accent-dark': C.goInk,
          'accent-50': C.goBg,
        },
        canvas: { DEFAULT: C.surface, subtle: C.sunk, raised: C.surface, board: C.board },
        success: C.goInk,
        warning: C.heldInk,
        error: C.stopInk,
        info: C.ink2,
      },

      fontFamily: {
        sans: ['var(--font-body)', 'system-ui', 'sans-serif'],
        body: ['var(--font-body)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
        heading: ['var(--font-display)', 'system-ui', 'sans-serif'],
      },

      fontSize: {
        '2xs': ['0.75rem', { lineHeight: '1.35' }],
        micro: ['0.8125rem', { lineHeight: '1.4' }],
      },

      borderRadius: { flap: '3px', control: '8px', panel: '12px', board: '16px', rail: '3px', tray: '12px', drawer: '16px', pill: '999px' },

      boxShadow: {
        pop: '0 1px 0 rgba(17,17,19,.04), 0 16px 32px -16px rgba(17,17,19,.24)',
        hairline: `inset 0 0 0 1px ${C.line}`,
        rim: `inset 0 0 0 1px ${C.line}`,
        tray: `0 0 0 1px ${C.line}`,
        'tray-lift': `0 0 0 1px ${C.lineStrong}, 0 1px 0 rgba(17,17,19,.04), 0 16px 32px -16px rgba(17,17,19,.24)`,
        drawer: `0 0 0 1px ${C.line}`,
        plate: 'none',
        field: `inset 0 0 0 1px ${C.lineStrong}`,
      },

      spacing: { demo: 'var(--demo-h)', header: 'var(--header-h)' },
      maxWidth: { wrap: '80rem', copy: '62ch' },
      minHeight: { tap: '44px' },
      zIndex: { sticky: '10', header: '30', demo: '40', scrim: '50', sheet: '60', toast: '70' },
      transitionTimingFunction: { out: 'cubic-bezier(0.2, 0.7, 0.2, 1)', slide: 'cubic-bezier(0.2, 0.7, 0.2, 1)' },
      transitionDuration: { 120: '150ms', 150: '150ms', 200: '200ms', 250: '250ms', 280: '250ms' },
      gridTemplateColumns: { gig: 'minmax(0, 1fr) 24rem', hero: '6fr 7fr' },
    },
  },
  plugins: [require('tailwindcss-animate')],
}

export default config
