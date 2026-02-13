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
        vortex: {
          bg: "#0a0e17",
          surface: "#111827",
          card: "#1a2332",
          border: "#1e2d3d",
          accent: "#3b82f6",
          "accent-bright": "#60a5fa",
          green: "#22c55e",
          red: "#ef4444",
          amber: "#f59e0b",
          purple: "#a855f7",
          cyan: "#06b6d4",
          muted: "#6b7280",
          text: "#e5e7eb",
          "text-bright": "#f9fafb",
        },
      },
      fontFamily: {
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;
