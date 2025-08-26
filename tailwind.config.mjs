const plugin = require("tailwindcss/plugin");

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  darkMode: ["class"],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ["Geist Sans", "sans-serif"],
        serif: ["Libre Caslon Text", "sans-serif"],
        mono: ["Geist Mono", "monospace"],
        code: ["Fira Code", "monospace"],
      },
      fontSize: {
        "clamp-sm": "clamp(2em, 3vw, 3em)",
        "clamp-md": "clamp(2em, 5vw, 6em)",
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        light: "hsl(var(--light))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        gradient: "var(--gradient)",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        "ocean-green": {
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
          DEFAULT: "#37A577",
        },
        sky: {
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
          DEFAULT: "#262B36",
        },
        chart: {
          1: "hsl(var(--chart-1))",
          2: "hsl(var(--chart-2))",
          3: "hsl(var(--chart-3))",
          4: "hsl(var(--chart-4))",
          5: "hsl(var(--chart-5))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [
    require("tailwindcss-motion"),
    require("tailwindcss-intersect"),
    require("tailwindcss-animate"),
    require("@tailwindcss/typography"),
    plugin(function ({ addBase, theme }) {
      addBase({
        h1: {
          fontFamily: theme("fontFamily.sans"),
          fontWeight: theme("fontWeight.regular"),
          fontTracking: theme("fontTracking.widest"),
          fontSize: theme("fontSize.2xl"),
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
