import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwind from "@astrojs/tailwind";
import react from "@astrojs/react";

// https://astro.build/config
export default defineConfig({
  site: 'https://jakubsob.github.io',
  integrations: [mdx(), sitemap(), tailwind(), react()],
  markdown: {
    syntaxHighlight: 'shiki',
    shikiConfig: {
      theme: 'github-light',
      langs: [],
      wrap: true,
      transformers: []
    },
  }
});
