// @ts-check

import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';
import react from '@astrojs/react';
import icon from 'astro-icon';

// https://astro.build/config
export default defineConfig({
  output: 'server',
  adapter: vercel(),
  image: {
    // Use sharp for image optimization with webp output
    format: ['webp'],
    quality: 80,
  },
  vite: {
    // @ts-ignore
    plugins: [tailwindcss()],
    ssr: {
      noExternal: ['gsap', 'motion', 'ogl'],
    },
  },

  integrations: [react(), icon()],
});