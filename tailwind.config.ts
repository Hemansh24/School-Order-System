import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#DEBFE3",
          soft: "#F4E8F6",
          dark: "#7D4B88"
        },
        ink: "#2B2230",
        muted: "#6F6175",
        canvas: "#FAF7FB",
        line: "#E8DDEC",
        ok: "#DDF4E4",
        warn: "#F8E5AF",
        danger: "#F1C6CC"
      },
      boxShadow: {
        soft: "0 12px 32px rgba(43, 34, 48, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;
