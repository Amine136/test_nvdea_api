/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        nvidia: {
          green: '#76b900',
          bright: '#00e676',
          dark: '#051910',
        }
      }
    },
  },
  plugins: [],
}
