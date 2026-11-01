import { describe, expect, it } from "vitest";
import { parseEnv } from "@/lib/config/env";

describe("parseEnv", () => {
  it("defaults to DK1, the real Energi Data Service and no token", () => {
    // Arrange
    const noVariables = {};

    // Act
    const env = parseEnv(noVariables);

    // Assert
    expect(env).toEqual({
      PRICE_AREA: "DK1",
      ENERGIDATA_BASE_URL: "https://api.energidataservice.dk",
      ELOVERBLIK_REFRESH_TOKEN: undefined,
    });
  });

  it("treats an empty token as missing", () => {
    // Arrange
    const emptyToken = { ELOVERBLIK_REFRESH_TOKEN: "" };

    // Act
    const env = parseEnv(emptyToken);

    // Assert
    expect(env.ELOVERBLIK_REFRESH_TOKEN).toBeUndefined();
  });

  it("rejects an unknown price area", () => {
    // Arrange
    const unknownArea = { PRICE_AREA: "DK3" };

    // Act
    const parse = () => parseEnv(unknownArea);

    // Assert
    expect(parse).toThrow(/PRICE_AREA/);
  });

  it("rejects an Energi Data Service address that is not a URL", () => {
    // Arrange
    const notAUrl = { ENERGIDATA_BASE_URL: "localhost" };

    // Act
    const parse = () => parseEnv(notAUrl);

    // Assert
    expect(parse).toThrow(/ENERGIDATA_BASE_URL/);
  });
});
