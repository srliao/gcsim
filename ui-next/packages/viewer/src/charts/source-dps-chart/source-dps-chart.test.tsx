import type { Sim } from "@gcsim/types";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SourceDpsChart, transformSourceDps } from "./source-dps-chart.js";

const mockData: Sim.SourceStats[] = [
  { sources: { "Normal Attack": { mean: 18000 }, "Elemental Skill": { mean: 12000 } } },
  { sources: { "Normal Attack": { mean: 4000 }, "Elemental Skill": { mean: 9000 } } },
];
const mockNames = ["Hu Tao", "Xingqiu"];

describe("transformSourceDps", () => {
  it("produces correct rows with one row per source", () => {
    const { rows } = transformSourceDps(mockData, mockNames);
    expect(rows).toHaveLength(2);
    expect(rows.map((r) => r.name)).toContain("Normal Attack");
    expect(rows.map((r) => r.name)).toContain("Elemental Skill");
  });

  it("maps character values to row fields", () => {
    const { rows } = transformSourceDps(mockData, mockNames);
    const normalRow = rows.find((r) => r.name === "Normal Attack");
    const skillRow = rows.find((r) => r.name === "Elemental Skill");
    expect(normalRow?.["Hu Tao"]).toBe(18000);
    expect(normalRow?.Xingqiu).toBe(4000);
    expect(skillRow?.["Hu Tao"]).toBe(12000);
    expect(skillRow?.Xingqiu).toBe(9000);
  });

  it("defaults missing source to 0", () => {
    const sparseData: Sim.SourceStats[] = [
      { sources: { "Normal Attack": { mean: 18000 } } },
      { sources: { "Elemental Skill": { mean: 9000 } } },
    ];
    const { rows } = transformSourceDps(sparseData, mockNames);
    const normalRow = rows.find((r) => r.name === "Normal Attack");
    const skillRow = rows.find((r) => r.name === "Elemental Skill");
    expect(normalRow?.Xingqiu).toBe(0);
    expect(skillRow?.["Hu Tao"]).toBe(0);
  });

  it("keys equal characterNames", () => {
    const { keys } = transformSourceDps(mockData, mockNames);
    expect(keys).toEqual(mockNames);
  });

  it("returns empty rows and keys for empty data", () => {
    const { rows, keys } = transformSourceDps([], []);
    expect(rows).toHaveLength(0);
    expect(keys).toHaveLength(0);
  });
});

describe("SourceDpsChart", () => {
  it("renders without crashing with sample data", () => {
    const { container } = render(<SourceDpsChart data={mockData} characterNames={mockNames} />);
    expect(container.firstChild).not.toBeNull();
  });

  it("renders the chart wrapper with data-testid", () => {
    render(<SourceDpsChart data={mockData} characterNames={mockNames} />);
    expect(screen.getByTestId("source-dps-chart")).toBeInTheDocument();
  });

  it("renders chart title", () => {
    render(<SourceDpsChart data={mockData} characterNames={mockNames} />);
    expect(screen.getByTestId("chart-title")).toHaveTextContent("Source DPS");
  });

  it("renders chart container when data is provided", () => {
    render(<SourceDpsChart data={mockData} characterNames={mockNames} />);
    expect(screen.getByTestId("chart-container")).toBeInTheDocument();
  });

  it("renders empty state when data is empty", () => {
    render(<SourceDpsChart data={[]} characterNames={[]} />);
    expect(screen.getByTestId("chart-empty")).toHaveTextContent("No data available");
  });

  it("renders empty state when data is undefined", () => {
    render(<SourceDpsChart data={undefined} characterNames={[]} />);
    expect(screen.getByTestId("chart-empty")).toHaveTextContent("No data available");
  });
});
