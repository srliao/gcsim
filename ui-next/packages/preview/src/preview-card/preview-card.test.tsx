import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { mockSimResult } from "../../../../tooling/test-fixtures/index.js";
import { PreviewCard } from "./preview-card.js";

describe("PreviewCard", () => {
  it("renders the preview card container", () => {
    render(<PreviewCard data={mockSimResult} />);
    expect(screen.getByTestId("preview-card")).toBeInTheDocument();
  });

  it("renders team display section with character portraits", () => {
    render(<PreviewCard data={mockSimResult} />);
    const team = screen.getByTestId("preview-team");
    expect(team).toBeInTheDocument();
    // TeamDisplay renders Portrait <img>s whose alt text matches char names.
    const imgs = team.querySelectorAll("img");
    const alts = Array.from(imgs).map((i) => i.getAttribute("alt"));
    expect(alts).toContain("hutao");
    expect(alts).toContain("xingqiu");
  });

  it("renders DPS badge with formatted value", () => {
    render(<PreviewCard data={mockSimResult} />);
    const dpsBadge = screen.getByTestId("preview-dps");
    expect(dpsBadge).toHaveTextContent("DPS:");
    expect(dpsBadge).toHaveTextContent("50,251"); // 50250.5 rounded
  });

  it("renders iterations badge", () => {
    render(<PreviewCard data={mockSimResult} />);
    expect(screen.getByTestId("preview-iterations")).toHaveTextContent("1,000 iterations");
  });

  it("renders mode badge", () => {
    render(<PreviewCard data={mockSimResult} />);
    expect(screen.getByTestId("preview-mode")).toHaveTextContent("Duration");
  });

  it("does not render modified badge when not modified", () => {
    render(<PreviewCard data={mockSimResult} />);
    expect(screen.queryByTestId("preview-modified")).not.toBeInTheDocument();
  });

  it("renders modified badge when modified", () => {
    render(<PreviewCard data={{ ...mockSimResult, modified: true }} />);
    expect(screen.getByTestId("preview-modified")).toHaveTextContent("Modified");
  });

  it("renders character DPS breakdown with names and values", () => {
    render(<PreviewCard data={mockSimResult} />);
    const charDps = screen.getByTestId("preview-char-dps");
    expect(charDps).toBeInTheDocument();
    expect(charDps.textContent).toContain("hutao");
    expect(charDps.textContent).toContain("35,100");
  });

  it("handles missing optional data gracefully", () => {
    const minimalData: typeof mockSimResult = {
      ...mockSimResult,
      statistics: undefined,
      character_details: undefined,
    };
    render(<PreviewCard data={minimalData} />);
    expect(screen.getByTestId("preview-card")).toBeInTheDocument();
    expect(screen.getByTestId("preview-dps")).toHaveTextContent("DPS: —");
  });

  it("does not render warnings badge when no warnings", () => {
    render(<PreviewCard data={mockSimResult} />);
    expect(screen.queryByTestId("preview-warnings")).not.toBeInTheDocument();
  });

  it("calls onImageLoaded callback on mount", () => {
    const onImageLoaded = vi.fn();
    render(<PreviewCard data={mockSimResult} onImageLoaded={onImageLoaded} />);
    expect(onImageLoaded).toHaveBeenCalled();
  });

  it("renders warnings badge when warnings exist", () => {
    const dataWithWarnings = {
      ...mockSimResult,
      statistics: {
        ...mockSimResult.statistics,
        warnings: { ...mockSimResult.statistics?.warnings, swap_cd: true },
      },
    };
    render(<PreviewCard data={dataWithWarnings} />);
    expect(screen.getByTestId("preview-warnings")).toBeInTheDocument();
  });
});
