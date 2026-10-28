import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { BestHoursList } from "@/components/features/prices/best-hours-list";

describe("BestHoursList", () => {
  it("lists each hour with its value under the title", () => {
    render(
      <BestHoursList
        title="De billigste timer"
        emptyText="Der er ikke flere timer i dag."
        items={[
          { key: "a", label: "kl. 02-03", valueLabel: "0,85 kr./kWh" },
          { key: "b", label: "kl. 03-04", valueLabel: "0,88 kr./kWh" },
        ]}
      />,
    );
    expect(
      screen.getByRole("heading", { name: "De billigste timer" }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
    expect(screen.getByText("0,85 kr./kWh")).toBeInTheDocument();
  });

  it("explains why the list is empty instead of showing nothing", () => {
    render(
      <BestHoursList
        title="De billigste timer"
        emptyText="Der er ikke flere timer i dag."
        items={[]}
      />,
    );
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
    expect(
      screen.getByText("Der er ikke flere timer i dag."),
    ).toBeInTheDocument();
  });
});
