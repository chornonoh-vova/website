// @ts-check
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import vercel from "@astrojs/vercel";
import react from "@astrojs/react";

export default defineConfig({
  site: "https://chornonoh-vova.com",
  prefetch: true,

  vite: {
    plugins: [tailwindcss()],
  },

  markdown: {
    shikiConfig: {
      themes: {
        light: "github-light",
        dark: "github-dark",
      },
    },
  },

  experimental: {
    headingIdCompat: true,
  },

  integrations: [
    mdx({
      optimize: {
        ignoreElementNames: ["a"],
      },
    }),
    sitemap(),
    react(),
  ],

  adapter: vercel(),
});
