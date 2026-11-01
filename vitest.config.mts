import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  // Vitest runs on Vite, not on Next.js/Turbopack, so JSX support is set up separately here.
  plugins: [react()],
  resolve: {
    // Mirrors "paths" in tsconfig.json; Vite does not read it on its own. Keep both in sync.
    alias: {
      "@tests": fileURLToPath(new URL("./tests", import.meta.url)),
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      // "server-only" throws outside Next.js' server build. Tests run server code directly,
      // so they get the package's own empty stand-in instead.
      "server-only": fileURLToPath(
        new URL("./node_modules/server-only/empty.js", import.meta.url),
      ),
    },
  },
  test: {
    // Simulated browser DOM, so components can be rendered in tests.
    environment: "jsdom",
    setupFiles: ["./tests/setup.ts"],
    // All tests live in tests/, organised like src/. Browser tests (Playwright) will go in
    // tests/e2e/ and run separately, so Vitest skips them.
    include: ["tests/**/*.test.{ts,tsx}"],
    exclude: ["node_modules", ".next", "tests/e2e/**"],
  },
});
