/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        green: {
          DEFAULT: 'var(--green)',
          500: 'var(--green)',
        },
        bg: {
          DEFAULT: 'var(--bg)',
        },
        surface: {
          DEFAULT: 'var(--surface)',
          2: 'var(--surface2)',
        },
        ink: {
          DEFAULT: 'var(--text)',
          muted: 'var(--text-muted)',
        },
        line: 'var(--border)',
      },
      fontFamily: {
        sans: ['var(--font-dm-sans)', 'system-ui', 'sans-serif'],
        display: ['var(--font-syne)', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        pulseDot: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.4', transform: 'scale(0.85)' },
        },
        pulseRing: {
          '0%': { boxShadow: '0 0 0 0 rgba(0, 208, 132, 0.5)' },
          '70%': { boxShadow: '0 0 0 8px rgba(0, 208, 132, 0)' },
          '100%': { boxShadow: '0 0 0 0 rgba(0, 208, 132, 0)' },
        },
        bounceDot: {
          '0%, 80%, 100%': { transform: 'translateY(0)', opacity: '0.4' },
          '40%': { transform: 'translateY(-6px)', opacity: '1' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        pulseDot: 'pulseDot 1.4s ease-in-out infinite',
        pulseRing: 'pulseRing 1.8s ease-out infinite',
        bounceDot: 'bounceDot 1.4s ease-in-out infinite',
        fadeUp: 'fadeUp 0.4s ease-out both',
      },
    },
  },
  plugins: [],
};
