import type { Sim } from "@gcsim/types";
import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { FieldTimeBar, transformFieldTimeBar } from "./field-time-bar.js";

const mockFieldTime: Sim.FloatStat[] = [{ mean: 25 }, { mean: 50 }, { mean: 15 }, { mean: 10 }];
const characterNames = ["Hu Tao", "Xingqiu", "Bennett", "Zhongli"];
const characterElements = ["pyro", "hydro", "pyro", "geo"];

describe("transformFieldTimeBar", () => {
  it("produces one segment per character with element + percentage", () => {
    const segments = transformFieldTimeBar(mockFieldTime, characterNames, characterElements);

    expect(segments).toHaveLength(4);
    expect(segments[0]).toMatchObject({
      name: "Hu Tao",
      element: "pyro",
      value: 25,
      pct: 25,
    });
    expect(segments[1]).toMatchObject({
      name: "Xingqiu",
      element: "hydro",
      value: 50,
      pct: 50,
    });
  });

  it("percentages sum to 100", () => {
    const segments = transformFieldTimeBar(mockFieldTime, characterNames, characterElements);
    const total = segments.reduce((s, seg) => s + seg.pct, 0);
    expect(total).toBe(100);
  });

  it("falls back to `Character N` and physical when names/elements are missing", () => {
    const segments = transformFieldTimeBar([{ mean: 100 }], [], []);
    expect(segments[0].name).toBe("Character 1");
    expect(segments[0].element).toBe("physical");
  });

  it("returns empty when fieldTime is undefined", () => {
    expect(transformFieldTimeBar(undefined, characterNames, characterElements)).toEqual([]);
  });

  it("returns empty when fieldTime is empty", () => {
    expect(transformFieldTimeBar([], characterNames, characterElements)).toEqual([]);
  });

  it("returns empty when all means sum to 0", () => {
    expect(
      transformFieldTimeBar([{ mean: 0 }, { mean: 0 }], characterNames, characterElements),
    ).toEqual([]);
  });
});

describe("FieldTimeBar", () => {
  it("renders the outer wrapper with data-testid", () => {
    render(
      <FieldTimeBar
        fieldTime={mockFieldTime}
        characterNames={characterNames}
        characterElements={characterElements}
      />,
    );
    expect(screen.getByTestId("field-time-bar")).toBeInTheDocument();
  });

  it("renders one segment per character", () => {
    render(
      <FieldTimeBar
        fieldTime={mockFieldTime}
        characterNames={characterNames}
        characterElements={characterElements}
      />,
    );
    const segments = screen.getAllByTestId("field-time-bar-segment");
    expect(segments).toHaveLength(4);
  });

  it("renders each segment with the character name and percentage", () => {
    render(
      <FieldTimeBar
        fieldTime={mockFieldTime}
        characterNames={characterNames}
        characterElements={characterElements}
      />,
    );
    const segments = screen.getAllByTestId("field-time-bar-segment");
    expect(within(segments[0]).getByText(/Hu Tao/)).toBeInTheDocument();
    expect(within(segments[0]).getByText(/25%/)).toBeInTheDocument();
    expect(within(segments[1]).getByText(/50%/)).toBeInTheDocument();
  });

  it("renders empty state when fieldTime is undefined", () => {
    render(<FieldTimeBar fieldTime={undefined} characterNames={[]} characterElements={[]} />);
    expect(screen.getByTestId("field-time-bar-empty")).toBeInTheDocument();
  });

  it("applies element color via element data attribute on each segment", () => {
    render(
      <FieldTimeBar
        fieldTime={mockFieldTime}
        characterNames={characterNames}
        characterElements={characterElements}
      />,
    );
    const segments = screen.getAllByTestId("field-time-bar-segment");
    expect(segments[0]).toHaveAttribute("data-element", "pyro");
    expect(segments[1]).toHaveAttribute("data-element", "hydro");
    expect(segments[3]).toHaveAttribute("data-element", "geo");
  });

  it("handles missing characterNames/elements by falling back gracefully", () => {
    render(<FieldTimeBar fieldTime={mockFieldTime} />);
    const segments = screen.getAllByTestId("field-time-bar-segment");
    expect(segments).toHaveLength(4);
    expect(within(segments[0]).getByText(/Character 1/)).toBeInTheDocument();
    expect(segments[0]).toHaveAttribute("data-element", "physical");
  });
});
