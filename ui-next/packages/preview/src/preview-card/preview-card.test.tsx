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
    // TeamStrip renders CharacterCardCompact <img>s whose alt text matches char names.
    const imgs = team.querySelectorAll("img");
    const alts = Array.from(imgs).map((i) => i.getAttribute("alt"));
    expect(alts).toContain("hutao");
    expect(alts).toContain("xingqiu");
  });

  it("renders DPS metadata chip with formatted value", () => {
    render(<PreviewCard data={mockSimResult} />);
    const dpsChip = screen.getByTestId("preview-dps");
    expect(dpsChip).toHaveTextContent("DPS");
    expect(dpsChip).toHaveTextContent("50,251"); // 50250.5 rounded
  });

  it("renders iterations metadata chip", () => {
    render(<PreviewCard data={mockSimResult} />);
    const iter = screen.getByTestId("preview-iterations");
    expect(iter).toHaveTextContent("Iter");
    expect(iter).toHaveTextContent("1,000");
  });

  it("renders mode metadata chip", () => {
    render(<PreviewCard data={mockSimResult} />);
    const mode = screen.getByTestId("preview-mode");
    expect(mode).toHaveTextContent("Mode");
    expect(mode).toHaveTextContent("Duration");
  });

  it("does not render modified chip when not modified", () => {
    render(<PreviewCard data={mockSimResult} />);
    expect(screen.queryByTestId("preview-modified")).not.toBeInTheDocument();
  });

  it("renders modified chip when modified", () => {
    render(<PreviewCard data={{ ...mockSimResult, modified: true }} />);
    expect(screen.getByTestId("preview-modified")).toHaveTextContent("Modified");
  });

  it("renders metadata chips using the viewer MetadataChip component", () => {
    render(<PreviewCard data={mockSimResult} />);
    const metadata = screen.getByTestId("preview-metadata");
    // The new design uses MetadataChip from @gcsim/viewer (which marks each
    // chip with data-testid="metadata-chip").
    const chips = metadata.querySelectorAll('[data-testid="metadata-chip"]');
    expect(chips.length).toBeGreaterThanOrEqual(3); // DPS + Iter + Mode at minimum
  });

  it("colors each character DPS bar with its element token", () => {
    render(<PreviewCard data={mockSimResult} />);
    const charDps = screen.getByTestId("preview-char-dps");
    const rows = charDps.querySelectorAll("[data-element]");
    expect(rows.length).toBeGreaterThan(0);
    // The first row should be hutao (pyro).
    const hutaoBar = rows[0]?.querySelector('div[style*="background"]') as HTMLElement | null;
    expect(hutaoBar).not.toBeNull();
    expect(hutaoBar?.style.background).toContain("--el-pyro");
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
    expect(screen.getByTestId("preview-dps")).toHaveTextContent("DPS");
    expect(screen.getByTestId("preview-dps")).toHaveTextContent("—");
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
