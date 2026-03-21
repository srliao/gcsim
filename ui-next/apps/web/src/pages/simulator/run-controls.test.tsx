import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const mockNavigate = vi.fn();

vi.mock("@tanstack/react-router", () => ({
  useNavigate: () => mockNavigate,
}));

const mockExecutor = {
  ready: vi.fn().mockResolvedValue(true),
  running: vi.fn().mockReturnValue(false),
  run: vi.fn().mockResolvedValue(true),
  cancel: vi.fn(),
  validate: vi.fn(),
  sample: vi.fn(),
  buildInfo: vi.fn().mockReturnValue({ hash: "abc", date: "2026-01-01" }),
};

vi.mock("../../components/executor-provider", () => ({
  useExecutor: () => mockExecutor,
}));

vi.mock("../../stores/simulator-store", () => ({
  useSimulatorStore: (selector: (s: { config: string }) => unknown) =>
    selector({ config: "test config;" }),
}));

const mockSetResults = vi.fn();

vi.mock("../../stores/viewer-store", () => ({
  useViewerStore: (selector: (s: { setResults: typeof mockSetResults }) => unknown) =>
    selector({ setResults: mockSetResults }),
}));

import { RunControls } from "./run-controls";

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("RunControls", () => {
  it("renders Run button", async () => {
    render(<RunControls />);
    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Run" })).toBeDefined();
    });
  });

  it("shows Ready indicator when executor is ready", async () => {
    render(<RunControls />);
    await waitFor(() => {
      expect(screen.getByText("Ready")).toBeDefined();
    });
  });

  it("shows Not Ready indicator when executor is not ready", async () => {
    mockExecutor.ready.mockResolvedValueOnce(false);
    render(<RunControls />);
    await waitFor(() => {
      expect(screen.getByText("Not Ready")).toBeDefined();
    });
  });

  it("Run button is disabled when not ready", async () => {
    mockExecutor.ready.mockResolvedValueOnce(false);
    render(<RunControls />);
    await waitFor(() => {
      expect(screen.getByText("Not Ready")).toBeDefined();
    });
    const button = screen.getByRole("button", { name: "Run" });
    expect(button).toHaveProperty("disabled", true);
  });

  it("shows Cancel button when running", async () => {
    mockExecutor.run.mockImplementation(
      () => new Promise(() => {}), // never resolves
    );
    render(<RunControls />);
    await waitFor(() => {
      expect(screen.getByText("Ready")).toBeDefined();
    });
    fireEvent.click(screen.getByRole("button", { name: "Run" }));
    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Cancel" })).toBeDefined();
    });
  });
});
