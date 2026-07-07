import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        chrono: {
          bg: "#0a0a0f",
          surface: "#12121a",
          surfaceHover: "#1a1a25",
          border: "#2a2a3a",
          primary: "#8b5cf6",
          primaryHover: "#7c3aed",
          accent: "#f59e0b",
          success: "#10b981",
          warning: "#f59e0b",
          danger: "#ef4444",
          info: "#3b82f6",
          text: "#e2e8f0",
          textMuted: "#94a3b8",
          textDim: "#64748b",
        },
        tier: {
          essential: "#10b981",
          recommended: "#3b82f6",
          optional: "#f59e0b",
          skip: "#ef4444",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
