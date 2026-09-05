import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import vue from '@astrojs/vue';
import process from 'node:process';
import { deriveSiteConfig } from './src/config/site.ts';

const { site, base } = deriveSiteConfig(process.env);

export default defineConfig({
  site: site.href,
  base,
  output: 'static',
  integrations: [vue(), sitemap()],
  vite: {
    build: {
      cssCodeSplit: true,
    },
  },
});
