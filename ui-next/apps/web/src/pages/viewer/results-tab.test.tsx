import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { mockSimResult } from "../../../../../tooling/test-fixtures/index.js";
import { ResultsTab } from "./results-tab";

vi.mock("@gcsim/viewer", () => ({
  MetadataChip: (props: { label: string; value: string }) => (
    <div data-testid="metadata-chip" data-label={props.label}>
      {props.value}
    </div>
  ),
  Warnings: () => <div data-testid="warnings" />,
  TeamHeader: () => <div data-testid="team-header" />,
  DetailedMetricTile: (props: { label: string }) => (
    <div data-testid="detailed-metric-tile">{props.label}</div>
  ),
  formatSummaryStat: () => ({
    value: "0",
    stats: { min: "0", max: "0", std: "0", p25: "0", p50: "0", p75: "0" },
  }),
  DPSCard: (props: { char: string | { name: string } }) => (
    <div data-testid="dps-card">
      {typeof props.char === "string" ? props.char : props.char.name}
    </div>
  ),
  TargetInfoCard: () => <div data-testid="target-info-card" />,
  DistributionChart: () => <div data-testid="distribution-chart" />,
  DamageTimeline: () => <div data-testid="damage-timeline" />,
  CumulativeDamage: () => <div data-testid="cumulative-damage" />,
  ElementDpsChart: () => <div data-testid="element-dps-chart" />,
  CharacterDpsPie: () => <div data-testid="character-dps-pie" />,
  ElementDpsPie: () => <div data-testid="element-dps-pie" />,
  SourceDpsChart: () => <div data-testid="source-dps-chart" />,
  CharacterActionsChart: () => <div data-testid="character-actions-chart" />,
  FieldTimeChart: () => <div data-testid="field-time-chart" />,
  EnergyChart: () => <div data-testid="energy-chart" />,
  EndingEnergyChart: () => <div data-testid="ending-energy-chart" />,
  ReactionsChart: () => <div data-testid="reactions-chart" />,
  TargetAuraUptimeChart: () => <div data-testid="target-aura-uptime-chart" />,
}));

describe("ResultsTab", () => {
  it("renders the metadata section with chips", () => {
    render(<ResultsTab results={mockSimResult} />);
    expect(screen.getByTestId("metadata-section")).toBeInTheDocument();
    const chips = screen.getAllByTestId("metadata-chip");
    expect(chips.length).toBeGreaterThan(0);
    expect(chips.map((c) => c.getAttribute("data-label"))).toEqual(
      expect.arrayContaining(["iter", "mode"]),
    );
  });

  it("renders the team header", () => {
    render(<ResultsTab results={mockSimResult} />);
    expect(screen.getByTestId("team-header")).toBeInTheDocument();
  });

  it("renders detailed metric tiles for each summary stat", () => {
    render(<ResultsTab results={mockSimResult} />);
    const rollupSection = screen.getByTestId("rollup-section");
    expect(rollupSection).toBeInTheDocument();
    const tiles = screen.getAllByTestId("detailed-metric-tile");
    expect(tiles.length).toBe(6);
    expect(tiles[0]).toHaveTextContent("DPS");
    expect(tiles[5]).toHaveTextContent("Duration");
  });

  it("renders DPS cards for each character", () => {
    render(<ResultsTab results={mockSimResult} />);
    const dpsCards = screen.getAllByTestId("dps-card");
    expect(dpsCards.length).toBe(2);
    expect(dpsCards[0]).toHaveTextContent("hutao");
    expect(dpsCards[1]).toHaveTextContent("xingqiu");
  });

  it("renders the charts section", () => {
    render(<ResultsTab results={mockSimResult} />);
    const chartsSection = screen.getByTestId("charts-section");
    expect(chartsSection).toBeInTheDocument();
    expect(screen.getByTestId("distribution-chart")).toBeInTheDocument();
    expect(screen.getByTestId("damage-timeline")).toBeInTheDocument();
    expect(screen.getByTestId("cumulative-damage")).toBeInTheDocument();
    expect(screen.getByTestId("character-dps-pie")).toBeInTheDocument();
    expect(screen.getByTestId("element-dps-pie")).toBeInTheDocument();
    expect(screen.getByTestId("element-dps-chart")).toBeInTheDocument();
    expect(screen.getByTestId("source-dps-chart")).toBeInTheDocument();
    expect(screen.getByTestId("character-actions-chart")).toBeInTheDocument();
    expect(screen.getByTestId("field-time-chart")).toBeInTheDocument();
    expect(screen.getByTestId("energy-chart")).toBeInTheDocument();
    expect(screen.getByTestId("ending-energy-chart")).toBeInTheDocument();
    expect(screen.getByTestId("reactions-chart")).toBeInTheDocument();
    expect(screen.getByTestId("target-aura-uptime-chart")).toBeInTheDocument();
  });

  it("renders target info card", () => {
    render(<ResultsTab results={mockSimResult} />);
    expect(screen.getByTestId("target-info-card")).toBeInTheDocument();
  });
});
