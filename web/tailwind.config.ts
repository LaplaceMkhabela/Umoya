import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        umoya: "#30D158",
        ink: "#111827",
      },
    },
  },
  plugins: [],
};

export default config;
