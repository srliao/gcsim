import { describe, expect, it } from "vitest";
import { eventDisplayMap, getEventDisplay } from "./display-config.js";
import type { SimEventType } from "./types.js";

const allTypes: SimEventType[] = [
  "damage",
  "energy",
  "status",
  "element",
  "action",
  "calc",
  "snapshot",
  "pre_damage_mods",
  "shield",
  "heal",
  "hurt",
  "construct",
  "icd",
  "cooldown",
  "hitlag",
  "enemy",
  "character",
  "weapon",
  "artifact",
  "user",
  "sim",
  "player",
  "warning",
  "debug",
  "generic",
];

describe("eventDisplayMap", () => {
  it("has an entry for every SimEventType", () => {
    for (const type of allTypes) {
      expect(eventDisplayMap[type]).toBeDefined();
      expect(eventDisplayMap[type].color).toBeTruthy();
      expect(eventDisplayMap[type].icon).toBeTruthy();
      expect(eventDisplayMap[type].label).toBeTruthy();
    }
  });
});

describe("getEventDisplay", () => {
  it("returns config for known types", () => {
    const damage = getEventDisplay("damage");
    expect(damage.color).toBe("#2563EB");
    expect(damage.icon).toBe("local_fire_department");
    expect(damage.label).toBe("Damage");
  });

  it("returns generic config for unknown type", () => {
    const unknown = getEventDisplay("not_a_real_type" as SimEventType);
    expect(unknown.color).toBe("#6B7280");
    expect(unknown.icon).toBe("circle");
  });
});
