import { describe, expect, it } from "vitest";
import { createDemoConsumptionSource } from "@/lib/sources/demo/demo-consumption-source";
import { dayRange } from "@/lib/utils/time";

const normalDay = dayRange(new Date("2026-10-28T12:00:00Z"));

describe("createDemoConsumptionSource", () => {
  it("has one electricity meter", async () => {
    // Arrange
    const source = createDemoConsumptionSource();

    // Act
    const meteringPoints = await source.getMeteringPoints();

    // Assert
    expect(meteringPoints).toEqual([
      { id: "demo", consumptionType: "electricity", label: "Demo" },
    ]);
  });

  it("returns one point per hour for a normal day", async () => {
    // Arrange
    const source = createDemoConsumptionSource();

    // Act
    const points = await source.getConsumption(normalDay, "demo");

    // Assert
    expect(points).toHaveLength(24);
  });

  it("returns 25 points on the day summer time ends", async () => {
    // Arrange
    const source = createDemoConsumptionSource();
    const summerTimeEnds = dayRange(new Date("2026-10-25T12:00:00Z"));

    // Act
    const points = await source.getConsumption(summerTimeEnds, "demo");

    // Assert
    expect(points).toHaveLength(25);
  });

  it("returns hourly kWh for the demo meter", async () => {
    // Arrange
    const source = createDemoConsumptionSource();

    // Act
    const [first] = await source.getConsumption(normalDay, "demo");

    // Assert
    expect(first).toMatchObject({
      meteringPointId: "demo",
      start: normalDay.start,
      intervalLength: "hour",
      unit: "kWh",
    });
  });

  it("uses more at the evening peak than at night", async () => {
    // Arrange
    const source = createDemoConsumptionSource();

    // Act
    const points = await source.getConsumption(normalDay, "demo");

    // Assert: index = Danish hour, because the day starts at Danish midnight.
    const threeAtNight = points[3].quantity;
    const sixInTheEvening = points[18].quantity;
    expect(sixInTheEvening).toBeGreaterThan(threeAtNight);
  });

  it("returns the same values every time", async () => {
    // Arrange
    const source = createDemoConsumptionSource();
    const firstCall = await source.getConsumption(normalDay, "demo");

    // Act
    const secondCall = await source.getConsumption(normalDay, "demo");

    // Assert
    expect(secondCall).toEqual(firstCall);
  });

  it("returns an empty list for an unknown meter", async () => {
    // Arrange
    const source = createDemoConsumptionSource();

    // Act
    const points = await source.getConsumption(normalDay, "571313000000000000");

    // Assert
    expect(points).toEqual([]);
  });
});
