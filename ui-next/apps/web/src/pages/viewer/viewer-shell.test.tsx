import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ViewerShell } from "./viewer-shell";

// Mock the viewer store
const mockSetActiveTab = vi.fn();

vi.mock("../../stores/viewer-store", () => ({
  useViewerStore: (selector: (s: Record<string, unknown>) => unknown) =>
    selector({
      activeTab: "results",
      setActiveTab: mockSetActiveTab,
    }),
}));

// Mock primitives Tabs components
vi.mock("@gcsim/primitives", () => ({
  Tabs: ({
    value,
    children,
  }: {
    value: string;
    onValueChange?: (v: string) => void;
    children: React.ReactNode;
  }) => (
    <div data-testid="tabs" data-value={value}>
      {children}
    </div>
  ),
  TabsList: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="tabs-list">{children}</div>
  ),
  TabsTrigger: ({ value, children }: { value: string; children: React.ReactNode }) => (
    <button type="button" data-testid={`tab-${value}`} onClick={() => mockSetActiveTab(value)}>
      {children}
    </button>
  ),
  TabsContent: ({ value, children }: { value: string; children: React.ReactNode }) => (
    <div data-testid={`content-${value}`}>{children}</div>
  ),
}));

// Mock child tab components to isolate ViewerShell tests
vi.mock("./config-tab", () => ({
  ConfigTab: () => <div data-testid="config-tab">ConfigTab</div>,
}));

vi.mock("./results-tab", () => ({
  ResultsTab: () => <div data-testid="results-tab">ResultsTab</div>,
}));

vi.mock("./sample-tab", () => ({
  SampleTab: () => <div data-testid="sample-tab">SampleTab</div>,
}));

const mockResults = { schema_version: "test" } as never;

describe("ViewerShell", () => {
  it("shows loading state", () => {
    render(<ViewerShell results={null} isLoading={true} error={null} />);
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("shows error state", () => {
    render(<ViewerShell results={null} isLoading={false} error="Something went wrong" />);
    expect(screen.getByText("Error: Something went wrong")).toBeInTheDocument();
  });

  it("shows no results message when results is null", () => {
    render(<ViewerShell results={null} isLoading={false} error={null} />);
    expect(screen.getByText("No results loaded.")).toBeInTheDocument();
  });

  it("shows tabs when results are loaded", () => {
    render(<ViewerShell results={mockResults} isLoading={false} error={null} />);
    expect(screen.getByTestId("tabs")).toBeInTheDocument();
    expect(screen.getByTestId("tab-results")).toBeInTheDocument();
    expect(screen.getByTestId("tab-config")).toBeInTheDocument();
    expect(screen.getByTestId("tab-sample")).toBeInTheDocument();
  });

  it("calls setActiveTab on tab click", () => {
    render(<ViewerShell results={mockResults} isLoading={false} error={null} />);
    fireEvent.click(screen.getByTestId("tab-config"));
    expect(mockSetActiveTab).toHaveBeenCalledWith("config");
  });
});
