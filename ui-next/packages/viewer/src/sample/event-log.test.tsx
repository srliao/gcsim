import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { FrameGroup, SimEvent } from "../events/index.js";
import { EventLog } from "./event-log.js";

function makeEvent(
  overrides: Partial<SimEvent> & { type: SimEvent["type"]; message: string },
): SimEvent {
  return {
    frame: 0,
    characterIndex: 0,
    raw: { char_index: 0, ended: 0, event: "action", frame: 0, msg: "", logs: {} },
    ...overrides,
  } as SimEvent;
}

function makeFrameGroups(): FrameGroup[] {
  return [
    {
      frame: 1,
      activeCharacter: 0,
      slots: [
        [], // sim slot
        [
          makeEvent({
            type: "action",
            message: "hutao uses normal attack",
            action: "normal",
            target: "target-1",
          }),
          makeEvent({
            type: "damage",
            message: "hutao deals 5000 damage",
            damage: 5000,
            crit: true,
            amp: "",
            cata: "",
            target: "target-1",
          }),
        ],
        [], // xingqiu slot
      ],
    },
    {
      frame: 5,
      activeCharacter: 0,
      slots: [
        [],
        [
          makeEvent({
            type: "energy",
            message: "hutao receives 3 particles",
            energyType: "particle" as const,
            source: "skill",
            amount: 3,
            postRecovery: 50,
            maxEnergy: 70,
          }),
        ],
        [makeEvent({ type: "status", message: "xingqiu skill buff active", key: "skill-buff" })],
      ],
    },
  ];
}

describe("EventLog", () => {
  const defaultProps = {
    frameGroups: makeFrameGroups(),
    characterNames: ["hutao", "xingqiu"],
  };

  it("renders the event log container", () => {
    render(<EventLog {...defaultProps} />);
    expect(screen.getByTestId("event-log")).toBeInTheDocument();
  });

  it("renders header with character names", () => {
    render(<EventLog {...defaultProps} />);
    const header = screen.getByTestId("event-log-header");
    expect(header).toHaveTextContent("Frame");
    expect(header).toHaveTextContent("Sim");
    expect(header).toHaveTextContent("hutao");
    expect(header).toHaveTextContent("xingqiu");
  });

  it("renders frame rows", () => {
    render(<EventLog {...defaultProps} />);
    const rows = screen.getAllByTestId("event-log-row");
    expect(rows.length).toBeGreaterThanOrEqual(1);
  });

  it("renders event items with badges", () => {
    render(<EventLog {...defaultProps} />);
    const items = screen.getAllByTestId("event-item");
    expect(items.length).toBeGreaterThan(0);
  });

  it("renders filter preset selector", () => {
    render(<EventLog {...defaultProps} />);
    expect(screen.getByTestId("filter-preset-select")).toBeInTheDocument();
  });

  it("renders search input", () => {
    render(<EventLog {...defaultProps} />);
    expect(screen.getByTestId("event-search-input")).toBeInTheDocument();
  });

  it("filters events by search query", () => {
    render(<EventLog {...defaultProps} />);
    const search = screen.getByTestId("event-search-input");
    fireEvent.change(search, { target: { value: "particles" } });
    // Only the energy event matching "particles" should remain
    const items = screen.getAllByTestId("event-item");
    expect(items.length).toBe(1);
    expect(items[0]).toHaveTextContent("particles");
  });

  it("shows empty state when no events match", () => {
    render(<EventLog {...defaultProps} />);
    const search = screen.getByTestId("event-search-input");
    fireEvent.change(search, { target: { value: "nonexistent_query_xyz" } });
    expect(screen.getByTestId("event-log-empty")).toBeInTheDocument();
  });

  it("handles empty frameGroups", () => {
    render(<EventLog frameGroups={[]} characterNames={["hutao"]} />);
    expect(screen.getByTestId("event-log-empty")).toBeInTheDocument();
  });
});
