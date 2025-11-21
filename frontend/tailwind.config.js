/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'xbox-green': '#4169E1',
        'xbox-green-light': '#5B8DEF',
        'xbox-green-dark': '#3557c9',
        'xbox-gray': '#FFFFFF',
        'xbox-dark': '#F9FAFB',
      },
      animation: {
        'glow': 'glow 2s ease-in-out infinite alternate',
        'slide-up': 'slideUp 0.5s ease-out',
        'fade-in': 'fadeIn 0.6s ease-in',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px #4169E1, 0 0 10px #4169E1, 0 0 15px #4169E1' },
          '100%': { boxShadow: '0 0 10px #4169E1, 0 0 20px #4169E1, 0 0 30px #4169E1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'pulse-glow': {
          '0%, 100%': { textShadow: '0 0 10px rgba(65, 105, 225, 0.5)' },
          '50%': { textShadow: '0 0 20px rgba(65, 105, 225, 0.8)' },
        },
      },
    },
  },
  plugins: [],
}