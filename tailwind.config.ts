import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#080b11",
        foreground: "#f0f4f8",
        cyber: {
          cyan: "#00f3ff",
          green: "#00ff88",
          purple: "#a855f7",
          amber: "#f59e0b",
          red: "#ef4444",
          blue: "#3b82f6",
          dark: "#080b11",
          card: "#0f1624",
          cardHover: "#162035",
          border: "#1c2b45",
          borderGlow: "#00f3ff33",
        },
      },
      animation: {
        "spin-slow": "spin 8s linear infinite",
        "spin-fast": "spin 0.6s linear infinite",
        "pulse-glow": "pulseGlow 2s ease-in-out infinite",
        "float": "float 3s ease-in-out infinite",
        "scan": "scan 4s linear infinite",
      },
      keyframes: {
        pulseGlow: {
          "0%, 100%": { opacity: "1", filter: "drop-shadow(0 0 15px rgba(0, 243, 255, 0.6))" },
          "50%": { opacity: "0.7", filter: "drop-shadow(0 0 5px rgba(0, 243, 255, 0.2))" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
        scan: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(1000%)" },
        },
      },
      boxShadow: {
        "cyber-cyan": "0 0 20px -2px rgba(0, 243, 255, 0.4)",
        "cyber-green": "0 0 20px -2px rgba(0, 255, 136, 0.4)",
        "cyber-purple": "0 0 20px -2px rgba(168, 85, 247, 0.4)",
        "cyber-amber": "0 0 20px -2px rgba(245, 158, 11, 0.4)",
      },
    },
  },
  plugins: [],
} satisfies Config;
