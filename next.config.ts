import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enables "use cache" and Partial Prerendering: static parts of a page are prerendered,
  // dynamic parts stream in. Next.js recommends partialPrefetching together with it.
  // See node_modules/next/dist/docs/01-app/03-api-reference/05-config/01-next-config-js/cacheComponents.md
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      // Tailwind v4 runs as a Turbopack loader on CSS files (no PostCSS config needed).
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
