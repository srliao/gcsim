import type { Sim } from "@gcsim/types";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CharacterDpsPie, transformCharacterDps } from "./character-dps-pie.js";

const mockCharacterDps: Sim.FloatStat[] = [
  { min: 20000, max: 45000, mean: 35100, sd: 3200 },
  { min: 10000, max: 25000, mean: 15150, sd: 2100 },
];
const mockNames = ["Hu Tao", "Xingqiu"];

describe("transformCharacterDps", () => {
  it("converts FloatStat array to chart data with name and value", () => {
    const result = transformCharacterDps(mockCharacterDps, mockNames);
    expect(result).toHaveLength(2);
    expect(result[0].name).toBe("Hu Tao");
    expect(result[0].value).toBe(35100);
    expect(result[1].name).toBe("Xingqiu");
    expect(result[1].value).toBe(15150);
  });

  it("computes percentage strings relative to total mean", () => {
    const result = transformCharacterDps(mockCharacterDps, mockNames);
    const totalMean = 35100 + 15150; // 50250
    const expectedPct0 = `${Math.round((35100 / totalMean) * 100)}%`;
    const expectedPct1 = `${Math.round((15150 / totalMean) * 100)}%`;
    expect(result[0].pct).toBe(expectedPct0);
    expect(result[1].pct).toBe(expectedPct1);
  });

  it("percentages sum to ~100%", () => {
    const result = transformCharacterDps(mockCharacterDps, mockNames);
    const total = result.reduce((sum, d) => {
      const num = Number.parseInt(d.pct.replace("%", ""), 10);
      return sum + num;
    }, 0);
    // Allow rounding error of ±2
    expect(total).toBeGreaterThanOrEqual(98);
    expect(total).toBeLessThanOrEqual(102);
  });

  it("defaults mean to 0 when undefined", () => {
    const result = transformCharacterDps([{ min: 0, max: 10 }, { mean: 20000 }], ["A", "B"]);
    expect(result[0].value).toBe(0);
    expect(result[1].value).toBe(20000);
  });

  it("returns empty array when input is empty", () => {
    const result = transformCharacterDps([], []);
    expect(result).toHaveLength(0);
  });

  it("returns empty array when input is undefined", () => {
    const result = transformCharacterDps(undefined, []);
    expect(result).toHaveLength(0);
  });
});

describe("CharacterDpsPie", () => {
  it("renders without crashing with valid data", () => {
    const { container } = render(
      <CharacterDpsPie characterDps={mockCharacterDps} characterNames={mockNames} />,
    );
    expect(container.firstChild).not.toBeNull();
  });

  it("renders the chart wrapper with data-testid", () => {
    render(<CharacterDpsPie characterDps={mockCharacterDps} characterNames={mockNames} />);
    expect(screen.getByTestId("character-dps-pie")).toBeInTheDocument();
  });

  it("renders chart title", () => {
    render(<CharacterDpsPie characterDps={mockCharacterDps} characterNames={mockNames} />);
    expect(screen.getByTestId("chart-title")).toHaveTextContent("Character DPS");
  });

  it("renders chart container when data is provided", () => {
    render(<CharacterDpsPie characterDps={mockCharacterDps} characterNames={mockNames} />);
    expect(screen.getByTestId("chart-container")).toBeInTheDocument();
  });

  it("renders empty state when characterDps is empty", () => {
    render(<CharacterDpsPie characterDps={[]} characterNames={[]} />);
    expect(screen.getByTestId("chart-empty")).toHaveTextContent("No data available");
  });

  it("renders empty state when characterDps is undefined", () => {
    render(<CharacterDpsPie characterDps={undefined} characterNames={[]} />);
    expect(screen.getByTestId("chart-empty")).toHaveTextContent("No data available");
  });
});
