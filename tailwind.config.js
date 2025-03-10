/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#022A46',
        secondary: '#154a83'
      },
      backgroundImage: {
        'base': "url('/src/assets/bg/bg.png')",
      },
    },
  },
  plugins: [],
}