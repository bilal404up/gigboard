import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        mahogany: { DEFAULT: '#4B2320', raised: '#5E2F2A', deep: '#2E1414' },
        laminate: { DEFAULT: '#EFE9DF', raised: '#F7F3EA', sunk: '#E4DCCF' },
        ink: { DEFAULT: '#1A1412', muted: '#5C524C', subtle: '#6E6256', faint: '#B9AFA4' },
        sand: { DEFAULT: '#D9C9B4', light: '#E8DDCD' },
        brass: { DEFAULT: '#C9A24A', deep: '#7A5A14', light: '#E7C978', tint: '#F6EBCF' },
        release: { DEFAULT: '#1FC77A', deep: '#0B6B40', tint: '#D9F3E6' },
        alarm: { DEFAULT: '#B8281C', tint: '#F6E1DE' },
        enamel: { teal: '#0E5E57', vermilion: '#C8331F', mustard: '#D9A531', cobalt: '#2D4FA8', plum: '#6A2C70' },

        // legacy aliases so untouched pages still belong to the new world
        brand: {
          primary: '#4B2320',
          'primary-dark': '#2E1414',
          'primary-50': '#E4DCCF',
          'primary-100': '#D9C9B4',
          accent: '#C9A24A',
          'accent-dark': '#7A5A14',
          'accent-50': '#F6EBCF',
        },
        canvas: { DEFAULT: '#F7F3EA', subtle: '#E4DCCF', raised: '#F7F3EA', board: '#2E1414' },
        line: { DEFAULT: '#D9C9B4', subtle: '#E8DDCD', strong: '#1A1412' },
        success: '#0B6B40',
        warning: '#7A5A14',
        error: '#B8281C',
        info: '#2D4FA8',
        seller: { new: '#6E6256', 'level-one': '#0E5E57', 'level-two': '#7A5A14', 'top-rated': '#0B6B40' },
      },

      fontFamily: {
        sans: ['var(--font-body)', 'system-ui', 'sans-serif'],
        body: ['var(--font-body)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
        heading: ['var(--font-display)', 'system-ui', 'sans-serif'],
      },

      fontSize: {
        'sign-xl': ['6rem', { lineHeight: '0.95', letterSpacing: '-0.01em', fontWeight: '800' }],
        sign: ['2.75rem', { lineHeight: '1', letterSpacing: '-0.01em', fontWeight: '700' }],
        head: ['1.375rem', { lineHeight: '1.2', fontWeight: '700' }],
        micro: ['0.8125rem', { lineHeight: '1.4' }],
        price: ['1.75rem', { lineHeight: '1', fontWeight: '700' }],
        'price-xl': ['3rem', { lineHeight: '1', fontWeight: '700' }],
      },

      borderRadius: { rail: '2px', tray: '10px', drawer: '14px', pill: '999px' },

      boxShadow: {
        rim: 'inset 0 0 0 1.5px #C9A24A',
        tray: '0 1px 0 #D5CBBD, 0 6px 0 -2px #E4DCCF',
        'tray-lift': '0 1px 0 #D5CBBD, 0 14px 0 -6px #E4DCCF, 0 18px 24px -14px rgba(26, 20, 18, 0.5)',
        drawer: '0 2px 0 #2E1414, 0 10px 0 -4px #2E1414',
        plate: '0 1px 0 #7A5A14, inset 0 1px 0 #E7C978',
        lamp: '0 0 0 3px rgba(31, 199, 122, 0.25), 0 0 14px rgba(31, 199, 122, 0.6)',
        field: 'inset 0 -2px 0 #4B2320',
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
