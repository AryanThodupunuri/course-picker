/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        'uva-navy': '#232D4B',
        'uva-orange': '#E57200'
      }
    },
  },
  plugins: [],
}