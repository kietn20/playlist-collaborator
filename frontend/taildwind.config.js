// File: tailwind.config.js (REVISED)
// Purpose: Configuration for Tailwind CSS
// Location: karmonic-frontend/ (root of frontend project)

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'text': '#f2f2e6',
        'background': '#080804',
        'primary': '#cfcea0',
        'secondary': '#527039',
        'accent': '#81b56f',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      spacing: { // Renamed keys slightly for clarity if needed
         'screen-80h': '80vh',
         'screen-90w': '90vw',
      },
      transitionTimingFunction: {
         'ease-in-out': 'ease-in-out',
      }
    },
  },
  plugins: [],
  // Keep preflight enabled, use MUI CssBaseline instead
}