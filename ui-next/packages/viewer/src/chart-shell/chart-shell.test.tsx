import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ChartShell } from "./chart-shell.js";

describe("ChartShell", () => {
  it("renders title", () => {
    render(<ChartShell title="DPS Timeline">chart</ChartShell>);
    expect(screen.getByTestId("chart-shell-title")).toHaveTextContent("DPS Timeline");
  });

  it("renders subtitle when provided", () => {
    render(
      <ChartShell title="DPS Timeline" subtitle="per 30 frames">
        chart
      </ChartShell>,
    );
    expect(screen.getByTestId("chart-shell-subtitle")).toHaveTextContent("per 30 frames");
  });

  it("omits subtitle when not provided", () => {
    render(<ChartShell title="X">chart</ChartShell>);
    expect(screen.queryByTestId("chart-shell-subtitle")).toBeNull();
  });

  it("renders badge and action slots", () => {
    render(
      <ChartShell
        title="X"
        badge={<span data-testid="b">B</span>}
        action={<span data-testid="a">A</span>}
      >
        chart
      </ChartShell>,
    );
    expect(screen.getByTestId("b")).toBeInTheDocument();
    expect(screen.getByTestId("a")).toBeInTheDocument();
    expect(screen.getByTestId("chart-shell-actions")).toBeInTheDocument();
  });

  it("omits actions row when neither badge nor action is provided", () => {
    render(<ChartShell title="X">chart</ChartShell>);
    expect(screen.queryByTestId("chart-shell-actions")).toBeNull();
  });

  it("renders children in body when provided", () => {
    render(<ChartShell title="X">content</ChartShell>);
    expect(screen.getByTestId("chart-shell-body")).toHaveTextContent("content");
  });

  it("renders empty state when children is null", () => {
    render(<ChartShell title="X">{null}</ChartShell>);
    expect(screen.getByTestId("chart-shell-empty")).toHaveTextContent("No data available");
  });

  it("renders empty state when children is false", () => {
    render(<ChartShell title="X">{false}</ChartShell>);
    expect(screen.getByTestId("chart-shell-empty")).toBeInTheDocument();
  });

  it("applies custom height to body", () => {
    render(
      <ChartShell title="X" height={500}>
        content
      </ChartShell>,
    );
    expect(screen.getByTestId("chart-shell-body")).toHaveStyle({ height: "500px" });
  });

  it("applies custom height to empty state", () => {
    render(
      <ChartShell title="X" height={400}>
        {null}
      </ChartShell>,
    );
    expect(screen.getByTestId("chart-shell-empty")).toHaveStyle({ height: "400px" });
  });

  it("renders footer when provided", () => {
    render(
      <ChartShell title="X" footer={<span>legend</span>}>
        content
      </ChartShell>,
    );
    expect(screen.getByTestId("chart-shell-footer")).toHaveTextContent("legend");
  });

  it("omits footer when not provided", () => {
    render(<ChartShell title="X">content</ChartShell>);
    expect(screen.queryByTestId("chart-shell-footer")).toBeNull();
  });
});
