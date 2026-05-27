import type { Sim } from "@gcsim/types";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { EnergyChart, transformEnergy } from "./energy-chart.js";

const mockData: Sim.SourceStats[] = [
  { sources: { "Elemental Skill": { mean: 150 }, "Elemental Burst": { mean: 45 } } },
  { sources: { "Elemental Skill": { mean: 120 } } },
];
const mockNames = ["Hu Tao", "Xingqiu"];

describe("transformEnergy", () => {
  it("produces correct rows keyed by source name", () => {
    const { rows } = transformEnergy(mockData, mockNames);
    const sourceNames = rows.map((r) => r.name);
    expect(sourceNames).toContain("Elemental Skill");
    expect(sourceNames).toContain("Elemental Burst");
  });

  it("maps character values to row fields", () => {
    const { rows } = transformEnergy(mockData, mockNames);
    const skillRow = rows.find((r) => r.name === "Elemental Skill");
    expect(skillRow?.["Hu Tao"]).toBe(150);
    expect(skillRow?.Xingqiu).toBe(120);
  });

  it("defaults missing character value to 0", () => {
    const { rows } = transformEnergy(mockData, mockNames);
    const burstRow = rows.find((r) => r.name === "Elemental Burst");
    expect(burstRow?.["Hu Tao"]).toBe(45);
    expect(burstRow?.Xingqiu).toBe(0);
  });

  it("returns characterNames as keys", () => {
    const { keys } = transformEnergy(mockData, mockNames);
    expect(keys).toEqual(mockNames);
  });

  it("collects all unique source keys across characters", () => {
    const { rows } = transformEnergy(mockData, mockNames);
    expect(rows).toHaveLength(2);
  });

  it("returns empty rows and keys for empty data", () => {
    const { rows, keys } = transformEnergy([], []);
    expect(rows).toHaveLength(0);
    expect(keys).toHaveLength(0);
  });
});

describe("EnergyChart", () => {
  it("renders without crashing with sample data", () => {
    const { container } = render(<EnergyChart data={mockData} characterNames={mockNames} />);
    expect(container.firstChild).not.toBeNull();
  });

  it("renders the chart wrapper with data-testid", () => {
    render(<EnergyChart data={mockData} characterNames={mockNames} />);
    expect(screen.getByTestId("energy-chart")).toBeInTheDocument();
  });

  it("renders chart title", () => {
    render(<EnergyChart data={mockData} characterNames={mockNames} />);
    expect(screen.getByTestId("chart-shell-title")).toHaveTextContent("Energy Sources");
  });

  it("renders chart container when data is provided", () => {
    render(<EnergyChart data={mockData} characterNames={mockNames} />);
    expect(screen.getByTestId("chart-shell-body")).toBeInTheDocument();
  });

  it("renders empty state when data is empty", () => {
    render(<EnergyChart data={[]} characterNames={[]} />);
    expect(screen.getByTestId("chart-shell-empty")).toHaveTextContent("No data available");
  });

  it("renders empty state when data is undefined", () => {
    render(<EnergyChart data={undefined} characterNames={[]} />);
    expect(screen.getByTestId("chart-shell-empty")).toHaveTextContent("No data available");
  });
});
