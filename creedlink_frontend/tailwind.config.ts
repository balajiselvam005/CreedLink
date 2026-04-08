import type { Config } from "tailwindcss";

const config: Config = {
  theme: {
    extend: {
      colors: {
        brand: {
          primary: "#6366F1", // indigo-500
          hover: "#A5B4FC",   // indigo-300
        },

        state: {
          success: "#34D399", // emerald-400
          danger: "#FB7185",  // rose-400
        },

        surface: {
          DEFAULT: "#1E293B", // slate-800
          soft: "rgba(15,23,42,0.6)"
        },
      },
    },
  },
  plugins: [],
};

export default config;
