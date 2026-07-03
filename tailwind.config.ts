import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Dark theme palette with yellow text and accent
        ink: "#FFD100", // yellow text
        reel: "#FFE66A", // bright yellow accent
        canvas: "#020617", // dark background
        mist: "#0F172A", // dark surface
        smoke: "#94A3B8", // muted gray text
        line: "#334155", // subtle border
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      borderRadius: {
        xl2: "1.25rem",
        xl3: "1.75rem",
      },
      boxShadow: {
        soft: "0 20px 80px -30px rgba(0, 0, 0, 0.35)",
        card: "0 24px 90px -30px rgba(0, 0, 0, 0.45)",
        glow: "0 0 60px rgba(255, 209, 0, 0.2)",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.92)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        grain: {
          "0%, 100%": { transform: "translate(0, 0)" },
          "10%": { transform: "translate(-2%, -3%)" },
          "30%": { transform: "translate(3%, 2%)" },
          "50%": { transform: "translate(-4%, 1%)" },
          "70%": { transform: "translate(2%, -2%)" },
          "90%": { transform: "translate(-1%, 3%)" },
        },
        blinkDot: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.25" },
        },
        spin: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        checkDraw: {
          "0%": { strokeDashoffset: "48" },
          "100%": { strokeDashoffset: "0" },
        },
        ticker: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
      animation: {
        fadeUp: "fadeUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        fadeIn: "fadeIn 0.6s ease-out forwards",
        scaleIn: "scaleIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        grain: "grain 8s steps(8) infinite",
        blinkDot: "blinkDot 1.6s ease-in-out infinite",
        spin: "spin 0.8s linear infinite",
        checkDraw: "checkDraw 0.5s ease-out 0.2s forwards",
        ticker: "ticker 22s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
