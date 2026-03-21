import type { Sim } from "@gcsim/types";
import { describe, expect, it } from "vitest";
import { transformEvents } from "./transformer.js";
import type { DamageEvent, GenericEvent } from "./types.js";

function makeLog(overrides: Partial<Sim.LogDetails> & { event: string }): Sim.LogDetails {
  return {
    char_index: 0,
    ended: 0,
    event: "damage",
    frame: 60,
    msg: "test",
    logs: {},
    ...overrides,
  };
}

describe("transformEvents", () => {
  it("returns empty array for empty input", () => {
    expect(transformEvents([])).toEqual([]);
  });

  it("transforms each log entry", () => {
    const logs = [
      makeLog({ event: "damage", logs: { damage: 100 } }),
      makeLog({ event: "action", msg: "executed attack", logs: { action: "attack" } }),
    ];
    const result = transformEvents(logs);
    expect(result).toHaveLength(2);
    expect(result[0].type).toBe("damage");
    expect(result[1].type).toBe("action");
  });
});

describe("transformDamage", () => {
  it("extracts damage fields", () => {
    const log = makeLog({
      event: "damage",
      frame: 120,
      char_index: 1,
      msg: "normal attack hit",
      logs: { damage: 1234.56, crit: true, amp: "1.5x", cata: "", target: "enemy0" },
    });
    const result = transformEvents([log])[0] as DamageEvent;
    expect(result.type).toBe("damage");
    expect(result.damage).toBeCloseTo(1234.56);
    expect(result.crit).toBe(true);
    expect(result.amp).toBe("1.5x");
    expect(result.cata).toBe("");
    expect(result.target).toBe("enemy0");
    expect(result.frame).toBe(120);
    expect(result.characterIndex).toBe(1);
  });

  it("formats message with damage amount and extras", () => {
    const log = makeLog({
      event: "damage",
      msg: "normal attack hit",
      logs: { damage: 1234.56, crit: true, amp: "1.5x", cata: "", target: "enemy0" },
    });
    const result = transformEvents([log])[0] as DamageEvent;
    expect(result.message).toContain("1,235");
    expect(result.message).toContain("1.5x");
    expect(result.message).toContain("crit");
  });

  it("formats message without extras when none present", () => {
    const log = makeLog({
      event: "damage",
      msg: "hit",
      logs: { damage: 500, crit: false, target: "enemy0" },
    });
    const result = transformEvents([log])[0] as DamageEvent;
    expect(result.message).toContain("500");
    expect(result.message).not.toContain("crit");
  });
});

describe("sortLogsByOrdering", () => {
  it("preserves log field order when ordering is present", () => {
    const log = makeLog({
      event: "damage",
      logs: { target: "enemy0", damage: 100, crit: true },
      ordering: { damage: 0, crit: 1, target: 2 },
    });
    const result = transformEvents([log])[0];
    const rawKeys = Object.keys(result.raw.logs);
    expect(rawKeys.indexOf("damage")).toBeLessThan(rawKeys.indexOf("target"));
  });

  it("passes through unchanged when no ordering", () => {
    const log = makeLog({
      event: "damage",
      logs: { damage: 100, crit: false },
    });
    const result = transformEvents([log])[0];
    expect(result.type).toBe("damage");
  });
});

describe("transformGeneric (unknown event types)", () => {
  it("falls back to GenericEvent for unknown types", () => {
    const log = makeLog({
      event: "hook",
      msg: "hook added",
      logs: { key: "some-hook" },
    });
    const result = transformEvents([log])[0] as GenericEvent;
    expect(result.type).toBe("generic");
    expect(result.originalType).toBe("hook");
    expect(result.logs).toEqual({ key: "some-hook" });
    expect(result.message).toContain("hook");
  });
});
