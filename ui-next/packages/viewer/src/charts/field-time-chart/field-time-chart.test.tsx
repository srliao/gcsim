import type { Sim } from "@gcsim/types";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { FieldTimeChart, transformFieldTime } from "./field-time-chart.js";

const mockFieldTime: Sim.FloatStat[] = [
  { min: 50, max: 80, mean: 65.3, sd: 5.1 },
  { min: 15, max: 45, mean: 29.9, sd: 4.8 },
];
const mockNames = ["Hu Tao", "Xingqiu"];

describe("transformFieldTime", () => {
  it("converts FloatStat array to chart data with name and value", () => {
    const result = transformFieldTime(mockFieldTime, mockNames);
    expect(result).toHaveLength(2);
    expect(result[0].name).toBe("Hu Tao");
    expect(result[0].value).toBe(65.3);
    expect(result[1].name).toBe("Xingqiu");
    expect(result[1].value).toBe(29.9);
  });

  it("computes percentage strings relative to total mean", () => {
    const result = transformFieldTime(mockFieldTime, mockNames);
    const totalMean = 65.3 + 29.9; // 95.2
    const expectedPct0 = `${Math.round((65.3 / totalMean) * 100)}%`;
    const expectedPct1 = `${Math.round((29.9 / totalMean) * 100)}%`;
    expect(result[0].pct).toBe(expectedPct0);
    expect(result[1].pct).toBe(expectedPct1);
  });

  it("percentages sum to ~100%", () => {
    const result = transformFieldTime(mockFieldTime, mockNames);
    const total = result.reduce((sum, d) => {
      const num = Number.parseInt(d.pct.replace("%", ""), 10);
      return sum + num;
    }, 0);
    // Allow rounding error of ±2
    expect(total).toBeGreaterThanOrEqual(98);
    expect(total).toBeLessThanOrEqual(102);
  });

  it("defaults mean to 0 when undefined", () => {
    const result = transformFieldTime([{ min: 0, max: 10 }, { mean: 20 }], ["A", "B"]);
    expect(result[0].value).toBe(0);
    expect(result[1].value).toBe(20);
  });

  it("returns empty array when input is empty", () => {
    const result = transformFieldTime([], []);
    expect(result).toHaveLength(0);
  });

  it("returns empty array when input is undefined", () => {
    const result = transformFieldTime(undefined, []);
    expect(result).toHaveLength(0);
  });
});

describe("FieldTimeChart", () => {
  it("renders without crashing with valid data", () => {
    const { container } = render(
      <FieldTimeChart fieldTime={mockFieldTime} characterNames={mockNames} />,
    );
    expect(container.firstChild).not.toBeNull();
  });

  it("renders the chart wrapper with data-testid", () => {
    render(<FieldTimeChart fieldTime={mockFieldTime} characterNames={mockNames} />);
    expect(screen.getByTestId("field-time-chart")).toBeInTheDocument();
  });

  it("renders chart title", () => {
    render(<FieldTimeChart fieldTime={mockFieldTime} characterNames={mockNames} />);
    expect(screen.getByTestId("chart-title")).toHaveTextContent("Field Time");
  });

  it("renders chart container when data is provided", () => {
    render(<FieldTimeChart fieldTime={mockFieldTime} characterNames={mockNames} />);
    expect(screen.getByTestId("chart-container")).toBeInTheDocument();
  });

  it("renders empty state when fieldTime is empty", () => {
    render(<FieldTimeChart fieldTime={[]} characterNames={[]} />);
    expect(screen.getByTestId("chart-empty")).toHaveTextContent("No data available");
  });

  it("renders empty state when fieldTime is undefined", () => {
    render(<FieldTimeChart fieldTime={undefined} characterNames={[]} />);
    expect(screen.getByTestId("chart-empty")).toHaveTextContent("No data available");
  });
});
