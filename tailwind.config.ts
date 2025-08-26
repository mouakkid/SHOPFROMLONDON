import type { Config } from "tailwindcss";

export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  "#f5f3ff",
          100: "#ede9fe",
          200: "#ddd6fe",
          300: "#c4b5fd",
          400: "#a78bfa",
          500: "#8b5cf6",
          600: "#7c3aed",
          700: "#6d28d9",
          800: "#5b21b6",
          900: "#4c1d95",
        },
        accent: {
          400: "#60A5FA",
          500: "#3B82F6",
          600: "#2563EB",
        }
      },
      boxShadow: {
        glow: "0 0 15px rgba(99,102,241,.45)",
        "glow-sm": "0 0 8px rgba(99,102,241,.35)",
        "inner-1": "inset 0 1px 0 rgba(255,255,255,.06)",
      },
      keyframes: {
        "pulse-soft": {
          "0%,100%": { transform: "scale(1)", opacity: "1" },
          "50%": { transform: "scale(1.02)", opacity: ".95" },
        },
        shine: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(200%)" },
        },
        "float": {
          "0%,100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-2px)" },
        }
      },
      animation: {
        "pulse-soft": "pulse-soft 2s ease-in-out infinite",
        shine: "shine 1.2s linear",
        float: "float 4s ease-in-out infinite",
      },
      backdropBlur: { xs: "2px" },
    },
  },
  plugins: [],
} satisfies Config;
