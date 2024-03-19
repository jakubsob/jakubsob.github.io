const plugin = require('tailwindcss/plugin')

/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
		extend: {
      fontFamily: {
        sans: ['Geist Sans', 'sans-serif'],
        serif: ['Merriweather', 'serif'],
        mono: ['Geist Mono', 'monospace'],
        code: ['Fira Code', 'monospace'],
        syne: ['Syne Variable', 'sans-serif'],
        monoton: ['Monoton', 'serif'],
      },
    },
	},
  plugins: [
    require('@tailwindcss/typography'),
    plugin(function({ addBase, theme }) {
      addBase({
        'h1': {
          fontFamily: theme('fontFamily.uppercase'),
          fontFamily: theme('fontFamily.syne'),
          fontWeight: theme('fontWeight.semibold'),
          fontSize: theme('fontSize.2xl')
        },
        'h2': {
          fontFamily: theme('fontFamily.uppercase'),
          fontFamily: theme('fontFamily.syne'),
          fontSize: theme('fontSize.xl')
        },
        'h3': {
          fontSize: theme('fontSize.lg')
        },
      })
    })
  ],
}
