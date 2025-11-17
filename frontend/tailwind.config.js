/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'xbox-green': '#107C10',
        'xbox-green-light': '#0E7A0E',
        'xbox-green-dark': '#0A5F0A',
        'xbox-gray': '#1A1A1A',
        'xbox-dark': '#0D0D0D',
      },
      animation: {
        'glow': 'glow 2s ease-in-out infinite alternate',
        'slide-up': 'slideUp 0.5s ease-out',
        'fade-in': 'fadeIn 0.6s ease-in',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px #107C10, 0 0 10px #107C10, 0 0 15px #107C10' },
          '100%': { boxShadow: '0 0 10px #107C10, 0 0 20px #107C10, 0 0 30px #107C10' },
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
          '0%, 100%': { textShadow: '0 0 10px rgba(16, 124, 16, 0.5)' },
          '50%': { textShadow: '0 0 20px rgba(16, 124, 16, 0.8)' },
        },
      },
    },
  },
  plugins: [],
}