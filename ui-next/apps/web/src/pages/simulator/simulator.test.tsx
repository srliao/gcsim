import type { Executor } from "@gcsim/executor";
import type { Sim } from "@gcsim/types";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Hoisted mocks so vi.mock factories can read them.
const mocks = vi.hoisted(() => ({
  executor: {
    ready: vi.fn().mockResolvedValue(true),
    running: vi.fn().mockReturnValue(false),
    validate: vi.fn(),
    sample: vi.fn(),
    run: vi.fn().mockResolvedValue(true),
    cancel: vi.fn(),
    buildInfo: vi.fn().mockReturnValue({ hash: "abc", date: "2026-01-01" }),
  } satisfies Executor,
  navigate: vi.fn(),
}));

vi.mock("../../components/executor-provider", () => ({
  useExecutor: () => mocks.executor,
}));

vi.mock("@tanstack/react-router", () => ({
  useNavigate: () => mocks.navigate,
}));

// Avoid having to spin up real CodeMirror in jsdom.
vi.mock("@gcsim/editor", () => ({
  Editor: ({
    value,
    onChange,
    parseStatus,
  }: {
    value: string;
    onChange?: (v: string) => void;
    parseStatus?: string;
  }) => (
    <div data-testid="mock-editor" data-parse-status={parseStatus}>
      <textarea
        data-testid="mock-editor-textarea"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
      />
    </div>
  ),
}));

import { useSimulatorStore } from "../../stores/simulator-store";
import { Simulator } from "./simulator";

const SAMPLE_PARSED: Sim.ParsedResult = {
  characters: [
    {
      base: {
        key: "hutao",
        name: "hutao",
        element: "pyro",
        level: 90,
        max_level: 90,
        base_hp: 0,
        base_atk: 0,
        base_def: 0,
        cons: 1,
        start_hp: 0,
      },
      weapon: { name: "staffofhoma", level: 90, max_level: 90, refine: 1 },
      talents: { attack: 9, skill: 9, burst: 9 },
      stats: [],
      sets: { shimenawasreminiscence: 4 },
    },
    {
      base: {
        key: "xingqiu",
        name: "xingqiu",
        element: "hydro",
        level: 90,
        max_level: 90,
        base_hp: 0,
        base_atk: 0,
        base_def: 0,
        cons: 6,
        start_hp: 0,
      },
      weapon: { name: "sacrificialsword", level: 90, max_level: 90, refine: 5 },
      talents: { attack: 9, skill: 9, burst: 9 },
      stats: [],
      sets: { emblemofseveredfate: 4 },
    },
  ],
  errors: [],
  player_initial_pos: { x: 0, y: 0, r: 0 },
};

function renderSimulator() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0, staleTime: 0 } },
  });
  function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  }
  return render(<Simulator />, { wrapper: Wrapper });
}

beforeEach(() => {
  useSimulatorStore.setState({
    config: "active hutao;",
    team: [],
    validationResult: null,
  });
  mocks.executor.ready.mockResolvedValue(true);
  mocks.executor.validate.mockResolvedValue(SAMPLE_PARSED);
  mocks.executor.run.mockResolvedValue(true);
  mocks.navigate.mockReset();
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("Simulator", () => {
  it("renders the team preview section with the parsed status badge", async () => {
    renderSimulator();
    expect(screen.getByText(/Team preview/i)).toBeDefined();

    const badge = await screen.findByTestId("parser-status-badge");
    await waitFor(() => {
      expect(badge.textContent).toMatch(/parsed · 2\/4/);
    });
  });

  it("renders 4 team slots — parsed cards plus empty slots", async () => {
    renderSimulator();
    const grid = await screen.findByTestId("team-preview-grid");
    await waitFor(() => {
      expect(within(grid).getAllByTestId("character-card")).toHaveLength(2);
      expect(within(grid).getAllByTestId("character-card-empty")).toHaveLength(2);
    });
  });

  it("renders the editor section with mock editor", () => {
    renderSimulator();
    expect(screen.getByTestId("editor-section")).toBeDefined();
    expect(screen.getAllByTestId("mock-editor").length).toBeGreaterThan(0);
  });

  it("mounts exactly one Editor instance (no duplicate CodeMirror across tabs)", () => {
    renderSimulator();
    // Regression: previously the actions + config TabsContent panels each
    // rendered their own <Editor>, double-mounting CodeMirror.
    expect(screen.getAllByTestId("mock-editor")).toHaveLength(1);
  });

  it("renders the sticky bottom action bar with settings, tools, and run buttons", () => {
    renderSimulator();
    const bar = screen.getByTestId("action-bar");
    expect(within(bar).getByTestId("settings-button")).toBeDefined();
    expect(within(bar).getByTestId("tools-button")).toBeDefined();
    expect(within(bar).getByTestId("run-button")).toBeDefined();
    expect(within(bar).getByTestId("seed-input")).toBeDefined();
    expect(within(bar).getByText("untitled.gcsl")).toBeDefined();
  });

  it("renders the seed input as disabled (not yet wired to executor)", () => {
    renderSimulator();
    const seed = screen.getByTestId("seed-input") as HTMLInputElement;
    expect(seed.disabled).toBe(true);
  });

  it("opens the settings dialog when the Settings button is clicked", async () => {
    renderSimulator();
    fireEvent.click(screen.getByTestId("settings-button"));
    await waitFor(() => {
      expect(screen.getByTestId("settings-dialog")).toBeDefined();
    });
    expect(screen.getByText(/Executor settings/i)).toBeDefined();
  });

  it("opens the tools dialog with Enka and GOOD tabs when Tools is clicked", async () => {
    renderSimulator();
    fireEvent.click(screen.getByTestId("tools-button"));
    await waitFor(() => {
      expect(screen.getByTestId("tools-dialog")).toBeDefined();
    });
    expect(screen.getByRole("tab", { name: /Enka/i })).toBeDefined();
    expect(screen.getByRole("tab", { name: /GOOD/i })).toBeDefined();
    expect(screen.getByTestId("tools-enka-placeholder")).toBeDefined();
  });

  it("invokes the executor and navigates to /web when Run is clicked", async () => {
    renderSimulator();

    // Wait for ready() to resolve so the button is enabled.
    await waitFor(() => {
      const btn = screen.getByTestId("run-button") as HTMLButtonElement;
      expect(btn.disabled).toBe(false);
    });

    fireEvent.click(screen.getByTestId("run-button"));

    await waitFor(() => {
      expect(mocks.executor.run).toHaveBeenCalledTimes(1);
      expect(mocks.navigate).toHaveBeenCalledWith({ to: "/web" });
    });
  });

  it("displays parser errors when validate returns errors", async () => {
    mocks.executor.validate.mockResolvedValueOnce({
      characters: [],
      errors: ["unknown character: foo"],
      player_initial_pos: { x: 0, y: 0, r: 0 },
    });
    renderSimulator();
    await waitFor(() => {
      const list = screen.getByTestId("parser-error-list");
      expect(list.textContent).toContain("unknown character: foo");
    });
  });

  it("uses error tone on the parsed badge when validate returns errors and no characters", async () => {
    mocks.executor.validate.mockResolvedValueOnce({
      characters: [],
      errors: ["unknown character: foo"],
      player_initial_pos: { x: 0, y: 0, r: 0 },
    });
    renderSimulator();
    await waitFor(() => {
      const badge = screen.getByTestId("parser-status-badge");
      expect(badge.getAttribute("data-tone")).toBe("error");
    });
  });
});
