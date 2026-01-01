// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import cloudflare from '@astrojs/cloudflare';



// https://astro.build/config
export default defineConfig({
  output: 'server',
  vite: {
    plugins: [tailwindcss()]
  },

  image: {
    // Usa sharp apenas em build/prerender; evita uso de sharp no runtime Cloudflare.
    service: {
      entrypoint: 'astro/assets/services/compile'
    }
  },

  integrations: [],

  adapter: cloudflare()
});