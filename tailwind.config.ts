import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#05070c",
          900: "#090d14",
          800: "#111827",
          700: "#1f2937"
        },
        arc: {
          500: "#47d5ff",
          600: "#1aa8d9"
        },
        signal: {
          green: "#34d399",
          red: "#fb7185",
          amber: "#f59e0b",
          violet: "#a78bfa"
        }
      },
      boxShadow: {
        glow: "0 0 40px rgba(71, 213, 255, 0.12)"
      }
    }
  },
  plugins: []
};

export default config;
