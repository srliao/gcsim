import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DetailedMetricTile } from "./detailed-metric-tile.js";

const stats = {
  min: "35,000",
  max: "65,000",
  std: "4,200",
  p25: "47,000",
  p50: "50,000",
  p75: "53,000",
};

describe("DetailedMetricTile", () => {
  it("renders the label", () => {
    render(<DetailedMetricTile label="DPS" tone="pyro" value="50,251" stats={stats} />);
    expect(screen.getByTestId("detailed-metric-label")).toHaveTextContent("DPS");
  });

  it("renders the value", () => {
    render(<DetailedMetricTile label="DPS" tone="pyro" value="50,251" stats={stats} />);
    expect(screen.getByTestId("detailed-metric-value")).toHaveTextContent("50,251");
  });

  it("does not render unit when omitted", () => {
    render(<DetailedMetricTile label="DPS" tone="pyro" value="50,251" stats={stats} />);
    expect(screen.queryByTestId("detailed-metric-unit")).toBeNull();
  });

  it("renders unit when provided", () => {
    render(
      <DetailedMetricTile label="Duration" tone="dendro" value="95.2" unit="s" stats={stats} />,
    );
    expect(screen.getByTestId("detailed-metric-unit")).toHaveTextContent("s");
  });

  it("renders all six stat fields", () => {
    render(<DetailedMetricTile label="DPS" tone="pyro" value="50,251" stats={stats} />);
    expect(screen.getByTestId("detailed-metric-stat-min")).toHaveTextContent("35,000");
    expect(screen.getByTestId("detailed-metric-stat-max")).toHaveTextContent("65,000");
    expect(screen.getByTestId("detailed-metric-stat-std")).toHaveTextContent("4,200");
    expect(screen.getByTestId("detailed-metric-stat-p25")).toHaveTextContent("47,000");
    expect(screen.getByTestId("detailed-metric-stat-p50")).toHaveTextContent("50,000");
    expect(screen.getByTestId("detailed-metric-stat-p75")).toHaveTextContent("53,000");
  });

  it("reflects tone via data-tone attribute", () => {
    render(<DetailedMetricTile label="DPS" tone="pyro" value="x" stats={stats} />);
    expect(screen.getByTestId("detailed-metric-tile")).toHaveAttribute("data-tone", "pyro");
  });

  it.each([
    ["accent", "var(--accent)"],
    ["pyro", "var(--el-pyro)"],
    ["hydro", "var(--el-hydro)"],
    ["electro", "var(--el-electro)"],
    ["cryo", "var(--el-cryo)"],
    ["anemo", "var(--el-anemo)"],
    ["geo", "var(--el-geo)"],
    ["dendro", "var(--el-dendro)"],
  ] as const)("renders bar with %s tone", (tone, token) => {
    render(
      <DetailedMetricTile
        label="DPS"
        // biome-ignore lint/suspicious/noExplicitAny: typed at call site
        tone={tone as any}
        value="x"
        stats={stats}
      />,
    );
    const bar = screen.getByTestId("detailed-metric-bar");
    expect(bar.className).toContain(token);
  });
});
