/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'kidney-green': '#2E7D32',
        'kidney-light': '#4CAF50',
        'kidney-teal': '#00695C',
        'kidney-teal-light': '#26A69A',
        'kidney-cream': '#F1F8E9',
        'kidney-charcoal': '#212121',
        'kidney-gray': '#424242',
        'kidney-red': '#D32F2F',
        'kidney-amber': '#FFA000',
        // Additional from task description
        'teal': {
          50: '#F0FDF4',
          500: '#0D9488',
          600: '#0F766E',
          700: '#065F46',
        },
      },
      fontFamily: {
        'montserrat': ['Montserrat', 'sans-serif'],
        'opensans': ['Open Sans', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
