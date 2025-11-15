/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    './admin/**/*.php',
  ],
  theme: {
    extend: {
      animation: {
        'modal-in': 'modal-in 0.3s cubic-bezier(0.165, 0.84, 0.44, 1) forwards',
      },
      keyframes: {
        'modal-in': {
          '0%': {
            transform: 'scale(0.95)',
            opacity: '0',
          },
          '100%': {
            transform: 'scale(1)',
            opacity: '1',
          },
        },
      },
    },
  },
  plugins: [],
};