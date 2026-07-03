import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#2563EB",
          dark: "#1D4ED8",
          light: "#EFF4FF",
        },
      },
      borderRadius: {
        xl: "0.9rem",
      },
    },
  },
  plugins: [],
};
export default config;
