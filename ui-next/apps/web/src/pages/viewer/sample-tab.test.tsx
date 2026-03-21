import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { SampleTab } from "./sample-tab";

const mockSample = vi.fn();

vi.mock("@gcsim/viewer", () => ({
  SampleViewer: (props: Record<string, unknown>) => (
    <div data-testid="sample-viewer" data-result={JSON.stringify(props.result)} />
  ),
}));

vi.mock("../../components/executor-provider", () => ({
  useExecutor: () => ({ sample: mockSample }),
}));

const minimalResults = {
  config_file: "some config",
  character_details: [],
  statistics: {},
} as never;

describe("SampleTab", () => {
  it("renders SampleViewer component", () => {
    render(<SampleTab results={minimalResults} />);
    expect(screen.getByTestId("sample-viewer")).toBeInTheDocument();
  });

  it("passes results to SampleViewer", () => {
    render(<SampleTab results={minimalResults} />);
    const viewer = screen.getByTestId("sample-viewer");
    expect(viewer.dataset.result).toBe(JSON.stringify(minimalResults));
  });
});
