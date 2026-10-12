import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Old names, new values: every page that uses them moves to the new palette.
        mahogany: { DEFAULT: '#16181B', raised: '#25282D', deep: '#0C0D0F' },
        laminate: { DEFAULT: '#F7F7F4', raised: '#FFFFFF', sunk: '#EFEFEB' },
        ink: { DEFAULT: '#121417', muted: '#565B63', subtle: '#686D75', faint: '#C5C8CD' },
        sand: { DEFAULT: '#DCDDE0', light: '#ECEDEF' },
        brass: { DEFAULT: '#E5F2EA', deep: '#106F44', light: '#F2F8F4', tint: '#E5F2EA' },
        release: { DEFAULT: '#2BB673', deep: '#0C5C37', tint: '#E5F2EA' },
        alarm: { DEFAULT: '#B42318', tint: '#FCEBE9' },
        enamel: { teal: '#2F5D62', vermilion: '#9A3B2E', mustard: '#6E6230', cobalt: '#2F4A80', plum: '#5B3F6E' },

        brand: {
          primary: '#16181B',
          'primary-dark': '#0C0D0F',
          'primary-50': '#EFEFEB',
          'primary-100': '#DCDDE0',
          accent: '#106F44',
          'accent-dark': '#0C5C37',
          'accent-50': '#E5F2EA',
        },
        canvas: { DEFAULT: '#FFFFFF', subtle: '#EFEFEB', raised: '#FFFFFF', board: '#0E0F11' },
        line: { DEFAULT: '#E3E4E6', subtle: '#EEEFF1', strong: '#121417' },
        success: '#0C5C37',
        warning: '#7A5A14',
        error: '#B42318',
        info: '#2F4A80',
        seller: { new: '#686D75', 'level-one': '#2F5D62', 'level-two': '#4A4F57', 'top-rated': '#0C5C37' },
      },

      fontFamily: {
        sans: ['var(--font-body)', 'system-ui', 'sans-serif'],
        body: ['var(--font-body)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
        heading: ['var(--font-display)', 'system-ui', 'sans-serif'],
      },

      fontSize: {
        'sign-xl': ['4.5rem', { lineHeight: '1', letterSpacing: '-0.035em', fontWeight: '700' }],
        sign: ['2.5rem', { lineHeight: '1.08', letterSpacing: '-0.03em', fontWeight: '700' }],
        head: ['1.375rem', { lineHeight: '1.2', fontWeight: '700' }],
        micro: ['0.8125rem', { lineHeight: '1.4' }],
        price: ['1.75rem', { lineHeight: '1', fontWeight: '700' }],
        'price-xl': ['3rem', { lineHeight: '1', fontWeight: '700' }],
      },

      borderRadius: { rail: '2px', tray: '14px', drawer: '16px', pill: '999px' },

      boxShadow: {
        rim: 'inset 0 0 0 1px #E3E4E6',
        tray: '0 0 0 1px #E3E4E6, 0 1px 2px rgba(18, 20, 23, 0.04)',
        'tray-lift': '0 0 0 1px #D5D7DB, 0 14px 30px -16px rgba(18, 20, 23, 0.3)',
        drawer: '0 0 0 1px #E3E4E6, 0 18px 40px -26px rgba(18, 20, 23, 0.35)',
        plate: 'none',
        lamp: '0 0 0 3px rgba(43, 182, 115, 0.25)',
        field: 'inset 0 0 0 1px #8A9096',
      },

      spacing: { demo: 'var(--demo-h)', header: 'var(--header-h)' },
      maxWidth: { wrap: '80rem', copy: '62ch' },
      minHeight: { tap: '44px' },
      zIndex: { sticky: '10', header: '30', demo: '40', scrim: '50', sheet: '60', toast: '70' },
      transitionTimingFunction: { out: 'cubic-bezier(0.2, 0.7, 0.2, 1)', slide: 'cubic-bezier(0.3, 0.9, 0.3, 1)' },
      transitionDuration: { 120: '120ms', 200: '200ms', 280: '280ms' },
      gridTemplateColumns: { gig: 'minmax(0, 1fr) 22rem', hero: '6fr 7fr' },
    },
  },
  plugins: [require('tailwindcss-animate')],
}

export default config
