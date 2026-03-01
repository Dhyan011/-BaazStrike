/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
      colors: {
        background: "#080b14",
        surface: "#0e1420",
        surfaceAlt: "#131926",
        border: "#1e2a3d",
        primary: {
          DEFAULT: "#4f8cff",
          dark: "#3370e8",
          glow: "rgba(79,140,255,0.35)",
        },
        accent: {
          cyan: "#00e5ff",
          purple: "#a855f7",
          red: "#ff4757",
          orange: "#ff6b35",
          green: "#22c55e",
          yellow: "#fbbf24",
        },
        severity: {
          critical: "#ff4757",
          high: "#ff6b35",
          medium: "#fbbf24",
          low: "#22c55e",
          none: "#6b7280",
        },
        text: {
          primary: "#f0f4ff",
          secondary: "#8892a4",
          muted: "#4a5568",
        },
      },
      backgroundImage: {
        "grid-pattern":
          "linear-gradient(rgba(79,140,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(79,140,255,0.03) 1px, transparent 1px)",
        "glow-primary":
          "radial-gradient(ellipse at center, rgba(79,140,255,0.15) 0%, transparent 70%)",
        "glow-red":
          "radial-gradient(ellipse at center, rgba(255,71,87,0.15) 0%, transparent 70%)",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "scan-line": "scanLine 2s linear infinite",
        "flicker": "flicker 0.15s infinite",
        "slide-in": "slideIn 0.5s ease-out",
      },
      keyframes: {
        scanLine: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100vh)" },
        },
        flicker: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.85" },
        },
        slideIn: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      boxShadow: {
        "glow-blue": "0 0 20px rgba(79,140,255,0.4)",
        "glow-red": "0 0 20px rgba(255,71,87,0.4)",
        "glow-green": "0 0 20px rgba(34,197,94,0.3)",
        "glow-orange": "0 0 20px rgba(255,107,53,0.3)",
        card: "0 4px 24px rgba(0,0,0,0.5)",
      },
    },
  },
  plugins: [],
};
