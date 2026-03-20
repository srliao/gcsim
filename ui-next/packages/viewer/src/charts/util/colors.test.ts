import { describe, expect, it } from "vitest";
import { actionColor, characterColor, elementColor, reactionColor } from "./colors.js";

describe("characterColor", () => {
  it("returns different colors for different indices", () => {
    const c0 = characterColor(0);
    const c1 = characterColor(1);
    expect(c0).not.toBe(c1);
  });

  it("wraps around after 10 colors", () => {
    expect(characterColor(10)).toBe(characterColor(0));
  });

  it("returns a hex color string", () => {
    expect(characterColor(0)).toMatch(/^#[0-9A-Fa-f]{6}$/);
  });
});

describe("elementColor", () => {
  it("returns correct color for pyro", () => {
    expect(elementColor("pyro")).toBe("#EF4444");
  });

  it("is case-insensitive", () => {
    expect(elementColor("Hydro")).toBe("#3B82F6");
  });

  it("returns fallback for unknown element", () => {
    expect(elementColor("unknown")).toBe("#9CA3AF");
  });
});

describe("actionColor", () => {
  it("returns correct color for burst", () => {
    expect(actionColor("burst")).toBe("#EF4444");
  });

  it("returns fallback for unknown action", () => {
    expect(actionColor("unknown")).toBe("#9CA3AF");
  });
});

describe("reactionColor", () => {
  it("returns correct color for vaporize", () => {
    expect(reactionColor("vaporize")).toBe("#F97316");
  });

  it("returns fallback for unknown reaction", () => {
    expect(reactionColor("unknown")).toBe("#9CA3AF");
  });
});
