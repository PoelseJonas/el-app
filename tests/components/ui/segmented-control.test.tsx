import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SegmentedControl } from "@/components/ui/segmented-control";

const languages = [
  { value: "da", label: "Dansk" },
  { value: "en", label: "English" },
];

async function noAction() {}

function renderLanguagePicker(chosen: string) {
  render(
    <SegmentedControl
      action={noAction}
      name="locale"
      legend="Sprog"
      value={chosen}
      options={languages}
    />,
  );
}

describe("SegmentedControl", () => {
  it("groups the options under the legend", () => {
    // Arrange
    const chosen = "da";

    // Act
    renderLanguagePicker(chosen);

    // Assert
    expect(screen.getByRole("group", { name: "Sprog" })).toBeInTheDocument();
  });

  it("marks the chosen option as pressed", () => {
    // Arrange
    const chosen = "en";

    // Act
    renderLanguagePicker(chosen);

    // Assert
    expect(screen.getByRole("button", { name: "English" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it("does not mark the other options as pressed", () => {
    // Arrange
    const chosen = "en";

    // Act
    renderLanguagePicker(chosen);

    // Assert
    expect(screen.getByRole("button", { name: "Dansk" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });

  it("submits the option's value under the given name", () => {
    // Arrange
    const chosen = "da";

    // Act
    renderLanguagePicker(chosen);

    // Assert
    const english = screen.getByRole("button", { name: "English" });
    expect(english).toHaveAttribute("type", "submit");
    expect(english).toHaveAttribute("name", "locale");
    expect(english).toHaveAttribute("value", "en");
  });
});
