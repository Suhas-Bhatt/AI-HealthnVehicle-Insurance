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
        background: 'rgb(var(--bg-background) / <alpha-value>)',
        card: 'rgb(var(--bg-card) / <alpha-value>)',
        white: 'rgb(var(--color-white) / <alpha-value>)',
        black: 'rgb(var(--color-black) / <alpha-value>)',
        zinc: {
          950: 'rgb(var(--zinc-950) / <alpha-value>)',
          900: 'rgb(var(--zinc-900) / <alpha-value>)',
          800: 'rgb(var(--zinc-800) / <alpha-value>)',
          700: 'rgb(var(--zinc-700) / <alpha-value>)',
          600: 'rgb(var(--zinc-600) / <alpha-value>)',
          500: 'rgb(var(--zinc-500) / <alpha-value>)',
          400: 'rgb(var(--zinc-400) / <alpha-value>)',
          300: 'rgb(var(--zinc-300) / <alpha-value>)',
          200: 'rgb(var(--zinc-200) / <alpha-value>)',
          100: 'rgb(var(--zinc-100) / <alpha-value>)',
        },
        primary: {
          light: '#6366f1',
          DEFAULT: '#4f46e5',
          dark: '#3730a3',
        },
        secondary: {
          light: '#22d3ee',
          DEFAULT: '#0891b2',
          dark: '#0e7490',
        },
        accent: {
          light: '#f472b6',
          DEFAULT: '#db2777',
          dark: '#9d174d',
        },
        success: '#10b981',
        warning: '#f59e0b',
        danger: '#ef4444',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      backgroundImage: {
        'gradient-main': 'linear-gradient(135deg, rgb(var(--bg-background)) 0%, rgb(var(--bg-card)) 100%)',
        'gradient-glass': 'linear-gradient(135deg, var(--glass-start) 0%, var(--glass-end) 100%)',
      },
    },
  },
  plugins: [],
}
