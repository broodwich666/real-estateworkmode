import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#f3efe6",
        ink: "#162033",
        navy: "#1c3358",
        clay: "#c45c26",
        moss: "#2f6f4e",
        mist: "#e7e1d4",
        line: "#d7d0c2",
      },
      fontFamily: {
        sans: ["var(--font-source-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["var(--font-fraunces)", "ui-serif", "Georgia", "serif"],
      },
      boxShadow: {
        card: "0 10px 30px rgba(22, 32, 51, 0.08)",
      },
    },
  },
  plugins: [],
};

export default config;
