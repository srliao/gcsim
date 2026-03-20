import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { StatTooltip } from "./stat-tooltip.js";

describe("StatTooltip", () => {
  it("returns null when no stats", () => {
    const { container } = render(<StatTooltip />);
    expect(container.innerHTML).toBe("");
  });

  it("renders label", () => {
    render(<StatTooltip label="Bucket 5" stats={{ dps: { mean: 1000, sd: 100 } }} />);
    expect(screen.getByTestId("stat-tooltip")).toHaveTextContent("Bucket 5");
  });

  it("renders stat mean and sd", () => {
    render(<StatTooltip stats={{ damage: { mean: 50250, sd: 4200 } }} />);
    const tooltip = screen.getByTestId("stat-tooltip");
    expect(tooltip).toHaveTextContent("50,250");
    expect(tooltip).toHaveTextContent("4,200");
  });

  it("renders multiple stats", () => {
    render(
      <StatTooltip
        stats={{
          pyro: { mean: 1000 },
          hydro: { mean: 2000 },
        }}
      />,
    );
    const tooltip = screen.getByTestId("stat-tooltip");
    expect(tooltip).toHaveTextContent("pyro");
    expect(tooltip).toHaveTextContent("hydro");
  });
});
