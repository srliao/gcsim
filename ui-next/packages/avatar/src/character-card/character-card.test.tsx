import type { Sim } from "@gcsim/types";
import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { mockHutao, mockXingqiu } from "../../../../tooling/test-fixtures/index.js";
import { CharacterCard, CharacterCardEmpty, groupSets } from "./character-card.js";

describe("groupSets", () => {
  it("returns an empty array for no sets", () => {
    expect(groupSets({})).toEqual([]);
    expect(groupSets(undefined)).toEqual([]);
    expect(groupSets(null)).toEqual([]);
  });

  it("collects entries with count >= 2", () => {
    expect(groupSets({ crimsonwitchofflames: 4 })).toEqual([
      { name: "crimsonwitchofflames", count: 4 },
    ]);
  });

  it("filters out count < 2 (single-piece set bonuses)", () => {
    expect(groupSets({ somealmost: 1, real: 2 })).toEqual([{ name: "real", count: 2 }]);
  });

  it("orders entries by count desc then name asc", () => {
    const out = groupSets({ aaa: 2, zzz: 2, bbb: 4 });
    expect(out).toEqual([
      { name: "bbb", count: 4 },
      { name: "aaa", count: 2 },
      { name: "zzz", count: 2 },
    ]);
  });
});

describe("CharacterCard", () => {
  it("renders the character name (capitalized via CSS, raw in DOM)", () => {
    render(<CharacterCard char={mockHutao} />);
    expect(screen.getByTestId("character-card-name")).toHaveTextContent("hutao");
  });

  it("renders the constellation chip", () => {
    render(<CharacterCard char={mockHutao} />);
    expect(screen.getByTestId("character-card-cons")).toHaveTextContent("C1");
  });

  it("renders level / max_level in mono", () => {
    render(<CharacterCard char={mockHutao} />);
    expect(screen.getByTestId("character-card-level")).toHaveTextContent("Lvl 90/90");
  });

  it("renders the talent triple", () => {
    render(<CharacterCard char={mockHutao} />);
    expect(screen.getByTestId("character-card-talents")).toHaveTextContent("Tal 10/10/10");
  });

  it("sets data-element from the character", () => {
    render(<CharacterCard char={mockHutao} />);
    expect(screen.getByTestId("character-card")).toHaveAttribute("data-element", "pyro");
  });

  it("renders the character art with alt = name", () => {
    render(<CharacterCard char={mockHutao} />);
    const art = screen.getByTestId("character-card-art") as HTMLImageElement;
    expect(art.alt).toBe("hutao");
    expect(art.src).toContain("/assets/avatar/hutao.png");
  });

  it("renders a single full-width set row for one 4-pc set", () => {
    render(<CharacterCard char={mockHutao} />);
    const sets = screen.getByTestId("character-card-sets");
    expect(sets).toHaveAttribute("data-split", "false");
    const rows = within(sets).getAllByTestId("character-card-set-row");
    expect(rows).toHaveLength(1);
    expect(rows[0]).toHaveTextContent("crimsonwitchofflames");
    expect(rows[0]).toHaveTextContent("4-pc");
  });

  it("renders two halves for a 2+2 split", () => {
    const splitChar: Sim.Character = {
      ...mockHutao,
      sets: { crimsonwitchofflames: 2, noblesseoblige: 2 },
    };
    render(<CharacterCard char={splitChar} />);
    const sets = screen.getByTestId("character-card-sets");
    expect(sets).toHaveAttribute("data-split", "true");
    const rows = within(sets).getAllByTestId("character-card-set-row");
    expect(rows).toHaveLength(2);
    expect(sets.textContent).toContain("crimsonwitchofflames");
    expect(sets.textContent).toContain("noblesseoblige");
  });

  it("renders a No-set placeholder when sets map is empty", () => {
    const emptySets: Sim.Character = { ...mockHutao, sets: {} };
    render(<CharacterCard char={emptySets} />);
    const sets = screen.getByTestId("character-card-sets");
    const rows = within(sets).getAllByTestId("character-card-set-row");
    expect(rows).toHaveLength(1);
    expect(rows[0]).toHaveTextContent("No set");
  });

  it("renders the weapon row with name + refine", () => {
    render(<CharacterCard char={mockHutao} />);
    const wpn = screen.getByTestId("character-card-weapon-row");
    expect(wpn).toHaveTextContent("staffofhoma");
    expect(wpn).toHaveTextContent("R1");
  });

  it("renders different character data correctly", () => {
    render(<CharacterCard char={mockXingqiu} />);
    expect(screen.getByTestId("character-card-name")).toHaveTextContent("xingqiu");
    expect(screen.getByTestId("character-card-cons")).toHaveTextContent("C6");
    expect(screen.getByTestId("character-card-talents")).toHaveTextContent("1/10/13");
    expect(screen.getByTestId("character-card-weapon-row")).toHaveTextContent("sacrificialsword");
    expect(screen.getByTestId("character-card-weapon-row")).toHaveTextContent("R5");
  });

  it("renders em-dash for a missing weapon name", () => {
    const noWpn: Sim.Character = {
      ...mockHutao,
      weapon: { name: "", refine: 0, level: 0, max_level: 0 },
    };
    render(<CharacterCard char={noWpn} />);
    expect(screen.getByTestId("character-card-weapon-row")).toHaveTextContent("—");
  });
});

describe("CharacterCardEmpty", () => {
  it("renders the empty-slot copy with the slot number", () => {
    render(<CharacterCardEmpty slot={3} />);
    expect(screen.getByTestId("character-card-empty")).toHaveTextContent(
      "slot 3 · not defined in code",
    );
  });

  it("falls back to a dash when no slot is provided", () => {
    render(<CharacterCardEmpty />);
    expect(screen.getByTestId("character-card-empty")).toHaveTextContent(
      "slot — · not defined in code",
    );
  });
});
