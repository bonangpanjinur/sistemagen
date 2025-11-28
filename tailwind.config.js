/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  // FIXED: Menggunakan strategi 'class' atau selector ID untuk menghindari konflik dengan style WP Admin
  // 'important' memaksa style tailwind menang di dalam ID #umh-app-root
  important: '#umh-app-root', 
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        secondary: {
          50: '#fdf4ff',
          100: '#fae8ff',
          200: '#f5d0fe',
          300: '#f0abfc',
          400: '#e879f9',
          500: '#d946ef',
          600: '#c026d3',
          700: '#a21caf',
          800: '#86198f',
          900: '#701a75',
        }
      },
      fontFamily: {
        // FIXED: Menambahkan definisi 'inter' agar class 'font-inter' dikenali saat build
        sans: ['Inter', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
      },
    },
  },
  // FIXED: Mematikan preflight agar tidak merusak tampilan Admin Bar WordPress
  corePlugins: {
    preflight: false,
  },
  plugins: [],
}