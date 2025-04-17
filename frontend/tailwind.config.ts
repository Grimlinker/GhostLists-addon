import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        pastel: {
          pink: "#fbcfe8",
          purple: "#e9d5ff",
          blue: "#bfdbfe",
          mint: "#d1fae5",
          yellow: "#fef9c3",
        },
        ghost: {
          bg: "#fdf4ff",
          accent: "#c084fc",
          soft: "#f3e8ff",
          dark: "#a855f7"
        },
      },
      fontFamily: {
        dreamy: ['"Comic Neue"', "cursive"],
      },
      borderRadius: {
        "2xl": "1rem",
      },
      boxShadow: {
        dreamy: "0 8px 20px rgba(200, 150, 255, 0.2)",
      },
    },
  },
  plugins: [
    require("@tailwindcss/forms"),
    require("@tailwindcss/typography"),
  ],
};
export default config;
