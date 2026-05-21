import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        lotto: {
          yellow: "#fbc400",
          blue: "#69c8f2",
          red: "#ff7272",
          gray: "#aaaaaa",
          green: "#b0d840",
        },
      },
    },
  },
  plugins: [],
};
export default config;
