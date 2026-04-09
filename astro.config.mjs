import { defineConfig } from "astro/config";
import vue from "@astrojs/vue";
import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  site: "https://syamimhakimi.github.io",
  output: "static",
  integrations: [vue()],
  vite: {
    plugins: [tailwindcss()],
  },
});
