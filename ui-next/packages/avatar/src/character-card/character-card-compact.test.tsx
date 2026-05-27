import type { Sim } from "@gcsim/types";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { mockHutao, mockXingqiu } from "../../../../tooling/test-fixtures/index.js";
import { CharacterCardCompact } from "./character-card-compact.js";

describe("CharacterCardCompact", () => {
  it("renders the character art with alt = name", () => {
    render(<CharacterCardCompact char={mockHutao} />);
    const art = screen.getByTestId("character-card-compact-art") as HTMLImageElement;
    expect(art.alt).toBe("hutao");
    expect(art.src).toContain("/assets/avatar/hutao.png");
  });

  it("sets data-element from the character", () => {
    render(<CharacterCardCompact char={mockHutao} />);
    expect(screen.getByTestId("character-card-compact")).toHaveAttribute("data-element", "pyro");
  });

  it("defaults to 84px square", () => {
    render(<CharacterCardCompact char={mockHutao} />);
    const card = screen.getByTestId("character-card-compact");
    expect(card).toHaveStyle({ width: "84px", height: "84px" });
  });

  it("respects custom size", () => {
    render(<CharacterCardCompact char={mockHutao} size={96} />);
    const card = screen.getByTestId("character-card-compact");
    expect(card).toHaveStyle({ width: "96px", height: "96px" });
  });

  it("renders the top-right level/cons-refine pill", () => {
    render(<CharacterCardCompact char={mockHutao} />);
    const stats = screen.getByTestId("character-card-compact-stats");
    expect(stats).toHaveTextContent("lvl 90");
    expect(stats).toHaveTextContent("C1 R1");
  });

  it("reflects the weapon refine in the pill", () => {
    render(<CharacterCardCompact char={mockXingqiu} />);
    const stats = screen.getByTestId("character-card-compact-stats");
    expect(stats).toHaveTextContent("C6 R5");
  });

  it("renders a weapon icon tile", () => {
    render(<CharacterCardCompact char={mockHutao} />);
    const tiles = screen.getAllByTestId("character-card-compact-icon");
    expect(tiles[0]).toHaveAttribute("data-kind", "weapon");
  });

  it("renders one artifact tile for a single 4-pc set (no badge)", () => {
    render(<CharacterCardCompact char={mockHutao} />);
    const tiles = screen.getAllByTestId("character-card-compact-icon");
    const artifactTiles = tiles.filter((t) => t.getAttribute("data-kind") === "artifact");
    expect(artifactTiles).toHaveLength(1);
    // No 2pc badge on a single set
    expect(artifactTiles[0].textContent).toBe("");
  });

  it("renders two artifact tiles with piece-count badges for a 2+2 split", () => {
    const split: Sim.Character = {
      ...mockHutao,
      sets: { noblesseoblige: 2, crimsonwitchofflames: 2 },
    };
    render(<CharacterCardCompact char={split} />);
    const artifactTiles = screen
      .getAllByTestId("character-card-compact-icon")
      .filter((t) => t.getAttribute("data-kind") === "artifact");
    expect(artifactTiles).toHaveLength(2);
    expect(artifactTiles[0]).toHaveTextContent("2");
    expect(artifactTiles[1]).toHaveTextContent("2");
  });

  it("renders only a weapon tile when no artifact sets", () => {
    const noSets: Sim.Character = { ...mockHutao, sets: {} };
    render(<CharacterCardCompact char={noSets} />);
    const tiles = screen.getAllByTestId("character-card-compact-icon");
    expect(tiles).toHaveLength(1);
    expect(tiles[0]).toHaveAttribute("data-kind", "weapon");
  });
});
