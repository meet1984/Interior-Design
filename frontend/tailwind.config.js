/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary:   "#111111",
        secondary: "#666666",
        muted:     "#888888",
        surface:   "#FFFFFF",
        bg:        "#FAFAFA",
        border:    "#E5E5E5",
        red: {
          primary: "#C1121F",
          deep:    "#9B0F18",
          accent:  "#E63946",
          light:   "rgba(193,18,31,0.08)",
        },
        // Legacy aliases kept to avoid breaking any Tailwind classes still used
        accent: "#C1121F",
        gold: {
          light:   "#E63946",
          DEFAULT: "#C1121F",
          dark:    "#9B0F18",
        }
      },
      fontFamily: {
        sans:    ["Inter", "sans-serif"],
        display: ["Playfair Display", "Georgia", "serif"],
        serif:   ["Playfair Display", "Georgia", "serif"],
      },
      boxShadow: {
        'card':     '0 2px 16px rgba(0,0,0,0.06)',
        'card-hover': '0 8px 40px rgba(0,0,0,0.12)',
        'nav':      '0 1px 0 rgba(0,0,0,0.08)',
        'nav-scroll': '0 4px 24px rgba(0,0,0,0.08)',
      },
      borderRadius: {
        'xl2': '1rem',
        'xl3': '1.25rem',
      }
    },
  },
  plugins: [],
}
