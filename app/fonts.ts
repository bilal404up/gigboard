import { Anybody, Albert_Sans, JetBrains_Mono } from 'next/font/google'

/* Anybody: variable, wdth 50 to 150 and wght. Set wide for signage. */
export const display = Anybody({
  subsets: ['latin'],
  axes: ['wdth'],
  display: 'swap',
  variable: '--font-display',
})

/* Albert Sans: variable wght, for everything you read. */
export const body = Albert_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-body',
})

/* JetBrains Mono: variable wght, for money, ids, times. */
export const mono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-mono',
})
