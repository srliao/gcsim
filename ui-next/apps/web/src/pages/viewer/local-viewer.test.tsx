import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { LocalViewer } from "./local-viewer";

// Mock react-query
vi.mock("@tanstack/react-query", () => ({
  useQuery: vi.fn().mockReturnValue({ data: null, isLoading: true, error: null }),
}));

// Mock viewer store
vi.mock("../../stores/viewer-store", () => ({
  useViewerStore: (selector: (s: Record<string, unknown>) => unknown) =>
    selector({
      activeTab: "results",
      setActiveTab: vi.fn(),
    }),
}));

// Mock ViewerShell
vi.mock("./viewer-shell", () => ({
  ViewerShell: (props: { results: unknown; isLoading: boolean; error: string | null }) => (
    <div data-testid="viewer-shell" data-loading={String(props.isLoading)}>
      {props.isLoading ? "loading" : "loaded"}
    </div>
  ),
}));

describe("LocalViewer", () => {
  it("shows loading initially", () => {
    render(<LocalViewer />);
    const shell = screen.getByTestId("viewer-shell");
    expect(shell).toHaveAttribute("data-loading", "true");
    expect(shell).toHaveTextContent("loading");
  });
});
