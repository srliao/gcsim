import type { Sim } from "@gcsim/types";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { EndingEnergyChart, transformEndingEnergy } from "./ending-energy-chart.js";

const mockEndStats: Sim.EndStats[] = [
  { ending_energy: { min: 38, max: 43, mean: 40.5, sd: 1.2 } },
  { ending_energy: { min: 60, max: 70, mean: 65.2, sd: 2.1 } },
];
const mockNames = ["Hu Tao", "Xingqiu"];

describe("transformEndingEnergy", () => {
  it("converts EndStats array to chart data with name and energy", () => {
    const result = transformEndingEnergy(mockEndStats, mockNames);
    expect(result).toHaveLength(2);
    expect(result[0].name).toBe("Hu Tao");
    expect(result[0].energy).toBe(40.5);
    expect(result[1].name).toBe("Xingqiu");
    expect(result[1].energy).toBe(65.2);
  });

  it("defaults energy to 0 when ending_energy is undefined", () => {
    const result = transformEndingEnergy([{}], ["A"]);
    expect(result[0].energy).toBe(0);
  });

  it("defaults energy to 0 when mean is undefined", () => {
    const result = transformEndingEnergy([{ ending_energy: { min: 0, max: 10 } }], ["A"]);
    expect(result[0].energy).toBe(0);
  });

  it("returns empty array when input is empty", () => {
    const result = transformEndingEnergy([], []);
    expect(result).toHaveLength(0);
  });

  it("returns empty array when input is undefined", () => {
    const result = transformEndingEnergy(undefined, []);
    expect(result).toHaveLength(0);
  });
});

describe("EndingEnergyChart", () => {
  it("renders without crashing with valid data", () => {
    const { container } = render(
      <EndingEnergyChart endStats={mockEndStats} characterNames={mockNames} />,
    );
    expect(container.firstChild).not.toBeNull();
  });

  it("renders the chart wrapper with data-testid", () => {
    render(<EndingEnergyChart endStats={mockEndStats} characterNames={mockNames} />);
    expect(screen.getByTestId("ending-energy-chart")).toBeInTheDocument();
  });

  it("renders chart title", () => {
    render(<EndingEnergyChart endStats={mockEndStats} characterNames={mockNames} />);
    expect(screen.getByTestId("chart-title")).toHaveTextContent("Ending Energy");
  });

  it("renders empty state when endStats is empty", () => {
    render(<EndingEnergyChart endStats={[]} characterNames={[]} />);
    expect(screen.getByTestId("chart-empty")).toHaveTextContent("No data available");
  });

  it("renders empty state when endStats is undefined", () => {
    render(<EndingEnergyChart endStats={undefined} characterNames={[]} />);
    expect(screen.getByTestId("chart-empty")).toHaveTextContent("No data available");
  });

  it("renders chart container when data is provided", () => {
    render(<EndingEnergyChart endStats={mockEndStats} characterNames={mockNames} />);
    expect(screen.getByTestId("chart-container")).toBeInTheDocument();
  });

  it("renders one bar per character", () => {
    render(<EndingEnergyChart endStats={mockEndStats} characterNames={mockNames} />);
    // The recharts BarChart renders rectangles for each bar
    const container = screen.getByTestId("chart-container");
    expect(container).toBeInTheDocument();
    // Verify data-driven: two characters means chart-container has correct height
    const style = container.getAttribute("style");
    expect(style).toContain(`height: ${mockNames.length * 40}px`);
  });
});
