/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: '#121212',
        light: '#f5f5f5',
        primary: '#1976d2',
        surface: '#1e1e1e',
      }
    },
  },
  plugins: [],
}