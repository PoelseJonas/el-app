import { screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { renderWithIntl } from "@tests/helpers/render-with-intl";
import { HourBarChart, type HourBar } from "@/components/charts/hour-bar-chart";

const twoHours: HourBar[] = [
  {
    key: "2026-10-28T16:00:00.000Z",
    label: "17",
    rangeLabel: "kl. 17-18",
    value: 1.2,
    valueLabel: "1,20 kr./kWh",
  },
  {
    key: "2026-10-28T17:00:00.000Z",
    label: "18",
    rangeLabel: "kl. 18-19",
    value: 0.9,
    valueLabel: "0,90 kr./kWh",
    current: true,
  },
];

function renderPriceChart(bars: HourBar[]) {
  renderWithIntl(
    <HourBarChart
      bars={bars}
      title="Spotpris pr. time i dag"
      hourHeading="Time"
      valueHeading="Spotpris"
    />,
  );
}

// The SVG chart is hidden from screen readers; the table carries the same data.
describe("HourBarChart", () => {
  it("has a table version with one row per hour", () => {
    // Arrange
    const bars = twoHours;

    // Act
    renderPriceChart(bars);

    // Assert
    const table = screen.getByRole("table", {
      name: "Spotpris pr. time i dag",
    });
    // Header row + one row per hour.
    expect(within(table).getAllByRole("row")).toHaveLength(3);
  });

  it("shows each hour with its value in the table", () => {
    // Arrange
    const bars = twoHours;

    // Act
    renderPriceChart(bars);

    // Assert
    const row = screen.getByRole("row", { name: /kl. 18-19/ });
    expect(within(row).getByText("0,90 kr./kWh")).toBeInTheDocument();
  });
});
