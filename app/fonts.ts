import { Archivo } from "next/font/google";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";

/**
 * Three voices.
 * - Archivo (width axis): the board flaps at wdth 62 and the expanded headlines at wdth 125.
 * - Geist: interface and body text.
 * - Geist Mono: prices, order numbers, dates and countdowns, with tabular figures.
 * Geist ships as local files from the "geist" package (Next 14's Google list predates it).
 * globals.css maps --font-body and --font-mono onto the Geist variables.
 */
export const display = Archivo({ subsets: ["latin"], axes: ["wdth"], variable: "--font-display", display: "swap" });
export const body = GeistSans;
export const mono = GeistMono;
