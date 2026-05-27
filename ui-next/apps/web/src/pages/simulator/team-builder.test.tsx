import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useSimulatorStore } from "../../stores/simulator-store";
import { TeamBuilder } from "./team-builder";

vi.mock("@gcsim/avatar", () => ({
  TeamStrip: ({ team }: { team: unknown[] }) => (
    <div data-testid="team-strip">{team.length} characters</div>
  ),
}));

vi.mock("@gcsim/data", () => ({
  latestChars: { "1.0": ["amber", "kaeya", "lisa"] },
}));

describe("TeamBuilder", () => {
  beforeEach(() => {
    useSimulatorStore.setState({ team: [] });
  });

  afterEach(() => {
    cleanup();
  });

  it("renders Team heading", () => {
    render(<TeamBuilder />);
    expect(screen.getByText("Team")).toBeDefined();
  });

  it("shows Add Character select and button", () => {
    render(<TeamBuilder />);
    expect(screen.getByLabelText("Add Character")).toBeDefined();
    expect(screen.getByRole("button", { name: "Add" })).toBeDefined();
  });

  it("renders team display when characters exist", () => {
    useSimulatorStore.setState({
      team: [
        {
          name: "amber",
          element: "pyro",
          level: 90,
          max_level: 90,
          cons: 0,
          weapon: { name: "", level: 90, max_level: 90, refine: 1 },
          talents: { attack: 9, skill: 9, burst: 9 },
          sets: {},
          stats: [],
          snapshot: [],
        },
      ],
    });
    render(<TeamBuilder />);
    const display = screen.getByTestId("team-strip");
    expect(display.textContent).toBe("1 characters");
  });

  it("Add button is disabled when team has 4 characters", () => {
    const makeChar = (name: string) => ({
      name,
      element: "",
      level: 90,
      max_level: 90,
      cons: 0,
      weapon: { name: "", level: 90, max_level: 90, refine: 1 },
      talents: { attack: 9, skill: 9, burst: 9 },
      sets: {},
      stats: [] as number[],
      snapshot: [] as number[],
    });
    useSimulatorStore.setState({
      team: [makeChar("amber"), makeChar("kaeya"), makeChar("lisa"), makeChar("xiangling")],
    });
    render(<TeamBuilder />);
    const addButton = screen.getByRole("button", { name: "Add" });
    expect(addButton).toHaveProperty("disabled", true);
  });
});
