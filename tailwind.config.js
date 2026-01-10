/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  // Use data-color-mode attribute for dark mode instead of media query
  darkMode: ['selector', '[data-color-mode="dark"]'],
  theme: {
    extend: {
      fontFamily: {
        nunito: ['var(--font-nunito)', 'Nunito', 'sans-serif'],
      },
      colors: {
        'menu-bg': 'rgba(148, 188, 194, 0.9)',
      },
    },
  },
  plugins: [],
} 