import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { mockHutao, mockXingqiu } from "../../../../tooling/test-fixtures/index.js";
import { AvatarCard } from "./avatar-card.js";

describe("AvatarCard", () => {
  it("renders character name", () => {
    render(<AvatarCard character={mockHutao} />);
    expect(screen.getByTestId("avatar-card-name")).toHaveTextContent("hutao");
  });

  it("renders level and max level", () => {
    render(<AvatarCard character={mockHutao} />);
    expect(screen.getByTestId("avatar-card-level")).toHaveTextContent("Lv. 90/90");
  });

  it("renders constellation count", () => {
    render(<AvatarCard character={mockHutao} />);
    expect(screen.getByTestId("avatar-card-cons")).toHaveTextContent("C1");
  });

  it("renders weapon info", () => {
    render(<AvatarCard character={mockHutao} />);
    expect(screen.getByTestId("avatar-card-weapon")).toHaveTextContent("staffofhoma R1");
  });

  it("renders talent levels", () => {
    render(<AvatarCard character={mockHutao} />);
    expect(screen.getByTestId("avatar-card-talents")).toHaveTextContent("10/10/10");
  });

  it("renders different character data correctly", () => {
    render(<AvatarCard character={mockXingqiu} />);
    expect(screen.getByTestId("avatar-card-name")).toHaveTextContent("xingqiu");
    expect(screen.getByTestId("avatar-card-cons")).toHaveTextContent("C6");
    expect(screen.getByTestId("avatar-card-weapon")).toHaveTextContent("sacrificialsword R5");
    expect(screen.getByTestId("avatar-card-talents")).toHaveTextContent("1/10/13");
  });

  it("includes portrait with correct element", () => {
    render(<AvatarCard character={mockHutao} />);
    const element = screen.getByTestId("portrait-element");
    expect(element).toHaveTextContent("pyro");
  });

  it("handles partial data gracefully", () => {
    const partial = {
      name: "unknown",
      level: 1,
      max_level: 20,
      element: "",
      cons: 0,
      weapon: { name: "dullblade", refine: 1, level: 1, max_level: 20 },
      talents: { attack: 1, skill: 1, burst: 1 },
      stats: [],
      snapshot: [],
      sets: {},
    };
    render(<AvatarCard character={partial} />);
    expect(screen.getByTestId("avatar-card-name")).toHaveTextContent("unknown");
    expect(screen.getByTestId("avatar-card-level")).toHaveTextContent("Lv. 1/20");
    expect(screen.getByTestId("avatar-card-cons")).toHaveTextContent("C0");
  });
});
