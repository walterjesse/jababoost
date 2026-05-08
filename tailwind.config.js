/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'display': ['Playfair Display', 'serif'],
        'sans': ['Inter', 'sans-serif'],
      },
      colors: {
        primary: '#FF6B35',
        secondary: '#F7931E',
        accent: '#C41E3A',
        dark: '#1a1a2e',
      },
    },
  },
  plugins: [],
}
