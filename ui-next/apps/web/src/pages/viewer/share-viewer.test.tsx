import "@testing-library/jest-dom/vitest";
import { useQuery } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ShareViewer } from "./share-viewer";

// Mock react-router
vi.mock("@tanstack/react-router", () => ({
  useParams: vi.fn().mockReturnValue({ id: "test-123" }),
}));

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
      shell
    </div>
  ),
}));

describe("ShareViewer", () => {
  it("calls fetchShareResult with route param id", () => {
    render(<ShareViewer />);
    expect(useQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: ["share-result", "test-123"],
        enabled: true,
      }),
    );
    expect(screen.getByTestId("viewer-shell")).toBeInTheDocument();
  });
});
