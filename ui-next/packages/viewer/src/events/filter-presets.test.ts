import { describe, it, expect } from "vitest";
import { filterPresets, allEventTypes } from "./filter-presets.js";

describe("filterPresets", () => {
  it("simple is a subset of advanced", () => {
    for (const type of filterPresets.simple) {
      expect(filterPresets.advanced).toContain(type);
    }
  });

  it("advanced is a subset of verbose", () => {
    for (const type of filterPresets.advanced) {
      expect(filterPresets.verbose).toContain(type);
    }
  });

  it("verbose is a subset of debug", () => {
    for (const type of filterPresets.verbose) {
      expect(filterPresets.debug).toContain(type);
    }
  });

  it("debug contains debug and sim", () => {
    expect(filterPresets.debug).toContain("debug");
    expect(filterPresets.debug).toContain("sim");
  });

  it("simple contains the 5 basic types", () => {
    expect(filterPresets.simple).toEqual(
      expect.arrayContaining(["action", "damage", "energy", "warning", "user"])
    );
    expect(filterPresets.simple).toHaveLength(5);
  });

  it("uses pre_damage_mods not pre_damage_mod", () => {
    expect(filterPresets.verbose).toContain("pre_damage_mods");
    expect(filterPresets.verbose).not.toContain("pre_damage_mod");
  });
});

describe("allEventTypes", () => {
  it("contains all types from debug preset plus generic", () => {
    for (const type of filterPresets.debug) {
      expect(allEventTypes).toContain(type);
    }
    expect(allEventTypes).toContain("generic");
  });
});
