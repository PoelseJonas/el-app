// A tiny stand-in for Energi Data Service during the Playwright tests. The app calls the API
// from the server, where Playwright cannot intercept requests, so playwright.config.ts starts
// this server and points ENERGIDATA_BASE_URL at it. It answers every request for a dataset
// with the saved response in tests/fixtures/energidata/, whatever the date range.
// Run with plain Node (24 runs TypeScript directly): node tests/e2e/fixture-server.mts

import { readFileSync } from "node:fs";
import { createServer } from "node:http";
import { join } from "node:path";

const PORT = Number(process.env.PORT ?? 4010);
const fixtures = join(import.meta.dirname, "..", "fixtures", "energidata");

const FILES: Record<string, string> = {
  DayAheadPrices: "day-ahead-prices.json",
  CO2Emis: "co2-emis.json",
  CO2EmisProg: "co2-emis-prog.json",
};

createServer((request, response) => {
  // "/dataset/DayAheadPrices?start=..." -> "DayAheadPrices"
  const dataset = new URL(request.url ?? "/", "http://localhost").pathname
    .split("/")
    .at(-1);
  const file = dataset ? FILES[dataset] : undefined;
  if (!file) {
    response.writeHead(404).end();
    return;
  }
  response.writeHead(200, { "content-type": "application/json" });
  response.end(readFileSync(join(fixtures, file)));
}).listen(PORT, () => {
  console.log(`Energi Data Service fixtures on http://localhost:${PORT}`);
});
