import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwind from "@astrojs/tailwind";
import {
  transformerNotationHighlight,
  transformerNotationFocus,
  transformerMetaHighlight,
  transformerNotationDiff
} from '@shikijs/transformers';

// https://astro.build/config
export default defineConfig({
  site: 'https://jakubsob.github.io',
  base: '/jakub_sobolewski',
  integrations: [mdx(), sitemap(), tailwind()],
  markdown: {
    syntaxHighlight: 'shiki',
    shikiConfig: {
      theme: 'github-dark',
      experimentalThemes: {
        light: 'github-light',
        dark: 'github-dark',
      },
      langs: [],
      wrap: true,
      transformers: [
        transformerMetaHighlight(),
        transformerNotationFocus(),
        transformerNotationHighlight(),
        transformerNotationDiff(),
      ],
    },
  },
});
