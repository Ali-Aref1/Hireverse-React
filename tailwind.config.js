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
        secondary: '#0DC8DC',
        tertiary: '#0073AC',
        background: '#040622'
      },
      fontFamily: {
        title: ['Toxigenesis', 'sans-serif'],
        body: ['SF-Pro', 'sans-serif'],
      },
      backgroundImage: {
        'base': "url('/src/assets/bg/bg3.png')",
        'interviews':"url('src/assets/interviews.png')"
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-in-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
      }
    },
  },
  plugins: [],
}