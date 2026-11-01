import { describe, expect, it } from "vitest";
import {
  co2EmissionsResponseSchema,
  dayAheadPricesResponseSchema,
} from "@/lib/sources/energidata/schemas";
import co2Fixture from "@tests/fixtures/energidata/co2-emis.json";
import forecastFixture from "@tests/fixtures/energidata/co2-emis-prog.json";
import pricesFixture from "@tests/fixtures/energidata/day-ahead-prices.json";

describe("dayAheadPricesResponseSchema", () => {
  it("accepts the saved real response", () => {
    // Arrange
    const response = pricesFixture;

    // Act
    const result = dayAheadPricesResponseSchema.safeParse(response);

    // Assert
    expect(result.success).toBe(true);
  });

  it("rejects a record without a price", () => {
    // Arrange
    const missingPrice = {
      records: [{ TimeUTC: "2026-10-28T11:00:00", PriceArea: "DK1" }],
    };

    // Act
    const result = dayAheadPricesResponseSchema.safeParse(missingPrice);

    // Assert
    expect(result.success).toBe(false);
  });
});

describe("co2EmissionsResponseSchema", () => {
  it("accepts the saved measured response", () => {
    // Arrange
    const response = co2Fixture;

    // Act
    const result = co2EmissionsResponseSchema.safeParse(response);

    // Assert
    expect(result.success).toBe(true);
  });

  it("accepts the saved forecast response", () => {
    // Arrange
    const response = forecastFixture;

    // Act
    const result = co2EmissionsResponseSchema.safeParse(response);

    // Assert
    expect(result.success).toBe(true);
  });

  it("rejects an unknown price area", () => {
    // Arrange
    const swedishArea = {
      records: [
        {
          Minutes5UTC: "2026-10-28T11:00:00",
          PriceArea: "SE3",
          CO2Emission: 1,
        },
      ],
    };

    // Act
    const result = co2EmissionsResponseSchema.safeParse(swedishArea);

    // Assert
    expect(result.success).toBe(false);
  });
});
