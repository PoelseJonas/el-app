import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SegmentedControl } from "@/components/ui/segmented-control";

const options = [
  { value: "da", label: "Dansk" },
  { value: "en", label: "English" },
];

async function noop() {}

describe("SegmentedControl", () => {
  it("groups the options under the legend", () => {
    render(
      <SegmentedControl
        action={noop}
        name="locale"
        legend="Sprog"
        value="da"
        options={options}
      />,
    );
    expect(screen.getByRole("group", { name: "Sprog" })).toBeInTheDocument();
  });

  it("marks only the chosen option as pressed", () => {
    render(
      <SegmentedControl
        action={noop}
        name="locale"
        legend="Sprog"
        value="en"
        options={options}
      />,
    );
    expect(screen.getByRole("button", { name: "English" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("button", { name: "Dansk" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });

  it("submits the option's value under the given name", () => {
    render(
      <SegmentedControl
        action={noop}
        name="locale"
        legend="Sprog"
        value="da"
        options={options}
      />,
    );
    const button = screen.getByRole("button", { name: "English" });
    expect(button).toHaveAttribute("type", "submit");
    expect(button).toHaveAttribute("name", "locale");
    expect(button).toHaveAttribute("value", "en");
  });
});
