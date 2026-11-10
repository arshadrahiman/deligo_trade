/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#07090E',
        surface: '#0F131D',
        surfaceHover: '#141A26',
        surfaceBorder: '#1E2839',
        borderSubtle: '#26334D',
        primary: {
          DEFAULT: '#FED430',
          hover: '#e5be2b',
        },
        navy: {
          DEFAULT: '#0D3B66',
          dark: '#08203E',
        },
        brandRed: '#E63946',
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        oswald: ['Oswald', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}

