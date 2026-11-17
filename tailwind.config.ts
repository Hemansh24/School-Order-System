import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "rgb(var(--brand) / <alpha-value>)",
          soft: "rgb(var(--brand-soft) / <alpha-value>)",
          dark: "rgb(var(--brand-dark) / <alpha-value>)"
        },
        ink: "rgb(var(--ink) / <alpha-value>)",
        muted: "rgb(var(--muted) / <alpha-value>)",
        canvas: "rgb(var(--canvas) / <alpha-value>)",
        surface: {
          DEFAULT: "rgb(var(--surface) / <alpha-value>)",
          raised: "rgb(var(--surface-raised) / <alpha-value>)",
          overlay: "rgb(var(--surface-overlay) / <alpha-value>)"
        },
        line: "rgb(var(--line) / <alpha-value>)",
        ok: {
          DEFAULT: "rgb(var(--ok) / <alpha-value>)",
          strong: "rgb(var(--ok-strong) / <alpha-value>)"
        },
        warn: {
          DEFAULT: "rgb(var(--warn) / <alpha-value>)",
          strong: "rgb(var(--warn-strong) / <alpha-value>)"
        },
        danger: {
          DEFAULT: "rgb(var(--danger) / <alpha-value>)",
          soft: "rgb(var(--danger-soft) / <alpha-value>)",
          strong: "rgb(var(--danger-strong) / <alpha-value>)"
        },
        info: {
          DEFAULT: "rgb(var(--info) / <alpha-value>)",
          strong: "rgb(var(--info-strong) / <alpha-value>)"
        }
      },
      boxShadow: {
        soft: "0 12px 32px var(--shadow-soft)"
      }
    }
  },
  plugins: []
};

export default config;
