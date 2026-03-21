import type { Sim } from "@gcsim/types";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { mockSimResult } from "../../../../tooling/test-fixtures/index.js";
import { SampleViewer } from "./sample-viewer.js";

const mockSample: Sim.Sample = {
  seed: "12345",
  config: "test config",
  initial_character: "hutao",
  character_details: mockSimResult.character_details,
  logs: [
    {
      char_index: 0,
      ended: 0,
      event: "action",
      frame: 1,
      msg: "hutao uses normal attack",
      logs: { target: "target-1" },
    },
    {
      char_index: 0,
      ended: 0,
      event: "damage",
      frame: 1,
      msg: "hutao deals 5000 pyro damage",
      logs: { damage: 5000, crit: true, amp: "", cata: "", target: "target-1" },
    },
  ],
};

describe("SampleViewer", () => {
  it("renders the sample viewer container", () => {
    render(<SampleViewer result={mockSimResult} onRequestSample={vi.fn()} />);
    expect(screen.getByTestId("sample-viewer")).toBeInTheDocument();
    expect(screen.getByTestId("seed-selector")).toBeInTheDocument();
  });

  it("shows loading state while generating", async () => {
    // Never-resolving promise to keep loading state
    const onRequestSample = vi.fn(() => new Promise<Sim.Sample>(() => {}));
    render(<SampleViewer result={mockSimResult} onRequestSample={onRequestSample} />);

    fireEvent.click(screen.getByTestId("generate-button"));

    await waitFor(() => {
      expect(screen.getByTestId("sample-loading")).toBeInTheDocument();
    });
  });

  it("shows error state on failure", async () => {
    const onRequestSample = vi.fn(() => Promise.reject(new Error("Network error")));
    render(<SampleViewer result={mockSimResult} onRequestSample={onRequestSample} />);

    fireEvent.click(screen.getByTestId("generate-button"));

    await waitFor(() => {
      expect(screen.getByTestId("sample-error")).toBeInTheDocument();
      expect(screen.getByTestId("sample-error")).toHaveTextContent("Network error");
    });
  });

  it("shows event log on success", async () => {
    const onRequestSample = vi.fn(() => Promise.resolve(mockSample));
    render(<SampleViewer result={mockSimResult} onRequestSample={onRequestSample} />);

    fireEvent.click(screen.getByTestId("generate-button"));

    await waitFor(() => {
      expect(screen.getByTestId("event-log")).toBeInTheDocument();
    });
  });

  it("disables seed selector while loading", async () => {
    const onRequestSample = vi.fn(() => new Promise<Sim.Sample>(() => {}));
    render(<SampleViewer result={mockSimResult} onRequestSample={onRequestSample} />);

    fireEvent.click(screen.getByTestId("generate-button"));

    await waitFor(() => {
      expect(screen.getByTestId("generate-button")).toBeDisabled();
    });
  });
});
