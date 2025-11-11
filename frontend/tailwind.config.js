/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        purple: {
          DEFAULT: '#9333ea',
          light: '#a855f7',
          dark: '#7e22ce',
        }
      }
    },
  },
  plugins: [],
}

