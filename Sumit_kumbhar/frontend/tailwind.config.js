/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        festive: {
          saffron: '#FF6F00',   // Deep Saffron Orange
          gold: '#FFD700',      // Golden accents
          maroon: '#800020',    // Royal Maroon
          cream: '#FFFDD0',     // Light Cream background
          terracotta: '#C25A3F',
        },
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.08)',
        'premium': '0 10px 30px -10px rgba(0, 0, 0, 0.1)',
      },
    },
  },
  plugins: [],
}
