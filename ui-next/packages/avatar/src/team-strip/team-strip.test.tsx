import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { mockCharacters, mockHutao, mockXingqiu } from "../../../../tooling/test-fixtures/index.js";
import { TeamStrip } from "./team-strip.js";

describe("TeamStrip", () => {
  it("always renders 4 slots", () => {
    render(<TeamStrip team={mockCharacters} />);
    const cards = screen.getAllByTestId("character-card-compact");
    const empties = screen.getAllByTestId("team-strip-empty-slot");
    expect(cards.length + empties.length).toBe(4);
  });

  it("renders one compact card per character", () => {
    render(<TeamStrip team={mockCharacters} />);
    expect(screen.getAllByTestId("character-card-compact")).toHaveLength(2);
  });

  it("fills remaining slots with empty placeholders", () => {
    render(<TeamStrip team={[mockHutao]} />);
    expect(screen.getAllByTestId("team-strip-empty-slot")).toHaveLength(3);
  });

  it("renders four empty placeholders for an empty team", () => {
    render(<TeamStrip team={[]} />);
    expect(screen.getAllByTestId("team-strip-empty-slot")).toHaveLength(4);
    expect(screen.queryAllByTestId("character-card-compact")).toHaveLength(0);
  });

  it("renders four cards (no placeholders) for a full team", () => {
    const team = [mockHutao, mockXingqiu, mockHutao, mockXingqiu];
    render(<TeamStrip team={team} />);
    expect(screen.getAllByTestId("character-card-compact")).toHaveLength(4);
    expect(screen.queryAllByTestId("team-strip-empty-slot")).toHaveLength(0);
  });

  it("passes data-element through from each character", () => {
    render(<TeamStrip team={[mockHutao]} />);
    expect(screen.getByTestId("character-card-compact")).toHaveAttribute("data-element", "pyro");
  });

  it("applies custom className", () => {
    render(<TeamStrip team={[]} className="my-strip" />);
    expect(screen.getByTestId("team-strip").className).toContain("my-strip");
  });

  it("respects a custom size on both cards and placeholders", () => {
    render(<TeamStrip team={[mockHutao]} size={120} />);
    expect(screen.getByTestId("character-card-compact")).toHaveStyle({
      width: "120px",
      height: "120px",
    });
    expect(screen.getAllByTestId("team-strip-empty-slot")[0]).toHaveStyle({
      width: "120px",
      height: "120px",
    });
  });
});
