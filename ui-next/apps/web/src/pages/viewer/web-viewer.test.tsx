import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { WebViewer } from "./web-viewer";

// Mock viewer store
vi.mock("../../stores/viewer-store", () => ({
  useViewerStore: (selector: (s: Record<string, unknown>) => unknown) =>
    selector({
      results: null,
      error: null,
      activeTab: "results",
      setActiveTab: vi.fn(),
    }),
}));

// Mock ViewerShell to isolate unit test
vi.mock("./viewer-shell", () => ({
  ViewerShell: (props: { results: unknown; isLoading: boolean; error: string | null }) => (
    <div data-testid="viewer-shell" data-loading={String(props.isLoading)} data-error={props.error}>
      {props.results ? "has-results" : "no-results"}
    </div>
  ),
}));

describe("WebViewer", () => {
  it("renders ViewerShell with store results", () => {
    render(<WebViewer />);
    const shell = screen.getByTestId("viewer-shell");
    expect(shell).toBeInTheDocument();
    expect(shell).toHaveAttribute("data-loading", "false");
    expect(shell).toHaveTextContent("no-results");
  });
});
