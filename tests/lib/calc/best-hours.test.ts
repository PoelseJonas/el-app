import { describe, expect, it } from "vitest";
import { lowestHours } from "@/lib/calc/best-hours";

interface TestHour {
  start: Date;
  value: number;
}

function hour(utcHour: number, value: number): TestHour {
  return { start: new Date(Date.UTC(2026, 9, 28, utcHour)), value };
}

const valueOf = (item: TestHour) => item.value;
const utcHours = (items: TestHour[]) =>
  items.map((item) => item.start.getUTCHours());

describe("lowestHours", () => {
  it("picks the lowest values and returns them in time order", () => {
    // Arrange
    const hours = [hour(0, 5), hour(1, 1), hour(2, 4), hour(3, 2), hour(4, 3)];

    // Act
    const best = lowestHours(hours, valueOf, 3);

    // Assert
    expect(utcHours(best)).toEqual([1, 3, 4]);
  });

  it("prefers the earlier hour on a tie", () => {
    // Arrange
    const tied = [hour(5, 1), hour(2, 1)];

    // Act
    const best = lowestHours(tied, valueOf, 1);

    // Assert
    expect(utcHours(best)).toEqual([2]);
  });

  it("returns all hours when there are fewer than asked for", () => {
    // Arrange
    const twoHours = [hour(0, 5), hour(1, 1)];

    // Act
    const best = lowestHours(twoHours, valueOf, 3);

    // Assert
    expect(best).toHaveLength(2);
  });

  it("does not change the input", () => {
    // Arrange
    const hours = [hour(0, 5), hour(1, 1), hour(2, 4)];
    const original = [...hours];

    // Act
    lowestHours(hours, valueOf, 2);

    // Assert
    expect(hours).toEqual(original);
  });
});
