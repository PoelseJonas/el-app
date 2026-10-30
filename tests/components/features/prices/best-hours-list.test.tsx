import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { BestHoursList } from "@/components/features/prices/best-hours-list";

const twoCheapHours = [
  { key: "a", label: "kl. 02-03", valueLabel: "0,85 kr./kWh" },
  { key: "b", label: "kl. 03-04", valueLabel: "0,88 kr./kWh" },
];

function renderCheapestList(items: typeof twoCheapHours) {
  render(
    <BestHoursList
      title="De billigste timer"
      emptyText="Der er ikke flere timer i dag."
      items={items}
    />,
  );
}

describe("BestHoursList", () => {
  it("shows the title as a heading", () => {
    // Arrange
    const items = twoCheapHours;

    // Act
    renderCheapestList(items);

    // Assert
    expect(
      screen.getByRole("heading", { name: "De billigste timer" }),
    ).toBeInTheDocument();
  });

  it("lists each hour with its value", () => {
    // Arrange
    const items = twoCheapHours;

    // Act
    renderCheapestList(items);

    // Assert
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
    expect(screen.getByText("0,85 kr./kWh")).toBeInTheDocument();
  });

  it("explains why the list is empty instead of showing nothing", () => {
    // Arrange
    const noItems: typeof twoCheapHours = [];

    // Act
    renderCheapestList(noItems);

    // Assert
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
    expect(
      screen.getByText("Der er ikke flere timer i dag."),
    ).toBeInTheDocument();
  });
});
