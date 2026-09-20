// @ts-check
import { existsSync } from "node:fs";
import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";

// The live site. Used for canonical URLs, sitemap, RSS and OG tags.
// The custom domain is served from GitHub Pages via public/CNAME.
const SITE_URL = "https://mehedimaruf.com";

/**
 * Local tools, not pages of the site. They live in .local-tool/ (gitignored,
 * outside src/) and are injected only when the command is `dev`, so they cannot
 * leak into a production build. The existsSync guard keeps `npm run dev` working
 * on a fresh clone where .local-tool/ is absent.
 */
const LOCAL_TOOLS = [{ pattern: "/font-lab", entrypoint: "./.local-tool/font-lab.astro" }];

/** @type {import("astro").AstroIntegration} */
const devOnlyRoutes = {
  name: "dev-only-routes",
  hooks: {
    "astro:config:setup": ({ command, injectRoute, logger }) => {
      if (command !== "dev") return;
      for (const tool of LOCAL_TOOLS) {
        if (!existsSync(new URL(tool.entrypoint, import.meta.url))) {
          logger.warn(`local tool missing, route ${tool.pattern} not mounted`);
          continue;
        }
        injectRoute(tool);
      }
    },
  },
};

export default defineConfig({
  site: SITE_URL,
  base: "/",
  trailingSlash: "ignore",
  integrations: [mdx(), sitemap(), devOnlyRoutes],
  image: {
    // Photography lives on Cloudflare R2 (see docs/MEDIA.md). Allow Astro to
    // optimise those images at build time; nothing else is remote.
    domains: ["img.mehedimaruf.com"],
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
