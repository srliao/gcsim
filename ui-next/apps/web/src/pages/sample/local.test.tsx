import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { LocalSample } from "./local";

// Mock react-query
vi.mock("@tanstack/react-query", () => ({
  useQuery: vi.fn().mockReturnValue({ data: null, isLoading: true, error: null }),
}));

// Mock @gcsim/viewer
vi.mock("@gcsim/viewer", () => ({
  SampleViewer: () => <div data-testid="sample-viewer">mock sample viewer</div>,
}));

// Mock @gcsim/api
vi.mock("@gcsim/api", () => ({
  fetchLocalResult: vi.fn(),
}));

describe("LocalSample", () => {
  it("renders heading", () => {
    render(<LocalSample />);
    expect(screen.getByRole("heading", { name: "Local Sample" })).toBeInTheDocument();
  });

  it("renders loading state", () => {
    render(<LocalSample />);
    expect(screen.getByTestId("local-sample-loading")).toBeInTheDocument();
    expect(screen.getByText("Loading results from local dev server...")).toBeInTheDocument();
  });
});
