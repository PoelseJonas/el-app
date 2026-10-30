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

// #region Test data

const range = {
  start: new Date("2026-10-28T11:00:00Z"),
  end: new Date("2026-10-28T13:00:00Z"),
};

/** A fake fetch that answers each dataset with a saved response; no network in tests. */
function fakeFetch(bodies: Record<string, unknown>): Fetch {
  return vi.fn(async (input: string | URL | Request) => {
    const dataset = new URL(String(input)).pathname.split("/").at(-1);
    return Response.json(bodies[dataset ?? ""]);
  }) as Fetch;
}

const failingWithStatus =
  (status: number): Fetch =>
  async () =>
    new Response("error", { status });

const failingNetwork: Fetch = async () => {
  throw new TypeError("fetch failed");
};

// #endregion

describe("buildDatasetUrl", () => {
  it("asks for UTC times, the price area and sorted rows", () => {
    // Arrange
    const query = { range, area: "DK2" as const };

    // Act
    const url = new URL(
      buildDatasetUrl(
        "https://api.energidataservice.dk",
        "DayAheadPrices",
        query,
      ),
    );

    // Assert
    expect(url.pathname).toBe("/dataset/DayAheadPrices");
    expect(Object.fromEntries(url.searchParams)).toEqual({
      start: "2026-10-28T11:00",
      end: "2026-10-28T13:00",
      timezone: "UTC",
      filter: '{"PriceArea":["DK2"]}',
      sort: "TimeUTC asc",
    });
  });
});

describe("createEnergiDataPriceSource", () => {
  it("returns the mapped prices", async () => {
    // Arrange
    const source = createEnergiDataPriceSource({
      fetch: fakeFetch({ DayAheadPrices: pricesFixture }),
    });

    // Act
    const prices = await source.getPrices(range, "DK1");

    // Assert
    expect(prices).toHaveLength(8);
  });

  it("throws a typed error on an HTTP error", async () => {
    // Arrange
    const source = createEnergiDataPriceSource({
      fetch: failingWithStatus(503),
    });

    // Act
    const result = source.getPrices(range, "DK1");

    // Assert
    await expect(result).rejects.toMatchObject({
      name: "SourceUnavailableError",
      reason: "http",
      status: 503,
    });
  });

  it("throws a typed error when the network fails", async () => {
    // Arrange
    const source = createEnergiDataPriceSource({ fetch: failingNetwork });

    // Act
    const result = source.getPrices(range, "DK1");

    // Assert
    await expect(result).rejects.toBeInstanceOf(SourceUnavailableError);
  });

  it("throws a typed error when the response has an unexpected shape", async () => {
    // Arrange
    const source = createEnergiDataPriceSource({
      fetch: fakeFetch({ DayAheadPrices: { records: [{ wrong: true }] } }),
    });

    // Act
    const result = source.getPrices(range, "DK1");

    // Assert
    await expect(result).rejects.toMatchObject({ reason: "invalid-response" });
  });
});

describe("createEnergiDataCo2Source", () => {
  it("uses measured values where both measured and forecast exist", async () => {
    // Arrange: both fixtures cover the same hour.
    const source = createEnergiDataCo2Source({
      fetch: fakeFetch({ CO2Emis: co2Fixture, CO2EmisProg: forecastFixture }),
    });

    // Act
    const points = await source.getCo2(range, "DK1");

    // Assert
    expect(points).toHaveLength(12);
    expect(points.every((point) => !point.isForecast)).toBe(true);
  });

  it("uses the forecast where nothing is measured yet", async () => {
    // Arrange
    const source = createEnergiDataCo2Source({
      fetch: fakeFetch({
        CO2Emis: { records: [] },
        CO2EmisProg: forecastFixture,
      }),
    });

    // Act
    const points = await source.getCo2(range, "DK1");

    // Assert
    expect(points).toHaveLength(12);
    expect(points.every((point) => point.isForecast)).toBe(true);
  });
});
