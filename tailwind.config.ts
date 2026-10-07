import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        heading: ["var(--font-sans)", "Helvetica Neue", "Arial", "sans-serif"],
        sans: ["var(--font-sans)", "Helvetica Neue", "Arial", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "SF Mono", "Menlo", "Consolas", "monospace"],
      },
      colors: {
        brand: {
          primary: "#1F2F6E",
          "primary-dark": "#141F4D",
          "primary-50": "#EEF0FA",
          "primary-100": "#DADEF3",
          accent: "#F2B705",
          "accent-dark": "#D9A304",
          "accent-50": "#FFF6D6",
        },
        canvas: {
          DEFAULT: "#FFFFFF",
          subtle: "#F2F3F5",
          raised: "#FFFFFF",
          board: "#101A33",
        },
        ink: {
          DEFAULT: "#151A2B",
          muted: "#4A5068",
          subtle: "#62687E",
          faint: "#9A9FB2",
        },
        line: {
          DEFAULT: "#D9DCE5",
          subtle: "#EBEDF2",
          strong: "#151A2B",
        },
        neutral: {
          50: "#F9FAFB",
          100: "#F3F4F6",
          200: "#E5E7EB",
          300: "#D1D5DB",
          500: "#6B7280",
          700: "#374151",
          900: "#111827",
          950: "#0A0A0A",
        },
        success: "#1D7A4F",
        warning: "#8A5A00",
        error: "#B42318",
        info: "#1F2F6E",
        seller: {
          new: "#62687E",
          "level-one": "#1F2F6E",
          "level-two": "#141F4D",
          "top-rated": "#F2B705",
        },
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      borderRadius: {
        xs: "4px",
        sm: "4px",
        md: "4px",
        lg: "6px",
        xl: "6px",
        "2xl": "12px",
        "3xl": "12px",
      },
      boxShadow: {
        card: "none",
        "card-hover": "none",
        popover: "0 8px 24px rgba(21, 26, 43, 0.14)",
      },
      fontSize: {
        "2xs": ["0.6875rem", { lineHeight: "1rem" }],
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.6" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.2s ease-out",
        "pulse-soft": "pulse-soft 2s ease-in-out infinite",
        shimmer: "shimmer 1.6s linear infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
