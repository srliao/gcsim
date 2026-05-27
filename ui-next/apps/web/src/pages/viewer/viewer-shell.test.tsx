import "@testing-library/jest-dom/vitest";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ViewerShell } from "./viewer-shell";

const mockSetActiveTab = vi.fn();
const mockSetConfig = vi.fn();
const mockNavigate = vi.fn();

vi.mock("../../stores/viewer-store", () => ({
  useViewerStore: (selector: (s: Record<string, unknown>) => unknown) =>
    selector({
      activeTab: "results",
      setActiveTab: mockSetActiveTab,
    }),
}));

vi.mock("../../stores/simulator-store", () => ({
  useSimulatorStore: (selector: (s: Record<string, unknown>) => unknown) =>
    selector({
      setConfig: mockSetConfig,
    }),
}));

vi.mock("@tanstack/react-router", () => ({
  useNavigate: () => mockNavigate,
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
  Button: ({
    children,
    onClick,
    "data-testid": testId,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    "data-testid"?: string;
    variant?: string;
    size?: string;
  }) => (
    <button type="button" data-testid={testId} onClick={onClick}>
      {children}
    </button>
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

const mockResults = {
  schema_version: "test",
  config_file: "hutao char lvl=90/90 cons=1;",
} as never;

describe("ViewerShell", () => {
  beforeEach(() => {
    mockSetActiveTab.mockReset();
    mockSetConfig.mockReset();
    mockNavigate.mockReset();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

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

  it("renders the sticky header with tabs and actions", () => {
    render(<ViewerShell results={mockResults} isLoading={false} error={null} />);
    const header = screen.getByTestId("viewer-header");
    expect(header).toBeDefined();
    expect(header.className).toContain("sticky");
    expect(screen.getByTestId("viewer-header-tabs")).toBeDefined();
    expect(screen.getByTestId("viewer-header-actions")).toBeDefined();
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

  it("renders all three action buttons", () => {
    render(<ViewerShell results={mockResults} isLoading={false} error={null} />);
    expect(screen.getByTestId("viewer-action-copy")).toBeDefined();
    expect(screen.getByTestId("viewer-action-send")).toBeDefined();
    expect(screen.getByTestId("viewer-action-share")).toBeDefined();
  });

  it("Copy Config writes to clipboard and shows a transient confirmation", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });

    render(<ViewerShell results={mockResults} isLoading={false} error={null} />);
    await act(async () => {
      fireEvent.click(screen.getByTestId("viewer-action-copy"));
    });

    expect(writeText).toHaveBeenCalledWith("hutao char lvl=90/90 cons=1;");
    await waitFor(() => {
      expect(screen.getByTestId("viewer-action-copy").textContent).toContain("Copied");
    });
  });

  it("Send To Simulator writes config to store and navigates", () => {
    render(<ViewerShell results={mockResults} isLoading={false} error={null} />);
    fireEvent.click(screen.getByTestId("viewer-action-send"));
    expect(mockSetConfig).toHaveBeenCalledWith("hutao char lvl=90/90 cons=1;");
    expect(mockNavigate).toHaveBeenCalledWith({ to: "/simulator" });
  });

  it("Share button has a click handler that does not throw", () => {
    render(<ViewerShell results={mockResults} isLoading={false} error={null} />);
    expect(() => fireEvent.click(screen.getByTestId("viewer-action-share"))).not.toThrow();
  });
});
