import { defineConfig } from "astro/config";
import vue from "@astrojs/vue";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";

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
    plugins: [tailwindcss()],
  },
});
