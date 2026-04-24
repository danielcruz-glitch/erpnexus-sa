import type { Config } from "tailwindcss";
export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        canvas: "#08111f",
        panel: "#0f1c31",
        accent: "#2dd4bf",
        ink: "#e6f0ff",
        muted: "#9fb0cf",
        warning: "#f59e0b",
        danger: "#ef4444"
      },
      boxShadow: { halo: "0 0 0 1px rgba(148,163,184,.12),0 20px 50px rgba(2,8,23,.45)" }
    }
  },
  plugins: []
} satisfies Config;
