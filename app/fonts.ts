import { Archivo } from "next/font/google";

/**
 * One family for the whole site. Archivo's width axis gives the board its condensed flap
 * letters (wdth 62); headings and body text use the normal width.
 * display and mono point at the same font; globals.css aliases their CSS variables.
 */
export const body = Archivo({ subsets: ["latin"], axes: ["wdth"], variable: "--font-body", display: "swap" });
export const display = body;
export const mono = body;
