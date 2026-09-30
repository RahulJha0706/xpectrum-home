import type { Config } from 'tailwindcss'

// Matches the Xpectrum app's Tailwind setup for the pieces the homepage uses:
// the IBM Plex Sans body font, the `tablet` breakpoint and the `xs` shadow.
const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-xp-body)', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
      },
      screens: {
        tablet: '640px',
      },
      boxShadow: {
        xs: '0px 1px 2px 0px rgba(16, 24, 40, 0.05)',
      },
    },
  },
  plugins: [],
}

export default config
