import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#080B1A",
          900: "#0A0D1F",
          800: "#0D1128",
          700: "#131834",
          600: "#1B2140",
        },
        brand: {
          blue: "#4C6FFF",
          blueLight: "#7C93FF",
          pink: "#FF3D71",
          purple: "#7B2FF7",
          rose: "#FF5C8A",
          amber: "#FFC94A",
        },
        mist: "#AEB4D6",
      },
      fontFamily: {
        display: ["var(--font-poppins)", "sans-serif"],
        body: ["var(--font-inter)", "sans-serif"],
      },
      backgroundImage: {
        "brand-gradient": "linear-gradient(135deg, #FF3D71 0%, #C13FE0 50%, #5B3DF5 100%)",
        "brand-gradient-soft": "linear-gradient(135deg, rgba(255,61,113,0.18) 0%, rgba(123,47,247,0.18) 100%)",
        "glow-radial": "radial-gradient(circle at 30% 20%, rgba(76,111,255,0.35), transparent 55%)",
      },
      boxShadow: {
        card: "0 20px 60px -20px rgba(123,47,247,0.45)",
        soft: "0 10px 40px -15px rgba(0,0,0,0.5)",
      },
      borderRadius: {
        xl2: "1.75rem",
      },
      maxWidth: {
        content: "72rem",
      },
    },
  },
  plugins: [],
};

export default config;
