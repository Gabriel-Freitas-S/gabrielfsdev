// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import cloudflare from '@astrojs/cloudflare';



// https://astro.build/config
export default defineConfig({
  prefetch: {
    prefetchAll: false,
    defaultStrategy: 'hover'
  },
  output: 'server',
  vite: {
    plugins: [tailwindcss()],
    optimizeDeps: {
      exclude: ['cookie']
    },
    ssr: {
      noExternal: ['cookie']
    }
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