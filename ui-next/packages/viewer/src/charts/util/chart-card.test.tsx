import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ChartCard } from "./chart-card.js";

describe("ChartCard", () => {
  it("renders title", () => {
    render(<ChartCard title="DPS Timeline">chart content</ChartCard>);
    expect(screen.getByTestId("chart-title")).toHaveTextContent("DPS Timeline");
  });

  it("renders children in container", () => {
    render(<ChartCard title="Test">chart content</ChartCard>);
    expect(screen.getByTestId("chart-container")).toBeInTheDocument();
  });

  it("renders empty state when children is null", () => {
    render(<ChartCard title="Test">{null}</ChartCard>);
    expect(screen.getByTestId("chart-empty")).toHaveTextContent("No data available");
  });

  it("renders empty state when children is false", () => {
    render(<ChartCard title="Test">{false}</ChartCard>);
    expect(screen.getByTestId("chart-empty")).toHaveTextContent("No data available");
  });

  it("applies custom height", () => {
    render(<ChartCard title="Test" height={500}>content</ChartCard>);
    const container = screen.getByTestId("chart-container");
    expect(container).toHaveStyle({ height: "500px" });
  });

  it("renders selector when provided", () => {
    render(
      <ChartCard title="Test" selector={<select data-testid="selector" />}>
        content
      </ChartCard>,
    );
    expect(screen.getByTestId("selector")).toBeInTheDocument();
  });
});
