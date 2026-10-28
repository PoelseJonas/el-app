import { describe, expect, it, vi } from "vitest";
import { SourceUnavailableError } from "@/lib/domain/errors";
import {
  buildDatasetUrl,
  createEnergiDataCo2Source,
  createEnergiDataPriceSource,
  type Fetch,
} from "@/lib/sources/energidata/client";
import co2Fixture from "@tests/fixtures/energidata/co2-emis.json";
import forecastFixture from "@tests/fixtures/energidata/co2-emis-prog.json";
import pricesFixture from "@tests/fixtures/energidata/day-ahead-prices.json";

const range = {
  start: new Date("2026-10-28T11:00:00Z"),
  end: new Date("2026-10-28T13:00:00Z"),
};

/** A fake fetch that answers each dataset with a saved response; no network in tests. */
function fakeFetch(bodies: Record<string, unknown>): Fetch {
  return vi.fn(async (input: string | URL | Request) => {
    const dataset = new URL(String(input)).pathname.split("/").at(-1)!;
    return Response.json(bodies[dataset]);
  }) as Fetch;
}

describe("buildDatasetUrl", () => {
  it("asks for UTC times, the price area and sorted rows", () => {
    const url = new URL(
      buildDatasetUrl(
        "https://api.energidataservice.dk",
        "DayAheadPrices",
        range,
        "DK2",
      ),
    );
    expect(url.pathname).toBe("/dataset/DayAheadPrices");
    expect(url.searchParams.get("start")).toBe("2026-10-28T11:00");
    expect(url.searchParams.get("end")).toBe("2026-10-28T13:00");
    expect(url.searchParams.get("timezone")).toBe("UTC");
    expect(url.searchParams.get("filter")).toBe('{"PriceArea":["DK2"]}');
    expect(url.searchParams.get("sort")).toBe("TimeUTC asc");
  });
});

describe("createEnergiDataPriceSource", () => {
  it("returns mapped prices", async () => {
    const source = createEnergiDataPriceSource({
      fetch: fakeFetch({ DayAheadPrices: pricesFixture }),
    });
    const prices = await source.getPrices(range, "DK1");
    expect(prices).toHaveLength(8);
  });

  it("throws a typed error on an HTTP error", async () => {
    const source = createEnergiDataPriceSource({
      fetch: async () => new Response("busy", { status: 503 }),
    });
    await expect(source.getPrices(range, "DK1")).rejects.toMatchObject({
      name: "SourceUnavailableError",
      reason: "http",
      status: 503,
    });
  });

  it("throws a typed error when the network fails", async () => {
    const source = createEnergiDataPriceSource({
      fetch: async () => {
        throw new TypeError("fetch failed");
      },
    });
    await expect(source.getPrices(range, "DK1")).rejects.toBeInstanceOf(
      SourceUnavailableError,
    );
  });

  it("throws a typed error when the response has an unexpected shape", async () => {
    const source = createEnergiDataPriceSource({
      fetch: fakeFetch({ DayAheadPrices: { records: [{ wrong: true }] } }),
    });
    await expect(source.getPrices(range, "DK1")).rejects.toMatchObject({
      reason: "invalid-response",
    });
  });
});

describe("createEnergiDataCo2Source", () => {
  it("combines measured values and the forecast without duplicates", async () => {
    // Both fixtures cover the same hour, so every forecast point is replaced by a measured one.
    const source = createEnergiDataCo2Source({
      fetch: fakeFetch({ CO2Emis: co2Fixture, CO2EmisProg: forecastFixture }),
    });
    const points = await source.getCo2(range, "DK1");
    expect(points).toHaveLength(12);
    expect(points.every((p) => !p.isForecast)).toBe(true);
  });

  it("uses the forecast where nothing is measured yet", async () => {
    const source = createEnergiDataCo2Source({
      fetch: fakeFetch({
        CO2Emis: { records: [] },
        CO2EmisProg: forecastFixture,
      }),
    });
    const points = await source.getCo2(range, "DK1");
    expect(points).toHaveLength(12);
    expect(points.every((p) => p.isForecast)).toBe(true);
  });
});
