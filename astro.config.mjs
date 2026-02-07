// @ts-check

import tailwindcss from '@tailwindcss/vite';
import vercel from '@astrojs/vercel';
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import icon from 'astro-icon';

// https://astro.build/config
export default defineConfig({
  output: 'static',
  adapter: vercel(),
  vite: {
    // @ts-ignore
    plugins: [tailwindcss()],
  },

  integrations: [react(), icon()],
});