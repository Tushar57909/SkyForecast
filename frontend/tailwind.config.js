/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        lightsky: {
          50: '#f0f7ff',
          100: '#e0f0fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
          950: '#082f49',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"Fira Code"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      boxShadow: {
        'subtle': '0 2px 10px rgba(12, 74, 110, 0.04)',
        'card': '0 4px 20px -2px rgba(12, 74, 110, 0.05), 0 2px 6px -1px rgba(12, 74, 110, 0.03)',
        'card-hover': '0 12px 35px -4px rgba(2, 132, 199, 0.12), 0 4px 12px -2px rgba(2, 132, 199, 0.06)',
        'glass': '0 8px 32px 0 rgba(14, 165, 233, 0.08)',
        'float': '0 20px 40px -10px rgba(2, 132, 199, 0.18)',
        'glow-sky': '0 0 20px rgba(14, 165, 233, 0.25)',
      },
      borderRadius: {
        '3xl': '24px',
        '2xl': '16px',
        'xl': '12px',
      }
    },
  },
  plugins: [],
}
