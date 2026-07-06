/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  // Dark mode is configured in app/globals.css via `@custom-variant dark`.
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