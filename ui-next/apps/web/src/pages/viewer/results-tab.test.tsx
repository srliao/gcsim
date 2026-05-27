import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { mockSimResult } from "../../../../../tooling/test-fixtures/index.js";
import { ResultsTab } from "./results-tab";

const mockSetActiveTab = vi.fn();

vi.mock("../../stores/viewer-store", () => ({
  useViewerStore: (selector: (s: Record<string, unknown>) => unknown) =>
    selector({ setActiveTab: mockSetActiveTab }),
}));

vi.mock("@gcsim/avatar", () => ({
  CharacterCard: (props: { char: { name: string } }) => (
    <div data-testid="character-card" data-name={props.char.name} />
  ),
  CharacterCardEmpty: (props: { slot: number }) => (
    <div data-testid="character-card-empty" data-slot={props.slot} />
  ),
}));

vi.mock("@gcsim/primitives", () => ({
  Badge: ({ children }: { children: React.ReactNode }) => (
    <span data-testid="badge">{children}</span>
  ),
  Tabs: ({ children, value }: { children: React.ReactNode; value: string }) => (
    <div data-testid="tabs" data-value={value}>
      {children}
    </div>
  ),
  TabsList: ({
    children,
    "data-testid": testId,
  }: {
    children: React.ReactNode;
    "data-testid"?: string;
    size?: string;
  }) => <div data-testid={testId ?? "tabs-list"}>{children}</div>,
  TabsTrigger: ({ value, children }: { value: string; children: React.ReactNode }) => (
    <button type="button" data-testid={`dps-metric-${value}`}>
      {children}
    </button>
  ),
}));

vi.mock("@gcsim/viewer", () => ({
  MetadataChip: (props: { label: string; value: string }) => (
    <div data-testid="metadata-chip" data-label={props.label}>
      {props.value}
    </div>
  ),
  Warnings: () => <div data-testid="warnings" />,
  ChartShell: ({
    title,
    children,
  }: {
    title: string;
    children?: React.ReactNode;
    subtitle?: string;
    badge?: React.ReactNode;
    height?: number;
  }) => (
    <div data-testid="chart-shell" data-title={title}>
      {children}
    </div>
  ),
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
  FieldTimeBar: () => <div data-testid="field-time-bar" />,
  EnergyChart: () => <div data-testid="energy-chart" />,
  EndingEnergyChart: () => <div data-testid="ending-energy-chart" />,
  ReactionsChart: () => <div data-testid="reactions-chart" />,
  TargetAuraUptimeChart: () => <div data-testid="target-aura-uptime-chart" />,
  FrameTrack: () => <div data-testid="frame-track" />,
}));

describe("ResultsTab", () => {
  it("renders the character banner with one card per character + empties to 4 slots", () => {
    render(<ResultsTab results={mockSimResult} />);
    const banner = screen.getByTestId("character-banner");
    expect(banner).toBeDefined();
    expect(screen.getAllByTestId("character-card").length).toBe(2);
    expect(screen.getAllByTestId("character-card-empty").length).toBe(2);
  });

  it("renders the metadata strip with chips", () => {
    render(<ResultsTab results={mockSimResult} />);
    expect(screen.getByTestId("metadata-section")).toBeInTheDocument();
    const chips = screen.getAllByTestId("metadata-chip");
    expect(chips.length).toBeGreaterThan(0);
    expect(chips.map((c) => c.getAttribute("data-label"))).toEqual(
      expect.arrayContaining(["iter", "mode"]),
    );
  });

  it("renders the 6 detailed metric tiles in a 3-col-at-lg grid", () => {
    render(<ResultsTab results={mockSimResult} />);
    const rollupSection = screen.getByTestId("rollup-section");
    expect(rollupSection).toBeDefined();
    expect(rollupSection.className).toContain("lg:grid-cols-3");
    const tiles = screen.getAllByTestId("detailed-metric-tile");
    expect(tiles.length).toBe(6);
    expect(tiles[0]).toHaveTextContent("DPS");
    expect(tiles[5]).toHaveTextContent("Duration");
  });

  it("renders the target-info + DPS-distribution split", () => {
    render(<ResultsTab results={mockSimResult} />);
    const split = screen.getByTestId("info-split");
    expect(split).toBeDefined();
    expect(screen.getByTestId("target-info-card")).toBeDefined();
    expect(screen.getByTestId("distribution-chart")).toBeDefined();
  });

  it("renders the per-character DPS section with a metric switch", () => {
    render(<ResultsTab results={mockSimResult} />);
    const section = screen.getByTestId("per-character-dps");
    expect(section).toBeDefined();
    expect(section.textContent).toContain("DPS contribution");
    expect(screen.getByTestId("dps-metric-tabs")).toBeDefined();
    expect(screen.getByTestId("dps-metric-dps")).toBeDefined();
    expect(screen.getByTestId("dps-metric-dmg")).toBeDefined();
    expect(screen.getByTestId("dps-metric-cnt")).toBeDefined();
    const dpsCards = screen.getAllByTestId("dps-card");
    expect(dpsCards.length).toBe(2);
    expect(dpsCards[0]).toHaveTextContent("hutao");
    expect(dpsCards[1]).toHaveTextContent("xingqiu");
  });

  it("renders the 6-col chart grid containing the spec charts", () => {
    render(<ResultsTab results={mockSimResult} />);
    const chartsSection = screen.getByTestId("charts-section");
    expect(chartsSection).toBeDefined();
    expect(chartsSection.className).toContain("grid-cols-6");
    expect(screen.getByTestId("field-time-bar")).toBeDefined();
    expect(screen.getByTestId("character-dps-pie")).toBeDefined();
    expect(screen.getByTestId("cumulative-damage")).toBeDefined();
    expect(screen.getByTestId("damage-timeline")).toBeDefined();
    expect(screen.getByTestId("element-dps-chart")).toBeDefined();
    expect(screen.getByTestId("element-dps-pie")).toBeDefined();
    expect(screen.getByTestId("character-actions-chart")).toBeDefined();
    expect(screen.getByTestId("sample-frame-preview")).toBeDefined();
  });

  it("preserves the additional non-mock charts in a secondary section", () => {
    render(<ResultsTab results={mockSimResult} />);
    expect(screen.getByTestId("additional-charts")).toBeDefined();
    expect(screen.getByTestId("source-dps-chart")).toBeDefined();
    expect(screen.getByTestId("energy-chart")).toBeDefined();
    expect(screen.getByTestId("ending-energy-chart")).toBeDefined();
    expect(screen.getByTestId("reactions-chart")).toBeDefined();
    expect(screen.getByTestId("target-aura-uptime-chart")).toBeDefined();
  });

  it("does not render the deprecated TeamHeader in the layout", () => {
    render(<ResultsTab results={mockSimResult} />);
    expect(screen.queryByTestId("team-header")).toBeNull();
  });
});
