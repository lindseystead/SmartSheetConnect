/**
 * PostCSS Configuration
 * 
 * Configured for use with Vite.
 * The warning about 'from' option is a known Vite/PostCSS compatibility issue
 * and is harmless - Vite handles PostCSS processing correctly internally.
 */

export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
