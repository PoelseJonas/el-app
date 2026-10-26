import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  // Vitest runs on Vite, not on Next.js/Turbopack, so JSX support is set up separately here.
  plugins: [react()],
  resolve: {
    // Mirrors "paths" in tsconfig.json; Vite does not read it on its own.
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  test: {
    // Simulated browser DOM, so components can be rendered in tests.
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
    exclude: ["node_modules", ".next"],
  },
});
