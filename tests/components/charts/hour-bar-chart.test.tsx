import { screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { renderWithIntl } from "@tests/helpers/render-with-intl";
import { HourBarChart, type HourBar } from "@/components/charts/hour-bar-chart";

const bars: HourBar[] = [
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

describe("HourBarChart", () => {
  // The SVG chart is hidden from screen readers; the table carries the same data.
  it("has a table version of the data for screen readers", () => {
    renderWithIntl(
      <HourBarChart
        bars={bars}
        title="Spotpris pr. time i dag"
        hourHeading="Time"
        valueHeading="Spotpris"
      />,
    );
    const table = screen.getByRole("table", {
      name: "Spotpris pr. time i dag",
    });
    const rows = within(table).getAllByRole("row");
    // Header row + one row per hour.
    expect(rows).toHaveLength(3);
    expect(within(rows[2]).getByText("kl. 18-19")).toBeInTheDocument();
    expect(within(rows[2]).getByText("0,90 kr./kWh")).toBeInTheDocument();
  });
});
