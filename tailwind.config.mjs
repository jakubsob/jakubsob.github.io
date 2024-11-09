const plugin = require('tailwindcss/plugin')
const { addIconSelectors } = require("@iconify/tailwind");

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Geist Sans", "sans-serif"],
        serif: ["Merriweather", "serif"],
        mono: ["Geist Mono", "monospace"],
        code: ["Fira Code", "monospace"],
        syne: ["Syne Variable", "sans-serif"],
        monoton: ["Monoton", "serif"],
      },
      fontSize: {
        clamp: "clamp(2rem, 5vw, 3rem)",
      },
      colors: {
        sky: {
          DEFAULT: "#262B36",
          50: "#BDC3D1",
          100: "#B1B8C8",
          200: "#99A3B7",
          300: "#818DA7",
          400: "#697796",
          500: "#59647E",
          600: "#485166",
          700: "#373E4E",
          800: "#262B36",
          900: "#0F1115",
          950: "#030405",
        },
        malibu: {
          DEFAULT: "#82B1FF",
          50: "#E8F1FF",
          100: "#D4E4FF",
          200: "#ABCAFF",
          300: "#82B1FF",
          400: "#4A8EFF",
          500: "#126BFF",
          600: "#0051D9",
          700: "#003CA1",
          800: "#002768",
          900: "#001230",
          950: "#000814",
        },
        marine: {
          DEFAULT: "#77C0CA",
          50: "#FBFDFD",
          100: "#ECF6F8",
          200: "#CFE9EC",
          300: "#B2DBE1",
          400: "#94CED5",
          500: "#77C0CA",
          600: "#4FADBA",
          700: "#3B8B96",
          800: "#2B666E",
          900: "#1B4046",
          950: "#132E31",
        },
      },
    },
  },
  plugins: [
    require("@tailwindcss/typography"),
    addIconSelectors(["logos"]),
    plugin(function ({ addBase, theme }) {
      addBase({
        h1: {
          fontFamily: theme("fontFamily.uppercase"),
          fontWeight: theme("fontWeight.semibold"),
          fontSize: theme("fontSize.2xl"),
        },
        h2: {
          fontFamily: theme("fontFamily.uppercase"),
          fontSize: theme("fontSize.xl"),
        },
        h3: {
          fontSize: theme("fontSize.lg"),
        },
      });
    }),
    plugin(function ({ addUtilities, theme }) {
      function extractVars(obj, group = "", prefix) {
        return Object.keys(obj).reduce((vars, key) => {
          const value = obj[key];
          const cssVariable =
            key === "DEFAULT"
              ? `--${prefix}${group}`
              : `--${prefix}${group}-${key}`;

          const newVars =
            typeof value === "string"
              ? { [cssVariable]: value }
              : extractVars(value, `-${key}`, prefix);

          return { ...vars, ...newVars };
        }, {});
      }

      addUtilities({
        ":root": {
          ...extractVars(theme("colors"), "", "color"),
          ...extractVars(theme("boxShadow"), "", "box-shadow"),
        },
      });
    }),
  ],
};
