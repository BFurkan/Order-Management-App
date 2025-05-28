/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#e3f2fd',
          100: '#bbdefb',
          500: '#2196f3',
          600: '#1976d2',
          700: '#1565c0',
        },
        secondary: {
          50: '#fce4ec',
          100: '#f8bbd9',
          500: '#e91e63',
          600: '#d81b60',
          700: '#c2185b',
        }
      }
    },
  },
  plugins: [],
} 