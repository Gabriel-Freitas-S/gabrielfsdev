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
    // Usa squoosh (WASM) para evitar dependência de sharp em runtime Cloudflare.
    service: {
      entrypoint: 'astro/assets/services/squoosh'
    }
  },

  integrations: [],

  adapter: cloudflare()
});