import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwind from "@astrojs/tailwind";
import react from "@astrojs/react";
import {
  transformerNotationDiff,
  transformerNotationFocus,
  transformerMetaHighlight,
} from "@shikijs/transformers";

// https://astro.build/config
export default defineConfig({
  site: "https://jakubsobolewski.com",
  integrations: [mdx(), sitemap(), tailwind(), react()],
  markdown: {
    shikiConfig: {
      themes: {
        light: "github-light",
        dark: "github-dark",
      },
      langs: ["r", "gherkin", "javascript", "typescript", "bash", "json", "md"],
      wrap: true,
      transformers: [
        transformerNotationDiff(),
        transformerNotationFocus(),
        transformerMetaHighlight(),
      ],
    },
  },
});
