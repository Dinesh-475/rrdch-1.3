/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: { 50:'#EAF0F9', 100:'#C2D3EF', 200:'#90AEDF', 500:'#1A3C6E', 600:'#15305A', 700:'#0F2344', 900:'#060F1C' },
        gold:    { 300:'#F0D080', 400:'#D4A017', 500:'#A87C10' },
        teal:    { 400:'#00897B', 500:'#00695C' },
        coral:   { 400:'#D85A30', 500:'#A84420' },
        ivory:   { DEFAULT:'#FAFAF8', 100:'#F0EDE8' },
        neutral: { 50:'#FAFAF8', 100:'#F0EDE8', 800:'#2C2C2A', 900:'#1E1E1E' }
      },
      fontFamily: {
        heading: ['"Playfair Display"', 'Georgia', 'serif'],
        body:    ['"Inter"', 'system-ui', 'sans-serif'],
        ui:      ['"Nunito"', 'sans-serif'],
        kannada: ['"Noto Sans Kannada"', 'sans-serif']
      },
      animation: {
        'ticker': 'ticker 30s linear infinite',
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'scale-in': 'scaleIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
      },
      keyframes: {
        ticker: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(-100%)' }
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' }
        }
      }
    }
  },
  plugins: [
  ]
}
