import type { Sim } from "@gcsim/types";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { elementColor } from "../util/colors.js";
import { ElementDpsPie, transformElementDpsPie } from "./element-dps-pie.js";

const mockElementDps: Sim.ElementDPS = {
  pyro: { mean: 30000 },
  hydro: { mean: 14000 },
  physical: { mean: 6250 },
};

describe("transformElementDpsPie", () => {
  it("converts ElementDPS to chart data with name, value, pct, and color", () => {
    const result = transformElementDpsPie(mockElementDps);
    expect(result).toHaveLength(3);

    const pyro = result.find((d) => d.name === "Pyro");
    expect(pyro).toBeDefined();
    expect(pyro?.value).toBe(30000);
    expect(pyro?.color).toBe(elementColor("pyro"));

    const hydro = result.find((d) => d.name === "Hydro");
    expect(hydro).toBeDefined();
    expect(hydro?.value).toBe(14000);
    expect(hydro?.color).toBe(elementColor("hydro"));

    const physical = result.find((d) => d.name === "Physical");
    expect(physical).toBeDefined();
    expect(physical?.value).toBe(6250);
    expect(physical?.color).toBe(elementColor("physical"));
  });

  it("capitalizes element names for display", () => {
    const result = transformElementDpsPie({ electro: { mean: 5000 } });
    expect(result[0].name).toBe("Electro");
  });

  it("computes percentage strings relative to total mean", () => {
    const result = transformElementDpsPie(mockElementDps);
    const total = 30000 + 14000 + 6250; // 50250
    const pyroPct = `${Math.round((30000 / total) * 100)}%`;
    const pyro = result.find((d) => d.name === "Pyro");
    expect(pyro?.pct).toBe(pyroPct);
  });

  it("percentages sum to ~100%", () => {
    const result = transformElementDpsPie(mockElementDps);
    const total = result.reduce((sum, d) => {
      return sum + Number.parseInt(d.pct.replace("%", ""), 10);
    }, 0);
    expect(total).toBeGreaterThanOrEqual(98);
    expect(total).toBeLessThanOrEqual(102);
  });

  it("defaults mean to 0 when undefined", () => {
    const result = transformElementDpsPie({ pyro: { min: 0, max: 10 } });
    expect(result[0].value).toBe(0);
  });

  it("returns empty array when input is undefined", () => {
    const result = transformElementDpsPie(undefined);
    expect(result).toHaveLength(0);
  });

  it("returns empty array when input has no entries", () => {
    const result = transformElementDpsPie({});
    expect(result).toHaveLength(0);
  });

  it("uses elementColor for slice colors", () => {
    const result = transformElementDpsPie({ geo: { mean: 10000 } });
    expect(result[0].color).toBe(elementColor("geo"));
  });
});

describe("ElementDpsPie", () => {
  it("renders without crashing with valid data", () => {
    const { container } = render(<ElementDpsPie elementDps={mockElementDps} />);
    expect(container.firstChild).not.toBeNull();
  });

  it("renders the chart wrapper with data-testid", () => {
    render(<ElementDpsPie elementDps={mockElementDps} />);
    expect(screen.getByTestId("element-dps-pie")).toBeInTheDocument();
  });

  it("renders chart title", () => {
    render(<ElementDpsPie elementDps={mockElementDps} />);
    expect(screen.getByTestId("chart-shell-title")).toHaveTextContent("Element DPS");
  });

  it("renders chart container when data is provided", () => {
    render(<ElementDpsPie elementDps={mockElementDps} />);
    expect(screen.getByTestId("chart-shell-body")).toBeInTheDocument();
  });

  it("renders all elements present in input via transform", () => {
    // Verify the transform produces entries for all input elements
    const data = transformElementDpsPie(mockElementDps);
    const names = data.map((d) => d.name);
    expect(names).toContain("Pyro");
    expect(names).toContain("Hydro");
    expect(names).toContain("Physical");
  });

  it("renders empty state when elementDps is undefined", () => {
    render(<ElementDpsPie elementDps={undefined} />);
    expect(screen.getByTestId("chart-shell-empty")).toHaveTextContent("No data available");
  });

  it("renders empty state when elementDps is empty object", () => {
    render(<ElementDpsPie elementDps={{}} />);
    expect(screen.getByTestId("chart-shell-empty")).toHaveTextContent("No data available");
  });
});
