/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#070A12',
        surface: '#0D121F',
        surfaceHover: '#141C30',
        surfaceBorder: '#1A233A',
        borderSubtle: '#24304E',
        primary: {
          DEFAULT: '#F59E0B',
          hover: '#D97706',
          light: '#FBBF24',
        },
        accent: {
          emerald: '#10B981',
          emeraldDark: '#059669',
          cyan: '#06B6D4',
          indigo: '#6366F1',
          gold: '#F59E0B',
        },
        navy: {
          DEFAULT: '#0F2744',
          dark: '#081729',
        },
        brandRed: '#EF4444',
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        oswald: ['Oswald', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        'pos': '0 10px 30px -10px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.08)',
        'pos-glow': '0 0 35px -5px rgba(245, 158, 11, 0.25)',
        'emerald-glow': '0 0 25px -5px rgba(16, 185, 129, 0.3)',
      },
    },
  },
  plugins: [],
}
