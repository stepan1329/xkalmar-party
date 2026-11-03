// @ts-check
import { defineConfig } from 'astro/config';
import imagemin from 'vite-plugin-imagemin';

// https://astro.build/config
export default defineConfig({
  site: 'https://xkalmar.com',
  sitemap: {
    exclude: ['/privacy/**'],
  },
  vite: {
    plugins: [
      imagemin({
        gifsicle: { optimizationLevel: 7 },
        optipng: { optimizationLevel: 7 },
        mozjpeg: { quality: 80, progressive: true },
        pngquant: { quality: [0.8, 0.9] },
        svgo: {
          plugins: [
            { name: 'removeViewBox' },
            { name: 'removeEmptyAttrs', active: false },
          ],
        },
      }),
    ],
  },
});
