/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Space Grotesk', 'sans-serif'],
        display: ['Space Grotesk', 'sans-serif'],
      },
      colors: {
        ink: {
          950: '#0b0a14',
          900: '#131023',
          800: '#1a1433',
          700: '#241c44',
        },
        brand: {
          400: '#22d3ee',
          500: '#06b6d4',
          600: '#0891b2',
          700: '#0e7490',
        },
      },
      boxShadow: {
        'glow-cyan': '0 0 40px rgba(6,182,212,0.2)',
        'glow-cyan-lg': '0 0 80px rgba(6,182,212,0.15)',
      },
    },
  },
  plugins: [],
}
