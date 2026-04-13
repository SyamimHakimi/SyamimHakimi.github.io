import { defineConfig } from "astro/config";
import { fileURLToPath } from "node:url";
import vue from "@astrojs/vue";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";

const astroPrerenderEntrypoint = fileURLToPath(
  new URL(
    "./node_modules/astro/dist/entrypoints/prerender.js",
    import.meta.url,
  ),
);

// https://astro.build/config
export default defineConfig({
  // GitHub Pages deployment — must match the repo's public URL.
  site: "https://syamimhakimi.github.io",
  output: "static",
  integrations: [
    vue(),
    // Generates /sitemap-index.xml and /sitemap-0.xml from all static routes.
    sitemap(),
  ],
  vite: {
    resolve: {
      // Work around Vite/Rollup failing to resolve Astro's exported prerender
      // entrypoint as a build input in this project/dependency setup.
      alias: {
        "astro/entrypoints/prerender": astroPrerenderEntrypoint,
      },
    },
    plugins: [tailwindcss()],
  },
});
