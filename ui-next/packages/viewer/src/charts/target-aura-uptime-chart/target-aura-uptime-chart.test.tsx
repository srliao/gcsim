import type { Sim } from "@gcsim/types";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TargetAuraUptimeChart, transformAuraUptime } from "./target-aura-uptime-chart.js";

const mockData: Sim.SourceStats[] = [{ sources: { Pyro: { mean: 0.45 }, Hydro: { mean: 0.35 } } }];

describe("transformAuraUptime", () => {
  it("produces correct rows from first target sources", () => {
    const { rows } = transformAuraUptime(mockData);
    expect(rows).toHaveLength(2);
    const names = rows.map((r) => r.name);
    expect(names).toContain("Pyro");
    expect(names).toContain("Hydro");
  });

  it("converts values to 0-100 percentage range", () => {
    const { rows } = transformAuraUptime(mockData);
    const pyroRow = rows.find((r) => r.name === "Pyro");
    const hydroRow = rows.find((r) => r.name === "Hydro");
    expect(pyroRow?.uptime).toBeCloseTo(45);
    expect(hydroRow?.uptime).toBeCloseTo(35);
  });

  it("returns single key 'uptime'", () => {
    const { keys } = transformAuraUptime(mockData);
    expect(keys).toEqual(["uptime"]);
  });

  it("returns empty rows and keys for empty data", () => {
    const { rows, keys } = transformAuraUptime([]);
    expect(rows).toHaveLength(0);
    expect(keys).toEqual(["uptime"]);
  });

  it("returns empty rows when data is undefined", () => {
    const { rows } = transformAuraUptime(undefined);
    expect(rows).toHaveLength(0);
  });

  it("returns empty rows when first target has no sources", () => {
    const { rows } = transformAuraUptime([{ sources: {} }]);
    expect(rows).toHaveLength(0);
  });
});

describe("TargetAuraUptimeChart", () => {
  it("renders without crashing with sample data", () => {
    const { container } = render(<TargetAuraUptimeChart data={mockData} />);
    expect(container.firstChild).not.toBeNull();
  });

  it("renders the chart wrapper with data-testid", () => {
    render(<TargetAuraUptimeChart data={mockData} />);
    expect(screen.getByTestId("target-aura-uptime-chart")).toBeInTheDocument();
  });

  it("renders chart title", () => {
    render(<TargetAuraUptimeChart data={mockData} />);
    expect(screen.getByTestId("chart-shell-title")).toHaveTextContent("Target Aura Uptime");
  });

  it("renders chart container when data is provided", () => {
    render(<TargetAuraUptimeChart data={mockData} />);
    expect(screen.getByTestId("chart-shell-body")).toBeInTheDocument();
  });

  it("renders empty state when data is empty array", () => {
    render(<TargetAuraUptimeChart data={[]} />);
    expect(screen.getByTestId("chart-shell-empty")).toHaveTextContent("No data available");
  });

  it("renders empty state when data is undefined", () => {
    render(<TargetAuraUptimeChart data={undefined} />);
    expect(screen.getByTestId("chart-shell-empty")).toHaveTextContent("No data available");
  });
});
