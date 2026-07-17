/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        slate: {
          50: 'hsl(var(--text-primary-raw) / <alpha-value>)',
          100: 'hsl(var(--text-primary-raw) / <alpha-value>)',
          200: 'hsl(var(--text-primary-raw) / <alpha-value>)',
          300: 'hsl(var(--text-secondary-raw) / <alpha-value>)',
          400: 'hsl(var(--text-secondary-raw) / <alpha-value>)',
          500: 'hsl(var(--text-muted-raw) / <alpha-value>)',
          600: 'hsl(var(--text-muted-raw) / <alpha-value>)',
          700: 'hsl(var(--text-muted-raw) / <alpha-value>)',
          800: 'hsl(var(--border-color-raw) / <alpha-value>)',
          850: 'hsl(var(--bg-tertiary-raw) / <alpha-value>)',
          900: 'hsl(var(--bg-secondary-raw) / <alpha-value>)',
          950: 'hsl(var(--bg-primary-raw) / <alpha-value>)',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}