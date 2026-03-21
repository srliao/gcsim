import type { Sim } from "@gcsim/types";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ReactionsChart, transformReactions } from "./reactions-chart.js";

const mockData: Sim.SourceStats[] = [
  { sources: { Vaporize: { mean: 50 }, Overloaded: { mean: 10 } } },
  { sources: { Vaporize: { mean: 20 } } },
];
const mockNames = ["Hu Tao", "Xingqiu"];

describe("transformReactions", () => {
  it("produces one row per reaction type", () => {
    const { rows } = transformReactions(mockData, mockNames);
    expect(rows).toHaveLength(2);
    const reactionNames = rows.map((r) => r.name);
    expect(reactionNames).toContain("Vaporize");
    expect(reactionNames).toContain("Overloaded");
  });

  it("keys equal characterNames", () => {
    const { keys } = transformReactions(mockData, mockNames);
    expect(keys).toEqual(mockNames);
  });

  it("maps character values to reaction rows", () => {
    const { rows } = transformReactions(mockData, mockNames);
    const vaporize = rows.find((r) => r.name === "Vaporize");
    expect(vaporize?.["Hu Tao"]).toBe(50);
    expect(vaporize?.Xingqiu).toBe(20);
  });

  it("defaults missing character reaction to 0", () => {
    const { rows } = transformReactions(mockData, mockNames);
    const overloaded = rows.find((r) => r.name === "Overloaded");
    expect(overloaded?.["Hu Tao"]).toBe(10);
    expect(overloaded?.Xingqiu).toBe(0);
  });

  it("returns empty rows and keys for empty data", () => {
    const { rows, keys } = transformReactions([], []);
    expect(rows).toHaveLength(0);
    expect(keys).toHaveLength(0);
  });
});

describe("ReactionsChart", () => {
  it("renders without crashing with sample data", () => {
    const { container } = render(<ReactionsChart data={mockData} characterNames={mockNames} />);
    expect(container.firstChild).not.toBeNull();
  });

  it("renders the chart wrapper with data-testid", () => {
    render(<ReactionsChart data={mockData} characterNames={mockNames} />);
    expect(screen.getByTestId("reactions-chart")).toBeInTheDocument();
  });

  it("renders chart title", () => {
    render(<ReactionsChart data={mockData} characterNames={mockNames} />);
    expect(screen.getByTestId("chart-title")).toHaveTextContent("Reactions");
  });

  it("renders chart container when data is provided", () => {
    render(<ReactionsChart data={mockData} characterNames={mockNames} />);
    expect(screen.getByTestId("chart-container")).toBeInTheDocument();
  });

  it("renders empty state when data is empty", () => {
    render(<ReactionsChart data={[]} characterNames={[]} />);
    expect(screen.getByTestId("chart-empty")).toHaveTextContent("No data available");
  });

  it("renders empty state when data is undefined", () => {
    render(<ReactionsChart data={undefined} characterNames={[]} />);
    expect(screen.getByTestId("chart-empty")).toHaveTextContent("No data available");
  });
});
