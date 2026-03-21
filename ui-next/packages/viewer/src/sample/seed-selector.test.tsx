import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { mockSimResult } from "../../../../tooling/test-fixtures/index.js";
import { SeedSelector } from "./seed-selector.js";

describe("SeedSelector", () => {
  const defaultProps = {
    result: mockSimResult,
    onGenerate: vi.fn(),
  };

  it("renders seed selector with default sample mode", () => {
    render(<SeedSelector {...defaultProps} />);
    expect(screen.getByTestId("seed-selector")).toBeInTheDocument();
    expect(screen.getByTestId("generate-button")).toBeInTheDocument();
  });

  it("renders all seed mode options", () => {
    render(<SeedSelector {...defaultProps} />);
    // The select trigger should be visible
    expect(screen.getByTestId("seed-mode-select")).toBeInTheDocument();
  });

  it("calls onGenerate with sample seed when generate is clicked", () => {
    const onGenerate = vi.fn();
    render(<SeedSelector {...defaultProps} onGenerate={onGenerate} />);
    fireEvent.click(screen.getByTestId("generate-button"));
    expect(onGenerate).toHaveBeenCalledWith("12345"); // mockSimResult.sample_seed
  });

  it("does not show custom input in non-custom mode", () => {
    render(<SeedSelector {...defaultProps} />);
    expect(screen.queryByTestId("custom-seed-input")).not.toBeInTheDocument();
  });

  it("disables generate button when disabled prop is true", () => {
    render(<SeedSelector {...defaultProps} disabled />);
    expect(screen.getByTestId("generate-button")).toBeDisabled();
  });

  it("disables generate button when seed is unavailable", () => {
    const resultWithNoSeed = { ...mockSimResult, sample_seed: undefined };
    render(<SeedSelector {...defaultProps} result={resultWithNoSeed} />);
    expect(screen.getByTestId("generate-button")).toBeDisabled();
  });
});
