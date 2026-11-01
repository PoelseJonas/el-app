// End-to-end tests: the whole app in a real browser (tests/e2e/). Vitest covers logic and
// components; these few tests cover the flows that matter (docs/architecture.md, "Tests").
// Run with `npm run test:e2e`. CI runs them in their own job (.github/workflows/ci.yml).

import { defineConfig, devices } from "@playwright/test";

const APP_PORT = 3100;
const FIXTURE_PORT = 4010;
const isCi = Boolean(process.env.CI);

export default defineConfig({
  testDir: "tests/e2e",
  // Fail CI if a test.only was left in by mistake.
  forbidOnly: isCi,
  retries: isCi ? 1 : 0,
  reporter: isCi ? "github" : "list",
  use: {
    baseURL: `http://localhost:${APP_PORT}`,
    // Danish browser, so the app picks Danish like it would for most users.
    locale: "da-DK",
    trace: "retain-on-failure",
  },
  // Desktop shows TopNav, mobile shows BottomNav; the navigation test runs on both.
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
  webServer: [
    {
      command: "node tests/e2e/fixture-server.mts",
      env: { PORT: String(FIXTURE_PORT) },
      url: `http://localhost:${FIXTURE_PORT}/dataset/DayAheadPrices`,
      reuseExistingServer: !isCi,
    },
    {
      // A production build, so the tests see what users get. `next start` keeps its
      // in-memory cache per process, so a fresh server never has real API data cached.
      command: `npm run build && npx next start --port ${APP_PORT}`,
      env: {
        ENERGIDATA_BASE_URL: `http://localhost:${FIXTURE_PORT}`,
        PRICE_AREA: "DK1",
      },
      url: `http://localhost:${APP_PORT}`,
      timeout: 180_000,
      reuseExistingServer: false,
    },
  ],
});
