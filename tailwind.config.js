/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#11224E",
        primaryLight: "#1A2B70",
        secondary: "#FBBF24",
        neutralLight: "#F3F4F6",
        neutralDark: "#374151",
        error: "#EF4444",
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.5rem",
      },
      boxShadow: {
        md: "0 4px 6px rgba(0,0,0,0.1)",
        xl: "0 10px 15px rgba(0,0,0,0.15)",
      },
      keyframes: {
        pulseSoft: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.6 },
        },
      },
      animation: {
        pulseSoft: 'pulseSoft 1.5s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}

