import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { mockCharacters, mockHutao, mockXingqiu } from "../../../../tooling/test-fixtures/index.js";
import { TeamDisplay } from "./team-display.js";

describe("TeamDisplay", () => {
  it("renders correct number of portraits for 2 characters", () => {
    render(<TeamDisplay characters={mockCharacters} />);
    const portraits = screen.getAllByTestId("portrait");
    expect(portraits).toHaveLength(2);
  });

  it("handles empty team", () => {
    render(<TeamDisplay characters={[]} />);
    expect(screen.getByTestId("team-display")).toHaveTextContent("No characters");
    expect(screen.queryAllByTestId("portrait")).toHaveLength(0);
  });

  it("handles 1 character", () => {
    render(<TeamDisplay characters={[mockHutao]} />);
    expect(screen.getAllByTestId("portrait")).toHaveLength(1);
  });

  it("handles 4 characters", () => {
    const team = [mockHutao, mockXingqiu, mockHutao, mockXingqiu];
    // Note: keys may collide with duplicate names, but this tests the count
    render(<TeamDisplay characters={team} />);
    expect(screen.getAllByTestId("portrait")).toHaveLength(4);
  });

  it("passes element to portraits", () => {
    render(<TeamDisplay characters={[mockHutao]} />);
    const element = screen.getByTestId("portrait-element");
    expect(element).toHaveTextContent("pyro");
  });

  it("applies custom className", () => {
    render(<TeamDisplay characters={[]} className="my-class" />);
    expect(screen.getByTestId("team-display").className).toContain("my-class");
  });
});
