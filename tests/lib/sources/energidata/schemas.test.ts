import { describe, expect, it } from "vitest";
import {
  co2EmissionsResponseSchema,
  dayAheadPricesResponseSchema,
} from "@/lib/sources/energidata/schemas";
import co2Fixture from "@tests/fixtures/energidata/co2-emis.json";
import forecastFixture from "@tests/fixtures/energidata/co2-emis-prog.json";
import pricesFixture from "@tests/fixtures/energidata/day-ahead-prices.json";

describe("Energi Data Service schemas", () => {
  it("accept the saved real responses", () => {
    expect(dayAheadPricesResponseSchema.safeParse(pricesFixture).success).toBe(
      true,
    );
    expect(co2EmissionsResponseSchema.safeParse(co2Fixture).success).toBe(true);
    expect(co2EmissionsResponseSchema.safeParse(forecastFixture).success).toBe(
      true,
    );
  });

  it("reject a price that is missing", () => {
    const broken = {
      records: [{ TimeUTC: "2026-10-28T11:00:00", PriceArea: "DK1" }],
    };
    expect(dayAheadPricesResponseSchema.safeParse(broken).success).toBe(false);
  });

  it("reject an unknown price area", () => {
    const broken = {
      records: [
        {
          Minutes5UTC: "2026-10-28T11:00:00",
          PriceArea: "SE3",
          CO2Emission: 1,
        },
      ],
    };
    expect(co2EmissionsResponseSchema.safeParse(broken).success).toBe(false);
  });
});
