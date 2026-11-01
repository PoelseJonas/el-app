import { describe, expect, it } from "vitest";
import { dkkPerMwhToDkkPerKwh } from "@/lib/utils/units";

describe("dkkPerMwhToDkkPerKwh", () => {
  it("converts DKK/MWh to DKK/kWh", () => {
    // Arrange
    const priceDkkPerMwh = 1250;

    // Act
    const priceDkkPerKwh = dkkPerMwhToDkkPerKwh(priceDkkPerMwh);

    // Assert
    expect(priceDkkPerKwh).toBe(1.25);
  });

  it("keeps negative prices negative", () => {
    // Arrange
    const priceDkkPerMwh = -80;

    // Act
    const priceDkkPerKwh = dkkPerMwhToDkkPerKwh(priceDkkPerMwh);

    // Assert
    expect(priceDkkPerKwh).toBe(-0.08);
  });
});
