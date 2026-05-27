import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MetadataChip } from "./metadata-chip.js";

describe("MetadataChip", () => {
  it("renders label and value", () => {
    render(<MetadataChip label="iter" value="1,000" />);
    expect(screen.getByTestId("metadata-chip-label")).toHaveTextContent("iter");
    expect(screen.getByTestId("metadata-chip-value")).toHaveTextContent("1,000");
  });

  it("defaults to neutral tone", () => {
    render(<MetadataChip label="mode" value="SL" />);
    expect(screen.getByTestId("metadata-chip")).toHaveAttribute("data-tone", "neutral");
  });

  it("applies accent tone", () => {
    render(<MetadataChip label="ver" value="2.5.0" tone="accent" />);
    expect(screen.getByTestId("metadata-chip")).toHaveAttribute("data-tone", "accent");
  });

  it("applies info tone", () => {
    render(<MetadataChip label="mode" value="TTK" tone="info" />);
    expect(screen.getByTestId("metadata-chip")).toHaveAttribute("data-tone", "info");
  });

  it("applies mono class to value when mono is true", () => {
    render(<MetadataChip label="ver" value="abc123" mono />);
    const value = screen.getByTestId("metadata-chip-value");
    expect(value.className).toMatch(/font-mono/);
    expect(value.className).toMatch(/tabular-nums/);
  });

  it("does not apply mono class when mono is false (default)", () => {
    render(<MetadataChip label="label" value="value" />);
    const value = screen.getByTestId("metadata-chip-value");
    expect(value.className).not.toMatch(/tabular-nums/);
  });

  it("forwards a custom className", () => {
    render(<MetadataChip label="x" value="y" className="custom-class" />);
    expect(screen.getByTestId("metadata-chip").className).toMatch(/custom-class/);
  });
});
