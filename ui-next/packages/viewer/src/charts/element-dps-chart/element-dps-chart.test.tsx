import type { Sim } from "@gcsim/types";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ElementDpsChart, transformElementDps } from "./element-dps-chart.js";

const mockData: Sim.ElementStats[] = [
  { elements: { pyro: { mean: 30000 }, physical: { mean: 5100 } } },
  { elements: { hydro: { mean: 14000 }, physical: { mean: 1150 } } },
];
const mockNames = ["Hu Tao", "Xingqiu"];

describe("transformElementDps", () => {
  it("produces correct rows with character names", () => {
    const { rows } = transformElementDps(mockData, mockNames);
    expect(rows).toHaveLength(2);
    expect(rows[0].name).toBe("Hu Tao");
    expect(rows[1].name).toBe("Xingqiu");
  });

  it("maps element values to row fields", () => {
    const { rows } = transformElementDps(mockData, mockNames);
    expect(rows[0].pyro).toBe(30000);
    expect(rows[0].physical).toBe(5100);
    expect(rows[1].hydro).toBe(14000);
    expect(rows[1].physical).toBe(1150);
  });

  it("defaults missing element to 0", () => {
    const { rows } = transformElementDps(mockData, mockNames);
    // Hu Tao has no hydro entry, Xingqiu has no pyro entry
    expect(rows[0].hydro).toBe(0);
    expect(rows[1].pyro).toBe(0);
  });

  it("collects all unique element keys across characters", () => {
    const { keys } = transformElementDps(mockData, mockNames);
    expect(keys).toContain("pyro");
    expect(keys).toContain("hydro");
    expect(keys).toContain("physical");
    expect(keys).toHaveLength(3);
  });

  it("returns empty rows and keys for empty data", () => {
    const { rows, keys } = transformElementDps([], []);
    expect(rows).toHaveLength(0);
    expect(keys).toHaveLength(0);
  });
});

describe("ElementDpsChart", () => {
  it("renders without crashing with sample data", () => {
    const { container } = render(<ElementDpsChart data={mockData} characterNames={mockNames} />);
    expect(container.firstChild).not.toBeNull();
  });

  it("renders the chart wrapper with data-testid", () => {
    render(<ElementDpsChart data={mockData} characterNames={mockNames} />);
    expect(screen.getByTestId("element-dps-chart")).toBeInTheDocument();
  });

  it("renders chart title", () => {
    render(<ElementDpsChart data={mockData} characterNames={mockNames} />);
    expect(screen.getByTestId("chart-shell-title")).toHaveTextContent("Element DPS");
  });

  it("renders chart container when data is provided", () => {
    render(<ElementDpsChart data={mockData} characterNames={mockNames} />);
    expect(screen.getByTestId("chart-shell-body")).toBeInTheDocument();
  });

  it("renders empty state when data is empty", () => {
    render(<ElementDpsChart data={[]} characterNames={[]} />);
    expect(screen.getByTestId("chart-shell-empty")).toHaveTextContent("No data available");
  });

  it("renders empty state when data is undefined", () => {
    render(<ElementDpsChart data={undefined} characterNames={[]} />);
    expect(screen.getByTestId("chart-shell-empty")).toHaveTextContent("No data available");
  });
});
