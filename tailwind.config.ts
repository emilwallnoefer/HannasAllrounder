import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        rose: {
          DEFAULT: "#e4a8b0",
          hover: "#e4a8b0",
          glow: "rgba(228, 168, 176, 0.4)",
        },
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
        "4xl": "2rem",
      },
      backdropBlur: {
        xs: "2px",
      },
      boxShadow: {
        "rose-glow": "0 0 20px rgba(228, 168, 176, 0.25)",
        "rose-glow-strong": "0 0 30px rgba(228, 168, 176, 0.35)",
      },
    },
  },
  plugins: [],
};

export default config;
