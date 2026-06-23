/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#0F172A",
        secondary: "#1E293B",
        accent: "#C8A97E",
        bg: "#F8FAFC",
        text: "#111827",
        gold: {
          light: "#DFCDAE",
          DEFAULT: "#C8A97E",
          dark: "#AA8753"
        }
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        display: ["Outfit", "sans-serif"],
      }
    },
  },
  plugins: [],
}

