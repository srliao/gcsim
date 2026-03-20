import type { Sim } from "@gcsim/types";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CharacterActionsChart, transformCharacterActions } from "./character-actions-chart.js";

const mockData: Sim.SourceStats[] = [
  {
    sources: {
      normal: { mean: 150 },
      skill: { mean: 30 },
      burst: { mean: 10 },
      dash: { mean: 10 },
    },
  },
  { sources: { normal: { mean: 45 }, skill: { mean: 22 }, burst: { mean: 10 } } },
];
const mockNames = ["Hu Tao", "Xingqiu"];

describe("transformCharacterActions", () => {
  it("produces one row per character", () => {
    const { rows } = transformCharacterActions(mockData, mockNames);
    expect(rows).toHaveLength(2);
    expect(rows[0].name).toBe("Hu Tao");
    expect(rows[1].name).toBe("Xingqiu");
  });

  it("collects all unique action keys across characters", () => {
    const { keys } = transformCharacterActions(mockData, mockNames);
    expect(keys).toContain("normal");
    expect(keys).toContain("skill");
    expect(keys).toContain("burst");
    expect(keys).toContain("dash");
    expect(keys).toHaveLength(4);
  });

  it("maps action values to row fields", () => {
    const { rows } = transformCharacterActions(mockData, mockNames);
    expect(rows[0].normal).toBe(150);
    expect(rows[0].skill).toBe(30);
    expect(rows[0].burst).toBe(10);
    expect(rows[0].dash).toBe(10);
    expect(rows[1].normal).toBe(45);
    expect(rows[1].skill).toBe(22);
    expect(rows[1].burst).toBe(10);
  });

  it("defaults missing action keys to 0", () => {
    const { rows } = transformCharacterActions(mockData, mockNames);
    // Xingqiu has no dash entry
    expect(rows[1].dash).toBe(0);
  });

  it("returns empty rows and keys for empty data", () => {
    const { rows, keys } = transformCharacterActions([], []);
    expect(rows).toHaveLength(0);
    expect(keys).toHaveLength(0);
  });

  it("returns empty rows and keys for undefined data", () => {
    const { rows, keys } = transformCharacterActions(undefined, []);
    expect(rows).toHaveLength(0);
    expect(keys).toHaveLength(0);
  });
});

describe("CharacterActionsChart", () => {
  it("renders without crashing with valid data", () => {
    const { container } = render(
      <CharacterActionsChart data={mockData} characterNames={mockNames} />,
    );
    expect(container.firstChild).not.toBeNull();
  });

  it("renders the chart wrapper with data-testid", () => {
    render(<CharacterActionsChart data={mockData} characterNames={mockNames} />);
    expect(screen.getByTestId("character-actions-chart")).toBeInTheDocument();
  });

  it("renders chart title", () => {
    render(<CharacterActionsChart data={mockData} characterNames={mockNames} />);
    expect(screen.getByTestId("chart-title")).toHaveTextContent("Character Actions");
  });

  it("renders chart container when data is provided", () => {
    render(<CharacterActionsChart data={mockData} characterNames={mockNames} />);
    expect(screen.getByTestId("chart-container")).toBeInTheDocument();
  });

  it("renders empty state when data is empty", () => {
    render(<CharacterActionsChart data={[]} characterNames={[]} />);
    expect(screen.getByTestId("chart-empty")).toHaveTextContent("No data available");
  });

  it("renders empty state when data is undefined", () => {
    render(<CharacterActionsChart data={undefined} characterNames={[]} />);
    expect(screen.getByTestId("chart-empty")).toHaveTextContent("No data available");
  });
});
