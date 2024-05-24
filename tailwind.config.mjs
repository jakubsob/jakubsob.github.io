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
    }),
    plugin(function({ addUtilities, theme }) {
      function extractVars (obj, group = '', prefix) {
        return Object.keys(obj).reduce((vars, key) => {
          const value = obj[key];
          const cssVariable = key === "DEFAULT" ? `--${prefix}${group}` : `--${prefix}${group}-${key}`;

          const newVars =
          typeof value === 'string'
          ? { [cssVariable]: value }
          : extractVars(value, `-${key}`, prefix);

          return { ...vars, ...newVars };
        }, {});
      }

      addUtilities({
        ':root': {
          ...extractVars(theme('colors'), '', 'color'),
          ...extractVars(theme('boxShadow'), '', 'box-shadow')
        }
      })
    })
  ],
}
