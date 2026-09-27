/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef4ff",
          100: "#d9e6ff",
          200: "#b7cfff",
          300: "#8bb0ff",
          400: "#5c8cff",
          500: "#3466f6",
          600: "#234bea",
          700: "#1c3bc4",
          800: "#1c339c",
          900: "#1c2f7a",
        },
        danger: {
          50: "#fef2f2",
          500: "#ef4444",
          600: "#dc2626",
        },
        surface: {
          DEFAULT: "#ffffff",
          muted: "#f6f8fc",
          border: "#e6e9f2",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(16, 24, 40, 0.06), 0 1px 3px rgba(16, 24, 40, 0.08)",
      },
    },
  },
  plugins: [],
};
