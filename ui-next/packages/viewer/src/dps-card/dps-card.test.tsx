import type { Sim } from "@gcsim/types";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DPSCard } from "./dps-card.js";

const baseCharacter: Sim.Character = {
  name: "hutao",
  level: 90,
  element: "pyro",
  max_level: 90,
  cons: 1,
  weapon: { name: "staffofhoma", refine: 1, level: 90, max_level: 90 },
  talents: { attack: 10, skill: 10, burst: 10 },
  stats: [],
  snapshot: [],
  sets: {},
};

describe("DPSCard", () => {
  it("renders character name from string key", () => {
    render(<DPSCard char="hutao" dps={35100} share={1} mean={35100} std={3200} />);
    expect(screen.getByTestId("dps-card-name")).toHaveTextContent("hutao");
  });

  it("renders character name from Sim.Character", () => {
    render(<DPSCard char={baseCharacter} dps={35100} share={1} mean={35100} std={3200} />);
    expect(screen.getByTestId("dps-card-name")).toHaveTextContent("hutao");
  });

  it("renders formatted DPS value", () => {
    render(<DPSCard char="hutao" dps={35100} share={1} mean={35100} std={3200} />);
    expect(screen.getByTestId("dps-card-value")).toHaveTextContent("35,100");
  });

  it("renders meta line with mean and std", () => {
    render(<DPSCard char="hutao" dps={35100} share={1} mean={35100} std={3200} />);
    expect(screen.getByTestId("dps-card-mean")).toHaveTextContent("μ 35,100");
    expect(screen.getByTestId("dps-card-std")).toHaveTextContent("σ 3,200");
  });

  it("fills the bar according to share", () => {
    render(<DPSCard char="hutao" dps={20000} share={0.5} mean={20000} std={1000} />);
    expect(screen.getByTestId("dps-card-bar")).toHaveStyle({ width: "50%" });
  });

  it("clamps share above 1", () => {
    render(<DPSCard char="hutao" dps={20000} share={1.5} mean={20000} std={1000} />);
    expect(screen.getByTestId("dps-card-bar")).toHaveStyle({ width: "100%" });
  });

  it("clamps negative share to 0", () => {
    render(<DPSCard char="hutao" dps={20000} share={-0.3} mean={20000} std={1000} />);
    expect(screen.getByTestId("dps-card-bar")).toHaveStyle({ width: "0%" });
  });

  it("uses the character's element color for the bar", () => {
    render(<DPSCard char={baseCharacter} dps={1} share={1} mean={1} std={1} />);
    const bar = screen.getByTestId("dps-card-bar");
    expect(bar.style.background).toContain("--el-pyro");
  });

  it("derives role from element when role not provided", () => {
    render(<DPSCard char={baseCharacter} dps={1} share={1} mean={1} std={1} />);
    expect(screen.getByTestId("dps-card-role")).toHaveTextContent("Pyro");
  });

  it("uses explicit role when provided", () => {
    // biome-ignore lint/a11y/useValidAriaRole: `role` here is a DPSCard prop, not the ARIA attribute
    render(<DPSCard char={baseCharacter} dps={1} share={1} mean={1} std={1} role="Main DPS" />);
    expect(screen.getByTestId("dps-card-role")).toHaveTextContent("Main DPS");
  });

  it("omits role when no element is available and none provided", () => {
    render(<DPSCard char="hutao" dps={1} share={1} mean={1} std={1} />);
    expect(screen.queryByTestId("dps-card-role")).toBeNull();
  });

  it("renders dash for non-finite numbers", () => {
    render(<DPSCard char="hutao" dps={Number.NaN} share={0} mean={Number.NaN} std={Number.NaN} />);
    expect(screen.getByTestId("dps-card-value")).toHaveTextContent("—");
    expect(screen.getByTestId("dps-card-mean")).toHaveTextContent("μ —");
    expect(screen.getByTestId("dps-card-std")).toHaveTextContent("σ —");
  });
});
