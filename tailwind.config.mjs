const plugin = require("tailwindcss/plugin");

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
        "clamp-md": "clamp(1.25rem, 2vw, 1.5rem)",
      },
      colors: {
        "ocean-green": {
          DEFAULT: "#37A577",
          50: "#AFE4CE",
          100: "#A0DFC5",
          200: "#81D5B2",
          300: "#63CB9F",
          400: "#44C18D",
          500: "#37A577",
          600: "#2C835E",
          700: "#206045",
          800: "#153E2D",
          900: "#091B14",
          950: "#030A07",
        },
        sky: {
          DEFAULT: "#262B36",
          50: "#E1E4EA",
          100: "#C9CED9",
          200: "#99A3B7",
          300: "#697796",
          400: "#485166",
          500: "#262B36",
          600: "#222630",
          700: "#1E212A",
          800: "#191D24",
          900: "#15181E",
          950: "#13161B",
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
    plugin(function ({ addBase, theme }) {
      addBase({
        h1: {
          fontFamily: theme("fontFamily.sans"),
          fontWeight: theme("fontWeight.regular"),
          fontTracking: theme("fontTracking.widest"),
          fontSize: theme("fontSize.2xl"),
          color: theme("colors.black"),
        },
        h2: {
          fontFamily: theme("fontFamily.sans"),
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
