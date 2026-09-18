import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#17211c",
        muted: "#5a675f",
        paper: "#f3efe6",
        card: "#fffcf6",
        line: "#d8d0c0",
        pine: "#1d6b4f",
        "pine-dark": "#14523c",
        clay: "#c9842a",
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 12px 32px -20px rgba(23, 33, 28, 0.35)",
      },
    },
  },
  plugins: [],
};

export default config;
